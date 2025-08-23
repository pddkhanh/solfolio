import { Module } from '@nestjs/common';
import { WalletController } from './wallet.controller';
import { WalletService } from './wallet.service';
import { TokenMetadataService } from './token-metadata.service';
import { BlockchainModule } from '../blockchain/blockchain.module';
import { PriceModule } from '../price/price.module';

@Module({
  imports: [BlockchainModule, PriceModule],
  controllers: [WalletController],
  providers: [WalletService, TokenMetadataService],
  exports: [WalletService, TokenMetadataService],
})
export class WalletModule {}
