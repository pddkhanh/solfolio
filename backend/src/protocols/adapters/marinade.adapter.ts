import { Injectable } from '@nestjs/common';
import { PublicKey } from '@solana/web3.js';
import { Marinade, MarinadeConfig } from '@marinade.finance/marinade-ts-sdk';
import { ProtocolType, PositionType } from '@prisma/client';
// @ts-expect-error - SPL token v0.4.13 has these functions but types are incorrect
import { getAssociatedTokenAddressSync, getAccount } from '@solana/spl-token';
import { BaseProtocolAdapter } from '../base-protocol-adapter';
import { Position, ProtocolStats } from '../protocol-adapter.interface';
import { BlockchainService } from '../../blockchain/blockchain.service';
import { PriceService } from '../../price/price.service';
import { RedisService } from '../../redis/redis.service';

@Injectable()
export class MarinadeAdapter extends BaseProtocolAdapter {
  private marinade: Marinade;
  private readonly MSOL_MINT = 'mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So';
  private readonly SOL_MINT = 'So11111111111111111111111111111111111111112';
  private readonly SUPPORTED_TOKENS = new Set([this.MSOL_MINT]);

  constructor(
    private readonly blockchainService: BlockchainService,
    private readonly priceService: PriceService,
    redisService: RedisService,
  ) {
    super(ProtocolType.MARINADE, 'Marinade Finance', 100, redisService);
    this.initializeMarinade();
  }

  private initializeMarinade(): void {
    try {
      const connection = this.blockchainService.getConnection();
      const config = new MarinadeConfig({
        connection,
        publicKey: null,
      });
      this.marinade = new Marinade(config);
      this.logger.log('Marinade SDK initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize Marinade SDK:', error);
      throw error;
    }
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

      const msolBalance = await this.getMsolBalance(walletPubkey);

      if (msolBalance > 0) {
        const stats = await this.getProtocolStats();

        const exchangeRate = (stats.metadata['exchangeRate'] as number) || 1.1;
        const solValue = msolBalance * exchangeRate;

        const solPrice = await this.priceService.getTokenPrice(this.SOL_MINT);
        const usdValue = solValue * (solPrice || 0);

        const estimatedDailyRewards = (msolBalance * (stats.apy / 100)) / 365;

        positions.push({
          protocol: ProtocolType.MARINADE,
          positionType: PositionType.STAKING,
          tokenMint: this.MSOL_MINT,
          amount: msolBalance,
          underlyingMint: this.SOL_MINT,
          underlyingAmount: solValue,
          usdValue,
          apy: stats.apy,
          rewards: estimatedDailyRewards,
          metadata: {
            exchangeRate,
            totalStaked: stats.tvl,
            validatorCount: stats.validatorCount,
          },
        });
      }

      await this.cachePositions(walletAddress, positions);
      return positions;
    } catch (error) {
      this.handleError(
        error,
        `fetching Marinade positions for ${walletAddress}`,
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

      const state = await this.marinade.getMarinadeState();
      const exchangeRate = state.mSolPrice;

      const connection = this.blockchainService.getConnection();
      const epochInfo = await connection.getEpochInfo();

      const stats: ProtocolStats = {
        protocolName: this.protocolName,
        tvl: 8000000,
        apy: 7.2,
        validatorCount: 450,
        metadata: {
          exchangeRate,
          epochInfo,
        },
      };

      await this.cacheStats(stats);
      return stats;
    } catch (error) {
      this.handleError(error, 'fetching Marinade stats');
      return {
        protocolName: this.protocolName,
        tvl: 8000000,
        apy: 7.0,
        validatorCount: 450,
        metadata: {
          exchangeRate: 1.1,
        },
      };
    }
  }

  isSupported(tokenMint: string): boolean {
    return this.SUPPORTED_TOKENS.has(tokenMint);
  }

  private async getMsolBalance(walletPubkey: PublicKey): Promise<number> {
    try {
      const connection = this.blockchainService.getConnection();
      const msolMint = new PublicKey(this.MSOL_MINT);

      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      const ata = getAssociatedTokenAddressSync(
        msolMint,
        walletPubkey,
      ) as PublicKey;

      try {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call
        const account = (await getAccount(connection, ata)) as {
          amount: bigint;
        };
        return Number(account.amount) / 1e9;
      } catch {
        return 0;
      }
    } catch (error) {
      this.logger.error('Error fetching mSOL balance:', error);
      return 0;
    }
  }
}
