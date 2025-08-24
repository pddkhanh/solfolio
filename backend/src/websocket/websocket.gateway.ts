import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { WebsocketService } from './websocket.service';
import { PublicKey } from '@solana/web3.js';

@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  },
  namespace: '/',
  transports: ['websocket', 'polling'],
})
export class WebsocketGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(WebsocketGateway.name);
  private clientWallets = new Map<string, string>();

  constructor(private readonly websocketService: WebsocketService) {}

  afterInit(server: Server) {
    this.logger.log('WebSocket Gateway initialized');
    this.websocketService.setServer(server);
  }

  async handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);

    const walletAddress = client.handshake.query.wallet as string;
    if (walletAddress) {
      await this.handleWalletSubscription(client, walletAddress);
    }

    client.emit('connected', {
      message: 'Connected to SolFolio WebSocket server',
      clientId: client.id,
    });
  }

  async handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);

    const walletAddress = this.clientWallets.get(client.id);
    if (walletAddress) {
      await this.handleWalletUnsubscription(client, walletAddress);
      this.clientWallets.delete(client.id);
    }
  }

  @SubscribeMessage('subscribe:wallet')
  async handleWalletSubscription(
    @ConnectedSocket() client: Socket,
    @MessageBody() walletAddress: string,
  ) {
    if (!walletAddress) {
      client.emit('error', { message: 'Wallet address is required' });
      return;
    }

    // Validate Solana wallet address
    if (!this.isValidSolanaAddress(walletAddress)) {
      client.emit('error', { message: 'Invalid Solana wallet address' });
      return;
    }

    this.logger.log(
      `Client ${client.id} subscribing to wallet: ${walletAddress}`,
    );

    const previousWallet = this.clientWallets.get(client.id);
    if (previousWallet && previousWallet !== walletAddress) {
      await client.leave(`wallet:${previousWallet}`);
      this.logger.log(
        `Client ${client.id} left room: wallet:${previousWallet}`,
      );
    }

    await client.join(`wallet:${walletAddress}`);
    this.clientWallets.set(client.id, walletAddress);

    client.emit('subscription:confirmed', {
      type: 'wallet',
      address: walletAddress,
      room: `wallet:${walletAddress}`,
    });

    // Notify monitoring service
    this.websocketService.notifyWalletSubscribed(walletAddress);

    this.logger.log(`Client ${client.id} joined room: wallet:${walletAddress}`);
  }

  @SubscribeMessage('unsubscribe:wallet')
  async handleWalletUnsubscription(
    @ConnectedSocket() client: Socket,
    @MessageBody() walletAddress: string,
  ) {
    if (!walletAddress) {
      return;
    }

    this.logger.log(
      `Client ${client.id} unsubscribing from wallet: ${walletAddress}`,
    );

    await client.leave(`wallet:${walletAddress}`);

    if (this.clientWallets.get(client.id) === walletAddress) {
      this.clientWallets.delete(client.id);
    }

    client.emit('unsubscription:confirmed', {
      type: 'wallet',
      address: walletAddress,
    });

    // Check if any other clients are still subscribed to this wallet
    const room = this.server.sockets.adapter.rooms.get(
      `wallet:${walletAddress}`,
    );
    if (!room || room.size === 0) {
      // No more clients for this wallet, notify monitoring service
      this.websocketService.notifyWalletUnsubscribed(walletAddress);
    }

    this.logger.log(`Client ${client.id} left room: wallet:${walletAddress}`);
  }

  @SubscribeMessage('subscribe:prices')
  async handlePriceSubscription(@ConnectedSocket() client: Socket) {
    this.logger.log(`Client ${client.id} subscribing to price updates`);

    await client.join('prices');

    client.emit('subscription:confirmed', {
      type: 'prices',
      room: 'prices',
    });

    this.logger.log(`Client ${client.id} joined room: prices`);
  }

  @SubscribeMessage('unsubscribe:prices')
  async handlePriceUnsubscription(@ConnectedSocket() client: Socket) {
    this.logger.log(`Client ${client.id} unsubscribing from price updates`);

    await client.leave('prices');

    client.emit('unsubscription:confirmed', {
      type: 'prices',
    });

    this.logger.log(`Client ${client.id} left room: prices`);
  }

  @SubscribeMessage('ping')
  handlePing(@ConnectedSocket() client: Socket) {
    client.emit('pong', { timestamp: Date.now() });
  }

  private isValidSolanaAddress(address: string): boolean {
    try {
      new PublicKey(address);
      return true;
    } catch {
      return false;
    }
  }
}
