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
        const redisHost = configService.get('REDIS_HOST', 'redis');
        const redisPort = configService.get('REDIS_PORT', 6379);
        const redisPassword = configService.get('REDIS_PASSWORD');

        // Build Redis URL
        let redisUrl = `redis://${redisHost}:${redisPort}`;
        if (redisPassword) {
          redisUrl = `redis://:${redisPassword}@${redisHost}:${redisPort}`;
        }

        return {
          stores: [
            new Keyv({
              store: new KeyvRedis(redisUrl),
              ttl: 300000, // 5 minutes in milliseconds (cache-manager v7 uses ms)
              namespace: 'solfolio',
            }),
          ],
        };
      },
      inject: [ConfigService],
    }),
  ],
  providers: [RedisService, RedisHealthIndicator],
  exports: [CacheModule, RedisService, RedisHealthIndicator],
})
export class RedisModule {}
