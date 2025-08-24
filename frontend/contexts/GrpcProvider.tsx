'use client';

import React, { createContext, useContext, useEffect, useMemo } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import useGrpcClient from '@/hooks/useGrpcClient';
import type { Portfolio, Token, Position, UpdateEvent } from '@/lib/grpc/portfolio.client';

interface GrpcContextType {
  loading: boolean;
  error: Error | null;
  portfolio: Portfolio | null;
  tokens: Token[];
  positions: Position[];
  getPortfolio: (wallet: string, forceRefresh?: boolean) => Promise<Portfolio | undefined>;
  getTokenBalances: (wallet: string) => Promise<Token[] | undefined>;
  getPositions: (wallet: string, protocols?: string[]) => Promise<Position[] | undefined>;
  getPrices: (mints: string[]) => Promise<Record<string, number> | undefined>;
  subscribeToUpdates: (
    wallet: string,
    eventTypes?: string[],
    onUpdate?: (event: UpdateEvent) => void,
  ) => (() => void) | undefined;
  refresh: () => Promise<void>;
}

const GrpcContext = createContext<GrpcContextType | undefined>(undefined);

export function GrpcProvider({ children }: { children: React.ReactNode }) {
  const { publicKey } = useWallet();
  const {
    loading,
    error,
    portfolio,
    tokens,
    positions,
    getPortfolio,
    getTokenBalances,
    getPositions,
    getPrices,
    subscribeToUpdates,
    startAutoRefresh,
    stopAutoRefresh,
  } = useGrpcClient({
    autoRefresh: true,
    refreshInterval: 60000, // 1 minute
  });

  const walletAddress = useMemo(() => publicKey?.toBase58(), [publicKey]);

  useEffect(() => {
    if (walletAddress) {
      // Fetch initial portfolio data
      getPortfolio(walletAddress);
      
      // Subscribe to updates
      const unsubscribe = subscribeToUpdates(walletAddress);
      
      // Start auto-refresh
      startAutoRefresh(walletAddress);
      
      return () => {
        if (unsubscribe) {
          unsubscribe();
        }
        stopAutoRefresh();
      };
    } else {
      stopAutoRefresh();
    }
  }, [walletAddress, getPortfolio, subscribeToUpdates, startAutoRefresh, stopAutoRefresh]);

  const refresh = async () => {
    if (walletAddress) {
      await getPortfolio(walletAddress, true);
    }
  };

  const contextValue = useMemo(
    () => ({
      loading,
      error,
      portfolio,
      tokens,
      positions,
      getPortfolio,
      getTokenBalances,
      getPositions,
      getPrices,
      subscribeToUpdates,
      refresh,
    }),
    [
      loading,
      error,
      portfolio,
      tokens,
      positions,
      getPortfolio,
      getTokenBalances,
      getPositions,
      getPrices,
      subscribeToUpdates,
    ]
  );

  return (
    <GrpcContext.Provider value={contextValue}>
      {children}
    </GrpcContext.Provider>
  );
}

export function useGrpc() {
  const context = useContext(GrpcContext);
  if (context === undefined) {
    throw new Error('useGrpc must be used within a GrpcProvider');
  }
  return context;
}

export default GrpcProvider;