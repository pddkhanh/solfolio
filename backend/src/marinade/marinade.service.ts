import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { PublicKey } from '@solana/web3.js';
import { Marinade, MarinadeConfig } from '@marinade.finance/marinade-ts-sdk';
import { PrismaClient, ProtocolType, PositionType } from '@prisma/client';
// @ts-expect-error - SPL token v0.4.13 has these functions but types are incorrect
import { getAssociatedTokenAddressSync, getAccount } from '@solana/spl-token';
import { BlockchainService } from '../blockchain/blockchain.service';
import { PriceService } from '../price/price.service';

export interface MarinadePosition {
  protocol: ProtocolType;
  positionType: PositionType;
  tokenMint: string;
  amount: number;
  underlyingMint: string;
  underlyingAmount: number;
  usdValue: number;
  apy: number;
  rewards: number;
  metadata: Record<string, any>;
}

export interface MarinadeStats {
  exchangeRate: number;
  totalStaked: number;
  apy: number;
  validatorCount: number;
  epochInfo: any;
}

@Injectable()
export class MarinadeService implements OnModuleInit {
  private readonly logger = new Logger(MarinadeService.name);
  private marinade: Marinade;
  private prisma: PrismaClient;
  private readonly MSOL_MINT = 'mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So';
  private readonly SOL_MINT = 'So11111111111111111111111111111111111111112';

  constructor(
    private readonly blockchainService: BlockchainService,
    private readonly priceService: PriceService,
  ) {
    this.prisma = new PrismaClient();
  }

  async onModuleInit() {
    // Initialize Marinade SDK after blockchain connection is ready
    await this.initializeMarinade();
  }

  private async initializeMarinade(): Promise<void> {
    try {
      // Wait a bit for blockchain service to initialize
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const connection = this.blockchainService.getConnection();
      const config = new MarinadeConfig({
        connection,
        publicKey: null, // Will be set when needed
      });
      this.marinade = new Marinade(config);
      this.logger.log('Marinade SDK initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize Marinade SDK:', error);
      // Don't throw - allow service to start even if Marinade fails
      this.logger.warn('Marinade service will run in degraded mode');
    }
  }

  /**
   * Detect and fetch Marinade staking positions for a wallet
   */
  async getPositions(walletAddress: string): Promise<MarinadePosition[]> {
    try {
      const walletPubkey = new PublicKey(walletAddress);
      const positions: MarinadePosition[] = [];

      // Get mSOL balance
      const msolBalance = await this.getMsolBalance(walletPubkey);

      if (msolBalance > 0) {
        // Get exchange rate and APY
        const stats = await this.getMarinadeStats();

        // Calculate SOL value
        const solValue = msolBalance * stats.exchangeRate;

        // Get USD value
        const solPrice = await this.priceService.getTokenPrice(this.SOL_MINT);
        const usdValue = solValue * (solPrice || 0);

        // Calculate rewards (simplified - in production would track actual rewards)
        const estimatedDailyRewards = (msolBalance * (stats.apy / 100)) / 365;

        positions.push({
          protocol: 'MARINADE' as ProtocolType,
          positionType: 'STAKING' as PositionType,
          tokenMint: this.MSOL_MINT,
          amount: msolBalance,
          underlyingMint: this.SOL_MINT,
          underlyingAmount: solValue,
          usdValue,
          apy: stats.apy,
          rewards: estimatedDailyRewards,
          metadata: {
            exchangeRate: stats.exchangeRate,
            totalStaked: stats.totalStaked,
            validatorCount: stats.validatorCount,
            epochInfo: stats.epochInfo,
          },
        });

        // Store position in database
        await this.storePosition(walletAddress, positions[0]);
      }

      // Check for native stake accounts (future enhancement)
      // const nativeStakeAccounts = await this.getNativeStakeAccounts(walletPubkey);

      return positions;
    } catch (error) {
      this.logger.error(
        `Error fetching Marinade positions for ${walletAddress}:`,
        error,
      );
      throw error;
    }
  }

  /**
   * Get mSOL balance for a wallet
   */
  private async getMsolBalance(walletPubkey: PublicKey): Promise<number> {
    try {
      const connection = this.blockchainService.getConnection();
      const msolMint = new PublicKey(this.MSOL_MINT);

      // Get associated token account
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
        // mSOL has 9 decimals
        return Number(account.amount) / 1e9;
      } catch {
        // Account doesn't exist, return 0
        return 0;
      }
    } catch (error) {
      this.logger.error('Error fetching mSOL balance:', error);
      throw error;
    }
  }

  /**
   * Get Marinade protocol stats
   */
  async getMarinadeStats(): Promise<MarinadeStats> {
    try {
      // Check cache first
      const cached = await this.getCachedStats();
      if (cached) {
        return cached;
      }

      // Check if Marinade is initialized
      if (!this.marinade) {
        this.logger.warn('Marinade SDK not initialized, returning default stats');
        return {
          exchangeRate: 1.1,
          totalStaked: 8000000,
          apy: 7.0,
          validatorCount: 450,
          epochInfo: null,
        };
      }

      const connection = this.blockchainService.getConnection();

      // Get Marinade state
      const state = await this.marinade.getMarinadeState();

      // Calculate exchange rate (mSOL to SOL)
      const exchangeRate = state.mSolPrice;

      // Get total staked (using a default value as tvl might not be available)
      const totalStaked = 8000000; // Default value, update when tvl is available

      // Fetch APY from Marinade API (simplified - in production use their API)
      const apy = await this.fetchMarinadeApy();

      // Get validator count (default value)
      const validatorCount = 450;

      // Get epoch info
      const epochInfo = await connection.getEpochInfo();

      const stats: MarinadeStats = {
        exchangeRate,
        totalStaked,
        apy,
        validatorCount,
        epochInfo: epochInfo,
      };

      // Cache the stats
      await this.cacheStats(stats);

      return stats;
    } catch (error) {
      this.logger.error('Error fetching Marinade stats:', error);
      // Return default values on error
      return {
        exchangeRate: 1.1,
        totalStaked: 8000000,
        apy: 7.0,
        validatorCount: 450,
        epochInfo: null,
      };
    }
  }

  /**
   * Fetch Marinade APY from their API
   */
  private async fetchMarinadeApy(): Promise<number> {
    try {
      // In production, fetch from Marinade's API
      // For now, return a reasonable default
      const marinadeData = await this.prisma.marinadeData.findFirst({
        orderBy: { lastUpdated: 'desc' },
      });

      return marinadeData?.apy ? Number(marinadeData.apy) : 7.2;
    } catch (error) {
      this.logger.error('Error fetching Marinade APY:', error);
      return 7.0; // Default APY
    }
  }

  /**
   * Calculate SOL value from mSOL amount
   */
  async calculateSolValue(msolAmount: number): Promise<number> {
    const stats = await this.getMarinadeStats();
    return msolAmount * stats.exchangeRate;
  }

  /**
   * Calculate rewards earned
   */
  async calculateRewards(
    msolAmount: number,
    daysHeld: number,
  ): Promise<number> {
    const stats = await this.getMarinadeStats();
    const dailyRate = stats.apy / 100 / 365;
    return msolAmount * dailyRate * daysHeld;
  }

  /**
   * Store position in database
   */
  private async storePosition(
    walletAddress: string,
    position: MarinadePosition,
  ): Promise<void> {
    try {
      // Get or create wallet
      const wallet = await this.prisma.wallet.upsert({
        where: { address: walletAddress },
        update: { lastUpdated: new Date() },
        create: { address: walletAddress },
      });

      // Upsert position
      await this.prisma.position.upsert({
        where: {
          walletId_protocol_tokenMint: {
            walletId: wallet.id,
            protocol: position.protocol,
            tokenMint: position.tokenMint,
          },
        },
        update: {
          amount: position.amount,
          underlyingAmount: position.underlyingAmount,
          usdValue: position.usdValue,
          apy: position.apy,
          rewards: position.rewards,
          metadata: position.metadata,
          lastUpdated: new Date(),
        },
        create: {
          walletId: wallet.id,
          protocol: position.protocol,
          positionType: position.positionType,
          tokenMint: position.tokenMint,
          amount: position.amount,
          underlyingMint: position.underlyingMint,
          underlyingAmount: position.underlyingAmount,
          usdValue: position.usdValue,
          apy: position.apy,
          rewards: position.rewards,
          metadata: position.metadata,
        },
      });

      // Update Marinade data
      await this.prisma.marinadeData.upsert({
        where: { msolMint: this.MSOL_MINT },
        update: {
          exchangeRate: position.metadata['exchangeRate'] as number,
          totalStaked: position.metadata['totalStaked'] as number,
          apy: position.apy,
          validatorCount: position.metadata['validatorCount'] as number,
          epochInfo: position.metadata['epochInfo'] as Record<string, any>,
          lastUpdated: new Date(),
        },
        create: {
          msolMint: this.MSOL_MINT,
          exchangeRate: position.metadata['exchangeRate'] as number,
          totalStaked: position.metadata['totalStaked'] as number,
          apy: position.apy,
          validatorCount: position.metadata['validatorCount'] as number,
          epochInfo: position.metadata['epochInfo'] as Record<string, any>,
        },
      });
    } catch (error) {
      this.logger.error('Error storing position:', error);
      throw error;
    }
  }

  /**
   * Get cached stats
   */
  private async getCachedStats(): Promise<MarinadeStats | null> {
    try {
      const marinadeData = await this.prisma.marinadeData.findFirst({
        where: {
          msolMint: this.MSOL_MINT,
          lastUpdated: {
            gte: new Date(Date.now() - 60 * 1000), // 1 minute cache
          },
        },
      });

      if (marinadeData) {
        return {
          exchangeRate: Number(marinadeData.exchangeRate),
          totalStaked: Number(marinadeData.totalStaked),
          apy: Number(marinadeData.apy),
          validatorCount: marinadeData.validatorCount || 450,
          epochInfo: marinadeData.epochInfo,
        };
      }

      return null;
    } catch (error) {
      this.logger.error('Error fetching cached stats:', error);
      return null;
    }
  }

  /**
   * Cache stats in database
   */
  private async cacheStats(stats: MarinadeStats): Promise<void> {
    try {
      await this.prisma.marinadeData.upsert({
        where: { msolMint: this.MSOL_MINT },
        update: {
          exchangeRate: stats.exchangeRate,
          totalStaked: stats.totalStaked,
          apy: stats.apy,
          validatorCount: stats.validatorCount,
          epochInfo: stats.epochInfo,
          lastUpdated: new Date(),
        },
        create: {
          msolMint: this.MSOL_MINT,
          exchangeRate: stats.exchangeRate,
          totalStaked: stats.totalStaked,
          apy: stats.apy,
          validatorCount: stats.validatorCount,
          epochInfo: stats.epochInfo,
        },
      });
    } catch (error) {
      this.logger.error('Error caching stats:', error);
    }
  }

  async onModuleDestroy() {
    await this.prisma.$disconnect();
  }
}
