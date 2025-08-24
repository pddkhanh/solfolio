import { Injectable, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import {
  MarinadeService,
  MarinadePosition,
} from '../marinade/marinade.service';
import { WalletService } from '../wallet/wallet.service';
import { PriceService } from '../price/price.service';
import { RedisService } from '../redis/redis.service';
import { ProtocolsService } from '../protocols/protocols.service';
import { ProtocolAdapterRegistry } from '../protocols/protocol-adapter.registry';

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
  balances: Array<{
    mint: string;
    amount: string;
    decimals: number;
    valueUSD: number;
    symbol?: string;
    name?: string;
    logoUri?: string;
  }>;
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
    private readonly redisService: RedisService,
    private readonly protocolsService: ProtocolsService,
    private readonly protocolRegistry: ProtocolAdapterRegistry,
  ) {
    this.prisma = new PrismaClient();
  }

  /**
   * Get all positions for a wallet address using parallel fetching
   */
  async getPositions(walletAddress: string): Promise<PortfolioPosition[]> {
    try {
      // Generate cache key
      const cacheKey = this.redisService.generateKey(
        'positions',
        walletAddress,
      );

      // Use Redis wrap to handle caching automatically
      return await this.redisService.wrap(
        cacheKey,
        async () => {
          // Use the new protocol adapter system with parallel fetching
          const aggregatedPositions =
            await this.protocolsService.fetchAllPositions(walletAddress, {
              parallel: true, // Enable parallel fetching
              useCache: true,
              cacheTtl: 300,
              timeout: 10000, // 10 second timeout per protocol
            });

          // Transform to PortfolioPosition format
          const positions: PortfolioPosition[] =
            aggregatedPositions.positions.map((pos) => {
              // Add token metadata based on protocol
              let tokenSymbol = '';
              let tokenName = '';
              let logoUri = '';

              // Map known tokens (can be extended)
              if (
                pos.tokenMint === 'mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So'
              ) {
                tokenSymbol = 'mSOL';
                tokenName = 'Marinade staked SOL';
                logoUri =
                  'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So/logo.png';
              }
              // Add more token mappings as needed

              return {
                ...pos,
                protocolName: pos.protocolName,
                tokenSymbol,
                tokenName,
                logoUri,
              };
            });

          this.logger.log(
            `Fetched ${positions.length} positions from ${aggregatedPositions.byProtocol.size} protocols for ${walletAddress}`,
          );

          return positions;
        },
        { ttl: 300 }, // Cache for 5 minutes
      );
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
      // Generate cache key for portfolio summary
      const cacheKey = this.redisService.generateKey(
        'portfolio',
        walletAddress,
      );

      // Use Redis wrap to handle caching automatically
      return await this.redisService.wrap(
        cacheKey,
        async () => {
          // Get positions
          const positions = await this.getPositions(walletAddress);

          // Get token balances
          const walletBalances =
            await this.walletService.getWalletBalances(walletAddress);
          const balances = walletBalances.tokens as Array<{
            mint: string;
            amount: string;
            decimals: number;
            valueUSD: number;
            symbol?: string;
            name?: string;
            logoUri?: string;
          }>;

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
                  !['STAKING', 'LENDING', 'LP_POSITION'].includes(
                    p.positionType,
                  ),
              )
              .reduce((sum, p) => sum + p.usdValue, 0),
          };

          // Calculate performance metrics
          const weightedApy = positions.reduce((sum, pos) => {
            const weight = pos.usdValue / totalPositionValue;
            return sum + pos.apy * weight;
          }, 0);

          const dailyRewards = positions.reduce(
            (sum, pos) => sum + pos.rewards,
            0,
          );
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
        },
        { ttl: 60 }, // Cache for 1 minute
      );
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
            symbol: balance.symbol || null,
            name: balance.name || null,
            logoUri: balance.logoUri || null,
            lastUpdated: new Date(),
          },
          create: {
            walletId: wallet.id,
            tokenMint: balance.mint,
            amount: balance.amount,
            decimals: balance.decimals,
            usdValue: balance.valueUSD,
            symbol: balance.symbol || null,
            name: balance.name || null,
            logoUri: balance.logoUri || null,
          },
        });
      }

      // Cache the portfolio summary
      const cacheKey = `portfolio:${walletAddress}`;
      await this.prisma.cache.upsert({
        where: { key: cacheKey },
        update: {
          value: summary as any, // Prisma JsonValue type requires any
          expiresAt: new Date(Date.now() + 60 * 1000), // 1 minute cache
          lastUpdated: new Date(),
        },
        create: {
          key: cacheKey,
          type: 'POSITION',
          value: summary as any, // Prisma JsonValue type requires any
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
      const cacheKey = this.redisService.generateKey(
        'portfolio',
        walletAddress,
      );
      return await this.redisService.get<PortfolioSummary>(cacheKey);
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
