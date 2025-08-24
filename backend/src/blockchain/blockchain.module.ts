import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { BlockchainService } from './blockchain.service';
import { ConnectionManager } from './connection-manager.service';
import { RateLimiterService } from './rate-limiter.service';
import { BlockchainHealthIndicator } from './blockchain.health';
import { CircuitBreakerService } from '../common/circuit-breaker/circuit-breaker.service';

@Module({
  imports: [ConfigModule],
  providers: [
    BlockchainService,
    ConnectionManager,
    RateLimiterService,
    BlockchainHealthIndicator,
    CircuitBreakerService,
  ],
  exports: [
    BlockchainService,
    ConnectionManager,
    RateLimiterService,
    BlockchainHealthIndicator,
  ],
})
export class BlockchainModule {}
