import { Module, Global } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { RedisService } from './redis.service';
import { RedisHealthIndicator } from './redis.health';
import Keyv from 'keyv';
import KeyvRedis from '@keyv/redis';

@Global()
@Module({
  imports: [
    CacheModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const redisUrl = configService.get('REDIS_URL') || 'redis://redis:6379';
        
        try {
          // Create Keyv Redis adapter for cache-manager v7
          const keyvRedis = new KeyvRedis(redisUrl);
          
          return {
            stores: [new Keyv({ 
              store: keyvRedis,
              namespace: 'cache',
              ttl: 300000, // 5 minutes in milliseconds
            })],
          };
        } catch (error) {
          console.error('Failed to connect to Redis, using in-memory cache:', error);
          // Fallback to in-memory cache
          return {
            stores: [new Keyv({
              ttl: 300000, // 5 minutes in milliseconds
            })],
          };
        }
      },
      inject: [ConfigService],
    }),
  ],
  providers: [RedisService, RedisHealthIndicator],
  exports: [CacheModule, RedisService, RedisHealthIndicator],
})
export class RedisModule {}
