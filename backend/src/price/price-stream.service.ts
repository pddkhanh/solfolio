import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { JupiterPriceService } from './jupiter-price.service';
import { WebsocketService, PriceUpdate } from '../websocket/websocket.service';
import { RedisService } from '../redis/redis.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class PriceStreamService implements OnApplicationBootstrap {
  private readonly logger = new Logger(PriceStreamService.name);
  private isStreaming = false;
  private streamingTokens = new Set<string>();
  private lastPrices = new Map<string, number>();
  private readonly PRICE_STREAM_INTERVAL_MS = 30000; // 30 seconds
  private readonly PRICE_CHANGE_THRESHOLD = 0.001; // 0.1% change threshold
  private intervalId: NodeJS.Timeout | null = null;

  // Common tokens to stream prices for
  private readonly DEFAULT_TOKENS = [
    'So11111111111111111111111111111111111112', // SOL
    'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', // USDC
    'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB', // USDT
    'mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So', // mSOL (Marinade)
    'J1toso1uCk3RLmjorhTtrVwY9HJ7X8V9yYac6Y7kGCPn', // jitoSOL
    '7Q2afV64in6N6SeZsAAB81TJzwDoD6zpqmHkzi9Dcavn', // jsUSDC (Kamino)
  ];

  constructor(
    private readonly jupiterPriceService: JupiterPriceService,
    private readonly websocketService: WebsocketService,
    private readonly redisService: RedisService,
    private readonly configService: ConfigService,
  ) {}

  async onApplicationBootstrap() {
    // Start streaming default tokens
    await this.addTokensToStream(this.DEFAULT_TOKENS);
    
    // Load previously tracked tokens from Redis
    await this.loadTrackedTokensFromCache();
    
    this.startPriceStreaming();
    this.logger.log('Price streaming service initialized');
  }

  /**
   * Add tokens to the streaming list
   */
  async addTokensToStream(tokenMints: string[]): Promise<void> {
    const newTokens = tokenMints.filter(mint => !this.streamingTokens.has(mint));
    
    if (newTokens.length === 0) {
      return;
    }

    newTokens.forEach(mint => this.streamingTokens.add(mint));
    
    // Cache the streaming tokens list
    await this.redisService.set(
      'price-stream:tokens',
      Array.from(this.streamingTokens),
      { ttl: 86400 } // 24 hours
    );

    this.logger.log(`Added ${newTokens.length} tokens to price stream. Total: ${this.streamingTokens.size}`);
    
    // Fetch initial prices for new tokens
    if (this.isStreaming) {
      await this.fetchAndBroadcastPrices(newTokens);
    }
  }

  /**
   * Remove tokens from the streaming list
   */
  async removeTokensFromStream(tokenMints: string[]): Promise<void> {
    const removedCount = tokenMints.filter(mint => this.streamingTokens.delete(mint)).length;
    
    if (removedCount === 0) {
      return;
    }

    // Update cache
    await this.redisService.set(
      'price-stream:tokens',
      Array.from(this.streamingTokens),
      { ttl: 86400 }
    );

    this.logger.log(`Removed ${removedCount} tokens from price stream. Total: ${this.streamingTokens.size}`);
  }

  /**
   * Get currently streaming tokens
   */
  getStreamingTokens(): string[] {
    return Array.from(this.streamingTokens);
  }

  /**
   * Start the price streaming process
   */
  private startPriceStreaming(): void {
    if (this.isStreaming) {
      return;
    }

    this.isStreaming = true;
    
    // Initial fetch
    void this.fetchAndBroadcastPrices();

    // Set up interval for continuous streaming
    this.intervalId = setInterval(async () => {
      await this.fetchAndBroadcastPrices();
    }, this.PRICE_STREAM_INTERVAL_MS);

    this.logger.log(`Started price streaming with ${this.PRICE_STREAM_INTERVAL_MS}ms interval`);
  }

  /**
   * Stop the price streaming process
   */
  stopPriceStreaming(): void {
    if (!this.isStreaming) {
      return;
    }

    this.isStreaming = false;
    
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }

    this.logger.log('Stopped price streaming');
  }

  /**
   * Fetch prices and broadcast updates
   */
  private async fetchAndBroadcastPrices(specificTokens?: string[]): Promise<void> {
    if (this.streamingTokens.size === 0) {
      return;
    }

    const tokensToFetch = specificTokens || Array.from(this.streamingTokens);
    
    if (tokensToFetch.length === 0) {
      return;
    }

    try {
      this.logger.debug(`Fetching prices for ${tokensToFetch.length} tokens`);
      
      const prices = await this.jupiterPriceService.getTokenPrices(tokensToFetch);
      const priceUpdates: PriceUpdate[] = [];
      const timestamp = Date.now();

      for (const [tokenMint, price] of prices) {
        const lastPrice = this.lastPrices.get(tokenMint);
        
        // Calculate 24h change if we have previous price data
        const change24h = lastPrice ? ((price - lastPrice) / lastPrice) * 100 : undefined;
        
        // Only broadcast if price changed significantly or it's a new token
        const hasSignificantChange = !lastPrice || 
          Math.abs(price - lastPrice) / lastPrice > this.PRICE_CHANGE_THRESHOLD;

        if (hasSignificantChange) {
          const priceUpdate: PriceUpdate = {
            tokenMint,
            price,
            timestamp,
            change24h,
          };

          priceUpdates.push(priceUpdate);
          this.lastPrices.set(tokenMint, price);
        }
      }

      if (priceUpdates.length > 0) {
        // Broadcast via WebSocket
        this.websocketService.broadcastPriceUpdate(priceUpdates);
        
        // Publish to Redis pub/sub for other services
        await this.websocketService.publishPriceUpdate(priceUpdates);
        
        this.logger.log(`Broadcasted ${priceUpdates.length} price updates`);
      } else {
        this.logger.debug('No significant price changes to broadcast');
      }
    } catch (error) {
      this.logger.error('Error fetching and broadcasting prices', error);
    }
  }

  /**
   * Load previously tracked tokens from cache
   */
  private async loadTrackedTokensFromCache(): Promise<void> {
    try {
      const cachedTokens = await this.redisService.get<string[]>('price-stream:tokens');
      
      if (cachedTokens && Array.isArray(cachedTokens)) {
        cachedTokens.forEach(mint => this.streamingTokens.add(mint));
        this.logger.log(`Loaded ${cachedTokens.length} tokens from cache`);
      }
    } catch (error) {
      this.logger.error('Error loading tracked tokens from cache', error);
    }
  }

  /**
   * Cron job to periodically clean up old price data
   */
  @Cron(CronExpression.EVERY_HOUR)
  async cleanupOldPriceData(): Promise<void> {
    try {
      // Clean up old price cache entries older than 1 hour
      this.logger.debug('Running hourly price data cleanup');
      // Implementation can be added later if needed
    } catch (error) {
      this.logger.error('Error during price data cleanup', error);
    }
  }

  /**
   * Get streaming status and statistics
   */
  getStreamingStatus(): {
    isStreaming: boolean;
    tokensCount: number;
    lastUpdateCount: number;
    intervalMs: number;
  } {
    return {
      isStreaming: this.isStreaming,
      tokensCount: this.streamingTokens.size,
      lastUpdateCount: this.lastPrices.size,
      intervalMs: this.PRICE_STREAM_INTERVAL_MS,
    };
  }

  /**
   * Force immediate price update
   */
  async forceUpdate(): Promise<void> {
    await this.fetchAndBroadcastPrices();
  }
}