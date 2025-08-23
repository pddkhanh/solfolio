import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { PriceService } from './price.service';
import { JupiterPriceService } from './jupiter-price.service';
import { PriceController } from './price.controller';

@Module({
  imports: [HttpModule, ConfigModule],
  controllers: [PriceController],
  providers: [PriceService, JupiterPriceService],
  exports: [PriceService, JupiterPriceService],
})
export class PriceModule {}
