import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { BlockchainService } from './blockchain.service';
import { ConnectionManager } from './connection-manager.service';
import { RateLimiterService } from './rate-limiter.service';
import { BlockchainHealthIndicator } from './blockchain.health';
import { CircuitBreakerService } from '../common/circuit-breaker/circuit-breaker.service';
import { RpcBatchService } from './rpc-batch.service';

@Module({
  imports: [ConfigModule],
  providers: [
    BlockchainService,
    ConnectionManager,
    RateLimiterService,
    BlockchainHealthIndicator,
    CircuitBreakerService,
    RpcBatchService,
  ],
  exports: [
    BlockchainService,
    ConnectionManager,
    RateLimiterService,
    BlockchainHealthIndicator,
    RpcBatchService,
  ],
})
export class BlockchainModule {}
