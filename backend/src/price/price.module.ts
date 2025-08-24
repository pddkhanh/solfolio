import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { PriceService } from './price.service';
import { JupiterPriceService } from './jupiter-price.service';
import { PriceStreamService } from './price-stream.service';
import { PriceController } from './price.controller';
import { RedisModule } from '../redis/redis.module';

@Module({
  imports: [HttpModule, ConfigModule, RedisModule],
  controllers: [PriceController],
  providers: [PriceService, JupiterPriceService, PriceStreamService],
  exports: [PriceService, JupiterPriceService, PriceStreamService],
})
export class PriceModule {}
