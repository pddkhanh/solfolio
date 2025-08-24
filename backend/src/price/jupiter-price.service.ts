import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { ConfigService } from '@nestjs/config';

export interface TokenPrice {
  id: string; // mint address
  mintSymbol?: string;
  vsToken: string;
  vsTokenSymbol?: string;
  price: number;
  timeTaken?: number;
}

export interface JupiterPriceResponse {
  data: {
    [key: string]: {
      id: string;
      mintSymbol?: string;
      vsToken: string;
      vsTokenSymbol?: string;
      price: number;
    };
  };
  timeTaken: number;
}

// Map of known token addresses to CoinGecko IDs
const TOKEN_TO_COINGECKO_MAP: { [key: string]: string } = {
  So11111111111111111111111111111111111112: 'solana',
  EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v: 'usd-coin',
  Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB: 'tether',
  mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So: 'msol',
  J1toso1uCk3RLmjorhTtrVwY9HJ7X8V9yYac6Y7kGCPn: 'jito-staked-sol',
  '7Q2afV64in6N6SeZsAAB81TJzwDoD6zpqmHkzi9Dcavn': 'jupiter-exchange-solana',
};

@Injectable()
export class JupiterPriceService {
  private readonly logger = new Logger(JupiterPriceService.name);
  private readonly COINGECKO_API = 'https://api.coingecko.com/api/v3';
  private readonly USDC_MINT = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v';

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Fetch token prices using CoinGecko API as primary source
   * @param tokenMints Array of token mint addresses
   * @returns Map of token mint to price in USD
   */
  async getTokenPrices(tokenMints: string[]): Promise<Map<string, number>> {
    if (tokenMints.length === 0) {
      return new Map();
    }

    try {
      const uniqueMints = [...new Set(tokenMints)];
      const priceMap = new Map<string, number>();

      // Map token mints to CoinGecko IDs
      const coingeckoIds: string[] = [];
      const mintToIdMap = new Map<string, string>();

      for (const mint of uniqueMints) {
        const coingeckoId = TOKEN_TO_COINGECKO_MAP[mint];
        if (coingeckoId) {
          coingeckoIds.push(coingeckoId);
          mintToIdMap.set(mint, coingeckoId);
        } else {
          this.logger.warn(`No CoinGecko mapping for token mint: ${mint}`);
        }
      }

      if (coingeckoIds.length === 0) {
        this.logger.warn('No tokens could be mapped to CoinGecko IDs');
        return priceMap;
      }

      // Fetch prices from CoinGecko
      const url = `${this.COINGECKO_API}/simple/price`;
      const params = {
        ids: coingeckoIds.join(','),
        vs_currencies: 'usd',
      };

      this.logger.debug(
        `Fetching prices for ${coingeckoIds.length} tokens from CoinGecko`,
      );

      const response = await firstValueFrom(
        this.httpService.get(url, { params }),
      );

      // Map prices back to token mints
      if (response.data) {
        for (const [mint, coingeckoId] of mintToIdMap.entries()) {
          const priceData = response.data[coingeckoId];
          if (priceData && priceData.usd) {
            priceMap.set(mint, priceData.usd);
            this.logger.debug(
              `Price for ${coingeckoId} (${mint.slice(0, 8)}...): $${priceData.usd}`,
            );
          }
        }
      }

      this.logger.log(
        `Successfully fetched prices for ${priceMap.size}/${uniqueMints.length} tokens`,
      );
      return priceMap;
    } catch (error) {
      this.logger.error('Failed to fetch token prices from CoinGecko', error);
      // Return empty map instead of throwing to prevent service crashes
      return new Map();
    }
  }

  /**
   * Get price for a single token
   * @param tokenMint Token mint address
   * @returns Price in USD or null if not found
   */
  async getTokenPrice(tokenMint: string): Promise<number | null> {
    const prices = await this.getTokenPrices([tokenMint]);
    return prices.get(tokenMint) || null;
  }

  /**
   * Get SOL price in USD
   * @returns SOL price in USD
   */
  async getSolPrice(): Promise<number> {
    const SOL_MINT = 'So11111111111111111111111111111111111112';
    const price = await this.getTokenPrice(SOL_MINT);

    if (!price) {
      throw new Error('Failed to fetch SOL price');
    }

    return price;
  }
}
