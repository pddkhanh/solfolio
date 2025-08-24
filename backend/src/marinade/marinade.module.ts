import { Module } from '@nestjs/common';
import { MarinadeService } from './marinade.service';
import { BlockchainModule } from '../blockchain/blockchain.module';
import { PriceModule } from '../price/price.module';

@Module({
  imports: [BlockchainModule, PriceModule],
  providers: [MarinadeService],
  exports: [MarinadeService],
})
export class MarinadeModule {}
