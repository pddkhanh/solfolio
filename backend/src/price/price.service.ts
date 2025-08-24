import { Injectable, Logger } from '@nestjs/common';
import { JupiterPriceService } from './jupiter-price.service';
import { RedisService } from '../redis/redis.service';

export interface TokenPriceInfo {
  mint: string;
  symbol?: string;
  price: number;
  updatedAt: Date;
}

@Injectable()
export class PriceService {
  private readonly logger = new Logger(PriceService.name);
  private readonly CACHE_TTL = 60; // 1 minute cache TTL in seconds

  constructor(
    private readonly jupiterPriceService: JupiterPriceService,
    private readonly redisService: RedisService,
  ) {}

  /**
   * Get prices for multiple tokens with caching
   * @param tokenMints Array of token mint addresses
   * @param forceRefresh Skip cache and fetch fresh prices
   * @returns Map of token mint to price in USD
   */
  async getTokenPrices(
    tokenMints: string[],
    forceRefresh = false,
  ): Promise<Map<string, number>> {
    const result = new Map<string, number>();
    const mintsToFetch: string[] = [];

    // Check cache first
    if (!forceRefresh) {
      // Use batch get for efficiency
      const cacheKeys = tokenMints.map((mint) =>
        this.redisService.generateKey('price', mint),
      );
      const cachedPrices = await this.redisService.mget<number>(cacheKeys);

      tokenMints.forEach((mint, index) => {
        const cachedPrice = cachedPrices[index];
        if (cachedPrice !== null) {
          result.set(mint, cachedPrice);
          this.logger.debug(`Using cached price for ${mint}: $${cachedPrice}`);
        } else {
          mintsToFetch.push(mint);
        }
      });
    } else {
      mintsToFetch.push(...tokenMints);
    }

    // Fetch prices for tokens not in cache
    if (mintsToFetch.length > 0) {
      try {
        const freshPrices =
          await this.jupiterPriceService.getTokenPrices(mintsToFetch);

        // Update cache and result using batch set
        const cacheItems: Array<{
          key: string;
          value: number;
          options?: { ttl: number };
        }> = [];

        for (const [mint, price] of freshPrices) {
          const cacheKey = this.redisService.generateKey('price', mint);
          cacheItems.push({
            key: cacheKey,
            value: price,
            options: { ttl: this.CACHE_TTL },
          });
          result.set(mint, price);
        }

        // Batch set all prices at once
        if (cacheItems.length > 0) {
          await this.redisService.mset(cacheItems);
        }
      } catch (error) {
        this.logger.error('Failed to fetch fresh prices', error);
        // Try to get from cache even if expired on error
        for (const mint of mintsToFetch) {
          const cacheKey = this.redisService.generateKey('price', mint);
          const cached = await this.redisService.get<number>(cacheKey);
          if (cached !== null) {
            result.set(mint, cached);
            this.logger.warn(
              `Using potentially expired cache for ${mint} due to fetch error`,
            );
          }
        }
      }
    }

    return result;
  }

  /**
   * Get price for a single token with caching
   * @param tokenMint Token mint address
   * @param forceRefresh Skip cache and fetch fresh price
   * @returns Price in USD or null if not found
   */
  async getTokenPrice(
    tokenMint: string,
    forceRefresh = false,
  ): Promise<number | null> {
    const prices = await this.getTokenPrices([tokenMint], forceRefresh);
    return prices.get(tokenMint) || null;
  }

  /**
   * Calculate total USD value for token amounts
   * @param tokens Array of {mint, amount, decimals}
   * @returns Total value and individual token values
   */
  async calculateUSDValues(
    tokens: Array<{
      mint: string;
      amount: string;
      decimals: number;
      symbol?: string;
    }>,
  ): Promise<{
    totalValue: number;
    tokenValues: Array<{
      mint: string;
      symbol?: string;
      amount: string;
      usdValue: number;
      price: number;
    }>;
  }> {
    const mints = tokens.map((t) => t.mint);
    const prices = await this.getTokenPrices(mints);

    const tokenValues = tokens.map((token) => {
      const price = prices.get(token.mint) || 0;
      const amount = parseFloat(token.amount) / Math.pow(10, token.decimals);
      const usdValue = amount * price;

      return {
        mint: token.mint,
        symbol: token.symbol,
        amount: token.amount,
        usdValue,
        price,
      };
    });

    const totalValue = tokenValues.reduce((sum, tv) => sum + tv.usdValue, 0);

    this.logger.log(
      `Calculated total portfolio value: $${totalValue.toFixed(2)}`,
    );

    return {
      totalValue,
      tokenValues,
    };
  }

  /**
   * Clear price cache
   */
  clearCache(): void {
    // Clear all price entries from Redis
    // In production, you might want to use pattern-based deletion
    this.redisService.delByPattern('price:*');
    this.logger.log('Price cache cleared');
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): {
    isHealthy: boolean;
    connectionStatus: { connected: boolean; retries: number };
  } {
    return {
      isHealthy: this.redisService.isHealthy(),
      connectionStatus: this.redisService.getConnectionStatus(),
    };
  }
}
