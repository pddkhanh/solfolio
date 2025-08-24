import { Test, TestingModule } from '@nestjs/testing';
import { WebsocketGateway } from './websocket.gateway';
import { WebsocketService } from './websocket.service';
import { Server, Socket } from 'socket.io';

describe('WebsocketGateway', () => {
  let gateway: WebsocketGateway;
  let websocketService: WebsocketService;
  let mockServer: Partial<Server>;
  let mockSocket: Partial<Socket>;

  beforeEach(async () => {
    mockServer = {
      emit: jest.fn(),
      to: jest.fn(() => ({
        emit: jest.fn(),
      })),
      in: jest.fn(() => ({
        fetchSockets: jest.fn(() => Promise.resolve([])),
      })),
      sockets: {
        sockets: new Map(),
      },
    } as any;

    mockSocket = {
      id: 'test-socket-id',
      emit: jest.fn(),
      join: jest.fn(),
      leave: jest.fn(),
      handshake: {
        query: {
          wallet: '11111111111111111111111111111111', // Valid Solana address (System Program)
        },
      },
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WebsocketGateway,
        {
          provide: WebsocketService,
          useValue: {
            setServer: jest.fn(),
            broadcastPriceUpdate: jest.fn(),
            broadcastWalletUpdate: jest.fn(),
            broadcastPositionUpdate: jest.fn(),
          },
        },
      ],
    }).compile();

    gateway = module.get<WebsocketGateway>(WebsocketGateway);
    websocketService = module.get<WebsocketService>(WebsocketService);
    gateway.server = mockServer as Server;
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });

  describe('afterInit', () => {
    it('should initialize WebSocket server', () => {
      gateway.afterInit(mockServer as Server);
      expect(websocketService.setServer).toHaveBeenCalledWith(mockServer);
    });
  });

  describe('handleConnection', () => {
    it('should handle client connection with wallet address', async () => {
      await gateway.handleConnection(mockSocket as Socket);
      expect(mockSocket.emit).toHaveBeenCalledWith('connected', {
        message: 'Connected to SolFolio WebSocket server',
        clientId: 'test-socket-id',
      });
      expect(mockSocket.join).toHaveBeenCalledWith(
        'wallet:11111111111111111111111111111111',
      );
    });

    it('should handle client connection without wallet address', async () => {
      const socketWithoutWallet = {
        ...mockSocket,
        handshake: { query: {} },
      } as Socket;
      await gateway.handleConnection(socketWithoutWallet);
      expect(mockSocket.emit).toHaveBeenCalledWith('connected', {
        message: 'Connected to SolFolio WebSocket server',
        clientId: 'test-socket-id',
      });
    });
  });

  describe('handleDisconnect', () => {
    it('should handle client disconnection', async () => {
      await gateway.handleConnection(mockSocket as Socket);
      await gateway.handleDisconnect(mockSocket as Socket);
      expect(mockSocket.leave).toHaveBeenCalled();
    });
  });

  describe('handleWalletSubscription', () => {
    it('should subscribe client to wallet room', async () => {
      const validWallet = 'So11111111111111111111111111111111111111112'; // Valid wrapped SOL address
      await gateway.handleWalletSubscription(mockSocket as Socket, validWallet);
      expect(mockSocket.join).toHaveBeenCalledWith(`wallet:${validWallet}`);
      expect(mockSocket.emit).toHaveBeenCalledWith('subscription:confirmed', {
        type: 'wallet',
        address: validWallet,
        room: `wallet:${validWallet}`,
      });
    });

    it('should handle invalid wallet subscription', async () => {
      await gateway.handleWalletSubscription(mockSocket as Socket, '');
      expect(mockSocket.emit).toHaveBeenCalledWith('error', {
        message: 'Wallet address is required',
      });
    });
  });

  describe('handleWalletUnsubscription', () => {
    it('should unsubscribe client from wallet room', async () => {
      const validWallet = '11111111111111111111111111111111';
      await gateway.handleWalletUnsubscription(
        mockSocket as Socket,
        validWallet,
      );
      expect(mockSocket.leave).toHaveBeenCalledWith(`wallet:${validWallet}`);
      expect(mockSocket.emit).toHaveBeenCalledWith('unsubscription:confirmed', {
        type: 'wallet',
        address: validWallet,
      });
    });
  });

  describe('handlePriceSubscription', () => {
    it('should subscribe client to price updates', async () => {
      await gateway.handlePriceSubscription(mockSocket as Socket);
      expect(mockSocket.join).toHaveBeenCalledWith('prices');
      expect(mockSocket.emit).toHaveBeenCalledWith('subscription:confirmed', {
        type: 'prices',
        room: 'prices',
      });
    });
  });

  describe('handlePriceUnsubscription', () => {
    it('should unsubscribe client from price updates', async () => {
      await gateway.handlePriceUnsubscription(mockSocket as Socket);
      expect(mockSocket.leave).toHaveBeenCalledWith('prices');
      expect(mockSocket.emit).toHaveBeenCalledWith('unsubscription:confirmed', {
        type: 'prices',
      });
    });
  });

  describe('handlePing', () => {
    it('should respond to ping with pong', () => {
      gateway.handlePing(mockSocket as Socket);
      expect(mockSocket.emit).toHaveBeenCalledWith('pong', {
        timestamp: expect.any(Number),
      });
    });
  });
});
