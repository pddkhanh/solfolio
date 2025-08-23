import { Injectable, Logger } from '@nestjs/common';
import { PublicKey, Connection } from '@solana/web3.js';
import { TOKEN_PROGRAM_ID, TOKEN_2022_PROGRAM_ID } from '@solana/spl-token';
import { BlockchainService } from '../blockchain/blockchain.service';
import { ConnectionManager } from '../blockchain/connection-manager.service';
import { RateLimiterService } from '../blockchain/rate-limiter.service';
import { TokenMetadataService } from './token-metadata.service';
import { PriceService } from '../price/price.service';

export interface TokenBalance {
  mint: string;
  owner?: string;
  balance: string; // Renamed from amount for consistency with E2E tests
  amount?: string; // Keep for backward compatibility
  decimals: number;
  uiAmount?: number;
  valueUSD: number;
  tokenAccount?: string;
  isNative?: boolean;
  metadata?: {
    symbol: string;
    name: string;
    logoUri?: string;
  };
  // Legacy fields for backward compatibility
  symbol?: string;
  name?: string;
  logoUri?: string;
}

export interface WalletBalances {
  wallet?: string;
  nativeSol?: {
    amount: string;
    decimals: number;
    uiAmount: number;
  };
  tokens: TokenBalance[];
  nfts: any[]; // For future NFT support
  totalAccounts: number;
  totalValueUSD: number;
  lastUpdated: string;
  fetchedAt?: Date;
}

@Injectable()
export class WalletService {
  private readonly logger = new Logger(WalletService.name);

  constructor(
    private readonly blockchainService: BlockchainService,
    private readonly connectionManager: ConnectionManager,
    private readonly rateLimiter: RateLimiterService,
    private readonly tokenMetadataService: TokenMetadataService,
    private readonly priceService: PriceService,
  ) {}

  async getWalletBalances(walletAddress: string): Promise<WalletBalances> {
    try {
      await this.rateLimiter.waitForSlot();

      const publicKey = new PublicKey(walletAddress);

      // In E2E test environment, return mock data instead of making real connections
      if (process.env.IS_E2E_TEST === 'true') {
        return this.getMockWalletBalances(walletAddress);
      }

      const connection = this.blockchainService.getConnection();

      const [nativeBalance, tokenAccounts] = await Promise.all([
        this.getNativeSolBalance(publicKey, connection),
        this.getTokenAccounts(publicKey, connection),
      ]);

      const tokenBalances = await this.parseTokenAccounts(tokenAccounts as any);

      // Get real token prices including SOL
      const SOL_MINT = 'So11111111111111111111111111111111111112';
      const tokenMints = [SOL_MINT, ...tokenBalances.map((t) => t.mint)];
      const prices = await this.priceService.getTokenPrices(tokenMints);

      // Update token balances with real USD values
      const solPrice = prices.get(SOL_MINT) || 0;
      for (const token of tokenBalances) {
        const price = prices.get(token.mint) || 0;
        token.valueUSD = (token.uiAmount || 0) * price;
      }

      // Calculate total value in USD with real prices
      const totalValueUSD = tokenBalances.reduce(
        (sum, token) => sum + (token.valueUSD || 0),
        nativeBalance.uiAmount * solPrice,
      );

      return {
        wallet: walletAddress,
        nativeSol: nativeBalance,
        tokens: tokenBalances,
        nfts: [], // NFT support to be added later
        totalAccounts: tokenBalances.length,
        totalValueUSD,
        lastUpdated: new Date().toISOString(),
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
    accounts: Array<{
      pubkey: PublicKey;
      account: {
        data: {
          parsed: {
            info: {
              mint: string;
              owner: string;
              tokenAmount: {
                amount: string;
                decimals: number;
                uiAmount: number;
              };
            };
          };
        };
      };
    }>,
  ): Promise<TokenBalance[]> {
    const tokenBalances: TokenBalance[] = [];

    for (const account of accounts) {
      try {
        const parsedData = account.account.data.parsed;
        const tokenInfo = parsedData.info;

        if (tokenInfo.tokenAmount.uiAmount > 0) {
          const metadata = await this.tokenMetadataService.getTokenMetadata(
            tokenInfo.mint,
          );

          const tokenBalance: TokenBalance = {
            mint: tokenInfo.mint,
            owner: tokenInfo.owner,
            balance: tokenInfo.tokenAmount.amount,
            amount: tokenInfo.tokenAmount.amount, // For backward compatibility
            decimals: tokenInfo.tokenAmount.decimals,
            uiAmount: tokenInfo.tokenAmount.uiAmount,
            valueUSD: 0, // Will be updated with real price later
            tokenAccount: account.pubkey.toString(),
          };

          if (metadata) {
            tokenBalance.metadata = {
              symbol: metadata.symbol,
              name: metadata.name,
              logoUri: metadata.logoUri,
            };
            // Keep legacy fields for backward compatibility
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

  private getMockWalletBalances(walletAddress: string): WalletBalances {
    // Return mock data for E2E tests
    return {
      wallet: walletAddress,
      tokens: [],
      nfts: [],
      totalAccounts: 0,
      totalValueUSD: 0,
      lastUpdated: new Date().toISOString(),
      nativeSol: {
        amount: '0',
        decimals: 9,
        uiAmount: 0,
      },
    };
  }
}
