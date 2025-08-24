import {
  Controller,
  Get,
  Param,
  Query,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { PositionsService } from './positions.service';
import { PublicKey } from '@solana/web3.js';

@Controller('positions')
export class PositionsController {
  private readonly logger = new Logger(PositionsController.name);

  constructor(private readonly positionsService: PositionsService) {}

  /**
   * Get all positions for a wallet
   */
  @Get(':walletAddress')
  async getPositions(@Param('walletAddress') walletAddress: string) {
    try {
      // Validate wallet address
      try {
        new PublicKey(walletAddress);
      } catch {
        throw new HttpException(
          'Invalid wallet address',
          HttpStatus.BAD_REQUEST,
        );
      }

      // Check cache first
      const cached =
        await this.positionsService.getCachedPortfolio(walletAddress);
      if (cached) {
        this.logger.log(`Returning cached positions for ${walletAddress}`);
        return {
          success: true,
          data: cached.positions,
          cached: true,
        };
      }

      // Fetch fresh positions
      const positions = await this.positionsService.getPositions(walletAddress);

      return {
        success: true,
        data: positions,
        cached: false,
      };
    } catch (error) {
      this.logger.error(
        `Error fetching positions for ${walletAddress}:`,
        error,
      );

      if (error instanceof HttpException) {
        throw error;
      }

      throw new HttpException(
        'Failed to fetch positions',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Get complete portfolio summary
   */
  @Get(':walletAddress/summary')
  async getPortfolioSummary(
    @Param('walletAddress') walletAddress: string,
    @Query('refresh') refresh?: string,
  ) {
    try {
      // Validate wallet address
      try {
        new PublicKey(walletAddress);
      } catch {
        throw new HttpException(
          'Invalid wallet address',
          HttpStatus.BAD_REQUEST,
        );
      }

      // Check cache first (unless refresh is requested)
      if (refresh !== 'true') {
        const cached =
          await this.positionsService.getCachedPortfolio(walletAddress);
        if (cached) {
          this.logger.log(`Returning cached portfolio for ${walletAddress}`);
          return {
            success: true,
            data: cached,
            cached: true,
          };
        }
      }

      // Fetch fresh portfolio summary
      const summary =
        await this.positionsService.getPortfolioSummary(walletAddress);

      return {
        success: true,
        data: summary,
        cached: false,
      };
    } catch (error) {
      this.logger.error(
        `Error fetching portfolio summary for ${walletAddress}:`,
        error,
      );

      if (error instanceof HttpException) {
        throw error;
      }

      throw new HttpException(
        'Failed to fetch portfolio summary',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Get total portfolio value
   */
  @Get(':walletAddress/value')
  async getTotalValue(@Param('walletAddress') walletAddress: string) {
    try {
      // Validate wallet address
      try {
        new PublicKey(walletAddress);
      } catch {
        throw new HttpException(
          'Invalid wallet address',
          HttpStatus.BAD_REQUEST,
        );
      }

      const totalValue =
        await this.positionsService.calculateTotalValue(walletAddress);

      return {
        success: true,
        data: {
          walletAddress,
          totalValue,
          timestamp: new Date().toISOString(),
        },
      };
    } catch (error) {
      this.logger.error(
        `Error calculating total value for ${walletAddress}:`,
        error,
      );

      if (error instanceof HttpException) {
        throw error;
      }

      throw new HttpException(
        'Failed to calculate total value',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Get Marinade stats
   */
  @Get('marinade/stats')
  async getMarinadeStats() {
    try {
      // @ts-expect-error - marinadeService is injected but not in type definition
      const { marinadeService } = this.positionsService;
      // @ts-expect-error - getMarinadeStats exists on marinadeService
      const stats = await marinadeService.getMarinadeStats();

      return {
        success: true,
        data: stats as any,
      };
    } catch (error) {
      this.logger.error('Error fetching Marinade stats:', error);

      throw new HttpException(
        'Failed to fetch Marinade stats',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
