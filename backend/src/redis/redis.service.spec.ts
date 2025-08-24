import { Test, TestingModule } from '@nestjs/testing';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { RedisService } from './redis.service';

describe('RedisService', () => {
  let service: RedisService;

  const mockCacheManager = {
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn(),
    reset: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RedisService,
        {
          provide: CACHE_MANAGER,
          useValue: mockCacheManager,
        },
      ],
    }).compile();

    service = module.get<RedisService>(RedisService);

    // Clear all mocks
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('get', () => {
    it('should return cached value when exists', async () => {
      const testData = { test: 'data' };
      mockCacheManager.get.mockResolvedValue(testData);

      const result = await service.get('test-key');

      expect(result).toEqual(testData);
      expect(mockCacheManager.get).toHaveBeenCalledWith('test-key');
    });

    it('should return null when key does not exist', async () => {
      mockCacheManager.get.mockResolvedValue(null);

      const result = await service.get('non-existent');

      expect(result).toBeNull();
      expect(mockCacheManager.get).toHaveBeenCalledWith('non-existent');
    });

    it('should return null on error', async () => {
      mockCacheManager.get.mockRejectedValue(new Error('Redis error'));

      const result = await service.get('error-key');

      expect(result).toBeNull();
    });
  });

  describe('set', () => {
    it('should set value with default TTL', async () => {
      const testData = { test: 'data' };

      await service.set('test-key', testData);

      expect(mockCacheManager.set).toHaveBeenCalledWith(
        'test-key',
        testData,
        300000, // 5 minutes in milliseconds
      );
    });

    it('should set value with custom TTL', async () => {
      const testData = { test: 'data' };

      await service.set('test-key', testData, { ttl: 60 });

      expect(mockCacheManager.set).toHaveBeenCalledWith(
        'test-key',
        testData,
        60000, // 1 minute in milliseconds
      );
    });

    it('should handle errors gracefully', async () => {
      mockCacheManager.set.mockRejectedValue(new Error('Redis error'));

      // Should not throw
      await expect(service.set('error-key', 'value')).resolves.toBeUndefined();
    });
  });

  describe('del', () => {
    it('should delete a cache key', async () => {
      await service.del('test-key');

      expect(mockCacheManager.del).toHaveBeenCalledWith('test-key');
    });

    it('should handle deletion errors gracefully', async () => {
      mockCacheManager.del.mockRejectedValue(new Error('Redis error'));

      // Should not throw
      await expect(service.del('error-key')).resolves.toBeUndefined();
    });
  });

  describe('reset', () => {
    it('should reset the cache', () => {
      service.reset();

      expect(mockCacheManager.reset).toHaveBeenCalled();
    });

    it('should handle reset errors gracefully', () => {
      mockCacheManager.reset.mockImplementation(() => {
        throw new Error('Redis error');
      });

      // Should not throw
      expect(() => service.reset()).not.toThrow();
    });
  });

  describe('wrap', () => {
    it('should return cached value when exists', async () => {
      const cachedData = { cached: true };
      mockCacheManager.get.mockResolvedValue(cachedData);
      const fn = jest.fn();

      const result = await service.wrap('test-key', fn);

      expect(result).toEqual(cachedData);
      expect(fn).not.toHaveBeenCalled();
      expect(mockCacheManager.get).toHaveBeenCalledWith('test-key');
    });

    it('should execute function and cache result when not cached', async () => {
      const freshData = { fresh: true };
      mockCacheManager.get.mockResolvedValue(null);
      const fn = jest.fn().mockResolvedValue(freshData);

      const result = await service.wrap('test-key', fn);

      expect(result).toEqual(freshData);
      expect(fn).toHaveBeenCalled();
      expect(mockCacheManager.set).toHaveBeenCalledWith(
        'test-key',
        freshData,
        300000,
      );
    });

    it('should refresh TTL when refreshOnGet is true', async () => {
      const cachedData = { cached: true };
      mockCacheManager.get.mockResolvedValue(cachedData);
      const fn = jest.fn();

      const result = await service.wrap('test-key', fn, {
        ttl: 120,
        refreshOnGet: true,
      });

      expect(result).toEqual(cachedData);
      expect(mockCacheManager.set).toHaveBeenCalledWith(
        'test-key',
        cachedData,
        120000,
      );
    });

    it('should fallback to function execution on error', async () => {
      const freshData = { fresh: true };
      mockCacheManager.get.mockRejectedValue(new Error('Redis error'));
      const fn = jest.fn().mockResolvedValue(freshData);

      const result = await service.wrap('test-key', fn);

      expect(result).toEqual(freshData);
      expect(fn).toHaveBeenCalled();
    });
  });

  describe('generateKey', () => {
    it('should generate cache key with prefix', () => {
      const key = service.generateKey('wallet', 'abc123', 'balances');

      expect(key).toBe('wallet:abc123:balances');
    });

    it('should handle numeric parts', () => {
      const key = service.generateKey('position', 123, 456);

      expect(key).toBe('position:123:456');
    });
  });

  describe('mget', () => {
    it('should get multiple keys', async () => {
      mockCacheManager.get
        .mockResolvedValueOnce('value1')
        .mockResolvedValueOnce('value2')
        .mockResolvedValueOnce(null);

      const results = await service.mget(['key1', 'key2', 'key3']);

      expect(results).toEqual(['value1', 'value2', null]);
      expect(mockCacheManager.get).toHaveBeenCalledTimes(3);
    });
  });

  describe('mset', () => {
    it('should set multiple keys', async () => {
      const items = [
        { key: 'key1', value: 'value1' },
        { key: 'key2', value: 'value2', options: { ttl: 60 } },
      ];

      await service.mset(items);

      expect(mockCacheManager.set).toHaveBeenCalledTimes(2);
      expect(mockCacheManager.set).toHaveBeenCalledWith(
        'key1',
        'value1',
        300000,
      );
      expect(mockCacheManager.set).toHaveBeenCalledWith(
        'key2',
        'value2',
        60000,
      );
    });
  });

  describe('connection status', () => {
    it('should report health status', () => {
      expect(service.isHealthy()).toBeDefined();
    });

    it('should get connection status', () => {
      const status = service.getConnectionStatus();

      expect(status).toHaveProperty('connected');
      expect(status).toHaveProperty('retries');
    });
  });
});
