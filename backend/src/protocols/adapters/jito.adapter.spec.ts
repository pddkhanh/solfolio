import { Test, TestingModule } from '@nestjs/testing';
import { JitoAdapter } from './jito.adapter';
import { BlockchainService } from '../../blockchain/blockchain.service';
import { PriceService } from '../../price/price.service';
import { RedisService } from '../../redis/redis.service';
import { ProtocolType, PositionType } from '@prisma/client';

describe('JitoAdapter', () => {
  let adapter: JitoAdapter;
  let mockBlockchainService: jest.Mocked<BlockchainService>;
  let mockPriceService: jest.Mocked<PriceService>;
  let mockRedisService: jest.Mocked<RedisService>;

  beforeEach(async () => {
    mockBlockchainService = {
      getConnection: jest.fn().mockReturnValue({
        getParsedTokenAccountsByOwner: jest.fn(),
      }),
    } as any;

    mockPriceService = {
      getTokenPrice: jest.fn().mockResolvedValue(100),
    } as any;

    mockRedisService = {
      generateKey: jest.fn((prefix, key) => `${prefix}:${key}`),
      get: jest.fn(),
      set: jest.fn(),
      del: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JitoAdapter,
        { provide: BlockchainService, useValue: mockBlockchainService },
        { provide: PriceService, useValue: mockPriceService },
        { provide: RedisService, useValue: mockRedisService },
      ],
    }).compile();

    adapter = module.get<JitoAdapter>(JitoAdapter);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    it('should be defined', () => {
      expect(adapter).toBeDefined();
    });

    it('should have correct protocol properties', () => {
      expect(adapter.protocolType).toBe(ProtocolType.JITO);
      expect(adapter.protocolName).toBe('Jito');
      expect(adapter.priority).toBe(95);
    });
  });

  describe('isSupported', () => {
    it('should return true for JitoSOL token', () => {
      const jitosolMint = 'J1toso1uCk3RLmjorhTtrVwY9HJ7X8V9yYac6Y7kGCPn';
      expect(adapter.isSupported(jitosolMint)).toBe(true);
    });

    it('should return false for unsupported tokens', () => {
      const solMint = 'So11111111111111111111111111111111111111112';
      const unsupportedMint = '9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM';
      expect(adapter.isSupported(solMint)).toBe(false);
      expect(adapter.isSupported(unsupportedMint)).toBe(false);
    });
  });

  describe('getPositions', () => {
    const testWallet = '11111111111111111111111111111112';

    it('should return cached positions if available', async () => {
      const mockCachedPositions = [
        {
          protocol: ProtocolType.JITO,
          positionType: PositionType.STAKING,
          tokenMint: 'J1toso1uCk3RLmjorhTtrVwY9HJ7X8V9yYac6Y7kGCPn',
          amount: 10,
          underlyingMint: 'So11111111111111111111111111111111111111112',
          underlyingAmount: 10,
          usdValue: 1000,
          apy: 8.5,
          rewards: 2.33,
          metadata: {
            exchangeRate: 1.0,
            totalStaked: 12000000,
            validatorCount: 100,
            stakingYield: 'MEV + Validator Rewards',
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

    it('should return empty array if no JitoSOL balance found', async () => {
      jest.spyOn(adapter as any, 'getCachedPositions').mockResolvedValue(null);
      jest.spyOn(adapter as any, 'getJitosolBalance').mockResolvedValue(0);
      jest.spyOn(adapter as any, 'cachePositions').mockResolvedValue(undefined);

      const positions = await adapter.getPositions(testWallet);

      expect(positions).toEqual([]);
    });

    it('should create position for JitoSOL balance', async () => {
      jest.spyOn(adapter as any, 'getCachedPositions').mockResolvedValue(null);
      jest.spyOn(adapter as any, 'getJitosolBalance').mockResolvedValue(5);
      jest.spyOn(adapter as any, 'cachePositions').mockResolvedValue(undefined);

      const mockStats = {
        protocolName: 'Jito',
        tvl: 12000000,
        apy: 8.5,
        validatorCount: 100,
        metadata: {
          exchangeRate: 1.0,
        },
      };
      jest.spyOn(adapter, 'getProtocolStats').mockResolvedValue(mockStats);

      const positions = await adapter.getPositions(testWallet);

      expect(positions).toHaveLength(1);
      expect(positions[0].protocol).toBe(ProtocolType.JITO);
      expect(positions[0].positionType).toBe(PositionType.STAKING);
      expect(positions[0].amount).toBe(5);
      expect(positions[0].apy).toBe(8.5);
    });

    it('should handle errors gracefully and return empty array', async () => {
      jest.spyOn(adapter as any, 'getCachedPositions').mockResolvedValue(null);
      jest
        .spyOn(adapter as any, 'getJitosolBalance')
        .mockRejectedValue(new Error('RPC Error'));

      const positions = await adapter.getPositions(testWallet);

      expect(positions).toEqual([]);
    });
  });

  describe('getProtocolStats', () => {
    it('should return cached stats if available', async () => {
      const mockCachedStats = {
        protocolName: 'Jito',
        tvl: 12000000,
        apy: 8.5,
        validatorCount: 100,
        metadata: {
          exchangeRate: 1.0,
          mevBoost: true,
          liquidStaking: true,
        },
      };

      const getCachedStatsSpy = jest
        .spyOn(adapter as any, 'getCachedStats')
        .mockResolvedValue(mockCachedStats);

      const stats = await adapter.getProtocolStats();

      expect(getCachedStatsSpy).toHaveBeenCalled();
      expect(stats).toEqual(mockCachedStats);
    });

    it('should return default stats if no cache available', async () => {
      jest.spyOn(adapter as any, 'getCachedStats').mockResolvedValue(null);
      jest.spyOn(adapter as any, 'cacheStats').mockResolvedValue(undefined);

      const stats = await adapter.getProtocolStats();

      expect(stats.protocolName).toBe('Jito');
      expect(stats.tvl).toBe(12000000);
      expect(stats.apy).toBe(8.5);
      expect(stats.validatorCount).toBe(100);
      expect(stats.metadata.exchangeRate).toBe(1.0);
    });

    it('should return fallback stats on error', async () => {
      jest.spyOn(adapter as any, 'getCachedStats').mockResolvedValue(null);
      jest
        .spyOn(adapter as any, 'cacheStats')
        .mockRejectedValue(new Error('Cache Error'));

      const stats = await adapter.getProtocolStats();

      expect(stats.protocolName).toBe('Jito');
      expect(stats.tvl).toBe(12000000);
      expect(stats.apy).toBe(8.0);
      expect(stats.validatorCount).toBe(100);
    });
  });

  describe('private helper methods', () => {
    it('should handle JitoSOL balance fetching errors', async () => {
      const mockPublicKey = { toString: () => testWallet } as any;

      mockBlockchainService.getConnection.mockReturnValue({
        // Mock connection that throws an error
      } as any);

      const balance = await (adapter as any).getJitosolBalance(mockPublicKey);
      expect(balance).toBe(0);
    });
  });

  describe('error handling', () => {
    it('should handle network errors gracefully in getPositions', async () => {
      const testWallet = '11111111111111111111111111111112';

      jest.spyOn(adapter as any, 'getCachedPositions').mockResolvedValue(null);
      jest
        .spyOn(adapter as any, 'getJitosolBalance')
        .mockRejectedValue(new Error('Network error'));

      const positions = await adapter.getPositions(testWallet);
      expect(positions).toEqual([]);
    });

    it('should handle errors in getProtocolStats gracefully', async () => {
      jest
        .spyOn(adapter as any, 'getCachedStats')
        .mockRejectedValue(new Error('Cache error'));

      const stats = await adapter.getProtocolStats();

      expect(stats).toBeDefined();
      expect(stats.protocolName).toBe('Jito');
      expect(typeof stats.tvl).toBe('number');
      expect(typeof stats.apy).toBe('number');
    });
  });
});
