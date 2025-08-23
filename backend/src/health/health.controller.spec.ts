import { Test, TestingModule } from '@nestjs/testing';
import { HealthController } from './health.controller';
import {
  HealthCheckService,
  HttpHealthIndicator,
  MemoryHealthIndicator,
  DiskHealthIndicator,
} from '@nestjs/terminus';

describe('HealthController', () => {
  let controller: HealthController;
  let healthCheckService: HealthCheckService;

  const mockHealthCheckService = {
    check: jest.fn().mockResolvedValue({
      status: 'ok',
      info: {
        memory_heap: { status: 'up' },
        memory_rss: { status: 'up' },
      },
      error: {},
      details: {
        memory_heap: { status: 'up' },
        memory_rss: { status: 'up' },
      },
    }),
  };

  const mockHttpHealthIndicator = {};
  const mockMemoryHealthIndicator = {
    checkHeap: jest.fn().mockResolvedValue({ memory_heap: { status: 'up' } }),
    checkRSS: jest.fn().mockResolvedValue({ memory_rss: { status: 'up' } }),
  };
  const mockDiskHealthIndicator = {};

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [
        {
          provide: HealthCheckService,
          useValue: mockHealthCheckService,
        },
        {
          provide: HttpHealthIndicator,
          useValue: mockHttpHealthIndicator,
        },
        {
          provide: MemoryHealthIndicator,
          useValue: mockMemoryHealthIndicator,
        },
        {
          provide: DiskHealthIndicator,
          useValue: mockDiskHealthIndicator,
        },
      ],
    }).compile();

    controller = module.get<HealthController>(HealthController);
    healthCheckService = module.get<HealthCheckService>(HealthCheckService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('check()', () => {
    it('should return health check status', async () => {
      const result = await controller.check();
      expect(result).toEqual({
        status: 'ok',
        info: {
          memory_heap: { status: 'up' },
          memory_rss: { status: 'up' },
        },
        error: {},
        details: {
          memory_heap: { status: 'up' },
          memory_rss: { status: 'up' },
        },
      });
      expect(healthCheckService.check).toHaveBeenCalled();
    });
  });

  describe('ping()', () => {
    it('should return ping status', () => {
      const result = controller.ping();
      expect(result.status).toBe('ok');
      expect(result.timestamp).toBeDefined();
    });
  });

  describe('readiness()', () => {
    it('should return readiness status', async () => {
      const result = await controller.readiness();
      expect(result).toBeDefined();
      expect(healthCheckService.check).toHaveBeenCalled();
    });
  });

  describe('liveness()', () => {
    it('should return liveness status', () => {
      const result = controller.liveness();
      expect(result.status).toBe('alive');
      expect(result.timestamp).toBeDefined();
    });
  });
});
