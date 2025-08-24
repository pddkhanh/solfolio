import { Module, Global } from '@nestjs/common';
import { ProtocolAdapterRegistry } from './protocol-adapter.registry';
import { ProtocolsService } from './protocols.service';
import { RedisModule } from '../redis/redis.module';

@Global()
@Module({
  imports: [RedisModule],
  providers: [ProtocolAdapterRegistry, ProtocolsService],
  exports: [ProtocolAdapterRegistry, ProtocolsService],
})
export class ProtocolsModule {}