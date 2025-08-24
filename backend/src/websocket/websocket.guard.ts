import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import { Socket } from 'socket.io';

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

@Injectable()
export class WsRateLimitGuard implements CanActivate {
  private readonly rateLimits = new Map<string, RateLimitEntry>();
  private readonly maxRequests = 60; // 60 requests
  private readonly windowMs = 60000; // per minute

  canActivate(context: ExecutionContext): boolean {
    const client = context.switchToWs().getClient<Socket>();
    const clientId = client.id;
    const now = Date.now();

    const rateLimit = this.rateLimits.get(clientId);

    if (!rateLimit || now > rateLimit.resetTime) {
      // Create new rate limit entry
      this.rateLimits.set(clientId, {
        count: 1,
        resetTime: now + this.windowMs,
      });
      return true;
    }

    if (rateLimit.count >= this.maxRequests) {
      throw new WsException('Rate limit exceeded. Please try again later.');
    }

    rateLimit.count++;
    return true;
  }

  // Clean up old entries periodically
  cleanupOldEntries() {
    const now = Date.now();
    for (const [clientId, entry] of this.rateLimits.entries()) {
      if (now > entry.resetTime + this.windowMs) {
        this.rateLimits.delete(clientId);
      }
    }
  }
}
