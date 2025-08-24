export interface MonitoredWallet {
  address: string;
  subscriptionId?: number;
  lastActivity?: Date;
  isActive: boolean;
}

export interface TransactionNotification {
  signature: string;
  walletAddress: string;
  slot: number;
  timestamp: Date;
  type: 'confirmed' | 'finalized';
}

export interface PositionChange {
  walletAddress: string;
  protocol: string;
  previousValue?: number;
  currentValue?: number;
  changeType: 'deposit' | 'withdraw' | 'claim' | 'update';
  transactionSignature: string;
  timestamp: Date;
}

export interface AccountChangeEvent {
  accountId: string;
  lamports: number;
  slot: number;
  executable: boolean;
  owner: string;
  rentEpoch: number;
  data: Buffer;
}

export interface MonitoringConfig {
  maxSubscriptions: number;
  reconnectInterval: number;
  transactionConfirmationLevel: 'confirmed' | 'finalized';
  positionRefreshDelay: number;
}

export const DEFAULT_MONITORING_CONFIG: MonitoringConfig = {
  maxSubscriptions: 100,
  reconnectInterval: 5000,
  transactionConfirmationLevel: 'confirmed',
  positionRefreshDelay: 2000, // 2 seconds delay after transaction
};
