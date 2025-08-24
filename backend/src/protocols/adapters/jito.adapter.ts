import { Injectable } from '@nestjs/common';
import { PublicKey } from '@solana/web3.js';
import { ProtocolType, PositionType } from '@prisma/client';
// @ts-expect-error - SPL token v0.4.13 has these functions but types are incorrect
import { getAssociatedTokenAddressSync, getAccount } from '@solana/spl-token';
import { BaseProtocolAdapter } from '../base-protocol-adapter';
import { Position, ProtocolStats } from '../protocol-adapter.interface';
import { BlockchainService } from '../../blockchain/blockchain.service';
import { PriceService } from '../../price/price.service';
import { RedisService } from '../../redis/redis.service';

@Injectable()
export class JitoAdapter extends BaseProtocolAdapter {
  private readonly JITOSOL_MINT = 'J1toso1uCk3RLmjorhTtrVwY9HJ7X8V9yYac6Y7kGCPn';
  private readonly SOL_MINT = 'So11111111111111111111111111111111111111112';
  private readonly SUPPORTED_TOKENS = new Set([this.JITOSOL_MINT]);

  constructor(
    private readonly blockchainService: BlockchainService,
    private readonly priceService: PriceService,
    redisService: RedisService,
  ) {
    super(ProtocolType.JITO, 'Jito', 95, redisService);
    this.logger.log('Jito adapter initialized');
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

      const jitosolBalance = await this.getJitosolBalance(walletPubkey);

      if (jitosolBalance > 0) {
        const stats = await this.getProtocolStats();

        // jitoSOL represents staked SOL - the exchange rate is approximately 1:1 but may vary
        const exchangeRate = (stats.metadata['exchangeRate'] as number) || 1.0;
        const solValue = jitosolBalance * exchangeRate;

        const solPrice = await this.priceService.getTokenPrice(this.SOL_MINT);
        const usdValue = solValue * (solPrice || 0);

        const estimatedDailyRewards = (jitosolBalance * (stats.apy / 100)) / 365;

        positions.push({
          protocol: ProtocolType.JITO,
          positionType: PositionType.STAKING,
          tokenMint: this.JITOSOL_MINT,
          amount: jitosolBalance,
          underlyingMint: this.SOL_MINT,
          underlyingAmount: solValue,
          usdValue,
          apy: stats.apy,
          rewards: estimatedDailyRewards,
          metadata: {
            exchangeRate,
            totalStaked: stats.tvl,
            validatorCount: stats.validatorCount,
            stakingYield: 'MEV + Validator Rewards',
          },
        });
      }

      await this.cachePositions(walletAddress, positions);
      return positions;
    } catch (error) {
      this.handleError(
        error,
        `fetching Jito positions for ${walletAddress}`,
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

      // For now, using static values - in production this would be fetched from Jito API
      const stats: ProtocolStats = {
        protocolName: this.protocolName,
        tvl: 12000000, // ~12M SOL staked (approximate)
        apy: 8.5, // Jito typically offers higher APY due to MEV rewards
        validatorCount: 100, // Jito validator network size
        metadata: {
          exchangeRate: 1.0, // JitoSOL to SOL exchange rate (approximately 1:1)
          mevBoost: true,
          liquidStaking: true,
        },
      };

      await this.cacheStats(stats);
      return stats;
    } catch (error) {
      this.handleError(error, 'fetching Jito stats');
      return {
        protocolName: this.protocolName,
        tvl: 12000000,
        apy: 8.0,
        validatorCount: 100,
        metadata: {
          exchangeRate: 1.0,
        },
      };
    }
  }

  isSupported(tokenMint: string): boolean {
    return this.SUPPORTED_TOKENS.has(tokenMint);
  }

  private async getJitosolBalance(walletPubkey: PublicKey): Promise<number> {
    try {
      const connection = this.blockchainService.getConnection();
      const jitosolMint = new PublicKey(this.JITOSOL_MINT);

      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      const ata = getAssociatedTokenAddressSync(
        jitosolMint,
        walletPubkey,
      ) as PublicKey;

      try {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call
        const account = (await getAccount(connection, ata)) as {
          amount: bigint;
        };
        return Number(account.amount) / 1e9; // JitoSOL has 9 decimals
      } catch {
        return 0;
      }
    } catch (error) {
      this.logger.error('Error fetching JitoSOL balance:', error);
      return 0;
    }
  }
}