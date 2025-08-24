import { Module } from '@nestjs/common';
import { TransactionMonitoringService } from './transaction-monitoring.service';
import { WalletMonitorService } from './wallet-monitor.service';
import { AccountSubscriptionService } from './account-subscription.service';
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
  providers: [
    TransactionMonitoringService,
    WalletMonitorService,
    AccountSubscriptionService,
  ],
  exports: [
    TransactionMonitoringService,
    WalletMonitorService,
    AccountSubscriptionService,
  ],
})
export class MonitoringModule {}