import { Injectable, Logger } from '@nestjs/common';
import { JupiterPriceService } from './jupiter-price.service';

export interface TokenPriceInfo {
  mint: string;
  symbol?: string;
  price: number;
  updatedAt: Date;
}

interface CachedPrice {
  price: number;
  timestamp: number;
}

@Injectable()
export class PriceService {
  private readonly logger = new Logger(PriceService.name);
  private readonly priceCache = new Map<string, CachedPrice>();
  private readonly CACHE_TTL_MS = 60 * 1000; // 1 minute cache TTL

  constructor(private readonly jupiterPriceService: JupiterPriceService) {}

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
    const now = Date.now();
    const result = new Map<string, number>();
    const mintsToFetch: string[] = [];

    // Check cache first
    if (!forceRefresh) {
      for (const mint of tokenMints) {
        const cached = this.priceCache.get(mint);
        if (cached && now - cached.timestamp < this.CACHE_TTL_MS) {
          result.set(mint, cached.price);
          this.logger.debug(`Using cached price for ${mint}: $${cached.price}`);
        } else {
          mintsToFetch.push(mint);
        }
      }
    } else {
      mintsToFetch.push(...tokenMints);
    }

    // Fetch prices for tokens not in cache
    if (mintsToFetch.length > 0) {
      try {
        const freshPrices =
          await this.jupiterPriceService.getTokenPrices(mintsToFetch);

        // Update cache and result
        for (const [mint, price] of freshPrices) {
          this.priceCache.set(mint, {
            price,
            timestamp: now,
          });
          result.set(mint, price);
        }
      } catch (error) {
        this.logger.error('Failed to fetch fresh prices', error);
        // Return cached prices even if expired on error
        for (const mint of mintsToFetch) {
          const cached = this.priceCache.get(mint);
          if (cached) {
            result.set(mint, cached.price);
            this.logger.warn(
              `Using expired cache for ${mint} due to fetch error`,
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
    this.priceCache.clear();
    this.logger.log('Price cache cleared');
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): {
    size: number;
    entries: Array<{ mint: string; age: number }>;
  } {
    const now = Date.now();
    const entries = Array.from(this.priceCache.entries()).map(
      ([mint, cached]) => ({
        mint,
        age: Math.round((now - cached.timestamp) / 1000), // age in seconds
      }),
    );

    return {
      size: this.priceCache.size,
      entries,
    };
  }
}
