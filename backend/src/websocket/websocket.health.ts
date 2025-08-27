import { Injectable } from '@nestjs/common';
import {
  HealthCheckError,
  HealthIndicator,
  HealthIndicatorResult,
} from '@nestjs/terminus';
import { WebsocketService } from './websocket.service';

@Injectable()
export class WebsocketHealthIndicator extends HealthIndicator {
  constructor(private readonly websocketService: WebsocketService) {
    super();
  }

  isHealthy(key: string): HealthIndicatorResult {
    try {
      const isServerInitialized = this.websocketService.isServerInitialized();

      // Don't try to get connected clients if server is not initialized
      let connectedClients = 0;
      if (isServerInitialized) {
        try {
          connectedClients = this.websocketService.getConnectedClientsCount();
        } catch {
          // If there's an error getting count, just use 0
          connectedClients = 0;
        }
      }

      const result = this.getStatus(key, isServerInitialized, {
        initialized: isServerInitialized,
        connectedClients,
        status: isServerInitialized ? 'ready' : 'initializing',
      });

      // During startup, consider WebSocket as healthy even if not fully initialized
      // This prevents the health check from failing during the initialization phase
      return result;
    } catch (error) {
      throw new HealthCheckError(
        'WebSocket health check failed',
        this.getStatus(key, false, {
          error: error instanceof Error ? error.message : 'Unknown error',
          status: 'unhealthy',
        }),
      );
    }
  }
}
