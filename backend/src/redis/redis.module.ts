import { Module, Global } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { redisStore } from 'cache-manager-redis-store';
import { RedisService } from './redis.service';

@Global()
@Module({
  imports: [
    CacheModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        store: redisStore as any,
        host: configService.get('REDIS_HOST', 'redis'),
        port: configService.get('REDIS_PORT', 6379),
        password: configService.get('REDIS_PASSWORD'),
        ttl: 300, // Default TTL: 5 minutes
        max: 100, // Maximum number of items in cache
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [RedisService],
  exports: [CacheModule, RedisService],
})
export class RedisModule {}