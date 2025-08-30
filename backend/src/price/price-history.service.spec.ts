import { Test, TestingModule } from '@nestjs/testing';
import { PriceHistoryService } from './price-history.service';
import { PrismaService } from '../prisma/prisma.service';
import { JupiterPriceService } from './jupiter-price.service';
import { Decimal } from '@prisma/client/runtime/library';

describe('PriceHistoryService', () => {
  let service: PriceHistoryService;
  let prismaService: jest.Mocked<PrismaService>;
  let jupiterPriceService: jest.Mocked<JupiterPriceService>;

  const mockTokenMint = 'So11111111111111111111111111111111111111112';
  const mockTokenMint2 = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v';

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PriceHistoryService,
        {
          provide: PrismaService,
          useValue: {
            priceHistory: {
              upsert: jest.fn(),
              findFirst: jest.fn(),
              findMany: jest.fn().mockResolvedValue([]),
              deleteMany: jest.fn(),
            },
            position: {
              findMany: jest.fn().mockResolvedValue([]),
            },
            balance: {
              findMany: jest.fn().mockResolvedValue([]),
            },
          },
        },
        {
          provide: JupiterPriceService,
          useValue: {
            getTokenPrices: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<PriceHistoryService>(PriceHistoryService);
    prismaService = module.get(PrismaService);
    jupiterPriceService = module.get(JupiterPriceService);
  });

  describe('recordPriceSnapshot', () => {
    it('should record price snapshot for given tokens', async () => {
      const mockPrices = new Map([
        [mockTokenMint, 100],
        [mockTokenMint2, 1],
      ]);

      jupiterPriceService.getTokenPrices.mockResolvedValue(mockPrices);
      prismaService.priceHistory.upsert.mockResolvedValue({} as any);

      await service.recordPriceSnapshot([mockTokenMint, mockTokenMint2]);

      expect(jupiterPriceService.getTokenPrices).toHaveBeenCalledWith([
        mockTokenMint,
        mockTokenMint2,
      ]);
      expect(prismaService.priceHistory.upsert).toHaveBeenCalledTimes(2);
    });

    it('should handle errors gracefully', async () => {
      jupiterPriceService.getTokenPrices.mockRejectedValue(
        new Error('API Error'),
      );

      await service.recordPriceSnapshot([mockTokenMint]);

      // Should not throw
      expect(jupiterPriceService.getTokenPrices).toHaveBeenCalled();
    });
  });

  describe('getTokenPriceChanges', () => {
    it('should calculate price changes correctly', async () => {
      const currentPrice = 100;
      const price24hAgo = 90;
      const price7dAgo = 80;
      const price30dAgo = 50;

      jupiterPriceService.getTokenPrices.mockResolvedValue(
        new Map([[mockTokenMint, currentPrice]]),
      );

      prismaService.priceHistory.findFirst
        .mockResolvedValueOnce({
          price: new Decimal(price24hAgo),
        } as any)
        .mockResolvedValueOnce({
          price: new Decimal(price7dAgo),
        } as any)
        .mockResolvedValueOnce({
          price: new Decimal(price30dAgo),
        } as any);

      const result = await service.getTokenPriceChanges(mockTokenMint);

      expect(result.currentPrice).toBe(currentPrice);
      expect(result.change24h).toBe(10);
      expect(result.changePercent24h).toBeCloseTo(11.11, 2);
      expect(result.change7d).toBe(20);
      expect(result.changePercent7d).toBe(25);
      expect(result.change30d).toBe(50);
      expect(result.changePercent30d).toBe(100);
    });

    it('should handle missing historical prices', async () => {
      const currentPrice = 100;

      jupiterPriceService.getTokenPrices.mockResolvedValue(
        new Map([[mockTokenMint, currentPrice]]),
      );

      prismaService.priceHistory.findFirst.mockResolvedValue(null);

      const result = await service.getTokenPriceChanges(mockTokenMint);

      expect(result.currentPrice).toBe(currentPrice);
      expect(result.change24h).toBeUndefined();
      expect(result.changePercent24h).toBeUndefined();
    });
  });

  describe('calculatePortfolioChanges', () => {
    it('should calculate total portfolio changes', async () => {
      const tokenBalances = [
        { mint: mockTokenMint, amount: 1000000000, decimals: 9 }, // 1 SOL
        { mint: mockTokenMint2, amount: 1000000, decimals: 6 }, // 1 USDC
      ];

      const currentPrices = new Map([
        [mockTokenMint, 100],
        [mockTokenMint2, 1],
      ]);

      jupiterPriceService.getTokenPrices.mockResolvedValue(currentPrices);

      // Mock historical prices - need to mock the correct shape
      prismaService.priceHistory.findMany
        .mockResolvedValueOnce([
          // 24h ago
          {
            tokenMint: mockTokenMint,
            price: new Decimal(90),
            timestamp: new Date(),
          },
          {
            tokenMint: mockTokenMint2,
            price: new Decimal(0.99),
            timestamp: new Date(),
          },
        ] as any)
        .mockResolvedValueOnce([
          // 7d ago
          {
            tokenMint: mockTokenMint,
            price: new Decimal(80),
            timestamp: new Date(),
          },
          {
            tokenMint: mockTokenMint2,
            price: new Decimal(0.98),
            timestamp: new Date(),
          },
        ] as any)
        .mockResolvedValueOnce([
          // 30d ago
          {
            tokenMint: mockTokenMint,
            price: new Decimal(50),
            timestamp: new Date(),
          },
          {
            tokenMint: mockTokenMint2,
            price: new Decimal(0.95),
            timestamp: new Date(),
          },
        ] as any);

      const result = await service.calculatePortfolioChanges(tokenBalances);

      expect(result.totalValue).toBe(101); // 1 SOL * $100 + 1 USDC * $1
      expect(result.totalChange24h).toBeCloseTo(10.01, 2); // From $90.99 to $101
      expect(result.totalChangePercent24h).toBeCloseTo(11, 1);
    });

    it('should handle empty token balances', async () => {
      const result = await service.calculatePortfolioChanges([]);

      expect(result.totalValue).toBe(0);
      expect(result.totalChange24h).toBe(0);
      expect(result.totalChangePercent24h).toBe(0);
    });
  });

  describe('cleanupOldPriceHistory', () => {
    it('should delete old price history records', async () => {
      const deletedCount = 100;
      prismaService.priceHistory.deleteMany.mockResolvedValue({
        count: deletedCount,
      } as any);

      await service.cleanupOldPriceHistory();

      expect(prismaService.priceHistory.deleteMany).toHaveBeenCalled();
      const call = prismaService.priceHistory.deleteMany.mock.calls[0][0];
      expect(call.where.timestamp.lt).toBeDefined();
    });
  });
});
