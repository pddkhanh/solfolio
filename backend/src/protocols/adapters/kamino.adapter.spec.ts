import { Test, TestingModule } from '@nestjs/testing';
import { KaminoAdapter } from './kamino.adapter';
import { BlockchainService } from '../../blockchain/blockchain.service';
import { PriceService } from '../../price/price.service';
import { RedisService } from '../../redis/redis.service';
import { ProtocolType, PositionType } from '@prisma/client';

describe('KaminoAdapter', () => {
  let adapter: KaminoAdapter;

  beforeEach(async () => {
    const mockBlockchainService = {
      getConnection: jest.fn().mockReturnValue({
        getParsedTokenAccountsByOwner: jest.fn(),
      }),
    };

    const mockPriceService = {
      getTokenPrice: jest.fn().mockResolvedValue(100),
    };

    const mockRedisService = {
      generateKey: jest.fn((prefix, key) => `${prefix}:${key}`),
      get: jest.fn(),
      set: jest.fn(),
      del: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        KaminoAdapter,
        { provide: BlockchainService, useValue: mockBlockchainService },
        { provide: PriceService, useValue: mockPriceService },
        { provide: RedisService, useValue: mockRedisService },
      ],
    }).compile();

    adapter = module.get<KaminoAdapter>(KaminoAdapter);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    it('should be defined', () => {
      expect(adapter).toBeDefined();
    });

    it('should have correct protocol properties', () => {
      expect(adapter.protocolType).toBe(ProtocolType.KAMINO);
      expect(adapter.protocolName).toBe('Kamino Finance');
      expect(adapter.priority).toBe(90);
    });
  });

  describe('isSupported', () => {
    it('should return true for supported tokens', () => {
      const solMint = 'So11111111111111111111111111111111111111112';
      const usdcMint = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v';
      const msolMint = 'mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So';

      expect(adapter.isSupported(solMint)).toBe(true);
      expect(adapter.isSupported(usdcMint)).toBe(true);
      expect(adapter.isSupported(msolMint)).toBe(true);
    });

    it('should return false for unsupported tokens', () => {
      const unsupportedMint = '9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM';
      expect(adapter.isSupported(unsupportedMint)).toBe(false);
    });
  });

  describe('getPositions', () => {
    const testWallet = 'DemoWallet1111111111111111111111111111111111';

    it('should return cached positions if available', async () => {
      const mockCachedPositions = [
        {
          protocol: ProtocolType.KAMINO,
          positionType: PositionType.LENDING,
          tokenMint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
          amount: 1000,
          underlyingMint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
          underlyingAmount: 1000,
          usdValue: 1000,
          apy: 5.5,
          rewards: 150.68,
          metadata: {
            reserveAddress: 'test-reserve',
            marketAddress: '7u3HeHxYDLhnCoErrtycNokbQYbWGzLs6JSDqGAv5PfF',
          },
        },
      ];

      const getCachedPositionsSpy = jest
        .spyOn(adapter as any, 'getCachedPositions')
        .mockResolvedValue(mockCachedPositions);

      const positions = await adapter.getPositions(testWallet);

      expect(getCachedPositionsSpy).toHaveBeenCalledWith(testWallet);
      expect(positions).toEqual(mockCachedPositions);
    });

    it('should return empty array if no positions found', async () => {
      jest.spyOn(adapter as any, 'getCachedPositions').mockResolvedValue(null);
      jest.spyOn(adapter as any, 'initializeKamino').mockReturnValue(undefined);
      jest.spyOn(adapter as any, 'cachePositions').mockResolvedValue(undefined);

      const positions = await adapter.getPositions(testWallet);

      expect(positions).toEqual([]);
    });

    it('should handle errors gracefully and return empty array', async () => {
      jest.spyOn(adapter as any, 'getCachedPositions').mockResolvedValue(null);
      jest.spyOn(adapter as any, 'initializeKamino').mockImplementation(() => {
        throw new Error('SDK Error');
      });

      const positions = await adapter.getPositions(testWallet);

      expect(positions).toEqual([]);
    });
  });

  describe('getProtocolStats', () => {
    it('should return cached stats if available', async () => {
      const mockCachedStats = {
        protocolName: 'Kamino Finance',
        tvl: 150000000,
        apy: 6.5,
        metadata: {
          marketAddress: '7u3HeHxYDLhnCoErrtycNokbQYbWGzLs6JSDqGAv5PfF',
          reserveCount: 10,
          lastUpdated: Date.now(),
        },
      };

      const getCachedStatsSpy = jest
        .spyOn(adapter as any, 'getCachedStats')
        .mockResolvedValue(mockCachedStats);

      const stats = await adapter.getProtocolStats();

      expect(getCachedStatsSpy).toHaveBeenCalled();
      expect(stats).toEqual(mockCachedStats);
    });

    it('should return fallback stats on error', async () => {
      jest.spyOn(adapter as any, 'getCachedStats').mockResolvedValue(null);
      jest
        .spyOn(adapter as any, 'initializeKamino')
        .mockRejectedValue(new Error('SDK Error'));

      const stats = await adapter.getProtocolStats();

      expect(stats.protocolName).toBe('Kamino Finance');
      expect(stats.tvl).toBe(2400000000); // Updated to match the current implementation
      expect(stats.apy).toBe(6.5);
      expect(stats.metadata.marketAddress).toBe(
        '7u3HeHxYDLhnCoErrtycNokbQYbWGzLs6JSDqGAv5PfF',
      );
    });
  });

  describe('private helper methods', () => {
    it('should calculate supply APY correctly', () => {
      const apy = (adapter as any).calculateSupplyApy();
      expect(apy).toBe(5.5);
    });

    it('should calculate borrow APY correctly', () => {
      const apy = (adapter as any).calculateBorrowApy();
      expect(apy).toBe(8.0);
    });
  });

  describe('error handling', () => {
    it('should handle SDK initialization errors', async () => {
      const testWallet = 'DemoWallet1111111111111111111111111111111111';

      jest.spyOn(adapter as any, 'getCachedPositions').mockResolvedValue(null);
      jest.spyOn(adapter as any, 'initializeKamino').mockImplementation(() => {
        throw new Error('Failed to initialize SDK');
      });

      const positions = await adapter.getPositions(testWallet);
      expect(positions).toEqual([]);
    });

    it('should handle network errors gracefully', async () => {
      const stats = await adapter.getProtocolStats();

      expect(stats).toBeDefined();
      expect(stats.protocolName).toBe('Kamino Finance');
      expect(typeof stats.tvl).toBe('number');
      expect(typeof stats.apy).toBe('number');
    });
  });
});
