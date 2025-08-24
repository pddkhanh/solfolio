import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { PortfolioGrpcService } from './portfolio.grpc.service';
import { PortfolioGrpcController } from './portfolio.grpc.controller';
import { WalletModule } from '../wallet/wallet.module';
import { PositionsModule } from '../positions/positions.module';
import { PriceModule } from '../price/price.module';
import { WebsocketModule } from '../websocket/websocket.module';
import { CacheModule } from '../cache/cache.module';

@Module({
  imports: [
    WalletModule,
    PositionsModule,
    PriceModule,
    WebsocketModule,
    CacheModule,
    ClientsModule.register([
      {
        name: 'PORTFOLIO_SERVICE',
        transport: Transport.GRPC,
        options: {
          package: 'portfolio',
          protoPath: join(__dirname, './proto/portfolio.proto'),
          url: '0.0.0.0:50051',
        },
      },
    ]),
  ],
  controllers: [PortfolioGrpcController],
  providers: [PortfolioGrpcService],
  exports: [PortfolioGrpcService],
})
export class GrpcModule {}
