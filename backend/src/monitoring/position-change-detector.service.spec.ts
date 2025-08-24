import { Test, TestingModule } from '@nestjs/testing';
import { PositionChangeDetectorService } from './position-change-detector.service';
import { PositionsService } from '../positions/positions.service';
import { CacheService } from '../cache/cache.service';
import { PrismaService } from '../prisma/prisma.service';

describe('PositionChangeDetectorService', () => {
  let service: PositionChangeDetectorService;
  let positionsService: jest.Mocked<PositionsService>;
  let cacheService: jest.Mocked<CacheService>;
  let prismaService: jest.Mocked<PrismaService>;

  const mockWalletAddress = '7pV2bkd5n1234567890abcdefghijklmnopqrstuvwxyz';

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PositionChangeDetectorService,
        {
          provide: PositionsService,
          useValue: {
            getPositions: jest.fn(),
          },
        },
        {
          provide: CacheService,
          useValue: {
            get: jest.fn(),
            set: jest.fn(),
            delete: jest.fn(),
          },
        },
        {
          provide: PrismaService,
          useValue: {
            position: {
              findMany: jest.fn(),
              upsert: jest.fn(),
            },
            transaction: {
              create: jest.fn(),
              findMany: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<PositionChangeDetectorService>(
      PositionChangeDetectorService,
    );
    positionsService = module.get(PositionsService);
    cacheService = module.get(CacheService);
    prismaService = module.get(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('detectChanges', () => {
    it('should detect new positions', async () => {
      const currentPositions = [
        {
          protocol: 'marinade',
          type: 'staking',
          value: 1000,
          amount: '10',
          apy: 6.5,
        },
      ];

      // No previous snapshot
      cacheService.get.mockResolvedValue(null);
      prismaService.position.findMany.mockResolvedValue([]);

      // Current positions
      positionsService.getPositions.mockResolvedValue(currentPositions);

      // Mock database operations
      prismaService.position.upsert.mockResolvedValue({} as any);
      prismaService.transaction.create.mockResolvedValue({} as any);

      const changes = await service.detectChanges(
        mockWalletAddress,
        'transaction',
      );

      expect(changes).toHaveLength(1);
      expect(changes[0]).toMatchObject({
        walletAddress: mockWalletAddress,
        protocol: 'marinade',
        changeType: 'deposit',
        currentValue: 1000,
      });
    });

    it('should detect removed positions', async () => {
      const previousSnapshot = [
        {
          walletAddress: mockWalletAddress,
          protocol: 'marinade',
          type: 'staking',
          value: 1000,
          amount: '10',
          timestamp: new Date(),
        },
      ];

      // Previous snapshot exists
      cacheService.get.mockResolvedValue(previousSnapshot);

      // No current positions
      positionsService.getPositions.mockResolvedValue([]);

      const changes = await service.detectChanges(
        mockWalletAddress,
        'transaction',
      );

      expect(changes).toHaveLength(1);
      expect(changes[0]).toMatchObject({
        walletAddress: mockWalletAddress,
        protocol: 'marinade',
        changeType: 'withdraw',
        previousValue: 1000,
      });
    });

    it('should detect updated positions', async () => {
      const previousSnapshot = [
        {
          walletAddress: mockWalletAddress,
          protocol: 'marinade',
          type: 'staking',
          value: 1000,
          amount: '10',
          timestamp: new Date(),
        },
      ];

      const currentPositions = [
        {
          protocol: 'marinade',
          type: 'staking',
          value: 1500,
          amount: '15',
          apy: 6.5,
        },
      ];

      cacheService.get.mockResolvedValue(previousSnapshot);
      positionsService.getPositions.mockResolvedValue(currentPositions);

      const changes = await service.detectChanges(
        mockWalletAddress,
        'transaction',
      );

      expect(changes).toHaveLength(1);
      expect(changes[0]).toMatchObject({
        walletAddress: mockWalletAddress,
        protocol: 'marinade',
        changeType: 'deposit',
        previousValue: 1000,
        currentValue: 1500,
      });
    });

    it('should not detect changes below threshold', async () => {
      const previousSnapshot = [
        {
          walletAddress: mockWalletAddress,
          protocol: 'marinade',
          type: 'staking',
          value: 1000,
          amount: '10',
          timestamp: new Date(),
        },
      ];

      const currentPositions = [
        {
          protocol: 'marinade',
          type: 'staking',
          value: 1000.5, // 0.05% change, below 0.1% threshold
          amount: '10.005',
          apy: 6.5,
        },
      ];

      cacheService.get.mockResolvedValue(previousSnapshot);
      positionsService.getPositions.mockResolvedValue(currentPositions);

      const changes = await service.detectChanges(
        mockWalletAddress,
        'transaction',
      );

      expect(changes).toHaveLength(0);
    });

    it('should handle errors gracefully', async () => {
      positionsService.getPositions.mockRejectedValue(new Error('RPC error'));

      const changes = await service.detectChanges(
        mockWalletAddress,
        'transaction',
      );

      expect(changes).toEqual([]);
    });
  });

  describe('getRecentChanges', () => {
    it('should return recent changes from database', async () => {
      const mockTransactions = [
        {
          signature: 'sig1',
          walletAddress: mockWalletAddress,
          protocol: 'marinade',
          type: 'deposit',
          amount: '1000',
          blockTime: new Date(),
          status: 'success',
          fee: 5000,
          slot: 123456,
        },
      ];

      prismaService.transaction.findMany.mockResolvedValue(mockTransactions);

      const changes = await service.getRecentChanges(mockWalletAddress, 5);

      expect(changes).toHaveLength(1);
      expect(changes[0]).toMatchObject({
        walletAddress: mockWalletAddress,
        protocol: 'marinade',
        changeType: 'deposit',
        currentValue: 1000,
        transactionSignature: 'sig1',
      });
    });

    it('should handle database errors', async () => {
      prismaService.transaction.findMany.mockRejectedValue(
        new Error('Database error'),
      );

      const changes = await service.getRecentChanges(mockWalletAddress, 5);

      expect(changes).toEqual([]);
    });
  });
});
