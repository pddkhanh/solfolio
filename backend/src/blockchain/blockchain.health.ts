import { Injectable } from '@nestjs/common';
import {
  HealthIndicator,
  HealthIndicatorResult,
  HealthCheckError,
} from '@nestjs/terminus';
import { BlockchainService } from './blockchain.service';
import { ConnectionManager } from './connection-manager.service';
import { RateLimiterService } from './rate-limiter.service';

@Injectable()
export class BlockchainHealthIndicator extends HealthIndicator {
  constructor(
    private readonly blockchainService: BlockchainService,
    private readonly connectionManager: ConnectionManager,
    private readonly rateLimiter: RateLimiterService,
  ) {
    super();
  }

  async isHealthy(key: string): Promise<HealthIndicatorResult> {
    try {
      const checks = await Promise.all([
        this.checkConnection(),
        this.checkBlockHeight(),
        this.checkRateLimiter(),
      ]);

      const isHealthy = checks.every((check) => check.healthy);
      const details = {
        connection: checks[0],
        blockHeight: checks[1],
        rateLimiter: checks[2],
      };

      const result = this.getStatus(key, isHealthy, details);

      if (!isHealthy) {
        throw new HealthCheckError('Blockchain health check failed', result);
      }

      return result;
    } catch (error) {
      throw new HealthCheckError(
        'Blockchain health check failed',
        this.getStatus(key, false, { error: (error as Error).message }),
      );
    }
  }

  private async checkConnection(): Promise<{
    healthy: boolean;
    message: string;
    activeConnections?: string[];
  }> {
    try {
      const connection = this.blockchainService.getConnection();
      const isConnected =
        await this.connectionManager.testConnection(connection);
      const activeConnections = this.connectionManager.getActiveConnections();

      return {
        healthy: isConnected,
        message: isConnected
          ? `Connected to ${activeConnections.length} RPC endpoint(s)`
          : 'Connection test failed',
        activeConnections,
      };
    } catch (error) {
      return {
        healthy: false,
        message: `Connection error: ${(error as Error).message}`,
      };
    }
  }

  private async checkBlockHeight(): Promise<{
    healthy: boolean;
    blockHeight?: number;
    message: string;
  }> {
    try {
      const blockHeight = await this.blockchainService.getBlockHeight();
      const isHealthy = blockHeight > 0;

      return {
        healthy: isHealthy,
        blockHeight,
        message: isHealthy
          ? `Current block height: ${blockHeight}`
          : 'Unable to fetch block height',
      };
    } catch (error) {
      return {
        healthy: false,
        message: `Block height check failed: ${(error as Error).message}`,
      };
    }
  }

  private checkRateLimiter(): {
    healthy: boolean;
    stats: any;
    message: string;
  } {
    const stats = this.rateLimiter.getStats();
    const capacity = this.rateLimiter.getRemainingCapacity();
    const isThrottled = this.rateLimiter.isThrottled();

    return {
      healthy: !isThrottled || capacity > 10, // Healthy if not throttled or has some capacity
      stats: {
        ...stats,
        remainingCapacity: capacity,
        isThrottled,
      },
      message: isThrottled
        ? `Rate limiter is throttling requests (${capacity} slots available)`
        : `Rate limiter healthy (${capacity} slots available)`,
    };
  }
}
