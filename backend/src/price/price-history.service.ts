import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JupiterPriceService } from './jupiter-price.service';
import { Decimal } from '@prisma/client/runtime/library';
import { Cron, CronExpression } from '@nestjs/schedule';

export interface PriceChange {
  currentPrice: number;
  price24hAgo?: number;
  price7dAgo?: number;
  price30dAgo?: number;
  change24h?: number;
  changePercent24h?: number;
  change7d?: number;
  changePercent7d?: number;
  change30d?: number;
  changePercent30d?: number;
}

@Injectable()
export class PriceHistoryService {
  private readonly logger = new Logger(PriceHistoryService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly jupiterPriceService: JupiterPriceService,
  ) {}

  /**
   * Record current prices to history table
   */
  async recordPriceSnapshot(tokenMints?: string[]): Promise<void> {
    try {
      // If no specific mints provided, get prices for top tokens
      const mintsToRecord = tokenMints || (await this.getTopTokenMints());

      const prices =
        await this.jupiterPriceService.getTokenPrices(mintsToRecord);
      const timestamp = new Date();

      const priceHistoryData = Array.from(prices.entries()).map(
        ([mint, price]) => ({
          tokenMint: mint,
          symbol: mint, // Will be replaced with actual symbol from metadata
          price: new Decimal(price),
          timestamp,
        }),
      );

      // Use upsert to avoid duplicates for the same timestamp
      for (const data of priceHistoryData) {
        await this.prisma.priceHistory.upsert({
          where: {
            tokenMint_timestamp: {
              tokenMint: data.tokenMint,
              timestamp: data.timestamp,
            },
          },
          update: {
            price: data.price,
          },
          create: data,
        });
      }

      this.logger.log(
        `Recorded price snapshot for ${priceHistoryData.length} tokens`,
      );
    } catch (error) {
      this.logger.error('Failed to record price snapshot', error);
    }
  }

  /**
   * Get price changes for a token over different time periods
   */
  async getTokenPriceChanges(tokenMint: string): Promise<PriceChange> {
    const now = new Date();
    const [currentPriceData, price24hAgo, price7dAgo, price30dAgo] =
      await Promise.all([
        this.jupiterPriceService.getTokenPrices([tokenMint]),
        this.getPriceAtTime(
          tokenMint,
          new Date(now.getTime() - 24 * 60 * 60 * 1000),
        ),
        this.getPriceAtTime(
          tokenMint,
          new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
        ),
        this.getPriceAtTime(
          tokenMint,
          new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
        ),
      ]);

    const currentPrice = currentPriceData.get(tokenMint) || 0;

    const result: PriceChange = {
      currentPrice,
    };

    if (price24hAgo) {
      result.price24hAgo = price24hAgo;
      result.change24h = currentPrice - price24hAgo;
      result.changePercent24h =
        price24hAgo > 0
          ? ((currentPrice - price24hAgo) / price24hAgo) * 100
          : 0;
    }

    if (price7dAgo) {
      result.price7dAgo = price7dAgo;
      result.change7d = currentPrice - price7dAgo;
      result.changePercent7d =
        price7dAgo > 0 ? ((currentPrice - price7dAgo) / price7dAgo) * 100 : 0;
    }

    if (price30dAgo) {
      result.price30dAgo = price30dAgo;
      result.change30d = currentPrice - price30dAgo;
      result.changePercent30d =
        price30dAgo > 0
          ? ((currentPrice - price30dAgo) / price30dAgo) * 100
          : 0;
    }

    return result;
  }

  /**
   * Get price changes for multiple tokens
   */
  async getMultipleTokenPriceChanges(
    tokenMints: string[],
  ): Promise<Map<string, PriceChange>> {
    const results = new Map<string, PriceChange>();

    // Batch fetch current prices
    const currentPrices =
      await this.jupiterPriceService.getTokenPrices(tokenMints);

    // Batch fetch historical prices
    const now = new Date();
    const [prices24hAgo, prices7dAgo, prices30dAgo] = await Promise.all([
      this.getMultiplePricesAtTime(
        tokenMints,
        new Date(now.getTime() - 24 * 60 * 60 * 1000),
      ),
      this.getMultiplePricesAtTime(
        tokenMints,
        new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
      ),
      this.getMultiplePricesAtTime(
        tokenMints,
        new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
      ),
    ]);

    for (const mint of tokenMints) {
      const currentPrice = currentPrices.get(mint) || 0;
      const price24hAgo = prices24hAgo.get(mint);
      const price7dAgo = prices7dAgo.get(mint);
      const price30dAgo = prices30dAgo.get(mint);

      const priceChange: PriceChange = {
        currentPrice,
      };

      if (price24hAgo) {
        priceChange.price24hAgo = price24hAgo;
        priceChange.change24h = currentPrice - price24hAgo;
        priceChange.changePercent24h =
          price24hAgo > 0
            ? ((currentPrice - price24hAgo) / price24hAgo) * 100
            : 0;
      }

      if (price7dAgo) {
        priceChange.price7dAgo = price7dAgo;
        priceChange.change7d = currentPrice - price7dAgo;
        priceChange.changePercent7d =
          price7dAgo > 0 ? ((currentPrice - price7dAgo) / price7dAgo) * 100 : 0;
      }

      if (price30dAgo) {
        priceChange.price30dAgo = price30dAgo;
        priceChange.change30d = currentPrice - price30dAgo;
        priceChange.changePercent30d =
          price30dAgo > 0
            ? ((currentPrice - price30dAgo) / price30dAgo) * 100
            : 0;
      }

      results.set(mint, priceChange);
    }

    return results;
  }

  /**
   * Calculate portfolio value changes over time
   */
  async calculatePortfolioChanges(
    tokenBalances: Array<{ mint: string; amount: number; decimals: number }>,
  ): Promise<{
    totalValue: number;
    totalChange24h: number;
    totalChangePercent24h: number;
    totalChange7d: number;
    totalChangePercent7d: number;
    totalChange30d: number;
    totalChangePercent30d: number;
  }> {
    const mints = tokenBalances.map((t) => t.mint);
    const priceChanges = await this.getMultipleTokenPriceChanges(mints);

    let totalValue = 0;
    let totalValue24hAgo = 0;
    let totalValue7dAgo = 0;
    let totalValue30dAgo = 0;

    for (const token of tokenBalances) {
      const priceChange = priceChanges.get(token.mint);
      if (!priceChange) continue;

      const tokenAmount = token.amount / Math.pow(10, token.decimals);
      totalValue += tokenAmount * priceChange.currentPrice;

      if (priceChange.price24hAgo) {
        totalValue24hAgo += tokenAmount * priceChange.price24hAgo;
      }
      if (priceChange.price7dAgo) {
        totalValue7dAgo += tokenAmount * priceChange.price7dAgo;
      }
      if (priceChange.price30dAgo) {
        totalValue30dAgo += tokenAmount * priceChange.price30dAgo;
      }
    }

    return {
      totalValue,
      totalChange24h: totalValue - totalValue24hAgo,
      totalChangePercent24h:
        totalValue24hAgo > 0
          ? ((totalValue - totalValue24hAgo) / totalValue24hAgo) * 100
          : 0,
      totalChange7d: totalValue - totalValue7dAgo,
      totalChangePercent7d:
        totalValue7dAgo > 0
          ? ((totalValue - totalValue7dAgo) / totalValue7dAgo) * 100
          : 0,
      totalChange30d: totalValue - totalValue30dAgo,
      totalChangePercent30d:
        totalValue30dAgo > 0
          ? ((totalValue - totalValue30dAgo) / totalValue30dAgo) * 100
          : 0,
    };
  }

  /**
   * Get price at a specific time (or closest available)
   */
  private async getPriceAtTime(
    tokenMint: string,
    timestamp: Date,
  ): Promise<number | null> {
    const priceRecord = await this.prisma.priceHistory.findFirst({
      where: {
        tokenMint,
        timestamp: {
          lte: timestamp,
        },
      },
      orderBy: {
        timestamp: 'desc',
      },
    });

    return priceRecord ? priceRecord.price.toNumber() : null;
  }

  /**
   * Get prices for multiple tokens at a specific time
   */
  private async getMultiplePricesAtTime(
    tokenMints: string[],
    timestamp: Date,
  ): Promise<Map<string, number>> {
    const results = new Map<string, number>();

    // Get the closest price for each token before the timestamp
    const priceRecords = await this.prisma.priceHistory.findMany({
      where: {
        tokenMint: {
          in: tokenMints,
        },
        timestamp: {
          lte: timestamp,
        },
      },
      distinct: ['tokenMint'],
      orderBy: {
        timestamp: 'desc',
      },
    });

    for (const record of priceRecords) {
      results.set(record.tokenMint, record.price.toNumber());
    }

    return results;
  }

  /**
   * Get top token mints to track (based on current positions and balances)
   */
  private async getTopTokenMints(): Promise<string[]> {
    // Get unique token mints from recent positions and balances
    const [positions, balances] = await Promise.all([
      this.prisma.position.findMany({
        select: { tokenMint: true },
        distinct: ['tokenMint'],
        take: 50,
      }),
      this.prisma.balance.findMany({
        select: { tokenMint: true },
        distinct: ['tokenMint'],
        take: 50,
      }),
    ]);

    const mints = new Set<string>();
    positions.forEach((p) => mints.add(p.tokenMint));
    balances.forEach((b) => mints.add(b.tokenMint));

    // Add common tokens
    const commonTokens = [
      'So11111111111111111111111111111111111111112', // SOL
      'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', // USDC
      'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB', // USDT
      'mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So', // mSOL
      'J1toso1uCk3RLmjorhTtrVwY9HJ7X8V9yYac6Y7kGCPn', // JitoSOL
    ];
    commonTokens.forEach((t) => mints.add(t));

    return Array.from(mints);
  }

  /**
   * Scheduled job to record price snapshots every hour
   */
  @Cron(CronExpression.EVERY_HOUR)
  async recordHourlyPriceSnapshot(): Promise<void> {
    this.logger.log('Recording hourly price snapshot...');
    await this.recordPriceSnapshot();
  }

  /**
   * Clean up old price history (keep last 90 days)
   */
  @Cron(CronExpression.EVERY_DAY_AT_3AM)
  async cleanupOldPriceHistory(): Promise<void> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - 90);

    const deleted = await this.prisma.priceHistory.deleteMany({
      where: {
        timestamp: {
          lt: cutoffDate,
        },
      },
    });

    this.logger.log(`Cleaned up ${deleted.count} old price history records`);
  }
}
