import { Module } from '@nestjs/common';
import { PositionsController } from './positions.controller';
import { PositionsService } from './positions.service';
import { MarinadeModule } from '../marinade/marinade.module';
import { WalletModule } from '../wallet/wallet.module';
import { PriceModule } from '../price/price.module';

@Module({
  imports: [MarinadeModule, WalletModule, PriceModule],
  controllers: [PositionsController],
  providers: [PositionsService],
  exports: [PositionsService],
})
export class PositionsModule {}