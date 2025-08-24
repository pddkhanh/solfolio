import { Injectable, Logger } from '@nestjs/common';
import { PrismaClient, Position, Balance } from '@prisma/client';
import {
  MarinadeService,
  MarinadePosition,
} from '../marinade/marinade.service';
import { WalletService } from '../wallet/wallet.service';
import { PriceService } from '../price/price.service';

export interface PortfolioPosition extends MarinadePosition {
  protocolName: string;
  tokenSymbol?: string;
  tokenName?: string;
  logoUri?: string;
}

export interface PortfolioSummary {
  walletAddress: string;
  totalValue: number;
  totalPositions: number;
  positions: PortfolioPosition[];
  balances: any[];
  breakdown: {
    tokens: number;
    staking: number;
    lending: number;
    liquidity: number;
    other: number;
  };
  performance: {
    totalApy: number;
    dailyRewards: number;
    monthlyRewards: number;
  };
}

@Injectable()
export class PositionsService {
  private readonly logger = new Logger(PositionsService.name);
  private prisma: PrismaClient;

  constructor(
    private readonly marinadeService: MarinadeService,
    private readonly walletService: WalletService,
    private readonly priceService: PriceService,
  ) {
    this.prisma = new PrismaClient();
  }

  /**
   * Get all positions for a wallet address
   */
  async getPositions(walletAddress: string): Promise<PortfolioPosition[]> {
    try {
      const positions: PortfolioPosition[] = [];

      // Get Marinade positions
      const marinadePositions =
        await this.marinadeService.getPositions(walletAddress);
      positions.push(
        ...marinadePositions.map((pos) => ({
          ...pos,
          protocolName: 'Marinade Finance',
          tokenSymbol: 'mSOL',
          tokenName: 'Marinade staked SOL',
          logoUri:
            'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So/logo.png',
        })),
      );

      // In the future, add other protocol adapters here
      // const kaminoPositions = await this.kaminoService.getPositions(walletAddress);
      // const jitoPositions = await this.jitoService.getPositions(walletAddress);
      // etc.

      return positions;
    } catch (error) {
      this.logger.error(
        `Error fetching positions for ${walletAddress}:`,
        error,
      );
      throw error;
    }
  }

  /**
   * Get complete portfolio summary including positions and balances
   */
  async getPortfolioSummary(walletAddress: string): Promise<PortfolioSummary> {
    try {
      // Get positions
      const positions = await this.getPositions(walletAddress);

      // Get token balances
      const walletBalances =
        await this.walletService.getWalletBalances(walletAddress);
      const balances = walletBalances.tokens;

      // Calculate total values
      const totalPositionValue = positions.reduce(
        (sum, pos) => sum + pos.usdValue,
        0,
      );
      const totalBalanceValue = balances.reduce(
        (sum, bal) => sum + (bal.valueUSD || 0),
        0,
      );
      const totalValue = totalPositionValue + totalBalanceValue;

      // Calculate breakdown by type
      const breakdown = {
        tokens: totalBalanceValue,
        staking: positions
          .filter((p) => p.positionType === 'STAKING')
          .reduce((sum, p) => sum + p.usdValue, 0),
        lending: positions
          .filter((p) => p.positionType === 'LENDING')
          .reduce((sum, p) => sum + p.usdValue, 0),
        liquidity: positions
          .filter((p) => p.positionType === 'LP_POSITION')
          .reduce((sum, p) => sum + p.usdValue, 0),
        other: positions
          .filter(
            (p) =>
              !['STAKING', 'LENDING', 'LP_POSITION'].includes(p.positionType),
          )
          .reduce((sum, p) => sum + p.usdValue, 0),
      };

      // Calculate performance metrics
      const weightedApy = positions.reduce((sum, pos) => {
        const weight = pos.usdValue / totalPositionValue;
        return sum + pos.apy * weight;
      }, 0);

      const dailyRewards = positions.reduce((sum, pos) => sum + pos.rewards, 0);
      const monthlyRewards = dailyRewards * 30;

      const summary: PortfolioSummary = {
        walletAddress,
        totalValue,
        totalPositions: positions.length,
        positions,
        balances,
        breakdown,
        performance: {
          totalApy: weightedApy,
          dailyRewards,
          monthlyRewards,
        },
      };

      // Store in database
      await this.storePortfolioData(walletAddress, summary);

      return summary;
    } catch (error) {
      this.logger.error(
        `Error generating portfolio summary for ${walletAddress}:`,
        error,
      );
      throw error;
    }
  }

  /**
   * Store portfolio data in database
   */
  private async storePortfolioData(
    walletAddress: string,
    summary: PortfolioSummary,
  ): Promise<void> {
    try {
      // Get or create wallet
      const wallet = await this.prisma.wallet.upsert({
        where: { address: walletAddress },
        update: { lastUpdated: new Date() },
        create: { address: walletAddress },
      });

      // Store balances
      for (const balance of summary.balances) {
        await this.prisma.balance.upsert({
          where: {
            walletId_tokenMint: {
              walletId: wallet.id,
              tokenMint: balance.mint,
            },
          },
          update: {
            amount: balance.amount,
            decimals: balance.decimals,
            usdValue: balance.valueUSD,
            symbol: balance.symbol,
            name: balance.name,
            logoUri: balance.logoUri,
            lastUpdated: new Date(),
          },
          create: {
            walletId: wallet.id,
            tokenMint: balance.mint,
            amount: balance.amount,
            decimals: balance.decimals,
            usdValue: balance.valueUSD,
            symbol: balance.symbol,
            name: balance.name,
            logoUri: balance.logoUri,
          },
        });
      }

      // Cache the portfolio summary
      const cacheKey = `portfolio:${walletAddress}`;
      await this.prisma.cache.upsert({
        where: { key: cacheKey },
        update: {
          value: summary as any,
          expiresAt: new Date(Date.now() + 60 * 1000), // 1 minute cache
          lastUpdated: new Date(),
        },
        create: {
          key: cacheKey,
          type: 'POSITION',
          value: summary as any,
          walletId: wallet.id,
          expiresAt: new Date(Date.now() + 60 * 1000),
        },
      });
    } catch (error) {
      this.logger.error('Error storing portfolio data:', error);
      // Don't throw - this is non-critical
    }
  }

  /**
   * Get cached portfolio summary
   */
  async getCachedPortfolio(
    walletAddress: string,
  ): Promise<PortfolioSummary | null> {
    try {
      const cache = await this.prisma.cache.findFirst({
        where: {
          key: `portfolio:${walletAddress}`,
          expiresAt: { gte: new Date() },
        },
      });

      if (cache) {
        return cache.value as any as PortfolioSummary;
      }

      return null;
    } catch (error) {
      this.logger.error('Error fetching cached portfolio:', error);
      return null;
    }
  }

  /**
   * Calculate total portfolio value
   */
  async calculateTotalValue(walletAddress: string): Promise<number> {
    const summary = await this.getPortfolioSummary(walletAddress);
    return summary.totalValue;
  }

  async onModuleDestroy() {
    await this.prisma.$disconnect();
  }
}
