import { Test, TestingModule } from '@nestjs/testing';
import { RaydiumAdapter } from './raydium.adapter';
import { BlockchainService } from '../../blockchain/blockchain.service';
import { PriceService } from '../../price/price.service';
import { RedisService } from '../../redis/redis.service';
import { ProtocolType, PositionType } from '@prisma/client';

describe('RaydiumAdapter', () => {
  let adapter: RaydiumAdapter;
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
        RaydiumAdapter,
        { provide: BlockchainService, useValue: mockBlockchainService },
        { provide: PriceService, useValue: mockPriceService },
        { provide: RedisService, useValue: mockRedisService },
      ],
    }).compile();

    adapter = module.get<RaydiumAdapter>(RaydiumAdapter);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    it('should be defined', () => {
      expect(adapter).toBeDefined();
    });

    it('should have correct protocol properties', () => {
      expect(adapter.protocolType).toBe(ProtocolType.RAYDIUM);
      expect(adapter.protocolName).toBe('Raydium');
      expect(adapter.priority).toBe(80);
    });
  });

  describe('isSupported', () => {
    it('should return true for supported LP tokens', () => {
      const solUsdcLp = 'GVMLiqiRzsBUCwCzwkKWeUvWkqmNSKg6TDBhTkuiGLEe';
      const rayUsdcLp = 'FbC6K13MzHvN42bXrtGaWsvZY9fxrckWezF5a9c9fYAk';
      const raySolLp = 'E2bfB6v5Cd5nv8bqh6bPGYhkJgTGwcTPU4v2VJpBrDJZ';

      expect(adapter.isSupported(solUsdcLp)).toBe(true);
      expect(adapter.isSupported(rayUsdcLp)).toBe(true);
      expect(adapter.isSupported(raySolLp)).toBe(true);
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
          protocol: ProtocolType.RAYDIUM,
          positionType: PositionType.LP_POSITION,
          tokenMint: 'GVMLiqiRzsBUCwCzwkKWeUvWkqmNSKg6TDBhTkuiGLEe',
          amount: 3,
          underlyingMint: 'So11111111111111111111111111111111111111112',
          underlyingAmount: 2.25,
          usdValue: 225,
          apy: 18.0,
          rewards: 1.11,
          metadata: {
            poolType: 'AMM',
            fee: '0.25%',
            hasRayRewards: true,
            farmingAvailable: true,
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

    it('should return empty array if no LP token balances found', async () => {
      jest.spyOn(adapter as any, 'getCachedPositions').mockResolvedValue(null);
      jest.spyOn(adapter as any, 'getLpTokenBalance').mockResolvedValue(0);
      jest.spyOn(adapter as any, 'cachePositions').mockResolvedValue(undefined);

      const positions = await adapter.getPositions(testWallet);

      expect(positions).toEqual([]);
    });

    it('should create positions for LP token balances', async () => {
      jest.spyOn(adapter as any, 'getCachedPositions').mockResolvedValue(null);
      jest
        .spyOn(adapter as any, 'getLpTokenBalance')
        .mockResolvedValueOnce(1.5) // First LP token
        .mockResolvedValueOnce(0) // Second LP token
        .mockResolvedValueOnce(0); // Third LP token

      const mockPosition = {
        protocol: ProtocolType.RAYDIUM,
        positionType: PositionType.LP_POSITION,
        tokenMint: 'GVMLiqiRzsBUCwCzwkKWeUvWkqmNSKg6TDBhTkuiGLEe',
        amount: 1.5,
        underlyingMint: 'So11111111111111111111111111111111111111112',
        underlyingAmount: 1.125,
        usdValue: 112.5,
        apy: 18.0,
        rewards: 0.56,
        metadata: {
          poolType: 'AMM',
          fee: '0.25%',
          hasRayRewards: true,
          farmingAvailable: true,
        },
      };

      jest
        .spyOn(adapter as any, 'createLpPosition')
        .mockResolvedValue(mockPosition);
      jest.spyOn(adapter as any, 'cachePositions').mockResolvedValue(undefined);

      const positions = await adapter.getPositions(testWallet);

      expect(positions).toHaveLength(1);
      expect(positions[0].protocol).toBe(ProtocolType.RAYDIUM);
      expect(positions[0].positionType).toBe(PositionType.LP_POSITION);
    });

    it('should handle errors gracefully and return empty array', async () => {
      jest.spyOn(adapter as any, 'getCachedPositions').mockResolvedValue(null);
      jest
        .spyOn(adapter as any, 'getLpTokenBalance')
        .mockImplementation(() => {
          throw new Error('RPC Error');
        });

      const positions = await adapter.getPositions(testWallet);

      expect(positions).toEqual([]);
    });
  });

  describe('getProtocolStats', () => {
    it('should return cached stats if available', async () => {
      const mockCachedStats = {
        protocolName: 'Raydium',
        tvl: 500000000,
        apy: 18.0,
        metadata: {
          totalPools: 200,
          hasConcentratedLiquidity: true,
          hasFarms: true,
          rayTokenRewards: true,
          fees: '0.25% - 1%',
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

      expect(stats.protocolName).toBe('Raydium');
      expect(stats.tvl).toBe(500000000);
      expect(stats.apy).toBe(18.0);
      expect(stats.metadata.totalPools).toBe(200);
      expect(stats.metadata.hasConcentratedLiquidity).toBe(true);
      expect(stats.metadata.hasFarms).toBe(true);
    });

    it('should return fallback stats on error', async () => {
      jest.spyOn(adapter as any, 'getCachedStats').mockResolvedValue(null);
      jest
        .spyOn(adapter as any, 'cacheStats')
        .mockImplementation(async () => {
          throw new Error('Cache Error');
        });

      const stats = await adapter.getProtocolStats();

      expect(stats.protocolName).toBe('Raydium');
      expect(stats.tvl).toBe(500000000);
      expect(stats.apy).toBe(15.0);
      expect(stats.metadata.totalPools).toBe(200);
    });
  });

  describe('private helper methods', () => {
    it('should handle LP token balance fetching errors', () => {
      const mockPublicKey = { toString: () => testWallet } as any;
      const lpTokenMint = 'GVMLiqiRzsBUCwCzwkKWeUvWkqmNSKg6TDBhTkuiGLEe';

      mockBlockchainService.getConnection.mockReturnValue({
        // Mock connection that throws an error
      } as any);

      const balance = (adapter as any).getLpTokenBalance(
        mockPublicKey,
        lpTokenMint,
      );
      expect(balance).toBe(0);
    });

    it('should create LP position with correct properties', async () => {
      const lpTokenMint = 'GVMLiqiRzsBUCwCzwkKWeUvWkqmNSKg6TDBhTkuiGLEe';
      const balance = 2.5;

      const mockStats = {
        protocolName: 'Raydium',
        tvl: 500000000,
        apy: 18.0,
        metadata: { totalPools: 200 },
      };

      jest.spyOn(adapter, 'getProtocolStats').mockResolvedValue(mockStats);

      const position = await (adapter as any).createLpPosition(
        lpTokenMint,
        balance,
      );

      expect(position).toBeDefined();
      expect(position.protocol).toBe(ProtocolType.RAYDIUM);
      expect(position.positionType).toBe(PositionType.LP_POSITION);
      expect(position.tokenMint).toBe(lpTokenMint);
      expect(position.amount).toBe(balance);
      expect(position.metadata.poolType).toBe('AMM');
      expect(position.metadata.hasRayRewards).toBe(true);
    });

    it('should handle createLpPosition errors', async () => {
      const lpTokenMint = 'GVMLiqiRzsBUCwCzwkKWeUvWkqmNSKg6TDBhTkuiGLEe';
      const balance = 2.5;

      jest
        .spyOn(adapter, 'getProtocolStats')
        .mockImplementation(async () => {
          throw new Error('Stats error');
        });

      const position = await (adapter as any).createLpPosition(
        lpTokenMint,
        balance,
      );

      expect(position).toBeNull();
    });
  });

  describe('error handling', () => {
    it('should handle network errors gracefully in getPositions', async () => {
      const testWallet = '11111111111111111111111111111112';

      jest.spyOn(adapter as any, 'getCachedPositions').mockResolvedValue(null);
      jest
        .spyOn(adapter as any, 'getLpTokenBalance')
        .mockImplementation(() => {
          throw new Error('Network error');
        });

      const positions = await adapter.getPositions(testWallet);
      expect(positions).toEqual([]);
    });

    it('should handle errors in getProtocolStats gracefully', async () => {
      jest
        .spyOn(adapter as any, 'getCachedStats')
        .mockImplementation(async () => {
          throw new Error('Cache error');
        });

      const stats = await adapter.getProtocolStats();

      expect(stats).toBeDefined();
      expect(stats.protocolName).toBe('Raydium');
      expect(typeof stats.tvl).toBe('number');
      expect(typeof stats.apy).toBe('number');
    });
  });
});
