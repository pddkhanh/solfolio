'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useWebSocket, ConnectionStatus, PriceUpdate, WalletUpdate, PositionUpdate } from '@/hooks/useWebSocket';
import { useWallet } from '@solana/wallet-adapter-react';
import { useTransactionAlerts, Transaction } from '@/components/realtime/TransactionAlert';

interface WebSocketContextValue {
  connectionStatus: ConnectionStatus;
  isConnected: boolean;
  reconnectAttempt: number;
  maxReconnectAttempts: number;
  prices: Map<string, PriceUpdate>;
  lastUpdate: Date | null;
  subscribeToPrices: () => void;
  unsubscribeFromPrices: () => void;
  reconnect: () => void;
}

const WebSocketContext = createContext<WebSocketContextValue | undefined>(undefined);

export function WebSocketProvider({ children }: { children: React.ReactNode }) {
  const { publicKey } = useWallet();
  const {
    connectionStatus,
    isConnected,
    reconnectAttempt,
    maxReconnectAttempts,
    subscribeToPrices,
    unsubscribeFromPrices,
    onPriceUpdate,
    onWalletUpdate,
    onPositionUpdate,
    reconnect,
  } = useWebSocket();

  const { showTransaction, updateTransaction } = useTransactionAlerts();
  const [prices, setPrices] = useState<Map<string, PriceUpdate>>(new Map());
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  // Subscribe to price updates
  useEffect(() => {
    if (!isConnected) return;

    const unsubscribe = onPriceUpdate((data) => {
      setPrices((prevPrices) => {
        const newPrices = new Map(prevPrices);
        data.prices.forEach((price) => {
          newPrices.set(price.tokenMint, price);
        });
        return newPrices;
      });
      setLastUpdate(new Date());
    });

    // Auto-subscribe to prices when connected
    subscribeToPrices();

    return unsubscribe;
  }, [isConnected, onPriceUpdate, subscribeToPrices]);

  // Subscribe to wallet updates
  useEffect(() => {
    if (!isConnected || !publicKey) return;

    const unsubscribe = onWalletUpdate((update) => {
      console.log('Wallet update:', update);
      
      // Show transaction notification
      if (update.type === 'transaction') {
        const tx: Transaction = {
          id: `tx-${Date.now()}`,
          type: update.data.type || 'send',
          status: 'pending',
          amount: update.data.amount,
          token: update.data.token,
          from: update.data.from,
          to: update.data.to,
          txHash: update.data.signature,
          timestamp: new Date(update.timestamp),
        };
        
        const txId = showTransaction(tx);
        
        // Simulate transaction confirmation after 3 seconds
        setTimeout(() => {
          updateTransaction(txId, { status: 'success' });
        }, 3000);
      }
      
      setLastUpdate(new Date());
    });

    return unsubscribe;
  }, [isConnected, publicKey, onWalletUpdate, showTransaction, updateTransaction]);

  // Subscribe to position updates
  useEffect(() => {
    if (!isConnected || !publicKey) return;

    const unsubscribe = onPositionUpdate((update) => {
      console.log('Position update:', update);
      setLastUpdate(new Date());
    });

    return unsubscribe;
  }, [isConnected, publicKey, onPositionUpdate]);

  const value: WebSocketContextValue = {
    connectionStatus,
    isConnected,
    reconnectAttempt,
    maxReconnectAttempts,
    prices,
    lastUpdate,
    subscribeToPrices,
    unsubscribeFromPrices,
    reconnect,
  };

  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  );
}

export function useWebSocketContext() {
  const context = useContext(WebSocketContext);
  if (context === undefined) {
    throw new Error('useWebSocketContext must be used within a WebSocketProvider');
  }
  return context;
}