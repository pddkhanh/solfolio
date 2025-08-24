import { Test, TestingModule } from '@nestjs/testing';
import { WalletMonitorService } from './wallet-monitor.service';
import { AccountSubscriptionService } from './account-subscription.service';
import { TransactionMonitoringService } from './transaction-monitoring.service';
import { PositionChangeDetectorService } from './position-change-detector.service';
import { WebsocketService } from '../websocket/websocket.service';
import { PositionsService } from '../positions/positions.service';
import { CacheService } from '../cache/cache.service';
import { EventEmitter } from 'events';

describe('WalletMonitorService', () => {
  let service: WalletMonitorService;
  let accountSubscription: jest.Mocked<AccountSubscriptionService>;
  let transactionMonitoring: jest.Mocked<TransactionMonitoringService>;
  let positionChangeDetector: jest.Mocked<PositionChangeDetectorService>;
  let websocketService: jest.Mocked<WebsocketService>;
  let positionsService: jest.Mocked<PositionsService>;
  let cacheService: jest.Mocked<CacheService>;

  const mockWalletAddress = '7pV2bkd5n1234567890abcdefghijklmnopqrstuvwxyz';

  beforeEach(async () => {
    // Create mock EventEmitter for AccountSubscriptionService
    const mockAccountSubscription = Object.create(EventEmitter.prototype);
    EventEmitter.call(mockAccountSubscription);
    Object.assign(mockAccountSubscription, {
      subscribeToWallet: jest.fn(),
      unsubscribeFromWallet: jest.fn(),
      isSubscribed: jest.fn(),
      getActiveSubscriptions: jest.fn(),
    });

    // Create mock EventEmitter for WebsocketService
    const mockWebsocketService = Object.create(EventEmitter.prototype);
    EventEmitter.call(mockWebsocketService);
    Object.assign(mockWebsocketService, {
      broadcastToWallet: jest.fn(),
      publishPositionUpdate: jest.fn(),
      notifyWalletSubscribed: jest.fn(),
      notifyWalletUnsubscribed: jest.fn(),
    });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WalletMonitorService,
        {
          provide: AccountSubscriptionService,
          useValue: mockAccountSubscription,
        },
        {
          provide: TransactionMonitoringService,
          useValue: {
            processTransaction: jest.fn(),
            getRecentTransactions: jest.fn(),
          },
        },
        {
          provide: PositionChangeDetectorService,
          useValue: {
            detectChanges: jest.fn(),
            getRecentChanges: jest.fn(),
          },
        },
        {
          provide: WebsocketService,
          useValue: mockWebsocketService,
        },
        {
          provide: PositionsService,
          useValue: {
            getPositions: jest.fn(),
          },
        },
        {
          provide: CacheService,
          useValue: {
            delete: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<WalletMonitorService>(WalletMonitorService);
    accountSubscription = module.get(AccountSubscriptionService);
    transactionMonitoring = module.get(TransactionMonitoringService);
    positionChangeDetector = module.get(PositionChangeDetectorService);
    websocketService = module.get(WebsocketService);
    positionsService = module.get(PositionsService);
    cacheService = module.get(CacheService);

    service.onModuleInit();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('startMonitoring', () => {
    it('should start monitoring for a wallet', () => {
      accountSubscription.subscribeToWallet.mockReturnValue(1);

      service.startMonitoring(mockWalletAddress);

      expect(accountSubscription.subscribeToWallet).toHaveBeenCalledWith(
        mockWalletAddress,
      );
      expect(websocketService.broadcastToWallet).toHaveBeenCalledWith(
        mockWalletAddress,
        expect.objectContaining({
          type: 'monitoring_started',
        }),
      );
    });

    it('should not start monitoring if already active', () => {
      accountSubscription.subscribeToWallet.mockReturnValue(1);

      // Start monitoring twice
      service.startMonitoring(mockWalletAddress);
      service.startMonitoring(mockWalletAddress);

      // Should only be called once
      expect(accountSubscription.subscribeToWallet).toHaveBeenCalledTimes(1);
    });

    it('should handle subscription failures', () => {
      accountSubscription.subscribeToWallet.mockReturnValue(null);

      service.startMonitoring(mockWalletAddress);

      expect(websocketService.broadcastToWallet).not.toHaveBeenCalled();
    });
  });

  describe('stopMonitoring', () => {
    it('should stop monitoring for a wallet', async () => {
      // First start monitoring
      accountSubscription.subscribeToWallet.mockReturnValue(1);
      service.startMonitoring(mockWalletAddress);

      // Then stop
      await service.stopMonitoring(mockWalletAddress);

      expect(accountSubscription.unsubscribeFromWallet).toHaveBeenCalledWith(
        mockWalletAddress,
      );
      expect(websocketService.broadcastToWallet).toHaveBeenCalledWith(
        mockWalletAddress,
        expect.objectContaining({
          type: 'monitoring_stopped',
        }),
      );
    });

    it('should not stop monitoring if not active', async () => {
      await service.stopMonitoring(mockWalletAddress);

      expect(accountSubscription.unsubscribeFromWallet).not.toHaveBeenCalled();
    });
  });

  describe('account change handling', () => {
    it('should handle account changes', async () => {
      const mockPositions = [{ protocol: 'marinade', value: 1000 }];
      const mockChanges = [
        {
          walletAddress: mockWalletAddress,
          protocol: 'marinade',
          changeType: 'update' as const,
          currentValue: 1000,
          transactionSignature: 'sig1',
          timestamp: new Date(),
        },
      ];

      positionChangeDetector.detectChanges.mockResolvedValue(mockChanges);
      positionsService.getPositions.mockResolvedValue(mockPositions);

      // Start monitoring
      accountSubscription.subscribeToWallet.mockReturnValue(1);
      service.startMonitoring(mockWalletAddress);

      // Simulate account change event
      const event = {
        accountId: mockWalletAddress,
        lamports: 1000000000,
        slot: 123456,
        executable: false,
        owner: 'system',
        rentEpoch: 300,
        data: Buffer.from(''),
      };

      accountSubscription.emit('accountChange', event);

      // Wait for async operations
      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(websocketService.broadcastToWallet).toHaveBeenCalledWith(
        mockWalletAddress,
        expect.objectContaining({
          type: 'account_change',
        }),
      );
    });
  });

  describe('transaction handling', () => {
    it('should process transactions and detect position changes', async () => {
      const mockPositionChange = {
        walletAddress: mockWalletAddress,
        protocol: 'marinade',
        changeType: 'deposit' as const,
        currentValue: 1500,
        previousValue: 1000,
        transactionSignature: 'sig1',
        timestamp: new Date(),
      };

      transactionMonitoring.processTransaction.mockResolvedValue(
        mockPositionChange,
      );

      // Simulate transaction event
      const event = {
        walletAddress: mockWalletAddress,
        signature: 'sig1',
        slot: 123456,
      };

      accountSubscription.emit('transaction', event);

      // Wait for async operations
      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(transactionMonitoring.processTransaction).toHaveBeenCalledWith(
        'sig1',
        mockWalletAddress,
      );
      expect(websocketService.broadcastToWallet).toHaveBeenCalledWith(
        mockWalletAddress,
        expect.objectContaining({
          type: 'position_change',
          data: mockPositionChange,
        }),
      );
    });
  });

  describe('getMonitoringStatus', () => {
    it('should return monitoring status for a wallet', () => {
      accountSubscription.isSubscribed.mockReturnValue(true);

      const status = service.getMonitoringStatus(mockWalletAddress);

      expect(status).toMatchObject({
        isMonitored: expect.any(Boolean),
        hasActiveSubscription: true,
        hasPendingRefresh: false,
      });
    });
  });

  describe('getActiveWallets', () => {
    it('should return list of active wallets', () => {
      const mockWallets = [
        {
          address: mockWalletAddress,
          subscriptionId: 1,
          isActive: true,
          lastActivity: new Date(),
        },
      ];

      accountSubscription.getActiveSubscriptions.mockReturnValue(mockWallets);

      const wallets = service.getActiveWallets();

      expect(wallets).toEqual(mockWallets);
    });
  });

  describe('WebSocket events', () => {
    it('should start monitoring when wallet is subscribed via WebSocket', async () => {
      accountSubscription.subscribeToWallet.mockReturnValue(1);

      // Emit wallet subscribed event
      websocketService.emit('walletSubscribed', mockWalletAddress);

      // Wait for async operations
      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(accountSubscription.subscribeToWallet).toHaveBeenCalledWith(
        mockWalletAddress,
      );
    });

    it('should stop monitoring when wallet is unsubscribed via WebSocket', async () => {
      // First start monitoring
      accountSubscription.subscribeToWallet.mockReturnValue(1);
      service.startMonitoring(mockWalletAddress);

      // Emit wallet unsubscribed event
      websocketService.emit('walletUnsubscribed', mockWalletAddress);

      // Wait for async operations
      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(accountSubscription.unsubscribeFromWallet).toHaveBeenCalledWith(
        mockWalletAddress,
      );
    });
  });
});
