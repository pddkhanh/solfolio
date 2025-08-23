import { Module } from '@nestjs/common';
import { WalletController } from './wallet.controller';
import { WalletService } from './wallet.service';
import { TokenMetadataService } from './token-metadata.service';
import { BlockchainModule } from '../blockchain/blockchain.module';

@Module({
  imports: [BlockchainModule],
  controllers: [WalletController],
  providers: [WalletService, TokenMetadataService],
  exports: [WalletService, TokenMetadataService],
})
export class WalletModule {}