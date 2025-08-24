import { Module, Global } from '@nestjs/common';
import { HeliusService } from './helius.service';

@Global()
@Module({
  providers: [HeliusService],
  exports: [HeliusService],
})
export class HeliusModule {}