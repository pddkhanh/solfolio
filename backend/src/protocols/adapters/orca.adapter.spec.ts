import { Test, TestingModule } from '@nestjs/testing';
import { OrcaAdapter } from './orca.adapter';
import { BlockchainService } from '../../blockchain/blockchain.service';
import { PriceService } from '../../price/price.service';
import { RedisService } from '../../redis/redis.service';
import { ProtocolType, PositionType } from '@prisma/client';

describe('OrcaAdapter', () => {
  let adapter: OrcaAdapter;
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
        OrcaAdapter,
        { provide: BlockchainService, useValue: mockBlockchainService },
        { provide: PriceService, useValue: mockPriceService },
        { provide: RedisService, useValue: mockRedisService },
      ],
    }).compile();

    adapter = module.get<OrcaAdapter>(OrcaAdapter);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    it('should be defined', () => {
      expect(adapter).toBeDefined();
    });

    it('should have correct protocol properties', () => {
      expect(adapter.protocolType).toBe(ProtocolType.ORCA);
      expect(adapter.protocolName).toBe('Orca');
      expect(adapter.priority).toBe(85);
    });
  });

  describe('isSupported', () => {
    it('should return true for supported LP tokens', () => {
      const solUsdcLp = '7qbRF6YsyGuLUVs6Y1q64bdVrfe4ZcUUz1JRdoVNUJnm';
      const orcaUsdcLp = '2p7nYbtPBgtmY69NsE8DAW6szpRJn7tQvDnqvoEWQvjY';

      expect(adapter.isSupported(solUsdcLp)).toBe(true);
      expect(adapter.isSupported(orcaUsdcLp)).toBe(true);
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
          protocol: ProtocolType.ORCA,
          positionType: PositionType.LP_POSITION,
          tokenMint: '7qbRF6YsyGuLUVs6Y1q64bdVrfe4ZcUUz1JRdoVNUJnm',
          amount: 5,
          underlyingMint: 'So11111111111111111111111111111111111111112',
          underlyingAmount: 2.5,
          usdValue: 250,
          apy: 15.0,
          rewards: 1.03,
          metadata: {
            poolType: 'Whirlpool',
            fee: '0.3%',
            isConcentratedLiquidity: true,
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
        .mockResolvedValueOnce(2) // First LP token
        .mockResolvedValueOnce(0); // Second LP token

      const mockPosition = {
        protocol: ProtocolType.ORCA,
        positionType: PositionType.LP_POSITION,
        tokenMint: '7qbRF6YsyGuLUVs6Y1q64bdVrfe4ZcUUz1JRdoVNUJnm',
        amount: 2,
        underlyingMint: 'So11111111111111111111111111111111111111112',
        underlyingAmount: 1,
        usdValue: 100,
        apy: 15.0,
        rewards: 0.41,
        metadata: {
          poolType: 'Whirlpool',
          fee: '0.3%',
          isConcentratedLiquidity: true,
        },
      };

      jest
        .spyOn(adapter as any, 'createLpPosition')
        .mockResolvedValue(mockPosition);
      jest.spyOn(adapter as any, 'cachePositions').mockResolvedValue(undefined);

      const positions = await adapter.getPositions(testWallet);

      expect(positions).toHaveLength(1);
      expect(positions[0].protocol).toBe(ProtocolType.ORCA);
      expect(positions[0].positionType).toBe(PositionType.LP_POSITION);
    });

    it('should handle errors gracefully and return empty array', async () => {
      jest.spyOn(adapter as any, 'getCachedPositions').mockResolvedValue(null);
      jest
        .spyOn(adapter as any, 'getLpTokenBalance')
        .mockRejectedValue(new Error('RPC Error'));

      const positions = await adapter.getPositions(testWallet);

      expect(positions).toEqual([]);
    });
  });

  describe('getProtocolStats', () => {
    it('should return cached stats if available', async () => {
      const mockCachedStats = {
        protocolName: 'Orca',
        tvl: 350000000,
        apy: 15.0,
        metadata: {
          totalPools: 100,
          whirlpools: true,
          concentratedLiquidity: true,
          fees: '0.01% - 1%',
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

      expect(stats.protocolName).toBe('Orca');
      expect(stats.tvl).toBe(350000000);
      expect(stats.apy).toBe(15.0);
      expect(stats.metadata.totalPools).toBe(100);
      expect(stats.metadata.whirlpools).toBe(true);
    });

    it('should return fallback stats on error', async () => {
      jest.spyOn(adapter as any, 'getCachedStats').mockResolvedValue(null);
      jest
        .spyOn(adapter as any, 'cacheStats')
        .mockRejectedValue(new Error('Cache Error'));

      const stats = await adapter.getProtocolStats();

      expect(stats.protocolName).toBe('Orca');
      expect(stats.tvl).toBe(350000000);
      expect(stats.apy).toBe(12.0);
      expect(stats.metadata.totalPools).toBe(100);
    });
  });

  describe('private helper methods', () => {
    it('should handle LP token balance fetching errors', async () => {
      const mockPublicKey = { toString: () => testWallet } as any;
      const lpTokenMint = '7qbRF6YsyGuLUVs6Y1q64bdVrfe4ZcUUz1JRdoVNUJnm';

      mockBlockchainService.getConnection.mockReturnValue({
        // Mock connection that throws an error
      } as any);

      const balance = await (adapter as any).getLpTokenBalance(
        mockPublicKey,
        lpTokenMint,
      );
      expect(balance).toBe(0);
    });

    it('should create LP position with correct properties', async () => {
      const lpTokenMint = '7qbRF6YsyGuLUVs6Y1q64bdVrfe4ZcUUz1JRdoVNUJnm';
      const balance = 5;

      const mockStats = {
        protocolName: 'Orca',
        tvl: 350000000,
        apy: 15.0,
        metadata: { totalPools: 100 },
      };

      jest.spyOn(adapter, 'getProtocolStats').mockResolvedValue(mockStats);

      const position = await (adapter as any).createLpPosition(
        lpTokenMint,
        balance,
      );

      expect(position).toBeDefined();
      expect(position.protocol).toBe(ProtocolType.ORCA);
      expect(position.positionType).toBe(PositionType.LP_POSITION);
      expect(position.tokenMint).toBe(lpTokenMint);
      expect(position.amount).toBe(balance);
    });

    it('should handle createLpPosition errors', async () => {
      const lpTokenMint = '7qbRF6YsyGuLUVs6Y1q64bdVrfe4ZcUUz1JRdoVNUJnm';
      const balance = 5;

      jest
        .spyOn(adapter, 'getProtocolStats')
        .mockRejectedValue(new Error('Stats error'));

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
      expect(stats.protocolName).toBe('Orca');
      expect(typeof stats.tvl).toBe('number');
      expect(typeof stats.apy).toBe('number');
    });
  });
});
