import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { APP_FILTER, APP_INTERCEPTOR, APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { HealthModule } from './health/health.module';
import { BlockchainModule } from './blockchain/blockchain.module';
import { WalletModule } from './wallet/wallet.module';
import { PriceModule } from './price/price.module';
import { MarinadeModule } from './marinade/marinade.module';
import { KaminoModule } from './kamino/kamino.module';
import { PositionsModule } from './positions/positions.module';
import { RedisModule } from './redis/redis.module';
import { WebsocketModule } from './websocket/websocket.module';
import { 
  GlobalExceptionFilter, 
  LoggingInterceptor, 
  RateLimitGuard,
  CircuitBreakerService 
} from './common';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    ScheduleModule.forRoot(),
    RedisModule,
    HealthModule,
    BlockchainModule,
    WalletModule,
    PriceModule,
    MarinadeModule,
    KaminoModule,
    PositionsModule,
    WebsocketModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    CircuitBreakerService,
    {
      provide: APP_FILTER,
      useClass: GlobalExceptionFilter,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
    {
      provide: APP_GUARD,
      useClass: RateLimitGuard,
    },
  ],
})
export class AppModule {}
