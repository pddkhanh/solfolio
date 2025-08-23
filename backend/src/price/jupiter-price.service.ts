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

@Injectable()
export class JupiterPriceService {
  private readonly logger = new Logger(JupiterPriceService.name);
  private readonly JUPITER_PRICE_API = 'https://price.jup.ag/v6';
  private readonly USDC_MINT = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v';

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Fetch token prices from Jupiter Price API
   * @param tokenMints Array of token mint addresses
   * @returns Map of token mint to price in USD
   */
  async getTokenPrices(tokenMints: string[]): Promise<Map<string, number>> {
    if (tokenMints.length === 0) {
      return new Map();
    }

    try {
      const uniqueMints = [...new Set(tokenMints)];
      const ids = uniqueMints.join(',');

      const url = `${this.JUPITER_PRICE_API}/price`;
      const params = {
        ids,
        vsToken: this.USDC_MINT, // Price in USDC (effectively USD)
      };

      this.logger.debug(`Fetching prices for ${uniqueMints.length} tokens`);

      const response = await firstValueFrom(
        this.httpService.get<JupiterPriceResponse>(url, { params }),
      );

      const priceMap = new Map<string, number>();

      if (response.data && response.data.data) {
        for (const [mint, priceData] of Object.entries(response.data.data)) {
          if (priceData && priceData.price) {
            priceMap.set(mint, priceData.price);
            this.logger.debug(
              `Price for ${priceData.mintSymbol || mint}: $${priceData.price}`,
            );
          }
        }
      }

      this.logger.log(
        `Successfully fetched prices for ${priceMap.size}/${uniqueMints.length} tokens`,
      );
      return priceMap;
    } catch (error) {
      this.logger.error('Failed to fetch token prices from Jupiter', error);
      throw error;
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
