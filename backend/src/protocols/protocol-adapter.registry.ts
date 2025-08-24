import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import {
  IProtocolAdapter,
  Position,
  ProtocolAdapterOptions,
} from './protocol-adapter.interface';
import { ProtocolType } from '@prisma/client';

@Injectable()
export class ProtocolAdapterRegistry implements OnModuleInit {
  private readonly logger = new Logger(ProtocolAdapterRegistry.name);
  private readonly adapters = new Map<ProtocolType, IProtocolAdapter>();
  private readonly adaptersByPriority: IProtocolAdapter[] = [];

  onModuleInit() {
    this.logger.log(
      `Protocol Adapter Registry initialized with ${this.adapters.size} adapters`,
    );
  }

  register(adapter: IProtocolAdapter): void {
    if (this.adapters.has(adapter.protocolType)) {
      this.logger.warn(
        `Adapter for protocol ${adapter.protocolType} already registered, replacing...`,
      );
    }

    this.adapters.set(adapter.protocolType, adapter);

    this.adaptersByPriority.push(adapter);
    this.adaptersByPriority.sort((a, b) => b.priority - a.priority);

    this.logger.log(
      `Registered adapter for ${adapter.protocolName} (${adapter.protocolType}) with priority ${adapter.priority}`,
    );
  }

  unregister(protocolType: ProtocolType): void {
    const adapter = this.adapters.get(protocolType);
    if (adapter) {
      this.adapters.delete(protocolType);
      const index = this.adaptersByPriority.indexOf(adapter);
      if (index > -1) {
        this.adaptersByPriority.splice(index, 1);
      }
      this.logger.log(`Unregistered adapter for ${protocolType}`);
    }
  }

  getAdapter(protocolType: ProtocolType): IProtocolAdapter | undefined {
    return this.adapters.get(protocolType);
  }

  getAllAdapters(): IProtocolAdapter[] {
    return [...this.adaptersByPriority];
  }

  getAdaptersByPriority(): IProtocolAdapter[] {
    return [...this.adaptersByPriority];
  }

  async getAllPositions(
    walletAddress: string,
    options?: ProtocolAdapterOptions,
  ): Promise<Map<ProtocolType, Position[]>> {
    const results = new Map<ProtocolType, Position[]>();

    if (options?.parallel !== false) {
      const promises = this.adaptersByPriority.map(async (adapter) => {
        try {
          const timeoutMs = options?.timeout || 10000;
          const positions = await this.withTimeout(
            adapter.getPositions(walletAddress),
            timeoutMs,
            `${adapter.protocolName} position fetch`,
          );

          if (positions && positions.length > 0) {
            results.set(adapter.protocolType, positions);
          }
        } catch (error) {
          this.logger.error(
            `Error fetching positions from ${adapter.protocolName}:`,
            error,
          );
        }
      });

      await Promise.allSettled(promises);
    } else {
      for (const adapter of this.adaptersByPriority) {
        try {
          const positions = await adapter.getPositions(walletAddress);
          if (positions && positions.length > 0) {
            results.set(adapter.protocolType, positions);
          }
        } catch (error) {
          this.logger.error(
            `Error fetching positions from ${adapter.protocolName}:`,
            error,
          );
        }
      }
    }

    return results;
  }

  async getAllPositionsFlat(
    walletAddress: string,
    options?: ProtocolAdapterOptions,
  ): Promise<Position[]> {
    const positionsMap = await this.getAllPositions(walletAddress, options);
    const allPositions: Position[] = [];

    for (const positions of positionsMap.values()) {
      allPositions.push(...positions);
    }

    return allPositions;
  }

  findAdapterForToken(tokenMint: string): IProtocolAdapter | undefined {
    for (const adapter of this.adaptersByPriority) {
      if (adapter.isSupported(tokenMint)) {
        return adapter;
      }
    }
    return undefined;
  }

  async invalidateAllCaches(walletAddress: string): Promise<void> {
    const promises = this.adaptersByPriority
      .filter((adapter) => typeof adapter.invalidateCache === 'function')
      .map(async (adapter) => {
        try {
          await adapter.invalidateCache!(walletAddress);
        } catch (error) {
          this.logger.error(
            `Error invalidating cache for ${adapter.protocolName}:`,
            error,
          );
        }
      });

    await Promise.allSettled(promises);
  }

  private async withTimeout<T>(
    promise: Promise<T>,
    timeoutMs: number,
    description: string,
  ): Promise<T> {
    let timeoutId: NodeJS.Timeout;

    const timeoutPromise = new Promise<T>((_, reject) => {
      timeoutId = setTimeout(
        () =>
          reject(new Error(`${description} timed out after ${timeoutMs}ms`)),
        timeoutMs,
      );
    });

    try {
      const result = await Promise.race([promise, timeoutPromise]);
      clearTimeout(timeoutId);
      return result;
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }

  getRegisteredProtocols(): ProtocolType[] {
    return Array.from(this.adapters.keys());
  }

  getAdapterCount(): number {
    return this.adapters.size;
  }
}
