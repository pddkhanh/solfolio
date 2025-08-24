import { Test, TestingModule } from '@nestjs/testing';
import { ProtocolAdapterRegistry } from './protocol-adapter.registry';
import {
  IProtocolAdapter,
  Position,
  ProtocolStats,
} from './protocol-adapter.interface';
import { ProtocolType, PositionType } from '@prisma/client';

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
        tokenMint: 'mock-token-mint',
        amount: 100,
        underlyingMint: 'underlying-mint',
        underlyingAmount: 110,
        usdValue: 1000,
        apy: 5.5,
        rewards: 0.15,
        metadata: {},
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
    return tokenMint === 'mock-token-mint';
  }

  invalidateCache(): Promise<void> {
    return Promise.resolve();
  }
}

describe('ProtocolAdapterRegistry', () => {
  let registry: ProtocolAdapterRegistry;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ProtocolAdapterRegistry],
    }).compile();

    registry = module.get<ProtocolAdapterRegistry>(ProtocolAdapterRegistry);

    // Mock the logger to prevent console output during tests
    jest.spyOn(registry['logger'], 'log').mockImplementation();
    jest.spyOn(registry['logger'], 'warn').mockImplementation();
    jest.spyOn(registry['logger'], 'error').mockImplementation();
  });

  it('should be defined', () => {
    expect(registry).toBeDefined();
  });

  describe('register', () => {
    it('should register an adapter', () => {
      const adapter = new MockProtocolAdapter(
        ProtocolType.MARINADE,
        'Marinade',
        100,
      );

      registry.register(adapter);

      expect(registry.getAdapter(ProtocolType.MARINADE)).toBe(adapter);
      expect(registry.getAdapterCount()).toBe(1);
    });

    it('should replace existing adapter for same protocol', () => {
      const adapter1 = new MockProtocolAdapter(
        ProtocolType.MARINADE,
        'Marinade V1',
        100,
      );
      const adapter2 = new MockProtocolAdapter(
        ProtocolType.MARINADE,
        'Marinade V2',
        100,
      );

      registry.register(adapter1);
      registry.register(adapter2);

      expect(registry.getAdapter(ProtocolType.MARINADE)).toBe(adapter2);
      expect(registry.getAdapterCount()).toBe(1);
    });

    it('should maintain adapters sorted by priority', () => {
      const adapter1 = new MockProtocolAdapter(
        ProtocolType.MARINADE,
        'Marinade',
        50,
      );
      const adapter2 = new MockProtocolAdapter(
        ProtocolType.KAMINO,
        'Kamino',
        100,
      );
      const adapter3 = new MockProtocolAdapter(ProtocolType.JITO, 'Jito', 75);

      registry.register(adapter1);
      registry.register(adapter2);
      registry.register(adapter3);

      const adaptersByPriority = registry.getAdaptersByPriority();
      expect(adaptersByPriority[0].priority).toBe(100);
      expect(adaptersByPriority[1].priority).toBe(75);
      expect(adaptersByPriority[2].priority).toBe(50);
    });
  });

  describe('unregister', () => {
    it('should remove an adapter', () => {
      const adapter = new MockProtocolAdapter(
        ProtocolType.MARINADE,
        'Marinade',
        100,
      );

      registry.register(adapter);
      expect(registry.getAdapterCount()).toBe(1);

      registry.unregister(ProtocolType.MARINADE);
      expect(registry.getAdapter(ProtocolType.MARINADE)).toBeUndefined();
      expect(registry.getAdapterCount()).toBe(0);
    });
  });

  describe('getAllPositions', () => {
    it('should fetch positions from all adapters in parallel', async () => {
      const adapter1 = new MockProtocolAdapter(
        ProtocolType.MARINADE,
        'Marinade',
        100,
      );
      const adapter2 = new MockProtocolAdapter(
        ProtocolType.KAMINO,
        'Kamino',
        50,
      );

      registry.register(adapter1);
      registry.register(adapter2);

      const positions = await registry.getAllPositions('test-wallet', {
        parallel: true,
      });

      expect(positions.size).toBe(2);
      expect(positions.get(ProtocolType.MARINADE)).toHaveLength(1);
      expect(positions.get(ProtocolType.KAMINO)).toHaveLength(1);
    });

    it('should fetch positions sequentially when parallel is false', async () => {
      const adapter1 = new MockProtocolAdapter(
        ProtocolType.MARINADE,
        'Marinade',
        100,
      );
      const adapter2 = new MockProtocolAdapter(
        ProtocolType.KAMINO,
        'Kamino',
        50,
      );

      registry.register(adapter1);
      registry.register(adapter2);

      const positions = await registry.getAllPositions('test-wallet', {
        parallel: false,
      });

      expect(positions.size).toBe(2);
    });

    it('should handle adapter errors gracefully', async () => {
      const errorAdapter = new MockProtocolAdapter(
        ProtocolType.MARINADE,
        'Error Adapter',
        100,
      );
      errorAdapter.getPositions = jest
        .fn()
        .mockRejectedValue(new Error('Test error'));

      const workingAdapter = new MockProtocolAdapter(
        ProtocolType.KAMINO,
        'Working Adapter',
        50,
      );

      registry.register(errorAdapter);
      registry.register(workingAdapter);

      const positions = await registry.getAllPositions('test-wallet');

      expect(positions.size).toBe(1);
      expect(positions.get(ProtocolType.KAMINO)).toHaveLength(1);
    });

    it('should timeout slow adapters', async () => {
      const slowAdapter = new MockProtocolAdapter(
        ProtocolType.MARINADE,
        'Slow Adapter',
        100,
      );
      let timeoutId: NodeJS.Timeout | undefined;
      slowAdapter.getPositions = jest.fn().mockImplementation(
        () =>
          new Promise((resolve) => {
            timeoutId = setTimeout(resolve, 5000);
          }),
      );

      registry.register(slowAdapter);

      const positions = await registry.getAllPositions('test-wallet', {
        timeout: 100,
      });

      expect(positions.size).toBe(0);

      // Clean up the timeout
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    });
  });

  describe('getAllPositionsFlat', () => {
    it('should return flat array of all positions', async () => {
      const adapter1 = new MockProtocolAdapter(
        ProtocolType.MARINADE,
        'Marinade',
        100,
      );
      const adapter2 = new MockProtocolAdapter(
        ProtocolType.KAMINO,
        'Kamino',
        50,
      );

      registry.register(adapter1);
      registry.register(adapter2);

      const positions = await registry.getAllPositionsFlat('test-wallet');

      expect(positions).toHaveLength(2);
      expect(positions[0].protocol).toBeDefined();
      expect(positions[1].protocol).toBeDefined();
    });
  });

  describe('findAdapterForToken', () => {
    it('should find adapter that supports a token', () => {
      const adapter = new MockProtocolAdapter(
        ProtocolType.MARINADE,
        'Marinade',
        100,
      );

      registry.register(adapter);

      const found = registry.findAdapterForToken('mock-token-mint');
      expect(found).toBe(adapter);
    });

    it('should return undefined for unsupported token', () => {
      const adapter = new MockProtocolAdapter(
        ProtocolType.MARINADE,
        'Marinade',
        100,
      );

      registry.register(adapter);

      const found = registry.findAdapterForToken('unsupported-token');
      expect(found).toBeUndefined();
    });
  });

  describe('invalidateAllCaches', () => {
    it('should call invalidateCache on all adapters', async () => {
      const adapter1 = new MockProtocolAdapter(
        ProtocolType.MARINADE,
        'Marinade',
        100,
      );
      const adapter2 = new MockProtocolAdapter(
        ProtocolType.KAMINO,
        'Kamino',
        50,
      );

      adapter1.invalidateCache = jest.fn();
      adapter2.invalidateCache = jest.fn();

      registry.register(adapter1);
      registry.register(adapter2);

      await registry.invalidateAllCaches('test-wallet');

      expect(adapter1.invalidateCache).toHaveBeenCalledWith('test-wallet');
      expect(adapter2.invalidateCache).toHaveBeenCalledWith('test-wallet');
    });
  });

  describe('getRegisteredProtocols', () => {
    it('should return list of registered protocol types', () => {
      const adapter1 = new MockProtocolAdapter(
        ProtocolType.MARINADE,
        'Marinade',
        100,
      );
      const adapter2 = new MockProtocolAdapter(
        ProtocolType.KAMINO,
        'Kamino',
        50,
      );

      registry.register(adapter1);
      registry.register(adapter2);

      const protocols = registry.getRegisteredProtocols();
      expect(protocols).toContain(ProtocolType.MARINADE);
      expect(protocols).toContain(ProtocolType.KAMINO);
      expect(protocols).toHaveLength(2);
    });
  });
});
