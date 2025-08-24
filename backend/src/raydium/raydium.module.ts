import { Module, OnModuleInit } from '@nestjs/common';
import { RaydiumAdapter } from '../protocols/adapters/raydium.adapter';
import { BlockchainModule } from '../blockchain/blockchain.module';
import { PriceModule } from '../price/price.module';
import { RedisModule } from '../redis/redis.module';
import { ProtocolsModule } from '../protocols/protocols.module';
import { ProtocolAdapterRegistry } from '../protocols/protocol-adapter.registry';

@Module({
  imports: [BlockchainModule, PriceModule, RedisModule, ProtocolsModule],
  providers: [RaydiumAdapter],
  exports: [RaydiumAdapter],
})
export class RaydiumModule implements OnModuleInit {
  constructor(
    private readonly raydiumAdapter: RaydiumAdapter,
    private readonly registry: ProtocolAdapterRegistry,
  ) {}

  onModuleInit() {
    this.registry.register(this.raydiumAdapter);
  }
}