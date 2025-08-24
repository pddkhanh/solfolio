import { Test, TestingModule } from '@nestjs/testing';
import { ProtocolsService } from './protocols.service';
import { ProtocolAdapterRegistry } from './protocol-adapter.registry';
import { RedisService } from '../redis/redis.service';
import { ProtocolType, PositionType } from '@prisma/client';
import {
  IProtocolAdapter,
  Position,
  ProtocolStats,
} from './protocol-adapter.interface';

class MockProtocolAdapter implements IProtocolAdapter {
  constructor(
    public readonly protocolType: ProtocolType,
    public readonly protocolName: string,
    public readonly priority: number,
  ) {}

  getPositions(): Promise<Position[]> {
    return Promise.resolve([
      {
        protocol: this.protocolType,
        positionType: PositionType.STAKING,
        tokenMint: `${this.protocolType.toLowerCase()}-token`,
        amount: 100,
        underlyingMint: 'SOL',
        underlyingAmount: 110,
        usdValue: 1000,
        apy: 5.5,
        rewards: 0.15,
        metadata: { protocol: this.protocolName },
      },
    ]);
  }

  getProtocolStats(): Promise<ProtocolStats> {
    return Promise.resolve({
      protocolName: this.protocolName,
      tvl: 1000000,
      apy: 5.5,
      metadata: {},
    });
  }

  isSupported(tokenMint: string): boolean {
    return tokenMint === `${this.protocolType.toLowerCase()}-token`;
  }

  invalidateCache(walletAddress: string): void {
    // Mock implementation
  }
}

describe('ProtocolsService', () => {
  let service: ProtocolsService;
  let registry: ProtocolAdapterRegistry;
  let mockRedisService: any;

  mockRedisService = {
    generateKey: jest.fn((prefix: string, key: string) => `${prefix}:${key}`),
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn(),
    wrap: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProtocolsService,
        ProtocolAdapterRegistry,
        {
          provide: RedisService,
          useValue: mockRedisService,
        },
      ],
    }).compile();

    service = module.get<ProtocolsService>(ProtocolsService);
    registry = module.get<ProtocolAdapterRegistry>(ProtocolAdapterRegistry);
    mockRedisService = module.get<RedisService>(RedisService);

    // Reset mocks
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('fetchAllPositions', () => {
    beforeEach(() => {
      const marinadeAdapter = new MockProtocolAdapter(
        ProtocolType.MARINADE,
        'Marinade Finance',
        100,
      );
      const kaminoAdapter = new MockProtocolAdapter(
        ProtocolType.KAMINO,
        'Kamino Finance',
        80,
      );

      registry.register(marinadeAdapter);
      registry.register(kaminoAdapter);
    });

    it('should fetch positions from all registered protocols', async () => {
      mockRedisService.get.mockResolvedValue(null);

      const result = await service.fetchAllPositions('test-wallet', {
        useCache: false,
      });

      expect(result.walletAddress).toBe('test-wallet');
      expect(result.positions).toHaveLength(2);
      expect(result.byProtocol.size).toBe(2);
      expect(result.totalValue).toBe(2000);
      expect(result.totalRewards).toBeCloseTo(0.3);
    });

    it('should return cached positions when available', async () => {
      const cachedData = {
        walletAddress: 'test-wallet',
        positions: [],
        byProtocol: new Map(),
        totalValue: 5000,
        totalApy: 6.0,
        totalRewards: 1.0,
      };

      mockRedisService.get.mockResolvedValue(cachedData);

      const result = await service.fetchAllPositions('test-wallet');

      expect(result).toEqual(cachedData);
      expect(mockRedisService.get).toHaveBeenCalledWith(
        'all-positions:test-wallet',
      );
    });

    it('should cache fetched positions', async () => {
      mockRedisService.get.mockResolvedValue(null);

      await service.fetchAllPositions('test-wallet', {
        useCache: true,
        cacheTtl: 600,
      });

      expect(mockRedisService.set).toHaveBeenCalledWith(
        'all-positions:test-wallet',
        expect.objectContaining({
          walletAddress: 'test-wallet',
          positions: expect.any(Array),
        }),
        { ttl: 600 },
      );
    });

    it('should calculate weighted APY correctly', async () => {
      mockRedisService.get.mockResolvedValue(null);

      const result = await service.fetchAllPositions('test-wallet', {
        useCache: false,
      });

      // Both positions have same APY (5.5) and same value (1000)
      // Weighted APY should be 5.5
      expect(result.totalApy).toBe(5.5);
    });

    it('should handle parallel fetching option', async () => {
      mockRedisService.get.mockResolvedValue(null);

      const getAllPositionsSpy = jest.spyOn(registry, 'getAllPositions');

      await service.fetchAllPositions('test-wallet', {
        parallel: false,
        useCache: false,
      });

      expect(getAllPositionsSpy).toHaveBeenCalledWith(
        'test-wallet',
        expect.objectContaining({ parallel: false }),
      );
    });
  });

  describe('getPositionsByProtocol', () => {
    it('should fetch positions for specific protocol', async () => {
      const adapter = new MockProtocolAdapter(
        ProtocolType.MARINADE,
        'Marinade Finance',
        100,
      );
      registry.register(adapter);

      const positions = await service.getPositionsByProtocol(
        'test-wallet',
        ProtocolType.MARINADE,
      );

      expect(positions).toHaveLength(1);
      expect(positions[0].protocolName).toBe('Marinade Finance');
      expect(positions[0].protocol).toBe(ProtocolType.MARINADE);
    });

    it('should throw error for unregistered protocol', async () => {
      await expect(
        service.getPositionsByProtocol('test-wallet', ProtocolType.KAMINO),
      ).rejects.toThrow('No adapter registered for protocol: KAMINO');
    });
  });

  describe('invalidatePositionCache', () => {
    it('should invalidate all caches', async () => {
      const adapter1 = new MockProtocolAdapter(
        ProtocolType.MARINADE,
        'Marinade',
        100,
      );
      const adapter2 = new MockProtocolAdapter(
        ProtocolType.KAMINO,
        'Kamino',
        80,
      );

      adapter1.invalidateCache = jest.fn();
      adapter2.invalidateCache = jest.fn();

      registry.register(adapter1);
      registry.register(adapter2);

      await service.invalidatePositionCache('test-wallet');

      expect(adapter1.invalidateCache).toHaveBeenCalledWith('test-wallet');
      expect(adapter2.invalidateCache).toHaveBeenCalledWith('test-wallet');
      expect(mockRedisService.del).toHaveBeenCalledWith(
        'all-positions:test-wallet',
      );
    });
  });

  describe('getRegisteredProtocols', () => {
    it('should return list of registered protocols', () => {
      const adapter1 = new MockProtocolAdapter(
        ProtocolType.MARINADE,
        'Marinade',
        100,
      );
      const adapter2 = new MockProtocolAdapter(
        ProtocolType.KAMINO,
        'Kamino',
        80,
      );

      registry.register(adapter1);
      registry.register(adapter2);

      const protocols = service.getRegisteredProtocols();

      expect(protocols).toContain(ProtocolType.MARINADE);
      expect(protocols).toContain(ProtocolType.KAMINO);
      expect(protocols).toHaveLength(2);
    });
  });

  describe('getAdapterCount', () => {
    it('should return number of registered adapters', () => {
      expect(service.getAdapterCount()).toBe(0);

      const adapter = new MockProtocolAdapter(
        ProtocolType.MARINADE,
        'Marinade',
        100,
      );
      registry.register(adapter);

      expect(service.getAdapterCount()).toBe(1);
    });
  });
});
