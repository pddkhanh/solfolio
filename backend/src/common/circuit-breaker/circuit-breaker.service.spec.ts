import { Test, TestingModule } from '@nestjs/testing';
import {
  CircuitBreakerService,
  CircuitBreakerState,
  CircuitBreakerError,
} from './circuit-breaker.service';

describe('CircuitBreakerService', () => {
  let service: CircuitBreakerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CircuitBreakerService],
    }).compile();

    service = module.get<CircuitBreakerService>(CircuitBreakerService);
  });

  afterEach(() => {
    service.resetAll();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('execute', () => {
    it('should execute successfully when circuit is closed', async () => {
      const mockOperation = jest.fn().mockResolvedValue('success');

      const result = await service.execute('test-service', mockOperation);

      expect(result).toBe('success');
      expect(mockOperation).toHaveBeenCalledTimes(1);
    });

    it('should open circuit after reaching failure threshold', async () => {
      const mockOperation = jest
        .fn()
        .mockRejectedValue(new Error('Service error'));

      // Execute multiple times to reach failure threshold (default: 5)
      for (let i = 0; i < 5; i++) {
        try {
          await service.execute('test-service', mockOperation);
        } catch {
          // Expected to fail
        }
      }

      const stats = service.getStats('test-service');
      expect(stats?.state).toBe(CircuitBreakerState.OPEN);
      expect(stats?.failures).toBe(5);
    });

    it('should throw CircuitBreakerError when circuit is open', async () => {
      const mockOperation = jest
        .fn()
        .mockRejectedValue(new Error('Service error'));

      // Open the circuit
      for (let i = 0; i < 5; i++) {
        try {
          await service.execute('test-service', mockOperation);
        } catch {
          // Expected to fail
        }
      }

      // Next call should throw CircuitBreakerError
      await expect(
        service.execute('test-service', mockOperation),
      ).rejects.toThrow(CircuitBreakerError);
    });

    it('should transition to half-open after timeout', async () => {
      const mockOperation = jest
        .fn()
        .mockRejectedValueOnce(new Error('Service error'))
        .mockRejectedValueOnce(new Error('Service error'))
        .mockRejectedValueOnce(new Error('Service error'))
        .mockRejectedValueOnce(new Error('Service error'))
        .mockRejectedValueOnce(new Error('Service error')) // Open circuit
        .mockResolvedValue('success'); // Success in half-open

      const options = {
        timeout: 100,
        failureThreshold: 5,
        successThreshold: 1,
      };

      // Open the circuit
      for (let i = 0; i < 5; i++) {
        try {
          await service.execute('test-service', mockOperation, options);
        } catch {
          // Expected to fail
        }
      }

      expect(service.getStats('test-service')?.state).toBe(
        CircuitBreakerState.OPEN,
      );

      // Wait for timeout
      await new Promise((resolve) => setTimeout(resolve, 150));

      // Next call should succeed and close circuit
      const result = await service.execute(
        'test-service',
        mockOperation,
        options,
      );
      expect(result).toBe('success');
      expect(service.getStats('test-service')?.state).toBe(
        CircuitBreakerState.CLOSED,
      );
    });

    it('should track success count in half-open state', async () => {
      const mockOperation = jest
        .fn()
        .mockRejectedValue(new Error('Service error'));

      const successMockOperation = jest.fn().mockResolvedValue('success');

      const options = {
        timeout: 100,
        failureThreshold: 5,
        successThreshold: 3,
      };

      // Open the circuit
      for (let i = 0; i < 5; i++) {
        try {
          await service.execute('test-service', mockOperation, options);
        } catch {
          // Expected to fail
        }
      }

      // Wait for timeout to transition to half-open
      await new Promise((resolve) => setTimeout(resolve, 150));

      // Execute successful operations
      for (let i = 0; i < 2; i++) {
        await service.execute('test-service', successMockOperation, options);
      }

      let stats = service.getStats('test-service');
      expect(stats?.state).toBe(CircuitBreakerState.HALF_OPEN);
      expect(stats?.successes).toBe(2);

      // One more success should close the circuit
      await service.execute('test-service', successMockOperation, options);

      stats = service.getStats('test-service');
      expect(stats?.state).toBe(CircuitBreakerState.CLOSED);
      expect(stats?.successes).toBe(0); // Reset after closing
    });

    it('should reset circuit on manual reset', async () => {
      const mockOperation = jest
        .fn()
        .mockRejectedValue(new Error('Service error'));

      // Open the circuit
      for (let i = 0; i < 5; i++) {
        try {
          await service.execute('test-service', mockOperation);
        } catch {
          // Expected to fail
        }
      }

      expect(service.getStats('test-service')?.state).toBe(
        CircuitBreakerState.OPEN,
      );

      // Reset the circuit
      service.reset('test-service');

      const stats = service.getStats('test-service');
      expect(stats?.state).toBe(CircuitBreakerState.CLOSED);
      expect(stats?.failures).toBe(0);
      expect(stats?.successes).toBe(0);
    });

    it('should handle multiple services independently', async () => {
      const failingOperation = jest
        .fn()
        .mockRejectedValue(new Error('Service error'));
      const successOperation = jest.fn().mockResolvedValue('success');

      // Fail service1
      for (let i = 0; i < 5; i++) {
        try {
          await service.execute('service1', failingOperation);
        } catch {
          // Expected to fail
        }
      }

      // Succeed with service2
      await service.execute('service2', successOperation);

      expect(service.getStats('service1')?.state).toBe(
        CircuitBreakerState.OPEN,
      );
      expect(service.getStats('service2')?.state).toBe(
        CircuitBreakerState.CLOSED,
      );
    });

    it('should track total statistics', async () => {
      const mockOperation = jest
        .fn()
        .mockResolvedValueOnce('success1')
        .mockResolvedValueOnce('success2')
        .mockRejectedValueOnce(new Error('error1'));

      await service.execute('test-service', mockOperation);
      await service.execute('test-service', mockOperation);

      try {
        await service.execute('test-service', mockOperation);
      } catch {
        // Expected to fail
      }

      const stats = service.getStats('test-service');
      expect(stats?.totalRequests).toBe(3);
      expect(stats?.totalSuccesses).toBe(2);
      expect(stats?.totalFailures).toBe(1);
    });
  });

  describe('getAllStats', () => {
    it('should return stats for all services', async () => {
      const mockOperation = jest.fn().mockResolvedValue('success');

      await service.execute('service1', mockOperation);
      await service.execute('service2', mockOperation);

      const allStats = service.getAllStats();

      expect(Object.keys(allStats)).toHaveLength(2);
      expect(allStats['service1']).toBeDefined();
      expect(allStats['service2']).toBeDefined();
    });
  });

  describe('resetAll', () => {
    it('should reset all circuits', async () => {
      const failingOperation = jest
        .fn()
        .mockRejectedValue(new Error('Service error'));

      // Create multiple circuits with failures
      for (let i = 0; i < 5; i++) {
        try {
          await service.execute('service1', failingOperation);
          await service.execute('service2', failingOperation);
        } catch {
          // Expected to fail
        }
      }

      expect(service.getStats('service1')?.state).toBe(
        CircuitBreakerState.OPEN,
      );
      expect(service.getStats('service2')?.state).toBe(
        CircuitBreakerState.OPEN,
      );

      service.resetAll();

      expect(service.getStats('service1')?.state).toBe(
        CircuitBreakerState.CLOSED,
      );
      expect(service.getStats('service2')?.state).toBe(
        CircuitBreakerState.CLOSED,
      );
    });
  });
});
