import {
  CanActivate,
  ExecutionContext,
  Injectable,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { RedisService } from '../../redis/redis.service';

export interface RateLimitOptions {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Maximum requests per window
  keyGenerator?: (request: Request) => string;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
}

export const RATE_LIMIT_KEY = 'rate_limit';
export const RateLimit = (options: RateLimitOptions) =>
  Reflector.createDecorator<RateLimitOptions>({ key: RATE_LIMIT_KEY, options });

@Injectable()
export class RateLimitGuard implements CanActivate {
  private readonly logger = new Logger(RateLimitGuard.name);

  constructor(
    private readonly reflector: Reflector,
    private readonly redisService: RedisService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const rateLimitOptions = this.reflector.get<RateLimitOptions>(
      RATE_LIMIT_KEY,
      context.getHandler(),
    ) || this.reflector.get<RateLimitOptions>(
      RATE_LIMIT_KEY,
      context.getClass(),
    );

    if (!rateLimitOptions) {
      return true; // No rate limiting applied
    }

    const request = context.switchToHttp().getRequest<Request>();
    const key = this.generateKey(request, rateLimitOptions);
    
    try {
      const isAllowed = await this.checkRateLimit(key, rateLimitOptions);
      
      if (!isAllowed) {
        this.logger.warn(`Rate limit exceeded for key: ${key}`, {
          ip: request.ip,
          userAgent: request.get('user-agent'),
          path: request.path,
        });
        
        throw new HttpException(
          {
            error: 'Too Many Requests',
            message: 'Rate limit exceeded. Please try again later.',
            statusCode: HttpStatus.TOO_MANY_REQUESTS,
            retryAfter: Math.ceil(rateLimitOptions.windowMs / 1000),
          },
          HttpStatus.TOO_MANY_REQUESTS,
        );
      }

      return true;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      
      this.logger.error(
        `Rate limiting check failed for key: ${key}`,
        error,
      );
      
      // On Redis failure, allow the request to proceed
      // This ensures the application doesn't fail completely
      return true;
    }
  }

  private generateKey(
    request: Request,
    options: RateLimitOptions,
  ): string {
    if (options.keyGenerator) {
      return options.keyGenerator(request);
    }

    // Default key generation based on IP and route
    const ip = request.ip || 'unknown';
    const route = request.route?.path || request.path;
    return `rate_limit:${ip}:${route}`;
  }

  private async checkRateLimit(
    key: string,
    options: RateLimitOptions,
  ): Promise<boolean> {
    const now = Date.now();
    const windowStart = now - options.windowMs;

    // Get current request count
    const countKey = `${key}:count`;
    const timestampKey = `${key}:timestamp`;

    const [currentCount, lastTimestamp] = await Promise.all([
      this.redisService.get<number>(countKey),
      this.redisService.get<number>(timestampKey),
    ]);

    // If no previous requests or window has expired, reset
    if (!currentCount || !lastTimestamp || lastTimestamp < windowStart) {
      await Promise.all([
        this.redisService.set(countKey, 1, {
          ttl: Math.ceil(options.windowMs / 1000),
        }),
        this.redisService.set(timestampKey, now, {
          ttl: Math.ceil(options.windowMs / 1000),
        }),
      ]);
      return true;
    }

    // Check if limit is exceeded
    if (currentCount >= options.maxRequests) {
      return false;
    }

    // Increment counter
    await this.redisService.set(countKey, currentCount + 1, {
      ttl: Math.ceil(options.windowMs / 1000),
    });

    return true;
  }
}