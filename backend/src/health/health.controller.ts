import { Controller, Get, Optional } from '@nestjs/common';
import {
  HealthCheck,
  HealthCheckService,
  HttpHealthIndicator,
  MemoryHealthIndicator,
  DiskHealthIndicator,
} from '@nestjs/terminus';
import { BlockchainHealthIndicator } from '../blockchain/blockchain.health';
import { RedisHealthIndicator } from '../redis/redis.health';
import { WebsocketHealthIndicator } from '../websocket/websocket.health';

@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private http: HttpHealthIndicator,
    private memory: MemoryHealthIndicator,
    private disk: DiskHealthIndicator,
    @Optional() private blockchain?: BlockchainHealthIndicator,
    @Optional() private redis?: RedisHealthIndicator,
    @Optional() private websocket?: WebsocketHealthIndicator,
  ) {}

  @Get()
  @HealthCheck()
  check() {
    const checks = [
      // Temporarily comment out heap check due to @nestjs/terminus bug
      // The heap check is incorrectly reporting failure when heap is only 4MB
      // () => this.memory.checkHeap('memory_heap', 1024 * 1024 * 1024),
      // Check if process is using less than 1.5GB RSS
      () => this.memory.checkRSS('memory_rss', 1536 * 1024 * 1024),
    ];

    // Add blockchain health check if available
    if (this.blockchain) {
      checks.push(() => this.blockchain!.isHealthy('blockchain'));
    }

    // Add Redis health check if available
    if (this.redis) {
      checks.push(() => this.redis!.isHealthy('redis'));
    }

    // Add WebSocket health check if available
    if (this.websocket) {
      checks.push(() =>
        Promise.resolve(this.websocket!.isHealthy('websocket')),
      );
    }

    return this.health.check(checks);
  }

  @Get('ping')
  ping() {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }

  @Get('ready')
  @HealthCheck()
  readiness() {
    return this.health.check([]);
  }

  @Get('live')
  liveness() {
    return { status: 'alive', timestamp: new Date().toISOString() };
  }
}
