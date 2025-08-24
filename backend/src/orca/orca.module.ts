import { Module, OnModuleInit } from '@nestjs/common';
import { OrcaAdapter } from '../protocols/adapters/orca.adapter';
import { BlockchainModule } from '../blockchain/blockchain.module';
import { PriceModule } from '../price/price.module';
import { RedisModule } from '../redis/redis.module';
import { ProtocolsModule } from '../protocols/protocols.module';
import { ProtocolAdapterRegistry } from '../protocols/protocol-adapter.registry';

@Module({
  imports: [BlockchainModule, PriceModule, RedisModule, ProtocolsModule],
  providers: [OrcaAdapter],
  exports: [OrcaAdapter],
})
export class OrcaModule implements OnModuleInit {
  constructor(
    private readonly orcaAdapter: OrcaAdapter,
    private readonly registry: ProtocolAdapterRegistry,
  ) {}

  onModuleInit() {
    this.registry.register(this.orcaAdapter);
  }
}