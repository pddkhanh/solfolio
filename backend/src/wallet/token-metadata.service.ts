import { Injectable, Logger } from '@nestjs/common';
import { createUmi } from '@metaplex-foundation/umi-bundle-defaults';
import {
  findMetadataPda,
  fetchMetadata,
} from '@metaplex-foundation/mpl-token-metadata';
import { publicKey } from '@metaplex-foundation/umi';
import axios from 'axios';

export interface TokenMetadata {
  symbol: string;
  name: string;
  logoUri?: string;
  decimals?: number;
}

@Injectable()
export class TokenMetadataService {
  private readonly logger = new Logger(TokenMetadataService.name);
  private umi: any;
  private metadataCache = new Map<string, TokenMetadata>();
  private readonly CACHE_TTL = 3600000; // 1 hour in milliseconds
  private cacheTimestamps = new Map<string, number>();

  constructor() {
    // Initialize Umi with the mainnet RPC (for metadata)
    this.umi = createUmi('https://api.mainnet-beta.solana.com');
  }

  async getTokenMetadata(mintAddress: string): Promise<TokenMetadata | null> {
    try {
      // Check cache first
      const cached = this.getCachedMetadata(mintAddress);
      if (cached) {
        return cached;
      }

      // Try to fetch from on-chain metadata
      const onChainMetadata = await this.fetchOnChainMetadata(mintAddress);
      if (onChainMetadata) {
        this.cacheMetadata(mintAddress, onChainMetadata);
        return onChainMetadata;
      }

      // Try to fetch from Jupiter token list as fallback
      const jupiterMetadata = await this.fetchJupiterMetadata(mintAddress);
      if (jupiterMetadata) {
        this.cacheMetadata(mintAddress, jupiterMetadata);
        return jupiterMetadata;
      }

      // If all else fails, return basic metadata
      const basicMetadata: TokenMetadata = {
        symbol: 'Unknown',
        name: `Token (${mintAddress.slice(0, 4)}...${mintAddress.slice(-4)})`,
      };

      this.cacheMetadata(mintAddress, basicMetadata);
      return basicMetadata;
    } catch (error) {
      this.logger.warn(`Failed to fetch metadata for ${mintAddress}:`, error);
      return null;
    }
  }

  private getCachedMetadata(mintAddress: string): TokenMetadata | null {
    const cached = this.metadataCache.get(mintAddress);
    const timestamp = this.cacheTimestamps.get(mintAddress);

    if (cached && timestamp && Date.now() - timestamp < this.CACHE_TTL) {
      return cached;
    }

    return null;
  }

  private cacheMetadata(mintAddress: string, metadata: TokenMetadata): void {
    this.metadataCache.set(mintAddress, metadata);
    this.cacheTimestamps.set(mintAddress, Date.now());
  }

  private async fetchOnChainMetadata(
    mintAddress: string,
  ): Promise<TokenMetadata | null> {
    try {
      const mintPubkey = publicKey(mintAddress);

      const metadataPda = findMetadataPda(
        this.umi as Parameters<typeof findMetadataPda>[0],
        {
          mint: mintPubkey,
        },
      );

      const metadata = await fetchMetadata(
        this.umi as Parameters<typeof fetchMetadata>[0],
        metadataPda as Parameters<typeof fetchMetadata>[1],
      );

      if (metadata) {
        const tokenMetadata: TokenMetadata = {
          symbol: metadata.symbol || 'Unknown',
          name: metadata.name || 'Unknown Token',
        };

        // Try to fetch off-chain metadata if URI exists
        if (metadata.uri) {
          try {
            const response = await axios.get<{ image?: string }>(metadata.uri, {
              timeout: 5000,
            });
            if (response.data && response.data.image) {
              tokenMetadata.logoUri = response.data.image;
            }
          } catch {
            this.logger.debug(
              `Failed to fetch off-chain metadata from ${metadata.uri}`,
            );
          }
        }

        return tokenMetadata;
      }
    } catch {
      this.logger.debug(`Failed to fetch on-chain metadata for ${mintAddress}`);
    }

    return null;
  }

  private async fetchJupiterMetadata(
    mintAddress: string,
  ): Promise<TokenMetadata | null> {
    try {
      interface JupiterToken {
        address: string;
        symbol?: string;
        name?: string;
        logoURI?: string;
        decimals?: number;
      }

      const response = await axios.get<JupiterToken[]>(
        'https://token.jup.ag/all',
        {
          timeout: 10000,
        },
      );

      if (response.data && Array.isArray(response.data)) {
        const token = response.data.find((t) => t.address === mintAddress);

        if (token) {
          return {
            symbol: token.symbol || 'Unknown',
            name: token.name || 'Unknown Token',
            logoUri: token.logoURI,
            decimals: token.decimals,
          };
        }
      }
    } catch {
      this.logger.debug('Failed to fetch Jupiter token list');
    }

    return null;
  }

  getCommonTokenMetadata(): Map<string, TokenMetadata> {
    const commonTokens = new Map<string, TokenMetadata>();

    // Add common Solana tokens
    commonTokens.set('So11111111111111111111111111111111111111112', {
      symbol: 'SOL',
      name: 'Solana',
      logoUri:
        'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png',
      decimals: 9,
    });

    commonTokens.set('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', {
      symbol: 'USDC',
      name: 'USD Coin',
      logoUri:
        'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v/logo.png',
      decimals: 6,
    });

    commonTokens.set('Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB', {
      symbol: 'USDT',
      name: 'USDT',
      logoUri:
        'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB/logo.png',
      decimals: 6,
    });

    commonTokens.set('mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So', {
      symbol: 'mSOL',
      name: 'Marinade staked SOL',
      logoUri:
        'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So/logo.png',
      decimals: 9,
    });

    // Cache all common tokens
    commonTokens.forEach((metadata, mint) => {
      this.cacheMetadata(mint, metadata);
    });

    return commonTokens;
  }
}
