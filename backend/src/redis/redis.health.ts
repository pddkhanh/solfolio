import { Injectable } from '@nestjs/common';
import {
  HealthIndicator,
  HealthIndicatorResult,
  HealthCheckError,
} from '@nestjs/terminus';
import { RedisService } from './redis.service';

@Injectable()
export class RedisHealthIndicator extends HealthIndicator {
  constructor(private readonly redisService: RedisService) {
    super();
  }

  async isHealthy(key: string): Promise<HealthIndicatorResult> {
    const isHealthy = this.redisService.isHealthy();
    const status = this.redisService.getConnectionStatus();

    const result = this.getStatus(key, isHealthy, {
      connected: status.connected,
      retries: status.retries,
    });

    if (isHealthy) {
      return result;
    }

    throw new HealthCheckError('Redis check failed', result);
  }
}