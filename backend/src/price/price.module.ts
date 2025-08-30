import { Module, forwardRef } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { PriceService } from './price.service';
import { JupiterPriceService } from './jupiter-price.service';
import { PriceStreamService } from './price-stream.service';
import { PriceHistoryService } from './price-history.service';
import { PriceController } from './price.controller';
import { RedisModule } from '../redis/redis.module';
import { WebsocketModule } from '../websocket/websocket.module';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [
    HttpModule,
    ConfigModule,
    RedisModule,
    PrismaModule,
    forwardRef(() => WebsocketModule),
  ],
  controllers: [PriceController],
  providers: [
    PriceService,
    JupiterPriceService,
    PriceStreamService,
    PriceHistoryService,
  ],
  exports: [
    PriceService,
    JupiterPriceService,
    PriceStreamService,
    PriceHistoryService,
  ],
})
export class PriceModule {}
