import { Injectable } from '@nestjs/common';
import { PublicKey } from '@solana/web3.js';
import { ProtocolType, PositionType } from '@prisma/client';
// @ts-expect-error - SPL token v0.4.13 has these functions but types are incorrect
import { getAssociatedTokenAddressSync, getAccount, getMint } from '@solana/spl-token';
import { BaseProtocolAdapter } from '../base-protocol-adapter';
import { Position, ProtocolStats } from '../protocol-adapter.interface';
import { BlockchainService } from '../../blockchain/blockchain.service';
import { PriceService } from '../../price/price.service';
import { RedisService } from '../../redis/redis.service';

@Injectable()
export class OrcaAdapter extends BaseProtocolAdapter {
  private readonly SOL_MINT = 'So11111111111111111111111111111111111111112';
  private readonly USDC_MINT = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v';
  
  // Common Orca LP tokens (this is a basic implementation - in production would use Orca SDK)
  private readonly ORCA_LP_TOKENS = new Set([
    // SOL-USDC Whirlpool
    '7qbRF6YsyGuLUVs6Y1q64bdVrfe4ZcUUz1JRdoVNUJnm',
    // ORCA-USDC Pool
    '2p7nYbtPBgtmY69NsE8DAW6szpRJn7tQvDnqvoEWQvjY',
    // Additional common LP tokens can be added here
  ]);

  constructor(
    private readonly blockchainService: BlockchainService,
    private readonly priceService: PriceService,
    redisService: RedisService,
  ) {
    super(ProtocolType.ORCA, 'Orca', 85, redisService);
    this.logger.log('Orca adapter initialized');
  }

  async getPositions(walletAddress: string): Promise<Position[]> {
    try {
      const cached = await this.getCachedPositions(walletAddress);
      if (cached) {
        this.logger.debug(`Returning cached positions for ${walletAddress}`);
        return cached;
      }

      const walletPubkey = new PublicKey(walletAddress);
      const positions: Position[] = [];

      // Check for LP token balances
      for (const lpTokenMint of this.ORCA_LP_TOKENS) {
        const balance = await this.getLpTokenBalance(walletPubkey, lpTokenMint);
        
        if (balance > 0) {
          const lpPosition = await this.createLpPosition(lpTokenMint, balance);
          if (lpPosition) {
            positions.push(lpPosition);
          }
        }
      }

      await this.cachePositions(walletAddress, positions);
      return positions;
    } catch (error) {
      this.handleError(
        error,
        `fetching Orca positions for ${walletAddress}`,
      );
      return [];
    }
  }

  async getProtocolStats(): Promise<ProtocolStats> {
    try {
      const cached = await this.getCachedStats();
      if (cached) {
        return cached;
      }

      const stats: ProtocolStats = {
        protocolName: this.protocolName,
        tvl: 350000000, // ~350M USD TVL (approximate)
        apy: 15.0, // Average LP APY (varies by pool)
        metadata: {
          totalPools: 100,
          whirlpools: true,
          concentratedLiquidity: true,
          fees: '0.01% - 1%',
        },
      };

      await this.cacheStats(stats);
      return stats;
    } catch (error) {
      this.handleError(error, 'fetching Orca stats');
      return {
        protocolName: this.protocolName,
        tvl: 350000000,
        apy: 12.0,
        metadata: {
          totalPools: 100,
        },
      };
    }
  }

  isSupported(tokenMint: string): boolean {
    return this.ORCA_LP_TOKENS.has(tokenMint);
  }

  private async getLpTokenBalance(walletPubkey: PublicKey, lpTokenMint: string): Promise<number> {
    try {
      const connection = this.blockchainService.getConnection();
      const lpMint = new PublicKey(lpTokenMint);

      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      const ata = getAssociatedTokenAddressSync(
        lpMint,
        walletPubkey,
      ) as PublicKey;

      try {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call
        const account = (await getAccount(connection, ata)) as {
          amount: bigint;
        };

        // Get mint info to determine decimals
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call
        const mintInfo = (await getMint(connection, lpMint)) as {
          decimals: number;
        };

        return Number(account.amount) / Math.pow(10, mintInfo.decimals);
      } catch {
        return 0;
      }
    } catch (error) {
      this.logger.error(`Error fetching LP token balance for ${lpTokenMint}:`, error);
      return 0;
    }
  }

  private async createLpPosition(lpTokenMint: string, balance: number): Promise<Position | null> {
    try {
      // This is a simplified implementation
      // In production, you would use Orca SDK to get actual pool composition and values
      
      const stats = await this.getProtocolStats();
      
      // Estimate USD value (in production, would calculate from underlying tokens)
      const estimatedUsdValue = balance * 50; // Rough estimate - would be calculated properly

      const estimatedDailyRewards = (estimatedUsdValue * (stats.apy / 100)) / 365;

      return {
        protocol: ProtocolType.ORCA,
        positionType: PositionType.LP_POSITION,
        tokenMint: lpTokenMint,
        amount: balance,
        underlyingMint: this.SOL_MINT, // Simplified - most pools have SOL
        underlyingAmount: estimatedUsdValue / (await this.priceService.getTokenPrice(this.SOL_MINT) || 1),
        usdValue: estimatedUsdValue,
        apy: stats.apy,
        rewards: estimatedDailyRewards,
        metadata: {
          poolType: 'Whirlpool',
          fee: '0.3%',
          isConcentratedLiquidity: true,
        },
      };
    } catch (error) {
      this.logger.error(`Error creating LP position for ${lpTokenMint}:`, error);
      return null;
    }
  }
}