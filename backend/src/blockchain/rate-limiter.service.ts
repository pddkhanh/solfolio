import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

interface RateLimiterStats {
  totalRequests: number;
  allowedRequests: number;
  throttledRequests: number;
  lastResetTime: number;
}

@Injectable()
export class RateLimiterService {
  private readonly logger = new Logger(RateLimiterService.name);
  private readonly maxRequestsPerSecond: number;
  private readonly requestQueue: number[] = [];
  private stats: RateLimiterStats = {
    totalRequests: 0,
    allowedRequests: 0,
    throttledRequests: 0,
    lastResetTime: Date.now(),
  };

  constructor(private readonly configService: ConfigService) {
    this.maxRequestsPerSecond = this.configService.get<number>(
      'RATE_LIMIT_RPC_PER_SECOND',
      100,
    );
    
    this.logger.log(
      `Rate limiter initialized with ${this.maxRequestsPerSecond} requests per second`,
    );

    // Reset stats every hour
    setInterval(() => this.resetStats(), 3600000);
  }

  async waitForSlot(): Promise<void> {
    this.stats.totalRequests++;
    
    const now = Date.now();
    const windowStart = now - 1000; // 1 second window

    // Remove old requests outside the window
    while (this.requestQueue.length > 0 && this.requestQueue[0] < windowStart) {
      this.requestQueue.shift();
    }

    // Check if we're at the limit
    if (this.requestQueue.length >= this.maxRequestsPerSecond) {
      const oldestRequest = this.requestQueue[0];
      const waitTime = oldestRequest + 1000 - now;
      
      if (waitTime > 0) {
        this.stats.throttledRequests++;
        this.logger.debug(
          `Rate limit reached. Waiting ${waitTime}ms. Queue size: ${this.requestQueue.length}`,
        );
        await this.sleep(waitTime);
        
        // Recursively call to re-check after waiting
        return this.waitForSlot();
      }
    }

    // Add current request to the queue
    this.requestQueue.push(now);
    this.stats.allowedRequests++;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  getStats(): RateLimiterStats {
    return { ...this.stats };
  }

  private resetStats(): void {
    const previousStats = { ...this.stats };
    
    this.stats = {
      totalRequests: 0,
      allowedRequests: 0,
      throttledRequests: 0,
      lastResetTime: Date.now(),
    };

    if (previousStats.totalRequests > 0) {
      const throttleRate = 
        (previousStats.throttledRequests / previousStats.totalRequests) * 100;
      
      this.logger.log(
        `Rate limiter stats reset. Previous period: ${previousStats.totalRequests} total, ` +
        `${previousStats.throttledRequests} throttled (${throttleRate.toFixed(2)}%)`,
      );
    }
  }

  getCurrentQueueSize(): number {
    const now = Date.now();
    const windowStart = now - 1000;
    
    // Clean up old entries
    while (this.requestQueue.length > 0 && this.requestQueue[0] < windowStart) {
      this.requestQueue.shift();
    }
    
    return this.requestQueue.length;
  }

  getRemainingCapacity(): number {
    const currentSize = this.getCurrentQueueSize();
    return Math.max(0, this.maxRequestsPerSecond - currentSize);
  }

  isThrottled(): boolean {
    return this.getCurrentQueueSize() >= this.maxRequestsPerSecond;
  }

  async executeWithRateLimit<T>(
    operation: () => Promise<T>,
  ): Promise<T> {
    await this.waitForSlot();
    return operation();
  }
}