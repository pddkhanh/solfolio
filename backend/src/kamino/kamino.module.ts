import { Module, OnModuleInit } from '@nestjs/common';
import { KaminoAdapter } from '../protocols/adapters/kamino.adapter';
import { BlockchainModule } from '../blockchain/blockchain.module';
import { PriceModule } from '../price/price.module';
import { RedisModule } from '../redis/redis.module';
import { ProtocolsModule } from '../protocols/protocols.module';
import { ProtocolAdapterRegistry } from '../protocols/protocol-adapter.registry';

@Module({
  imports: [BlockchainModule, PriceModule, RedisModule, ProtocolsModule],
  providers: [KaminoAdapter],
  exports: [KaminoAdapter],
})
export class KaminoModule implements OnModuleInit {
  constructor(
    private readonly kaminoAdapter: KaminoAdapter,
    private readonly registry: ProtocolAdapterRegistry,
  ) {}

  onModuleInit() {
    this.registry.register(this.kaminoAdapter);
  }
}
