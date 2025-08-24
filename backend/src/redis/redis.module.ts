import { Module, Global } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { ConfigModule, ConfigService } from '@nestjs/config';
import Keyv from 'keyv';
import KeyvRedis from '@keyv/redis';
import { RedisService } from './redis.service';
import { RedisHealthIndicator } from './redis.health';

@Global()
@Module({
  imports: [
    CacheModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        // First try to use REDIS_URL if available
        let redisUrl = configService.get('REDIS_URL');

        // If REDIS_URL is not set, build it from parts
        if (!redisUrl) {
          const redisHost = configService.get('REDIS_HOST', 'redis');
          const redisPort = configService.get('REDIS_PORT', 6379);
          const redisPassword = configService.get('REDIS_PASSWORD');

          redisUrl = `redis://${redisHost}:${redisPort}`;
          if (redisPassword) {
            redisUrl = `redis://:${redisPassword}@${redisHost}:${redisPort}`;
          }
        }

        try {
          const keyvRedis = new KeyvRedis(redisUrl);

          // Add error handling for Redis connection
          keyvRedis.on('error', (error) => {
            console.error('KeyvRedis connection error:', error);
          });

          const keyv = new Keyv({
            store: keyvRedis,
            ttl: 300000, // 5 minutes in milliseconds
            namespace: 'solfolio',
          });

          // Add error handling for Keyv
          keyv.on('error', (error) => {
            console.error('Keyv error:', error);
          });

          return {
            stores: [keyv],
          };
        } catch (error) {
          console.error('Failed to initialize Redis cache:', error);
          // Return in-memory cache as fallback
          return {
            stores: [
              new Keyv({
                ttl: 300000,
                namespace: 'solfolio',
              }),
            ],
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
