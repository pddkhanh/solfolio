import {
  Controller,
  Get,
  Param,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { WalletService, WalletBalances } from './wallet.service';

@Controller('api/wallet')
export class WalletController {
  private readonly logger = new Logger(WalletController.name);

  constructor(private readonly walletService: WalletService) {}

  @Get(':address/balances')
  async getWalletBalances(
    @Param('address') address: string,
  ): Promise<WalletBalances> {
    try {
      if (!this.isValidSolanaAddress(address)) {
        throw new HttpException(
          'Invalid Solana wallet address',
          HttpStatus.BAD_REQUEST,
        );
      }

      this.logger.log(`Fetching balances for wallet: ${address}`);
      const balances = await this.walletService.getWalletBalances(address);

      this.logger.log(
        `Found ${balances.totalAccounts} token accounts for wallet ${address}`,
      );

      return balances;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      this.logger.error(
        `Failed to fetch wallet balances: ${error.message}`,
        error.stack,
      );
      throw new HttpException(
        'Failed to fetch wallet balances',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  private isValidSolanaAddress(address: string): boolean {
    try {
      const base58Regex = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;
      return base58Regex.test(address);
    } catch {
      return false;
    }
  }
}
