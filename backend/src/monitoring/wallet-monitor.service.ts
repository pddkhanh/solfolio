import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { AccountSubscriptionService } from './account-subscription.service';
import { TransactionMonitoringService } from './transaction-monitoring.service';
import { PositionChangeDetectorService } from './position-change-detector.service';
import { WebsocketService } from '../websocket/websocket.service';
import { PositionsService } from '../positions/positions.service';
import { CacheService } from '../cache/cache.service';
import {
  AccountChangeEvent,
  MonitoredWallet,
  PositionChange,
} from './monitoring.interfaces';
import { forwardRef, Inject } from '@nestjs/common';

@Injectable()
export class WalletMonitorService implements OnModuleInit {
  private readonly logger = new Logger(WalletMonitorService.name);
  private activeWallets = new Set<string>();
  private positionRefreshQueue = new Map<string, NodeJS.Timeout>();

  constructor(
    private readonly accountSubscription: AccountSubscriptionService,
    @Inject(forwardRef(() => TransactionMonitoringService))
    private readonly transactionMonitoring: TransactionMonitoringService,
    private readonly positionChangeDetector: PositionChangeDetectorService,
    @Inject(forwardRef(() => WebsocketService))
    private readonly websocketService: WebsocketService,
    @Inject(forwardRef(() => PositionsService))
    private readonly positionsService: PositionsService,
    private readonly cacheService: CacheService,
  ) {}

  async onModuleInit() {
    this.setupEventListeners();
    this.logger.log('Wallet monitor service initialized');
  }

  private setupEventListeners() {
    // Listen for account changes
    this.accountSubscription.on(
      'accountChange',
      (event: AccountChangeEvent) => {
        this.handleAccountChange(event);
      },
    );

    // Listen for transactions
    this.accountSubscription.on('transaction', (event: any) => {
      this.handleTransaction(event);
    });

    // Listen for WebSocket client connections
    this.websocketService.on('walletSubscribed', (walletAddress: string) => {
      this.startMonitoring(walletAddress);
    });

    this.websocketService.on('walletUnsubscribed', (walletAddress: string) => {
      this.stopMonitoring(walletAddress);
    });
  }

  async startMonitoring(walletAddress: string): Promise<void> {
    try {
      if (this.activeWallets.has(walletAddress)) {
        this.logger.debug(`Already monitoring wallet: ${walletAddress}`);
        return;
      }

      this.logger.log(`Starting monitoring for wallet: ${walletAddress}`);

      // Subscribe to account changes
      const subscriptionId =
        await this.accountSubscription.subscribeToWallet(walletAddress);

      if (subscriptionId) {
        this.activeWallets.add(walletAddress);

        // Notify clients that monitoring has started
        this.websocketService.broadcastToWallet(walletAddress, {
          type: 'monitoring_started',
          data: {
            walletAddress,
            timestamp: new Date().toISOString(),
          },
        });
      }
    } catch (error) {
      this.logger.error(
        `Failed to start monitoring for wallet ${walletAddress}:`,
        error,
      );
    }
  }

  async stopMonitoring(walletAddress: string): Promise<void> {
    try {
      if (!this.activeWallets.has(walletAddress)) {
        return;
      }

      this.logger.log(`Stopping monitoring for wallet: ${walletAddress}`);

      // Unsubscribe from account changes
      await this.accountSubscription.unsubscribeFromWallet(walletAddress);
      this.activeWallets.delete(walletAddress);

      // Clear any pending refresh timers
      const timer = this.positionRefreshQueue.get(walletAddress);
      if (timer) {
        clearTimeout(timer);
        this.positionRefreshQueue.delete(walletAddress);
      }

      // Notify clients that monitoring has stopped
      this.websocketService.broadcastToWallet(walletAddress, {
        type: 'monitoring_stopped',
        data: {
          walletAddress,
          timestamp: new Date().toISOString(),
        },
      });
    } catch (error) {
      this.logger.error(
        `Failed to stop monitoring for wallet ${walletAddress}:`,
        error,
      );
    }
  }

  private async handleAccountChange(event: AccountChangeEvent) {
    const { accountId: walletAddress } = event;

    this.logger.debug(
      `Account change detected for ${walletAddress}, lamports: ${event.lamports}`,
    );

    // Notify clients of account change
    this.websocketService.broadcastToWallet(walletAddress, {
      type: 'account_change',
      data: {
        walletAddress,
        lamports: event.lamports,
        slot: event.slot,
        timestamp: new Date().toISOString(),
      },
    });

    // Schedule position refresh with debouncing
    this.schedulePositionRefresh(walletAddress);
  }

  private async handleTransaction(event: any) {
    const { walletAddress, signature, slot } = event;

    this.logger.log(
      `Transaction detected for ${walletAddress}: ${signature} at slot ${slot}`,
    );

    // Process the transaction
    const positionChange = await this.transactionMonitoring.processTransaction(
      signature,
      walletAddress,
    );

    if (positionChange) {
      // Notify clients of position change
      this.websocketService.broadcastToWallet(walletAddress, {
        type: 'position_change',
        data: positionChange,
      });

      // Schedule immediate position refresh
      this.schedulePositionRefresh(walletAddress, 1000); // 1 second delay
    }
  }

  private schedulePositionRefresh(walletAddress: string, delay: number = 3000) {
    // Clear existing timer if present
    const existingTimer = this.positionRefreshQueue.get(walletAddress);
    if (existingTimer) {
      clearTimeout(existingTimer);
    }

    // Schedule new refresh
    const timer = setTimeout(async () => {
      try {
        await this.refreshPositions(walletAddress);
        this.positionRefreshQueue.delete(walletAddress);
      } catch (error) {
        this.logger.error(
          `Failed to refresh positions for ${walletAddress}:`,
          error,
        );
      }
    }, delay);

    this.positionRefreshQueue.set(walletAddress, timer);
  }

  private async refreshPositions(walletAddress: string) {
    this.logger.log(`Refreshing positions for wallet: ${walletAddress}`);

    try {
      // Detect position changes
      const changes = await this.positionChangeDetector.detectChanges(
        walletAddress,
        'transaction',
      );

      // Clear cache for this wallet
      await this.cacheService.delete(`positions:${walletAddress}`);

      // Fetch fresh positions
      const positions = await this.positionsService.getPositions(walletAddress);

      // Broadcast updated positions
      this.websocketService.publishPositionUpdate(walletAddress, positions);

      // If there were changes, notify clients
      if (changes.length > 0) {
        for (const change of changes) {
          this.websocketService.broadcastToWallet(walletAddress, {
            type: 'position_change_detected',
            data: change,
          });
        }
      }

      this.logger.log(
        `Successfully refreshed ${positions.length} positions for ${walletAddress}, detected ${changes.length} changes`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to refresh positions for ${walletAddress}:`,
        error,
      );
      throw error;
    }
  }

  async getMonitoringStatus(walletAddress: string): Promise<{
    isMonitored: boolean;
    hasActiveSubscription: boolean;
    hasPendingRefresh: boolean;
  }> {
    return {
      isMonitored: this.activeWallets.has(walletAddress),
      hasActiveSubscription:
        this.accountSubscription.isSubscribed(walletAddress),
      hasPendingRefresh: this.positionRefreshQueue.has(walletAddress),
    };
  }

  async getActiveWallets(): Promise<MonitoredWallet[]> {
    return this.accountSubscription.getActiveSubscriptions();
  }

  getMonitoredWalletCount(): number {
    return this.activeWallets.size;
  }
}
