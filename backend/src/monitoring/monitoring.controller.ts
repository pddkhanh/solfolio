import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { WalletMonitorService } from './wallet-monitor.service';
import { PositionChangeDetectorService } from './position-change-detector.service';
import { TransactionMonitoringService } from './transaction-monitoring.service';
import { PublicKey } from '@solana/web3.js';

@Controller('monitoring')
export class MonitoringController {
  private readonly logger = new Logger(MonitoringController.name);

  constructor(
    private readonly walletMonitor: WalletMonitorService,
    private readonly changeDetector: PositionChangeDetectorService,
    private readonly transactionMonitoring: TransactionMonitoringService,
  ) {}

  @Get('status')
  getMonitoringStatus() {
    try {
      const activeWallets = this.walletMonitor.getActiveWallets();
      return {
        success: true,
        data: {
          activeWallets: activeWallets.length,
          wallets: activeWallets,
          timestamp: new Date().toISOString(),
        },
      };
    } catch (error) {
      this.logger.error('Failed to get monitoring status:', error);
      throw new HttpException(
        'Failed to get monitoring status',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('wallet/:address')
  async getWalletMonitoringStatus(@Param('address') address: string) {
    try {
      // Validate address
      this.validateSolanaAddress(address);

      const status = this.walletMonitor.getMonitoringStatus(address);
      const recentChanges = await this.changeDetector.getRecentChanges(
        address,
        5,
      );
      const recentTransactions =
        await this.transactionMonitoring.getRecentTransactions(address, 5);

      return {
        success: true,
        data: {
          walletAddress: address,
          monitoringStatus: status,
          recentChanges,
          recentTransactions,
          timestamp: new Date().toISOString(),
        },
      };
    } catch (error) {
      this.logger.error(`Failed to get wallet monitoring status:`, error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Failed to get wallet monitoring status',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('wallet/:address/start')
  startMonitoring(@Param('address') address: string) {
    try {
      // Validate address
      this.validateSolanaAddress(address);

      this.walletMonitor.startMonitoring(address);

      return {
        success: true,
        message: `Started monitoring wallet ${address}`,
        data: {
          walletAddress: address,
          timestamp: new Date().toISOString(),
        },
      };
    } catch (error) {
      this.logger.error(`Failed to start monitoring:`, error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Failed to start monitoring',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('wallet/:address/stop')
  async stopMonitoring(@Param('address') address: string) {
    try {
      // Validate address
      this.validateSolanaAddress(address);

      await this.walletMonitor.stopMonitoring(address);

      return {
        success: true,
        message: `Stopped monitoring wallet ${address}`,
        data: {
          walletAddress: address,
          timestamp: new Date().toISOString(),
        },
      };
    } catch (error) {
      this.logger.error(`Failed to stop monitoring:`, error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Failed to stop monitoring',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('wallet/:address/refresh')
  async triggerRefresh(@Param('address') address: string) {
    try {
      // Validate address
      this.validateSolanaAddress(address);

      // Trigger manual position refresh
      const changes = await this.changeDetector.detectChanges(
        address,
        'manual',
      );

      return {
        success: true,
        message: `Triggered refresh for wallet ${address}`,
        data: {
          walletAddress: address,
          changesDetected: changes.length,
          changes,
          timestamp: new Date().toISOString(),
        },
      };
    } catch (error) {
      this.logger.error(`Failed to trigger refresh:`, error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Failed to trigger refresh',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('transaction/:signature/process')
  async processTransaction(
    @Param('signature') signature: string,
    @Body() body: { walletAddress: string },
  ) {
    try {
      // Validate address
      this.validateSolanaAddress(body.walletAddress);

      const change = await this.transactionMonitoring.processTransaction(
        signature,
        body.walletAddress,
      );

      return {
        success: true,
        message: change
          ? `Transaction processed successfully`
          : `Transaction processed, no position changes detected`,
        data: {
          signature,
          walletAddress: body.walletAddress,
          positionChange: change,
          timestamp: new Date().toISOString(),
        },
      };
    } catch (error) {
      this.logger.error(`Failed to process transaction:`, error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Failed to process transaction',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  private validateSolanaAddress(address: string): void {
    try {
      new PublicKey(address);
    } catch {
      throw new HttpException(
        'Invalid Solana wallet address',
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
