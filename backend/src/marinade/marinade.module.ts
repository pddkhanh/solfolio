import { Module, OnModuleInit } from '@nestjs/common';
import { MarinadeService } from './marinade.service';
import { MarinadeAdapter } from '../protocols/adapters/marinade.adapter';
import { BlockchainModule } from '../blockchain/blockchain.module';
import { PriceModule } from '../price/price.module';
import { RedisModule } from '../redis/redis.module';
import { ProtocolsModule } from '../protocols/protocols.module';
import { ProtocolAdapterRegistry } from '../protocols/protocol-adapter.registry';

@Module({
  imports: [BlockchainModule, PriceModule, RedisModule, ProtocolsModule],
  providers: [MarinadeService, MarinadeAdapter],
  exports: [MarinadeService, MarinadeAdapter],
})
export class MarinadeModule implements OnModuleInit {
  constructor(
    private readonly marinadeAdapter: MarinadeAdapter,
    private readonly registry: ProtocolAdapterRegistry,
  ) {}

  onModuleInit() {
    this.registry.register(this.marinadeAdapter);
  }
}
