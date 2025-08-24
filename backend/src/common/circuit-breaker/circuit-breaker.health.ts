import { Injectable } from '@nestjs/common';
import {
  HealthIndicator,
  HealthIndicatorResult,
  HealthCheckError,
} from '@nestjs/terminus';
import {
  CircuitBreakerService,
  CircuitBreakerState,
} from './circuit-breaker.service';

@Injectable()
export class CircuitBreakerHealthIndicator extends HealthIndicator {
  constructor(private readonly circuitBreakerService: CircuitBreakerService) {
    super();
  }

  isHealthy(key: string): HealthIndicatorResult {
    const stats = this.circuitBreakerService.getAllStats();
    const openCircuits = Object.entries(stats).filter(
      ([, stat]) => stat.state === CircuitBreakerState.OPEN,
    );

    const healthData = {
      circuits: Object.keys(stats).length,
      openCircuits: openCircuits.length,
      details: stats,
    };

    const isHealthy = openCircuits.length === 0;

    const result = this.getStatus(key, isHealthy, healthData);

    if (isHealthy) {
      return result;
    }

    throw new HealthCheckError('Circuit breakers are failing', result);
  }
}
