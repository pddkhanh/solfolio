import { Injectable, Logger } from '@nestjs/common';
import { Connection, PublicKey } from '@solana/web3.js';
import { Marinade, MarinadeConfig } from '@marinade.finance/marinade-ts-sdk';
import { PrismaClient, ProtocolType, PositionType } from '@prisma/client';
import { getAssociatedTokenAddress, getAccount, Account } from '@solana/spl-token';
import { ConnectionManagerService } from '../blockchain/connection-manager.service';
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
export class MarinadeService {
  private readonly logger = new Logger(MarinadeService.name);
  private marinade: Marinade;
  private prisma: PrismaClient;
  private readonly MSOL_MINT = 'mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So';
  private readonly SOL_MINT = 'So11111111111111111111111111111111111111112';

  constructor(
    private readonly connectionManager: ConnectionManagerService,
    private readonly priceService: PriceService,
  ) {
    this.prisma = new PrismaClient();
    this.initializeMarinade();
  }

  private async initializeMarinade() {
    try {
      const connection = await this.connectionManager.getConnection();
      const config = new MarinadeConfig({
        connection,
        publicKey: null, // Will be set when needed
      });
      this.marinade = new Marinade(config);
      this.logger.log('Marinade SDK initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize Marinade SDK:', error);
      throw error;
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
        const usdValue = solValue * solPrice;
        
        // Calculate rewards (simplified - in production would track actual rewards)
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
      this.logger.error(`Error fetching Marinade positions for ${walletAddress}:`, error);
      throw error;
    }
  }

  /**
   * Get mSOL balance for a wallet
   */
  private async getMsolBalance(walletPubkey: PublicKey): Promise<number> {
    try {
      const connection = await this.connectionManager.getConnection();
      const msolMint = new PublicKey(this.MSOL_MINT);
      
      // Get associated token account
      const ata = await getAssociatedTokenAddress(msolMint, walletPubkey);
      
      try {
        const account = await getAccount(connection, ata);
        // mSOL has 9 decimals
        return Number(account.amount) / 1e9;
      } catch (error) {
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

      const connection = await this.connectionManager.getConnection();
      
      // Get Marinade state
      const state = await this.marinade.getMarinadeState();
      
      // Calculate exchange rate (mSOL to SOL)
      const exchangeRate = state.msolPrice;
      
      // Get total staked
      const totalStaked = state.tvl / 1e9; // Convert lamports to SOL
      
      // Fetch APY from Marinade API (simplified - in production use their API)
      const apy = await this.fetchMarinadeApy();
      
      // Get validator count
      const validatorCount = state.validatorSystem.validatorList.count;
      
      // Get epoch info
      const epochInfo = await connection.getEpochInfo();
      
      const stats: MarinadeStats = {
        exchangeRate,
        totalStaked,
        apy,
        validatorCount,
        epochInfo,
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
          exchangeRate: position.metadata.exchangeRate,
          totalStaked: position.metadata.totalStaked,
          apy: position.apy,
          validatorCount: position.metadata.validatorCount,
          epochInfo: position.metadata.epochInfo,
          lastUpdated: new Date(),
        },
        create: {
          msolMint: this.MSOL_MINT,
          exchangeRate: position.metadata.exchangeRate,
          totalStaked: position.metadata.totalStaked,
          apy: position.apy,
          validatorCount: position.metadata.validatorCount,
          epochInfo: position.metadata.epochInfo,
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