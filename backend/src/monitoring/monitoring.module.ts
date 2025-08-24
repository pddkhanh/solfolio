import { Module } from '@nestjs/common';
import { MonitoringController } from './monitoring.controller';
import { TransactionMonitoringService } from './transaction-monitoring.service';
import { WalletMonitorService } from './wallet-monitor.service';
import { AccountSubscriptionService } from './account-subscription.service';
import { PositionChangeDetectorService } from './position-change-detector.service';
import { HeliusModule } from '../helius/helius.module';
import { PositionsModule } from '../positions/positions.module';
import { WebsocketModule } from '../websocket/websocket.module';
import { PrismaModule } from '../prisma/prisma.module';
import { CacheModule } from '../cache/cache.module';
import { forwardRef } from '@nestjs/common';

@Module({
  imports: [
    HeliusModule,
    forwardRef(() => PositionsModule),
    forwardRef(() => WebsocketModule),
    PrismaModule,
    CacheModule,
  ],
  controllers: [MonitoringController],
  providers: [
    TransactionMonitoringService,
    WalletMonitorService,
    AccountSubscriptionService,
    PositionChangeDetectorService,
  ],
  exports: [
    TransactionMonitoringService,
    WalletMonitorService,
    AccountSubscriptionService,
    PositionChangeDetectorService,
  ],
})
export class MonitoringModule {}