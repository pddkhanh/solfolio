import { Module, OnModuleInit } from '@nestjs/common';
import { JitoAdapter } from '../protocols/adapters/jito.adapter';
import { BlockchainModule } from '../blockchain/blockchain.module';
import { PriceModule } from '../price/price.module';
import { RedisModule } from '../redis/redis.module';
import { ProtocolsModule } from '../protocols/protocols.module';
import { ProtocolAdapterRegistry } from '../protocols/protocol-adapter.registry';

@Module({
  imports: [BlockchainModule, PriceModule, RedisModule, ProtocolsModule],
  providers: [JitoAdapter],
  exports: [JitoAdapter],
})
export class JitoModule implements OnModuleInit {
  constructor(
    private readonly jitoAdapter: JitoAdapter,
    private readonly registry: ProtocolAdapterRegistry,
  ) {}

  onModuleInit() {
    this.registry.register(this.jitoAdapter);
  }
}
