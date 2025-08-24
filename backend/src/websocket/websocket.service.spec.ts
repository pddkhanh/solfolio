import { Test, TestingModule } from '@nestjs/testing';
import { WebsocketService } from './websocket.service';
import { RedisService } from '../redis/redis.service';
import { Server } from 'socket.io';

describe('WebsocketService', () => {
  let service: WebsocketService;
  let redisService: RedisService;
  let mockServer: Partial<Server>;

  beforeEach(async () => {
    mockServer = {
      to: jest.fn(() => ({
        emit: jest.fn(),
      })),
      in: jest.fn(() => ({
        fetchSockets: jest.fn(() => Promise.resolve([{ id: 'socket1' }, { id: 'socket2' }])),
      })),
      sockets: {
        sockets: new Map([
          ['socket1', {} as any],
          ['socket2', {} as any],
        ]),
      },
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WebsocketService,
        {
          provide: RedisService,
          useValue: {
            get: jest.fn(),
            set: jest.fn(),
            publish: jest.fn(),
            getSubscriber: jest.fn(() => ({
              subscribe: jest.fn(),
              on: jest.fn(),
            })),
          },
        },
      ],
    }).compile();

    service = module.get<WebsocketService>(WebsocketService);
    redisService = module.get<RedisService>(RedisService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('setServer', () => {
    it('should set server and initialize subscriptions', () => {
      const subscribeSpy = jest.spyOn(service as any, 'subscribeToRedisEvents');
      const priceUpdateSpy = jest.spyOn(service as any, 'startPriceUpdates');
      
      service.setServer(mockServer as Server);
      
      expect(subscribeSpy).toHaveBeenCalled();
      expect(priceUpdateSpy).toHaveBeenCalled();
    });
  });

  describe('broadcastPriceUpdate', () => {
    it('should broadcast price update to price room', () => {
      service.setServer(mockServer as Server);
      
      const priceUpdate = {
        tokenMint: 'test-mint',
        price: 100,
        timestamp: Date.now(),
      };
      
      service.broadcastPriceUpdate(priceUpdate);
      
      expect(mockServer.to).toHaveBeenCalledWith('prices');
    });

    it('should handle array of price updates', () => {
      service.setServer(mockServer as Server);
      
      const priceUpdates = [
        { tokenMint: 'mint1', price: 100, timestamp: Date.now() },
        { tokenMint: 'mint2', price: 200, timestamp: Date.now() },
      ];
      
      service.broadcastPriceUpdate(priceUpdates);
      
      expect(mockServer.to).toHaveBeenCalledWith('prices');
    });

    it('should not broadcast if server not initialized', () => {
      const loggerSpy = jest.spyOn((service as any).logger, 'warn');
      
      service.broadcastPriceUpdate({ tokenMint: 'test', price: 100, timestamp: Date.now() });
      
      expect(loggerSpy).toHaveBeenCalledWith(
        'Server not initialized, cannot broadcast price update',
      );
    });
  });

  describe('broadcastWalletUpdate', () => {
    it('should broadcast wallet update to wallet room', () => {
      service.setServer(mockServer as Server);
      
      const walletUpdate = {
        walletAddress: 'test-wallet',
        type: 'balance' as const,
        data: { balance: 100 },
        timestamp: Date.now(),
      };
      
      service.broadcastWalletUpdate(walletUpdate);
      
      expect(mockServer.to).toHaveBeenCalledWith('wallet:test-wallet');
    });
  });

  describe('broadcastPositionUpdate', () => {
    it('should broadcast position update to wallet room', () => {
      service.setServer(mockServer as Server);
      
      const positionData = {
        walletAddress: 'test-wallet',
        positions: [{ protocol: 'Marinade', value: 1000 }],
      };
      
      service.broadcastPositionUpdate(positionData);
      
      expect(mockServer.to).toHaveBeenCalledWith('wallet:test-wallet');
    });
  });

  describe('publishPriceUpdate', () => {
    it('should publish price update to Redis', async () => {
      const priceUpdate = {
        tokenMint: 'test-mint',
        price: 100,
        timestamp: Date.now(),
      };
      
      await service.publishPriceUpdate(priceUpdate);
      
      expect(redisService.publish).toHaveBeenCalledWith(
        'price:update',
        JSON.stringify(priceUpdate),
      );
      expect(redisService.set).toHaveBeenCalledWith(
        'prices:latest',
        JSON.stringify(priceUpdate),
        60,
      );
    });
  });

  describe('publishWalletUpdate', () => {
    it('should publish wallet update to Redis', async () => {
      const walletUpdate = {
        walletAddress: 'test-wallet',
        type: 'balance' as const,
        data: { balance: 100 },
        timestamp: Date.now(),
      };
      
      await service.publishWalletUpdate(walletUpdate);
      
      expect(redisService.publish).toHaveBeenCalledWith(
        'wallet:update',
        JSON.stringify(walletUpdate),
      );
    });
  });

  describe('publishPositionUpdate', () => {
    it('should publish position update to Redis', async () => {
      const positions = [{ protocol: 'Marinade', value: 1000 }];
      
      await service.publishPositionUpdate('test-wallet', positions);
      
      expect(redisService.publish).toHaveBeenCalledWith(
        'position:update',
        JSON.stringify({ walletAddress: 'test-wallet', positions }),
      );
    });
  });

  describe('getConnectedClientsCount', () => {
    it('should return connected clients count', () => {
      service.setServer(mockServer as Server);
      const count = service.getConnectedClientsCount();
      expect(count).toBe(2);
    });

    it('should return 0 if server not initialized', () => {
      const count = service.getConnectedClientsCount();
      expect(count).toBe(0);
    });
  });

  describe('getRoomClients', () => {
    it('should return clients in room', async () => {
      service.setServer(mockServer as Server);
      const clients = await service.getRoomClients('test-room');
      expect(clients).toEqual(['socket1', 'socket2']);
    });

    it('should return empty array if server not initialized', async () => {
      const clients = await service.getRoomClients('test-room');
      expect(clients).toEqual([]);
    });
  });

  describe('disconnect', () => {
    it('should clear price update interval on disconnect', () => {
      service.setServer(mockServer as Server);
      service.disconnect();
      expect((service as any).priceUpdateInterval).toBeNull();
    });
  });
});