import { ProtocolType, PositionType } from '@prisma/client';

export interface Position {
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

export interface ProtocolStats {
  protocolName: string;
  tvl: number;
  apy: number;
  validatorCount?: number;
  metadata: Record<string, any>;
}

export interface IProtocolAdapter {
  readonly protocolType: ProtocolType;
  readonly protocolName: string;
  readonly priority: number;

  getPositions(walletAddress: string): Promise<Position[]>;

  getProtocolStats(): Promise<ProtocolStats>;

  isSupported(tokenMint: string): boolean;

  invalidateCache?(walletAddress: string): Promise<void>;
}

export interface ProtocolAdapterOptions {
  useCache?: boolean;
  cacheTtl?: number;
  parallel?: boolean;
  timeout?: number;
}
