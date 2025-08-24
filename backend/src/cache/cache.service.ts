import { Injectable } from '@nestjs/common';
import { RedisService } from '../redis/redis.service';

@Injectable()
export class CacheService {
  constructor(private readonly redisService: RedisService) {}

  async get<T>(key: string): Promise<T | null> {
    const value = await this.redisService.get<string>(key);
    if (!value) return null;
    try {
      return JSON.parse(value) as T;
    } catch {
      return value as T;
    }
  }

  async set(key: string, value: any, ttl?: number): Promise<void> {
    const stringValue =
      typeof value === 'string' ? value : JSON.stringify(value);
    await this.redisService.set(key, stringValue, ttl ? { ttl } : undefined);
  }

  async delete(key: string): Promise<void> {
    await this.redisService.del(key);
  }

  async has(key: string): Promise<boolean> {
    return await this.redisService.exists(key);
  }
}
