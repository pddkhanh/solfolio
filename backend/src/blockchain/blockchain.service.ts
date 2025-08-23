import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Connection, PublicKey } from '@solana/web3.js';
import { ConnectionManager } from './connection-manager.service';

@Injectable()
export class BlockchainService implements OnModuleInit {
  private readonly logger = new Logger(BlockchainService.name);
  private connection: Connection;

  constructor(
    private readonly configService: ConfigService,
    private readonly connectionManager: ConnectionManager,
  ) {}

  async onModuleInit() {
    await this.initializeConnection();
  }

  private async initializeConnection() {
    try {
      const rpcUrl = this.configService.get<string>('HELIUS_RPC_URL');
      const network = this.configService.get<string>(
        'SOLANA_NETWORK',
        'devnet',
      );

      if (!rpcUrl) {
        throw new Error('HELIUS_RPC_URL is not configured');
      }

      this.connection = this.connectionManager.createConnection(rpcUrl);

      const version = await this.connection.getVersion();
      this.logger.log(`Connected to Solana ${network} via Helius RPC`);
      this.logger.log(`Solana version: ${JSON.stringify(version)}`);

      const slot = await this.connection.getSlot();
      this.logger.log(`Current slot: ${slot}`);
    } catch (error) {
      this.logger.error('Failed to initialize blockchain connection', error);
      throw error;
    }
  }

  getConnection(): Connection {
    if (!this.connection) {
      throw new Error('Blockchain connection not initialized');
    }
    return this.connection;
  }

  async getBalance(address: string): Promise<number> {
    try {
      const publicKey = new PublicKey(address);
      const balance = await this.connectionManager.executeWithRetry(async () =>
        this.connection.getBalance(publicKey),
      );
      return balance / 1e9; // Convert lamports to SOL
    } catch (error) {
      this.logger.error(`Failed to get balance for ${address}`, error);
      throw error;
    }
  }

  async getBlockHeight(): Promise<number> {
    try {
      return await this.connectionManager.executeWithRetry(async () =>
        this.connection.getBlockHeight(),
      );
    } catch (error) {
      this.logger.error('Failed to get block height', error);
      throw error;
    }
  }

  async getRecentBlockhash() {
    try {
      return await this.connectionManager.executeWithRetry(async () =>
        this.connection.getLatestBlockhash(),
      );
    } catch (error) {
      this.logger.error('Failed to get recent blockhash', error);
      throw error;
    }
  }

  async isHealthy(): Promise<boolean> {
    try {
      const blockHeight = await this.getBlockHeight();
      return blockHeight > 0;
    } catch (error) {
      this.logger.error('Health check failed', error);
      return false;
    }
  }
}
