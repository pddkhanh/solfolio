import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { HealthModule } from './health/health.module';
import { BlockchainModule } from './blockchain/blockchain.module';
import { WalletModule } from './wallet/wallet.module';
import { PriceModule } from './price/price.module';
import { MarinadeModule } from './marinade/marinade.module';
import { PositionsModule } from './positions/positions.module';
import { RedisModule } from './redis/redis.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    RedisModule,
    HealthModule,
    BlockchainModule,
    WalletModule,
    PriceModule,
    MarinadeModule,
    PositionsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
