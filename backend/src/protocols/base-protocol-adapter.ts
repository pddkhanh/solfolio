import { Logger } from '@nestjs/common';
import { ProtocolType } from '@prisma/client';
import { IProtocolAdapter, Position, ProtocolStats } from './protocol-adapter.interface';
import { RedisService } from '../redis/redis.service';

export abstract class BaseProtocolAdapter implements IProtocolAdapter {
  protected readonly logger: Logger;
  
  constructor(
    public readonly protocolType: ProtocolType,
    public readonly protocolName: string,
    public readonly priority: number,
    protected readonly redisService?: RedisService,
  ) {
    this.logger = new Logger(`${protocolName}Adapter`);
  }

  abstract getPositions(walletAddress: string): Promise<Position[]>;
  
  abstract getProtocolStats(): Promise<ProtocolStats>;
  
  abstract isSupported(tokenMint: string): boolean;

  protected async getCachedPositions(walletAddress: string): Promise<Position[] | null> {
    if (!this.redisService) {
      return null;
    }

    try {
      const cacheKey = this.redisService.generateKey(
        `positions:${this.protocolType.toLowerCase()}`,
        walletAddress,
      );
      return await this.redisService.get<Position[]>(cacheKey);
    } catch (error) {
      this.logger.error('Error fetching cached positions:', error);
      return null;
    }
  }

  protected async cachePositions(
    walletAddress: string,
    positions: Position[],
    ttl = 300,
  ): Promise<void> {
    if (!this.redisService) {
      return;
    }

    try {
      const cacheKey = this.redisService.generateKey(
        `positions:${this.protocolType.toLowerCase()}`,
        walletAddress,
      );
      await this.redisService.set(cacheKey, positions, ttl);
    } catch (error) {
      this.logger.error('Error caching positions:', error);
    }
  }

  async invalidateCache(walletAddress: string): Promise<void> {
    if (!this.redisService) {
      return;
    }

    try {
      const cacheKey = this.redisService.generateKey(
        `positions:${this.protocolType.toLowerCase()}`,
        walletAddress,
      );
      await this.redisService.del(cacheKey);
      this.logger.debug(`Cache invalidated for ${walletAddress}`);
    } catch (error) {
      this.logger.error('Error invalidating cache:', error);
    }
  }

  protected async getCachedStats(): Promise<ProtocolStats | null> {
    if (!this.redisService) {
      return null;
    }

    try {
      const cacheKey = `protocol:stats:${this.protocolType.toLowerCase()}`;
      return await this.redisService.get<ProtocolStats>(cacheKey);
    } catch (error) {
      this.logger.error('Error fetching cached stats:', error);
      return null;
    }
  }

  protected async cacheStats(stats: ProtocolStats, ttl = 60): Promise<void> {
    if (!this.redisService) {
      return;
    }

    try {
      const cacheKey = `protocol:stats:${this.protocolType.toLowerCase()}`;
      await this.redisService.set(cacheKey, stats, ttl);
    } catch (error) {
      this.logger.error('Error caching stats:', error);
    }
  }

  protected handleError(error: any, context: string): void {
    this.logger.error(`Error in ${context}:`, error);
    if (error.response) {
      this.logger.error('Response data:', error.response.data);
      this.logger.error('Response status:', error.response.status);
    }
  }
}