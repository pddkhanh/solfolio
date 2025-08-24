import { Injectable, Logger, OnModuleDestroy, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { createClient, RedisClientType } from 'redis';

export interface CacheOptions {
  ttl?: number; // Time to live in seconds
  refreshOnGet?: boolean; // Refresh TTL on get
}

@Injectable()
export class RedisService implements OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  private isConnected = false;
  private connectionRetries = 0;
  private readonly maxRetries = 5;
  private readonly retryDelay = 1000; // 1 second
  private publisher: RedisClientType;
  private subscriber: RedisClientType;
  private fallbackCache = new Map<string, { value: any; expiry: number }>();

  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {
    // Only initialize connections in non-test environments
    if (process.env.NODE_ENV !== 'test') {
      // Delay connection check to allow cache manager to initialize
      setTimeout(() => {
        void this.checkConnection();
      }, 1000);
      void this.initializePubSub();
      this.startFallbackCacheCleanup();
    }
  }

  async onModuleDestroy() {
    this.logger.log('Closing Redis connections...');
    // Cache manager handles connection cleanup
    if (this.publisher) {
      await this.publisher.quit();
    }
    if (this.subscriber) {
      await this.subscriber.quit();
    }
  }

  private async initializePubSub(): Promise<void> {
    try {
      const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

      this.publisher = createClient({ url: redisUrl });
      this.subscriber = createClient({ url: redisUrl });

      this.publisher.on('error', (err) => {
        this.logger.error('Redis Publisher Error:', err);
      });

      this.subscriber.on('error', (err) => {
        this.logger.error('Redis Subscriber Error:', err);
      });

      await this.publisher.connect();
      await this.subscriber.connect();

      this.logger.log('Redis pub/sub clients connected successfully');
    } catch (error) {
      this.logger.error('Failed to initialize Redis pub/sub clients:', error);
    }
  }

  private async checkConnection(): Promise<void> {
    try {
      // Test connection by setting and getting a test key
      const testKey = '__redis_connection_test__';
      const testValue = `test_${Date.now()}`;

      // Try to set with TTL in milliseconds (cache-manager v5+ uses ms)
      await this.cacheManager.set(testKey, testValue, 1000);
      const result = await this.cacheManager.get(testKey);

      if (result === testValue) {
        this.isConnected = true;
        this.connectionRetries = 0;
        this.logger.log('Redis connection established successfully');
        // Clean up test key
        await this.cacheManager.del(testKey);
      } else {
        throw new Error(
          `Connection test failed: expected ${testValue}, got ${String(result)}`,
        );
      }
    } catch (error) {
      this.isConnected = false;
      this.connectionRetries++;

      this.logger.error(
        `Redis connection failed (attempt ${this.connectionRetries}/${this.maxRetries}): ${error instanceof Error ? error.message : String(error)}`,
      );

      if (this.connectionRetries < this.maxRetries) {
        setTimeout(
          () => void this.checkConnection(),
          this.retryDelay * this.connectionRetries,
        );
      }
    }
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      const value = await this.cacheManager.get<T>(key);
      if (value !== undefined && value !== null) {
        this.logger.debug(`Cache hit for key: ${key}`);
        return value;
      } else {
        this.logger.debug(`Cache miss for key: ${key}`);
        // Try fallback cache
        return this.getFallback<T>(key);
      }
    } catch (error) {
      this.logger.error(
        `Error getting cache key ${key}: ${error instanceof Error ? error.message : String(error)}`,
      );
      // Try fallback cache
      return this.getFallback<T>(key);
    }
  }

  async set<T>(key: string, value: T, options?: CacheOptions): Promise<void> {
    try {
      const ttl = options?.ttl || 300; // Default 5 minutes
      await this.cacheManager.set(key, value, ttl * 1000); // Convert to milliseconds
      this.logger.debug(`Cache set for key: ${key} with TTL: ${ttl}s`);

      // Also set in fallback cache
      this.setFallback(key, value, ttl);
    } catch (error) {
      this.logger.error(
        `Error setting cache key ${key}: ${error instanceof Error ? error.message : String(error)}`,
      );
      // Set in fallback cache only
      const ttl = options?.ttl || 300;
      this.setFallback(key, value, ttl);
    }
  }

  async del(key: string): Promise<void> {
    try {
      await this.cacheManager.del(key);
      this.logger.debug(`Cache deleted for key: ${key}`);
    } catch (error) {
      this.logger.error(
        `Error deleting cache key ${key}: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  reset(): void {
    try {
      // Reset is not available in the Cache interface
      // We could iterate and delete keys if needed
      // For now, just log the intent
      const cacheWithReset = this.cacheManager as Cache & {
        reset?: () => void;
      };
      if (typeof cacheWithReset.reset === 'function') {
        cacheWithReset.reset();
      }
      this.logger.log('Cache reset successfully');
    } catch (error) {
      this.logger.error(
        `Error resetting cache: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  async wrap<T>(
    key: string,
    fn: () => Promise<T>,
    options?: CacheOptions,
  ): Promise<T> {
    try {
      // Try to get from cache first
      const cached = await this.get<T>(key);
      if (cached !== null && cached !== undefined) {
        if (options?.refreshOnGet) {
          // Refresh TTL - don't fail if this fails
          try {
            await this.set(key, cached, options);
          } catch (refreshError) {
            this.logger.warn(
              `Failed to refresh TTL for key ${key}: ${refreshError instanceof Error ? refreshError.message : String(refreshError)}`,
            );
          }
        }
        return cached;
      }

      // If not in cache, execute function and cache result
      const result = await fn();

      // Try to cache the result, but don't fail if caching fails
      try {
        await this.set(key, result, options);
      } catch (cacheError) {
        this.logger.warn(
          `Failed to cache result for key ${key}: ${cacheError instanceof Error ? cacheError.message : String(cacheError)}`,
        );
      }

      return result;
    } catch (error) {
      this.logger.error(
        `Error in cache wrap for key ${key}: ${error instanceof Error ? error.message : String(error)}`,
      );
      // Fallback to executing the function without caching
      try {
        return await fn();
      } catch (fnError) {
        this.logger.error(
          `Both cache and function failed for key ${key}: ${fnError instanceof Error ? fnError.message : String(fnError)}`,
        );
        throw fnError;
      }
    }
  }

  // Generate cache keys with prefixes for better organization
  generateKey(prefix: string, ...parts: (string | number)[]): string {
    return `${prefix}:${parts.join(':')}`;
  }

  // Batch operations for efficiency
  async mget<T>(keys: string[]): Promise<(T | null)[]> {
    const results = await Promise.all(keys.map((key) => this.get<T>(key)));
    return results;
  }

  async mset<T>(
    items: Array<{ key: string; value: T; options?: CacheOptions }>,
  ): Promise<void> {
    await Promise.all(
      items.map((item) => this.set(item.key, item.value, item.options)),
    );
  }

  // Pattern-based deletion (useful for invalidating related cache entries)
  delByPattern(pattern: string): void {
    try {
      // Note: This is a simplified implementation
      // In production, you might want to use Redis SCAN command
      this.logger.warn(
        `Pattern deletion not fully implemented for: ${pattern}`,
      );
      // For now, we'll just log the attempt
    } catch (error) {
      this.logger.error(
        `Error deleting by pattern ${pattern}: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  isHealthy(): boolean {
    return this.isConnected;
  }

  getConnectionStatus(): { connected: boolean; retries: number } {
    return {
      connected: this.isConnected,
      retries: this.connectionRetries,
    };
  }

  // Pub/Sub methods
  async publish(channel: string, message: string): Promise<void> {
    try {
      if (!this.publisher) {
        this.logger.warn('Redis publisher not initialized');
        return;
      }
      await this.publisher.publish(channel, message);
      this.logger.debug(`Published message to channel: ${channel}`);
    } catch (error) {
      this.logger.error(
        `Error publishing to channel ${channel}: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  getSubscriber(): RedisClientType {
    if (!this.subscriber) {
      throw new Error('Redis subscriber not initialized');
    }
    return this.subscriber;
  }

  // Fallback cache methods for when Redis is unavailable
  private getFallback<T>(key: string): T | null {
    const item = this.fallbackCache.get(key);
    if (!item) return null;

    if (Date.now() > item.expiry) {
      this.fallbackCache.delete(key);
      return null;
    }

    this.logger.debug(`Fallback cache hit for key: ${key}`);
    return item.value as T;
  }

  private setFallback<T>(key: string, value: T, ttlSeconds: number): void {
    const expiry = Date.now() + ttlSeconds * 1000;
    this.fallbackCache.set(key, { value, expiry });
    this.logger.debug(
      `Fallback cache set for key: ${key} with TTL: ${ttlSeconds}s`,
    );
  }

  private cleanupFallbackCache(): void {
    const now = Date.now();
    let removed = 0;

    for (const [key, item] of this.fallbackCache.entries()) {
      if (now > item.expiry) {
        this.fallbackCache.delete(key);
        removed++;
      }
    }

    if (removed > 0) {
      this.logger.debug(`Cleaned up ${removed} expired fallback cache entries`);
    }
  }

  // Periodic cleanup of fallback cache
  private startFallbackCacheCleanup(): void {
    setInterval(() => {
      this.cleanupFallbackCache();
    }, 60000); // Clean up every minute
  }
}
