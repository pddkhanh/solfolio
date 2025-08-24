import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { Connection, PublicKey, AccountInfo } from '@solana/web3.js';
import { HeliusService } from '../helius/helius.service';
import { EventEmitter } from 'events';
import { AccountChangeEvent, MonitoredWallet } from './monitoring.interfaces';

@Injectable()
export class AccountSubscriptionService
  extends EventEmitter
  implements OnModuleDestroy
{
  private readonly logger = new Logger(AccountSubscriptionService.name);
  private subscriptions = new Map<string, number>();
  private connection: Connection;
  private reconnectTimer?: NodeJS.Timeout;
  private isConnected = false;

  constructor(private readonly heliusService: HeliusService) {
    super();
    this.connection = this.heliusService.getConnection();
    this.setupConnectionHandlers();
  }

  async onModuleDestroy() {
    await this.cleanup();
  }

  private setupConnectionHandlers() {
    // Monitor connection health
    this.connection.onSlotChange(() => {
      if (!this.isConnected) {
        this.isConnected = true;
        this.logger.log('WebSocket connection established');
      }
    });
  }

  subscribeToWallet(walletAddress: string): number | null {
    try {
      // Check if already subscribed
      if (this.subscriptions.has(walletAddress)) {
        this.logger.debug(`Already subscribed to wallet: ${walletAddress}`);
        return this.subscriptions.get(walletAddress)!;
      }

      // Validate address
      let publicKey: PublicKey;
      try {
        publicKey = new PublicKey(walletAddress);
      } catch {
        this.logger.error(`Invalid wallet address: ${walletAddress}`);
        return null;
      }

      // Subscribe to account changes
      const subscriptionId = this.connection.onAccountChange(
        publicKey,
        (accountInfo: AccountInfo<Buffer>, context) => {
          this.handleAccountChange(walletAddress, accountInfo, context);
        },
        'confirmed',
      );

      this.subscriptions.set(walletAddress, subscriptionId);
      this.logger.log(
        `Subscribed to wallet ${walletAddress} with ID ${subscriptionId}`,
      );

      // Also subscribe to logs for this account to catch transactions
      this.subscribeToLogs(walletAddress);

      return subscriptionId;
    } catch (error) {
      this.logger.error(
        `Failed to subscribe to wallet ${walletAddress}:`,
        error,
      );
      return null;
    }
  }

  private subscribeToLogs(walletAddress: string) {
    try {
      const publicKey = new PublicKey(walletAddress);

      // Subscribe to logs mentioning this wallet
      const logsSubscriptionId = this.connection.onLogs(
        publicKey,
        (logs, context) => {
          this.handleTransactionLogs(walletAddress, logs, context);
        },
        'confirmed',
      );

      // Store with a different key for logs
      this.subscriptions.set(`${walletAddress}_logs`, logsSubscriptionId);
    } catch (error) {
      this.logger.error(
        `Failed to subscribe to logs for ${walletAddress}:`,
        error,
      );
    }
  }

  async unsubscribeFromWallet(walletAddress: string): Promise<void> {
    try {
      const subscriptionId = this.subscriptions.get(walletAddress);
      const logsSubscriptionId = this.subscriptions.get(
        `${walletAddress}_logs`,
      );

      if (subscriptionId) {
        await this.connection.removeAccountChangeListener(subscriptionId);
        this.subscriptions.delete(walletAddress);
        this.logger.log(`Unsubscribed from wallet ${walletAddress}`);
      }

      if (logsSubscriptionId) {
        await this.connection.removeOnLogsListener(logsSubscriptionId);
        this.subscriptions.delete(`${walletAddress}_logs`);
      }
    } catch (error) {
      this.logger.error(
        `Failed to unsubscribe from wallet ${walletAddress}:`,
        error,
      );
    }
  }

  private handleAccountChange(
    walletAddress: string,
    accountInfo: AccountInfo<Buffer>,
    context: any,
  ) {
    const event: AccountChangeEvent = {
      accountId: walletAddress,
      lamports: accountInfo.lamports,
      slot: context.slot,
      executable: accountInfo.executable,
      owner: accountInfo.owner.toBase58(),
      rentEpoch: accountInfo.rentEpoch,
      data: accountInfo.data,
    };

    this.logger.debug(
      `Account change detected for ${walletAddress} at slot ${context.slot}`,
    );

    // Emit the account change event
    this.emit('accountChange', event);
  }

  private handleTransactionLogs(
    walletAddress: string,
    logs: any,
    context: any,
  ) {
    // Check if this is a DeFi protocol interaction
    const isDeFiTransaction = this.checkForDeFiProtocol(logs);

    if (isDeFiTransaction) {
      this.logger.log(
        `DeFi transaction detected for wallet ${walletAddress}: ${logs.signature}`,
      );

      // Emit transaction event
      this.emit('transaction', {
        walletAddress,
        signature: logs.signature,
        slot: context.slot,
        logs: logs.logs,
        err: logs.err,
      });
    }
  }

  private checkForDeFiProtocol(logs: any): boolean {
    if (!logs.logs || !Array.isArray(logs.logs)) {
      return false;
    }

    // Check for known DeFi protocol program IDs in logs
    const defiPrograms = [
      'MarBmsSgKXdrN1egZf5sqe1TMai9K1rChYNDJgjq7aD', // Marinade
      'KaminoLendingProgram11111111111111111111111', // Kamino (placeholder)
      'whirLbMiicVdio4qvUfM5KAg6Ct8VwpYzGff3uctyCc', // Orca Whirlpool
      '675kPX9MHTjS2zt1qfr1NYHuzeLXfQM9H24wFSUt1Mp8', // Raydium AMM V4
      'JUP6LkbZbjS1jKKwapdHNy74zcZ3tLUZoi5QNyVTaV4', // Jupiter Aggregator
    ];

    return logs.logs.some((log: string) =>
      defiPrograms.some((program) => log.includes(program)),
    );
  }

  getActiveSubscriptions(): MonitoredWallet[] {
    const wallets: MonitoredWallet[] = [];

    for (const [address, subscriptionId] of this.subscriptions.entries()) {
      // Skip log subscriptions
      if (address.endsWith('_logs')) continue;

      wallets.push({
        address,
        subscriptionId,
        isActive: true,
        lastActivity: new Date(),
      });
    }

    return wallets;
  }

  async cleanup(): Promise<void> {
    this.logger.log('Cleaning up account subscriptions...');

    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
    }

    // Unsubscribe from all wallets
    const walletAddresses = Array.from(this.subscriptions.keys()).filter(
      (key) => !key.endsWith('_logs'),
    );

    for (const address of walletAddresses) {
      await this.unsubscribeFromWallet(address);
    }

    this.removeAllListeners();
    this.logger.log('Account subscriptions cleanup complete');
  }

  getSubscriptionCount(): number {
    // Count only wallet subscriptions, not log subscriptions
    return Array.from(this.subscriptions.keys()).filter(
      (key) => !key.endsWith('_logs'),
    ).length;
  }

  isSubscribed(walletAddress: string): boolean {
    return this.subscriptions.has(walletAddress);
  }
}
