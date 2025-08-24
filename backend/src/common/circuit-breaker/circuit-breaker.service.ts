import { Injectable, Logger } from '@nestjs/common';

export enum CircuitBreakerState {
  CLOSED = 'closed',
  OPEN = 'open',
  HALF_OPEN = 'half_open',
}

export interface CircuitBreakerOptions {
  failureThreshold: number; // Number of failures before opening circuit
  successThreshold: number; // Number of successes in half-open to close circuit
  timeout: number; // Time in ms before transitioning from open to half-open
  resetTimeoutOnSuccess?: boolean; // Reset timeout on successful call
  monitoringPeriod?: number; // Time window for failure counting (ms)
}

export class CircuitBreakerError extends Error {
  constructor(
    public readonly service: string,
    message?: string,
  ) {
    super(message || `Circuit breaker is OPEN for service: ${service}`);
    this.name = 'CircuitBreakerError';
  }
}

interface CircuitBreakerStats {
  state: CircuitBreakerState;
  failures: number;
  successes: number;
  lastFailureTime?: number;
  lastSuccessTime?: number;
  nextAttemptTime?: number;
  totalRequests: number;
  totalFailures: number;
  totalSuccesses: number;
}

@Injectable()
export class CircuitBreakerService {
  private readonly logger = new Logger(CircuitBreakerService.name);
  private readonly circuits = new Map<string, CircuitBreakerStats>();
  private readonly defaultOptions: CircuitBreakerOptions = {
    failureThreshold: 5,
    successThreshold: 3,
    timeout: 60000, // 1 minute
    resetTimeoutOnSuccess: false,
    monitoringPeriod: 120000, // 2 minutes
  };

  async execute<T>(
    serviceId: string,
    operation: () => Promise<T>,
    options?: Partial<CircuitBreakerOptions>,
  ): Promise<T> {
    const opts = { ...this.defaultOptions, ...options };
    const stats = this.getOrCreateStats(serviceId);

    // Check if circuit is open
    if (stats.state === CircuitBreakerState.OPEN) {
      if (Date.now() < (stats.nextAttemptTime || 0)) {
        this.logger.warn(`Circuit breaker OPEN for ${serviceId}`);
        throw new CircuitBreakerError(serviceId);
      }

      // Transition to half-open
      stats.state = CircuitBreakerState.HALF_OPEN;
      stats.successes = 0;
      this.logger.log(
        `Circuit breaker transitioning to HALF-OPEN for ${serviceId}`,
      );
    }

    try {
      const result = await operation();
      this.onSuccess(serviceId, opts);
      return result;
    } catch (error) {
      this.onFailure(serviceId, error, opts);
      throw error;
    }
  }

  private getOrCreateStats(serviceId: string): CircuitBreakerStats {
    if (!this.circuits.has(serviceId)) {
      this.circuits.set(serviceId, {
        state: CircuitBreakerState.CLOSED,
        failures: 0,
        successes: 0,
        totalRequests: 0,
        totalFailures: 0,
        totalSuccesses: 0,
      });
    }
    return this.circuits.get(serviceId)!;
  }

  private onSuccess(serviceId: string, options: CircuitBreakerOptions): void {
    const stats = this.getOrCreateStats(serviceId);
    const now = Date.now();

    stats.successes++;
    stats.totalSuccesses++;
    stats.totalRequests++;
    stats.lastSuccessTime = now;

    // Reset failure count if outside monitoring period
    if (options.monitoringPeriod && stats.lastFailureTime) {
      if (now - stats.lastFailureTime > options.monitoringPeriod) {
        stats.failures = 0;
      }
    }

    if (stats.state === CircuitBreakerState.HALF_OPEN) {
      if (stats.successes >= options.successThreshold) {
        stats.state = CircuitBreakerState.CLOSED;
        stats.failures = 0;
        stats.successes = 0;
        this.logger.log(`Circuit breaker CLOSED for ${serviceId}`);
      }
    }

    if (
      options.resetTimeoutOnSuccess &&
      stats.state === CircuitBreakerState.CLOSED
    ) {
      stats.failures = 0;
    }
  }

  private onFailure(
    serviceId: string,
    error: any,
    options: CircuitBreakerOptions,
  ): void {
    const stats = this.getOrCreateStats(serviceId);
    const now = Date.now();

    stats.failures++;
    stats.totalFailures++;
    stats.totalRequests++;
    stats.lastFailureTime = now;

    // Reset success count if outside monitoring period
    if (options.monitoringPeriod && stats.lastSuccessTime) {
      if (now - stats.lastSuccessTime > options.monitoringPeriod) {
        stats.successes = 0;
      }
    }

    this.logger.warn(
      `Circuit breaker failure for ${serviceId}: ${error instanceof Error ? error.message : String(error)}`,
      {
        failures: stats.failures,
        threshold: options.failureThreshold,
        state: stats.state,
      },
    );

    if (
      stats.state === CircuitBreakerState.CLOSED &&
      stats.failures >= options.failureThreshold
    ) {
      stats.state = CircuitBreakerState.OPEN;
      stats.nextAttemptTime = now + options.timeout;
      this.logger.error(
        `Circuit breaker OPENED for ${serviceId} - threshold exceeded`,
        {
          failures: stats.failures,
          threshold: options.failureThreshold,
          nextAttemptTime: new Date(stats.nextAttemptTime).toISOString(),
        },
      );
    } else if (stats.state === CircuitBreakerState.HALF_OPEN) {
      stats.state = CircuitBreakerState.OPEN;
      stats.nextAttemptTime = now + options.timeout;
      stats.successes = 0;
      this.logger.error(
        `Circuit breaker OPENED for ${serviceId} - failure in half-open state`,
      );
    }
  }

  getStats(serviceId: string): CircuitBreakerStats | undefined {
    return this.circuits.get(serviceId);
  }

  getAllStats(): Record<string, CircuitBreakerStats> {
    const result: Record<string, CircuitBreakerStats> = {};
    for (const [serviceId, stats] of this.circuits.entries()) {
      result[serviceId] = { ...stats };
    }
    return result;
  }

  reset(serviceId: string): void {
    const stats = this.circuits.get(serviceId);
    if (stats) {
      stats.state = CircuitBreakerState.CLOSED;
      stats.failures = 0;
      stats.successes = 0;
      stats.nextAttemptTime = undefined;
      this.logger.log(`Circuit breaker reset for ${serviceId}`);
    }
  }

  resetAll(): void {
    for (const serviceId of this.circuits.keys()) {
      this.reset(serviceId);
    }
    this.logger.log('All circuit breakers reset');
  }
}
