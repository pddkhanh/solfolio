import { Module, forwardRef } from '@nestjs/common';
import { WebsocketGateway } from './websocket.gateway';
import { WebsocketService } from './websocket.service';
import { RedisModule } from '../redis/redis.module';
import { PriceModule } from '../price/price.module';
import { WalletModule } from '../wallet/wallet.module';
import { PositionsModule } from '../positions/positions.module';

@Module({
  imports: [
    RedisModule,
    forwardRef(() => PriceModule),
    forwardRef(() => WalletModule),
    PositionsModule,
  ],
  providers: [WebsocketGateway, WebsocketService],
  exports: [WebsocketService],
})
export class WebsocketModule {}
