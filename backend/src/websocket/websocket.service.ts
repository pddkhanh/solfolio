import { Injectable, Logger } from '@nestjs/common';
import { Server } from 'socket.io';
import { RedisService } from '../redis/redis.service';
import { EventEmitter } from 'events';

export interface PriceUpdate {
  tokenMint: string;
  price: number;
  timestamp: number;
  change24h?: number;
}

export interface WalletUpdate {
  walletAddress: string;
  type: 'balance' | 'position' | 'transaction';
  data: any;
  timestamp: number;
}

@Injectable()
export class WebsocketService extends EventEmitter {
  private server: Server;
  private readonly logger = new Logger(WebsocketService.name);
  private priceUpdateInterval: NodeJS.Timeout | undefined;
  private readonly PRICE_UPDATE_INTERVAL = 30000; // 30 seconds

  constructor(private readonly redisService: RedisService) {
    super();
  }

  setServer(server: Server) {
    this.server = server;
    this.startPriceUpdates();
    void this.subscribeToRedisEvents();
  }

  private startPriceUpdates() {
    if (this.priceUpdateInterval) {
      clearInterval(this.priceUpdateInterval);
    }

    this.priceUpdateInterval = setInterval(() => {
      void this.fetchAndBroadcastPrices();
    }, this.PRICE_UPDATE_INTERVAL);

    void this.fetchAndBroadcastPrices();
  }

  private async fetchAndBroadcastPrices() {
    try {
      const cachedPrices = await this.redisService.get<string>('prices:latest');
      if (cachedPrices) {
        const prices = JSON.parse(cachedPrices) as PriceUpdate | PriceUpdate[];
        this.broadcastPriceUpdate(prices);
      }
    } catch (error) {
      this.logger.error('Error fetching prices for broadcast', error);
    }
  }

  private async subscribeToRedisEvents() {
    try {
      const subscriber = this.redisService.getSubscriber();

      await subscriber.subscribe('price:update', (message) => {
        this.handleRedisMessage('price:update', message);
      });
      await subscriber.subscribe('wallet:update', (message) => {
        this.handleRedisMessage('wallet:update', message);
      });
      await subscriber.subscribe('position:update', (message) => {
        this.handleRedisMessage('position:update', message);
      });

      this.logger.log('Subscribed to Redis pub/sub channels');
    } catch (error) {
      this.logger.error('Error subscribing to Redis events', error);
    }
  }

  private handleRedisMessage(channel: string, message: string) {
    try {
      const data = JSON.parse(message);

      switch (channel) {
        case 'price:update':
          this.broadcastPriceUpdate(data);
          break;
        case 'wallet:update':
          this.broadcastWalletUpdate(data);
          break;
        case 'position:update':
          this.broadcastPositionUpdate(data);
          break;
        default:
          this.logger.warn(`Unknown channel: ${channel}`);
      }
    } catch (error) {
      this.logger.error(`Error handling Redis message from ${channel}`, error);
    }
  }

  broadcastPriceUpdate(prices: PriceUpdate | PriceUpdate[]) {
    if (!this.server) {
      this.logger.warn('Server not initialized, cannot broadcast price update');
      return;
    }

    const priceArray = Array.isArray(prices) ? prices : [prices];

    this.server.to('prices').emit('price:update', {
      prices: priceArray,
      timestamp: Date.now(),
    });

    this.logger.debug(
      `Broadcasted price update to ${priceArray.length} tokens`,
    );
  }

  broadcastWalletUpdate(update: WalletUpdate) {
    if (!this.server) {
      this.logger.warn(
        'Server not initialized, cannot broadcast wallet update',
      );
      return;
    }

    const room = `wallet:${update.walletAddress}`;

    this.server.to(room).emit('wallet:update', {
      type: update.type,
      data: update.data,
      timestamp: update.timestamp || Date.now(),
    });

    this.logger.debug(`Broadcasted wallet update to room ${room}`);
  }

  broadcastPositionUpdate(data: { walletAddress: string; positions: any[] }) {
    if (!this.server) {
      this.logger.warn(
        'Server not initialized, cannot broadcast position update',
      );
      return;
    }

    const room = `wallet:${data.walletAddress}`;

    this.server.to(room).emit('position:update', {
      positions: data.positions,
      timestamp: Date.now(),
    });

    this.logger.debug(`Broadcasted position update to room ${room}`);
  }

  async publishPriceUpdate(prices: PriceUpdate | PriceUpdate[]) {
    try {
      await this.redisService.publish('price:update', JSON.stringify(prices));
      await this.redisService.set(
        'prices:latest',
        JSON.stringify(prices),
        { ttl: 60 }, // TTL: 1 minute
      );
    } catch (error) {
      this.logger.error('Error publishing price update to Redis', error);
    }
  }

  async publishWalletUpdate(update: WalletUpdate) {
    try {
      await this.redisService.publish('wallet:update', JSON.stringify(update));
    } catch (error) {
      this.logger.error('Error publishing wallet update to Redis', error);
    }
  }

  async publishPositionUpdate(walletAddress: string, positions: any[]) {
    try {
      const data = { walletAddress, positions };
      await this.redisService.publish('position:update', JSON.stringify(data));
    } catch (error) {
      this.logger.error('Error publishing position update to Redis', error);
    }
  }

  getConnectedClientsCount(): number {
    if (!this.server || !this.server.sockets) {
      return 0;
    }
    return this.server.sockets.sockets.size;
  }

  async getRoomClients(room: string): Promise<string[]> {
    if (!this.server) {
      return [];
    }
    const sockets = await this.server.in(room).fetchSockets();
    return sockets.map((socket) => socket.id);
  }

  broadcastToWallet(walletAddress: string, data: any) {
    if (!this.server) {
      this.logger.warn('Server not initialized, cannot broadcast to wallet');
      return;
    }

    const room = `wallet:${walletAddress}`;
    this.server.to(room).emit('wallet:notification', data);

    this.logger.debug(`Broadcasted notification to wallet room ${room}`);
  }

  notifyWalletSubscribed(walletAddress: string) {
    this.emit('walletSubscribed', walletAddress);
  }

  notifyWalletUnsubscribed(walletAddress: string) {
    this.emit('walletUnsubscribed', walletAddress);
  }

  isServerInitialized(): boolean {
    return !!this.server;
  }

  disconnect() {
    if (this.priceUpdateInterval) {
      clearInterval(this.priceUpdateInterval);
      this.priceUpdateInterval = undefined;
    }
    this.logger.log('WebSocket service disconnected');
  }
}
