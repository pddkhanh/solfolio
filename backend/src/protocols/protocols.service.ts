import { Injectable, Logger } from '@nestjs/common';
import { ProtocolAdapterRegistry } from './protocol-adapter.registry';
import { Position, ProtocolAdapterOptions } from './protocol-adapter.interface';
import { RedisService } from '../redis/redis.service';
import { ProtocolType } from '@prisma/client';

export interface ProtocolPosition extends Position {
  protocolName: string;
}

export interface AggregatedPositions {
  walletAddress: string;
  positions: ProtocolPosition[];
  byProtocol: Map<ProtocolType, ProtocolPosition[]>;
  totalValue: number;
  totalApy: number;
  totalRewards: number;
}

@Injectable()
export class ProtocolsService {
  private readonly logger = new Logger(ProtocolsService.name);

  constructor(
    private readonly registry: ProtocolAdapterRegistry,
    private readonly redisService: RedisService,
  ) {}

  async fetchAllPositions(
    walletAddress: string,
    options?: ProtocolAdapterOptions,
  ): Promise<AggregatedPositions> {
    try {
      const cacheKey = this.redisService.generateKey('all-positions', walletAddress);
      
      if (options?.useCache !== false) {
        const cached = await this.redisService.get<AggregatedPositions>(cacheKey);
        if (cached) {
          this.logger.debug(`Returning cached positions for ${walletAddress}`);
          return cached;
        }
      }

      const startTime = Date.now();
      
      const positionsMap = await this.registry.getAllPositions(walletAddress, {
        ...options,
        parallel: options?.parallel !== false,
      });

      const allPositions: ProtocolPosition[] = [];
      const byProtocol = new Map<ProtocolType, ProtocolPosition[]>();

      for (const [protocolType, positions] of positionsMap.entries()) {
        const adapter = this.registry.getAdapter(protocolType);
        if (!adapter) continue;

        const enrichedPositions = positions.map((pos) => ({
          ...pos,
          protocolName: adapter.protocolName,
        }));

        allPositions.push(...enrichedPositions);
        byProtocol.set(protocolType, enrichedPositions);
      }

      const totalValue = allPositions.reduce((sum, pos) => sum + pos.usdValue, 0);
      
      const totalApy = this.calculateWeightedApy(allPositions, totalValue);
      
      const totalRewards = allPositions.reduce((sum, pos) => sum + pos.rewards, 0);

      const result: AggregatedPositions = {
        walletAddress,
        positions: allPositions,
        byProtocol,
        totalValue,
        totalApy,
        totalRewards,
      };

      const ttl = options?.cacheTtl || 300;
      await this.redisService.set(cacheKey, result, ttl);

      const elapsed = Date.now() - startTime;
      this.logger.log(
        `Fetched ${allPositions.length} positions from ${positionsMap.size} protocols for ${walletAddress} in ${elapsed}ms`,
      );

      return result;
    } catch (error) {
      this.logger.error(`Error fetching all positions for ${walletAddress}:`, error);
      throw error;
    }
  }

  async getPositionsByProtocol(
    walletAddress: string,
    protocolType: ProtocolType,
  ): Promise<ProtocolPosition[]> {
    const adapter = this.registry.getAdapter(protocolType);
    if (!adapter) {
      throw new Error(`No adapter registered for protocol: ${protocolType}`);
    }

    try {
      const positions = await adapter.getPositions(walletAddress);
      return positions.map((pos) => ({
        ...pos,
        protocolName: adapter.protocolName,
      }));
    } catch (error) {
      this.logger.error(
        `Error fetching positions from ${protocolType} for ${walletAddress}:`,
        error,
      );
      throw error;
    }
  }

  async invalidatePositionCache(walletAddress: string): Promise<void> {
    try {
      await this.registry.invalidateAllCaches(walletAddress);
      
      const cacheKey = this.redisService.generateKey('all-positions', walletAddress);
      await this.redisService.del(cacheKey);
      
      this.logger.debug(`Invalidated all position caches for ${walletAddress}`);
    } catch (error) {
      this.logger.error(`Error invalidating position cache for ${walletAddress}:`, error);
      throw error;
    }
  }

  private calculateWeightedApy(positions: Position[], totalValue: number): number {
    if (totalValue === 0) return 0;

    return positions.reduce((sum, pos) => {
      const weight = pos.usdValue / totalValue;
      return sum + pos.apy * weight;
    }, 0);
  }

  getRegisteredProtocols(): ProtocolType[] {
    return this.registry.getRegisteredProtocols();
  }

  getAdapterCount(): number {
    return this.registry.getAdapterCount();
  }
}