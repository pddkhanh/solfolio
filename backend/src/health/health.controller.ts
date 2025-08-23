import { Controller, Get, Optional } from '@nestjs/common';
import {
  HealthCheck,
  HealthCheckService,
  HttpHealthIndicator,
  MemoryHealthIndicator,
  DiskHealthIndicator,
} from '@nestjs/terminus';
import { BlockchainHealthIndicator } from '../blockchain/blockchain.health';

@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private http: HttpHealthIndicator,
    private memory: MemoryHealthIndicator,
    private disk: DiskHealthIndicator,
    @Optional() private blockchain?: BlockchainHealthIndicator,
  ) {}

  @Get()
  @HealthCheck()
  check() {
    const checks = [
      // Check if process is using less than 300MB heap
      () => this.memory.checkHeap('memory_heap', 300 * 1024 * 1024),
      // Check if process is using less than 300MB RSS
      () => this.memory.checkRSS('memory_rss', 300 * 1024 * 1024),
    ];

    // Add blockchain health check if available
    if (this.blockchain) {
      checks.push(() => this.blockchain.isHealthy('blockchain'));
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
