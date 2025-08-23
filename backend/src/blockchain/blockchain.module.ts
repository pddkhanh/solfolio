import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { BlockchainService } from './blockchain.service';
import { ConnectionManager } from './connection-manager.service';
import { RateLimiterService } from './rate-limiter.service';
import { BlockchainHealthIndicator } from './blockchain.health';

@Module({
  imports: [ConfigModule],
  providers: [
    BlockchainService,
    ConnectionManager,
    RateLimiterService,
    BlockchainHealthIndicator,
  ],
  exports: [BlockchainService, ConnectionManager, BlockchainHealthIndicator],
})
export class BlockchainModule {}
