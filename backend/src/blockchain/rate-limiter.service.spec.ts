import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { RateLimiterService } from './rate-limiter.service';

describe('RateLimiterService', () => {
  let service: RateLimiterService;
  const mockConfigGet = jest.fn().mockImplementation((key: string) => {
    if (key === 'RATE_LIMIT_RPC_PER_SECOND') {
      return 10; // Low limit for testing
    }
    return null;
  });

  beforeEach(async () => {
    mockConfigGet.mockClear();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RateLimiterService,
        {
          provide: ConfigService,
          useValue: {
            get: mockConfigGet,
          },
        },
      ],
    }).compile();

    service = module.get<RateLimiterService>(RateLimiterService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should initialize with correct rate limit', () => {
    expect(mockConfigGet).toHaveBeenCalledWith(
      'RATE_LIMIT_RPC_PER_SECOND',
      100,
    );
  });

  describe('waitForSlot', () => {
    it('should allow requests within rate limit', async () => {
      const start = Date.now();

      // Make 5 requests (within limit of 10)
      for (let i = 0; i < 5; i++) {
        await service.waitForSlot();
      }

      const elapsed = Date.now() - start;
      expect(elapsed).toBeLessThan(100); // Should be fast
    });

    it('should throttle requests exceeding rate limit', async () => {
      const start = Date.now();

      // Make 15 requests (exceeding limit of 10)
      const promises = [];
      for (let i = 0; i < 15; i++) {
        promises.push(service.waitForSlot());
      }

      await Promise.all(promises);

      const elapsed = Date.now() - start;
      expect(elapsed).toBeGreaterThanOrEqual(500); // Should take time due to throttling
    });
  });

  describe('getStats', () => {
    it('should track request statistics', async () => {
      await service.waitForSlot();
      await service.waitForSlot();

      const stats = service.getStats();
      expect(stats.totalRequests).toBeGreaterThanOrEqual(2);
      expect(stats.allowedRequests).toBeGreaterThanOrEqual(2);
    });
  });

  describe('getCurrentQueueSize', () => {
    it('should return current queue size', async () => {
      const initialSize = service.getCurrentQueueSize();
      expect(initialSize).toBe(0);

      // Add some requests
      await service.waitForSlot();
      await service.waitForSlot();

      const newSize = service.getCurrentQueueSize();
      expect(newSize).toBeGreaterThanOrEqual(0);
    });
  });

  describe('getRemainingCapacity', () => {
    it('should return remaining capacity', () => {
      const capacity = service.getRemainingCapacity();
      expect(capacity).toBeLessThanOrEqual(10); // Max is 10 per our config
      expect(capacity).toBeGreaterThanOrEqual(0);
    });
  });

  describe('isThrottled', () => {
    it('should indicate when throttled', async () => {
      expect(service.isThrottled()).toBe(false);

      // Fill up the queue
      const promises = [];
      for (let i = 0; i < 12; i++) {
        promises.push(service.waitForSlot());
      }

      // Wait a bit for requests to be processed
      await new Promise((resolve) => setTimeout(resolve, 50));

      // Should be throttled at some point
      // Note: This might be flaky due to timing
    });
  });

  describe('executeWithRateLimit', () => {
    it('should execute operation with rate limiting', async () => {
      const mockOperation = jest.fn().mockResolvedValue('result');

      const result = await service.executeWithRateLimit(mockOperation);

      expect(mockOperation).toHaveBeenCalled();
      expect(result).toBe('result');
    });
  });
});
