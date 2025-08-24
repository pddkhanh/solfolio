import { Injectable, Logger } from '@nestjs/common';
import { PositionsService } from '../positions/positions.service';
import { CacheService } from '../cache/cache.service';
import { PrismaService } from '../prisma/prisma.service';
import { PositionChange } from './monitoring.interfaces';
import { forwardRef, Inject } from '@nestjs/common';

export interface PositionSnapshot {
  walletAddress: string;
  protocol: string;
  type: string;
  value: number;
  amount: string;
  apy?: number;
  timestamp: Date;
}

export interface PositionComparison {
  protocol: string;
  previousSnapshot?: PositionSnapshot;
  currentSnapshot?: PositionSnapshot;
  changeType: 'added' | 'removed' | 'updated' | 'unchanged';
  valueDifference?: number;
  percentageChange?: number;
}

@Injectable()
export class PositionChangeDetectorService {
  private readonly logger = new Logger(PositionChangeDetectorService.name);
  private readonly SNAPSHOT_CACHE_TTL = 3600; // 1 hour

  constructor(
    @Inject(forwardRef(() => PositionsService))
    private readonly positionsService: PositionsService,
    private readonly cacheService: CacheService,
    private readonly prisma: PrismaService,
  ) {}

  async detectChanges(
    walletAddress: string,
    trigger: 'transaction' | 'periodic' | 'manual' = 'transaction',
  ): Promise<PositionChange[]> {
    try {
      this.logger.log(
        `Detecting position changes for wallet ${walletAddress} (trigger: ${trigger})`,
      );

      // Get previous snapshot
      const previousSnapshot = await this.getPreviousSnapshot(walletAddress);

      // Get current positions
      const currentPositions =
        await this.positionsService.getPositions(walletAddress);

      // Create current snapshot
      const currentSnapshot = this.createSnapshot(
        walletAddress,
        currentPositions,
      );

      // Compare snapshots
      const comparisons = this.compareSnapshots(
        previousSnapshot,
        currentSnapshot,
      );

      // Store new snapshot
      await this.storeSnapshot(walletAddress, currentSnapshot);

      // Convert comparisons to position changes
      const changes = this.comparisonsToChanges(
        walletAddress,
        comparisons,
        trigger,
      );

      if (changes.length > 0) {
        this.logger.log(
          `Detected ${changes.length} position changes for wallet ${walletAddress}`,
        );

        // Store changes in database
        await this.storeChanges(changes);
      }

      return changes;
    } catch (error) {
      this.logger.error(
        `Failed to detect position changes for wallet ${walletAddress}:`,
        error,
      );
      return [];
    }
  }

  private async getPreviousSnapshot(
    walletAddress: string,
  ): Promise<PositionSnapshot[]> {
    // Try cache first
    const cacheKey = `position_snapshot:${walletAddress}`;
    const cached = await this.cacheService.get<PositionSnapshot[]>(cacheKey);
    if (cached) {
      return cached;
    }

    // Fetch from database
    try {
      const dbPositions = await this.prisma.position.findMany({
        where: {
          walletAddress,
        },
        orderBy: {
          updatedAt: 'desc',
        },
      });

      return dbPositions.map((pos) => ({
        walletAddress: pos.walletAddress,
        protocol: pos.protocol,
        type: pos.type,
        value: pos.value.toNumber(),
        amount: pos.amount,
        apy: pos.apy ? pos.apy.toNumber() : undefined,
        timestamp: pos.updatedAt,
      }));
    } catch (error) {
      this.logger.error(
        'Failed to fetch previous snapshot from database:',
        error,
      );
      return [];
    }
  }

  private createSnapshot(
    walletAddress: string,
    positions: any[],
  ): PositionSnapshot[] {
    return positions.map((pos) => ({
      walletAddress,
      protocol: pos.protocol,
      type: pos.type || 'unknown',
      value: pos.value || 0,
      amount: pos.amount?.toString() || '0',
      apy: pos.apy,
      timestamp: new Date(),
    }));
  }

  private compareSnapshots(
    previous: PositionSnapshot[],
    current: PositionSnapshot[],
  ): PositionComparison[] {
    const comparisons: PositionComparison[] = [];
    const previousMap = new Map<string, PositionSnapshot>();
    const currentMap = new Map<string, PositionSnapshot>();

    // Build maps for efficient lookup
    previous.forEach((snap) => {
      const key = `${snap.protocol}:${snap.type}`;
      previousMap.set(key, snap);
    });

    current.forEach((snap) => {
      const key = `${snap.protocol}:${snap.type}`;
      currentMap.set(key, snap);
    });

    // Check for added or updated positions
    currentMap.forEach((currentSnap, key) => {
      const previousSnap = previousMap.get(key);

      if (!previousSnap) {
        // New position
        comparisons.push({
          protocol: currentSnap.protocol,
          currentSnapshot: currentSnap,
          changeType: 'added',
          valueDifference: currentSnap.value,
          percentageChange: 100,
        });
      } else {
        // Check if position changed
        const valueDiff = currentSnap.value - previousSnap.value;
        const percentChange =
          previousSnap.value > 0 ? (valueDiff / previousSnap.value) * 100 : 0;

        // Consider it changed if value difference is more than 0.1%
        if (Math.abs(percentChange) > 0.1) {
          comparisons.push({
            protocol: currentSnap.protocol,
            previousSnapshot: previousSnap,
            currentSnapshot: currentSnap,
            changeType: 'updated',
            valueDifference: valueDiff,
            percentageChange: percentChange,
          });
        } else {
          comparisons.push({
            protocol: currentSnap.protocol,
            previousSnapshot: previousSnap,
            currentSnapshot: currentSnap,
            changeType: 'unchanged',
            valueDifference: 0,
            percentageChange: 0,
          });
        }
      }
    });

    // Check for removed positions
    previousMap.forEach((previousSnap, key) => {
      if (!currentMap.has(key)) {
        comparisons.push({
          protocol: previousSnap.protocol,
          previousSnapshot: previousSnap,
          changeType: 'removed',
          valueDifference: -previousSnap.value,
          percentageChange: -100,
        });
      }
    });

    return comparisons;
  }

  private comparisonsToChanges(
    walletAddress: string,
    comparisons: PositionComparison[],
    trigger: string,
  ): PositionChange[] {
    const changes: PositionChange[] = [];

    comparisons.forEach((comp) => {
      if (comp.changeType === 'unchanged') {
        return;
      }

      let changeType: 'deposit' | 'withdraw' | 'claim' | 'update';

      if (comp.changeType === 'added') {
        changeType = 'deposit';
      } else if (comp.changeType === 'removed') {
        changeType = 'withdraw';
      } else if (comp.valueDifference && comp.valueDifference > 0) {
        changeType = 'deposit';
      } else if (comp.valueDifference && comp.valueDifference < 0) {
        changeType = 'withdraw';
      } else {
        changeType = 'update';
      }

      changes.push({
        walletAddress,
        protocol: comp.protocol,
        previousValue: comp.previousSnapshot?.value,
        currentValue: comp.currentSnapshot?.value,
        changeType,
        transactionSignature: `${trigger}_${Date.now()}`, // Placeholder
        timestamp: new Date(),
      });
    });

    return changes;
  }

  private async storeSnapshot(
    walletAddress: string,
    snapshot: PositionSnapshot[],
  ): Promise<void> {
    try {
      // Store in cache
      const cacheKey = `position_snapshot:${walletAddress}`;
      await this.cacheService.set(cacheKey, snapshot, this.SNAPSHOT_CACHE_TTL);

      // Update database positions
      for (const snap of snapshot) {
        await this.prisma.position.upsert({
          where: {
            walletAddress_protocol_type: {
              walletAddress: snap.walletAddress,
              protocol: snap.protocol,
              type: snap.type,
            },
          },
          update: {
            value: snap.value,
            amount: snap.amount,
            apy: snap.apy,
            updatedAt: snap.timestamp,
          },
          create: {
            walletAddress: snap.walletAddress,
            protocol: snap.protocol,
            type: snap.type,
            value: snap.value,
            amount: snap.amount,
            apy: snap.apy,
          },
        });
      }
    } catch (error) {
      this.logger.error('Failed to store snapshot:', error);
    }
  }

  private async storeChanges(changes: PositionChange[]): Promise<void> {
    try {
      for (const change of changes) {
        await this.prisma.transaction.create({
          data: {
            signature: change.transactionSignature,
            walletAddress: change.walletAddress,
            protocol: change.protocol,
            type: change.changeType,
            amount: change.currentValue?.toString(),
            blockTime: change.timestamp,
            status: 'success',
            fee: 0,
          },
        });
      }
    } catch (error) {
      this.logger.error('Failed to store position changes:', error);
    }
  }

  async getRecentChanges(
    walletAddress: string,
    limit: number = 10,
  ): Promise<PositionChange[]> {
    try {
      const transactions = await this.prisma.transaction.findMany({
        where: {
          walletAddress,
          protocol: {
            not: null,
          },
        },
        orderBy: {
          blockTime: 'desc',
        },
        take: limit,
      });

      return transactions.map((tx) => ({
        walletAddress: tx.walletAddress,
        protocol: tx.protocol!,
        changeType: tx.type,
        currentValue: tx.amount ? parseFloat(tx.amount) : undefined,
        transactionSignature: tx.signature,
        timestamp: tx.blockTime,
      }));
    } catch (error) {
      this.logger.error('Failed to get recent changes:', error);
      return [];
    }
  }
}
