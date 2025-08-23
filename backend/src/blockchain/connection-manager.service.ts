import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Connection, ConnectionConfig } from '@solana/web3.js';
import { RateLimiterService } from './rate-limiter.service';

interface RetryOptions {
  maxRetries?: number;
  initialDelay?: number;
  maxDelay?: number;
  factor?: number;
}

@Injectable()
export class ConnectionManager {
  private readonly logger = new Logger(ConnectionManager.name);
  private connections: Map<string, Connection> = new Map();
  private readonly defaultRetryOptions: RetryOptions = {
    maxRetries: 3,
    initialDelay: 1000,
    maxDelay: 10000,
    factor: 2,
  };

  constructor(
    private readonly configService: ConfigService,
    private readonly rateLimiter: RateLimiterService,
  ) {}

  createConnection(rpcUrl: string, config?: ConnectionConfig): Connection {
    const existingConnection = this.connections.get(rpcUrl);
    if (existingConnection) {
      this.logger.debug(`Reusing existing connection for ${rpcUrl}`);
      return existingConnection;
    }

    const connectionConfig: ConnectionConfig = {
      commitment: 'confirmed',
      confirmTransactionInitialTimeout: 60000,
      ...config,
    };

    const connection = new Connection(rpcUrl, connectionConfig);
    this.connections.set(rpcUrl, connection);

    this.logger.log(`Created new connection to ${rpcUrl}`);
    return connection;
  }

  async executeWithRetry<T>(
    operation: () => Promise<T>,
    options?: RetryOptions,
  ): Promise<T> {
    const opts = { ...this.defaultRetryOptions, ...options };
    let lastError: Error = new Error('Operation failed');
    let delay = opts.initialDelay!;

    for (let attempt = 0; attempt <= opts.maxRetries!; attempt++) {
      try {
        await this.rateLimiter.waitForSlot();
        const result = await operation();

        if (attempt > 0) {
          this.logger.debug(`Operation succeeded after ${attempt} retries`);
        }

        return result;
      } catch (error) {
        lastError = error as Error;

        if (attempt === opts.maxRetries!) {
          this.logger.error(
            `Operation failed after ${opts.maxRetries! + 1} attempts`,
            error,
          );
          break;
        }

        const isRetryable = this.isRetryableError(error);
        if (!isRetryable) {
          this.logger.error('Non-retryable error encountered', error);
          throw error;
        }

        this.logger.warn(
          `Attempt ${attempt + 1} failed, retrying in ${delay}ms...`,
          (error as Error).message,
        );

        await this.sleep(delay);
        delay = Math.min(delay * opts.factor!, opts.maxDelay!);
      }
    }

    throw lastError;
  }

  private isRetryableError(error: unknown): boolean {
    if (!error) return false;

    const errorObj = error as {
      message?: string;
      code?: string;
      status?: number;
    };
    const message = errorObj.message?.toLowerCase() || '';
    const code = errorObj.code;

    // Network errors
    if (
      code === 'ECONNREFUSED' ||
      code === 'ECONNRESET' ||
      code === 'ETIMEDOUT' ||
      code === 'ENOTFOUND'
    ) {
      return true;
    }

    // Rate limiting errors
    if (
      message.includes('rate limit') ||
      message.includes('too many requests') ||
      errorObj.status === 429
    ) {
      return true;
    }

    // Temporary blockchain errors
    if (
      message.includes('blockhash not found') ||
      message.includes('node is behind') ||
      message.includes('service unavailable') ||
      errorObj.status === 503
    ) {
      return true;
    }

    return false;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  closeConnection(rpcUrl: string): void {
    const connection = this.connections.get(rpcUrl);
    if (connection) {
      this.connections.delete(rpcUrl);
      this.logger.log(`Closed connection to ${rpcUrl}`);
    }
  }

  closeAllConnections(): void {
    for (const [url] of this.connections) {
      this.closeConnection(url);
    }
    this.logger.log('Closed all connections');
  }

  getActiveConnections(): string[] {
    return Array.from(this.connections.keys());
  }

  async testConnection(connection: Connection): Promise<boolean> {
    try {
      const slot = await connection.getSlot();
      return slot > 0;
    } catch (error) {
      this.logger.error('Connection test failed', error);
      return false;
    }
  }
}
