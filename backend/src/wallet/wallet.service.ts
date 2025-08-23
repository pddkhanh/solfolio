import { Injectable, Logger } from '@nestjs/common';
import { PublicKey, Connection, ParsedAccountData } from '@solana/web3.js';
import {
  TOKEN_PROGRAM_ID,
  TOKEN_2022_PROGRAM_ID,
  getAccount,
  getMint,
  Account,
} from '@solana/spl-token';
import { BlockchainService } from '../blockchain/blockchain.service';
import { ConnectionManager } from '../blockchain/connection-manager.service';
import { RateLimiterService } from '../blockchain/rate-limiter.service';
import { TokenMetadataService } from './token-metadata.service';

export interface TokenBalance {
  mint: string;
  owner: string;
  amount: string;
  decimals: number;
  uiAmount: number;
  tokenAccount: string;
  isNative?: boolean;
  symbol?: string;
  name?: string;
  logoUri?: string;
}

export interface WalletBalances {
  wallet: string;
  nativeSol: {
    amount: string;
    decimals: number;
    uiAmount: number;
  };
  tokens: TokenBalance[];
  totalAccounts: number;
  fetchedAt: Date;
}

@Injectable()
export class WalletService {
  private readonly logger = new Logger(WalletService.name);

  constructor(
    private readonly blockchainService: BlockchainService,
    private readonly connectionManager: ConnectionManager,
    private readonly rateLimiter: RateLimiterService,
    private readonly tokenMetadataService: TokenMetadataService,
  ) {}

  async getWalletBalances(walletAddress: string): Promise<WalletBalances> {
    try {
      await this.rateLimiter.checkLimit();

      const publicKey = new PublicKey(walletAddress);
      const connection = this.blockchainService.getConnection();

      const [nativeBalance, tokenAccounts] = await Promise.all([
        this.getNativeSolBalance(publicKey, connection),
        this.getTokenAccounts(publicKey, connection),
      ]);

      const tokenBalances = await this.parseTokenAccounts(
        tokenAccounts,
        connection,
      );

      return {
        wallet: walletAddress,
        nativeSol: nativeBalance,
        tokens: tokenBalances,
        totalAccounts: tokenBalances.length,
        fetchedAt: new Date(),
      };
    } catch (error) {
      this.logger.error(
        `Failed to get wallet balances for ${walletAddress}`,
        error,
      );
      throw error;
    }
  }

  private async getNativeSolBalance(
    publicKey: PublicKey,
    connection: Connection,
  ): Promise<{ amount: string; decimals: number; uiAmount: number }> {
    const balance = await this.connectionManager.executeWithRetry(() =>
      connection.getBalance(publicKey),
    );

    return {
      amount: balance.toString(),
      decimals: 9,
      uiAmount: balance / Math.pow(10, 9),
    };
  }

  private async getTokenAccounts(publicKey: PublicKey, connection: Connection) {
    const tokenAccounts = await this.connectionManager.executeWithRetry(() =>
      connection.getParsedTokenAccountsByOwner(publicKey, {
        programId: TOKEN_PROGRAM_ID,
      }),
    );

    const token2022Accounts = await this.connectionManager.executeWithRetry(
      () =>
        connection.getParsedTokenAccountsByOwner(publicKey, {
          programId: TOKEN_2022_PROGRAM_ID,
        }),
    );

    return [...tokenAccounts.value, ...token2022Accounts.value];
  }

  private async parseTokenAccounts(
    accounts: any[],
    connection: Connection,
  ): Promise<TokenBalance[]> {
    const tokenBalances: TokenBalance[] = [];

    for (const account of accounts) {
      try {
        const parsedData = account.account.data.parsed;
        const tokenInfo = parsedData.info;

        if (tokenInfo.tokenAmount.uiAmount > 0) {
          const tokenBalance: TokenBalance = {
            mint: tokenInfo.mint,
            owner: tokenInfo.owner,
            amount: tokenInfo.tokenAmount.amount,
            decimals: tokenInfo.tokenAmount.decimals,
            uiAmount: tokenInfo.tokenAmount.uiAmount,
            tokenAccount: account.pubkey.toString(),
          };

          const metadata = await this.tokenMetadataService.getTokenMetadata(
            tokenInfo.mint,
          );
          if (metadata) {
            tokenBalance.symbol = metadata.symbol;
            tokenBalance.name = metadata.name;
            tokenBalance.logoUri = metadata.logoUri;
          }

          tokenBalances.push(tokenBalance);
        }
      } catch (error) {
        this.logger.warn(
          `Failed to parse token account ${account.pubkey.toString()}`,
          error,
        );
      }
    }

    return tokenBalances;
  }
}
