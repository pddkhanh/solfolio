import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { useWallet } from '@solana/wallet-adapter-react';

export interface PriceUpdate {
  tokenMint: string;
  price: number;
  timestamp: number;
  change24h?: number;
}

export interface WalletUpdate {
  type: 'balance' | 'position' | 'transaction';
  data: any;
  timestamp: number;
}

export interface PositionUpdate {
  positions: any[];
  timestamp: number;
}

export type ConnectionStatus = 'connecting' | 'connected' | 'disconnected' | 'reconnecting' | 'error';

export interface UseWebSocketReturn {
  socket: Socket | null;
  connectionStatus: ConnectionStatus;
  isConnected: boolean;
  error: string | null;
  subscribeToPrices: () => void;
  unsubscribeFromPrices: () => void;
  subscribeToWallet: (walletAddress: string) => void;
  unsubscribeFromWallet: (walletAddress: string) => void;
  onPriceUpdate: (callback: (data: { prices: PriceUpdate[]; timestamp: number }) => void) => void;
  onWalletUpdate: (callback: (data: WalletUpdate) => void) => void;
  onPositionUpdate: (callback: (data: PositionUpdate) => void) => void;
  disconnect: () => void;
  reconnect: () => void;
}

export const useWebSocket = (serverUrl?: string): UseWebSocketReturn => {
  const { publicKey } = useWallet();
  const socketRef = useRef<Socket | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('disconnected');
  const [error, setError] = useState<string | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const maxReconnectAttempts = 5;
  const reconnectAttempts = useRef(0);

  const url = serverUrl || process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:3001';

  const connect = useCallback(() => {
    if (socketRef.current?.connected) {
      return;
    }

    setConnectionStatus('connecting');
    setError(null);

    const socket = io(url, {
      transports: ['websocket', 'polling'],
      timeout: 10000,
      query: publicKey ? { wallet: publicKey.toString() } : {},
    });

    socket.on('connect', () => {
      console.log('WebSocket connected:', socket.id);
      setConnectionStatus('connected');
      setError(null);
      reconnectAttempts.current = 0;

      // Auto-subscribe to wallet updates if wallet is connected
      if (publicKey) {
        socket.emit('subscribe:wallet', publicKey.toString());
      }
    });

    socket.on('disconnect', (reason) => {
      console.log('WebSocket disconnected:', reason);
      setConnectionStatus('disconnected');
      
      // Auto-reconnect on unexpected disconnections
      if (reason === 'io server disconnect' || reason === 'transport close') {
        // Server disconnected us, don't auto-reconnect
        return;
      }
      
      if (reconnectAttempts.current < maxReconnectAttempts) {
        setConnectionStatus('reconnecting');
        reconnectAttempts.current++;
        
        const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.current - 1), 30000);
        reconnectTimeoutRef.current = setTimeout(() => {
          connect();
        }, delay);
      }
    });

    socket.on('connect_error', (err) => {
      console.error('WebSocket connection error:', err);
      setConnectionStatus('error');
      setError(`Connection failed: ${err.message}`);
      
      if (reconnectAttempts.current < maxReconnectAttempts) {
        setConnectionStatus('reconnecting');
        reconnectAttempts.current++;
        
        const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.current - 1), 30000);
        reconnectTimeoutRef.current = setTimeout(() => {
          connect();
        }, delay);
      }
    });

    socket.on('error', (err) => {
      console.error('WebSocket error:', err);
      setError(err.message || 'An unknown error occurred');
    });

    socket.on('subscription:confirmed', (data) => {
      console.log('Subscription confirmed:', data);
    });

    socket.on('unsubscription:confirmed', (data) => {
      console.log('Unsubscription confirmed:', data);
    });

    socketRef.current = socket;
  }, [url, publicKey]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }
    
    setConnectionStatus('disconnected');
    reconnectAttempts.current = 0;
  }, []);

  const reconnect = useCallback(() => {
    disconnect();
    setTimeout(() => {
      connect();
    }, 1000);
  }, [disconnect, connect]);

  // Auto-connect on mount
  useEffect(() => {
    connect();
    
    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  // Handle wallet changes
  useEffect(() => {
    if (!socketRef.current?.connected) return;

    if (publicKey) {
      socketRef.current.emit('subscribe:wallet', publicKey.toString());
    }
  }, [publicKey]);

  const subscribeToPrices = useCallback(() => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('subscribe:prices');
    }
  }, []);

  const unsubscribeFromPrices = useCallback(() => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('unsubscribe:prices');
    }
  }, []);

  const subscribeToWallet = useCallback((walletAddress: string) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('subscribe:wallet', walletAddress);
    }
  }, []);

  const unsubscribeFromWallet = useCallback((walletAddress: string) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('unsubscribe:wallet', walletAddress);
    }
  }, []);

  const onPriceUpdate = useCallback((callback: (data: { prices: PriceUpdate[]; timestamp: number }) => void) => {
    if (socketRef.current) {
      socketRef.current.on('price:update', callback);
      return () => {
        socketRef.current?.off('price:update', callback);
      };
    }
  }, []);

  const onWalletUpdate = useCallback((callback: (data: WalletUpdate) => void) => {
    if (socketRef.current) {
      socketRef.current.on('wallet:update', callback);
      return () => {
        socketRef.current?.off('wallet:update', callback);
      };
    }
  }, []);

  const onPositionUpdate = useCallback((callback: (data: PositionUpdate) => void) => {
    if (socketRef.current) {
      socketRef.current.on('position:update', callback);
      return () => {
        socketRef.current?.off('position:update', callback);
      };
    }
  }, []);

  return {
    socket: socketRef.current,
    connectionStatus,
    isConnected: connectionStatus === 'connected',
    error,
    subscribeToPrices,
    unsubscribeFromPrices,
    subscribeToWallet,
    unsubscribeFromWallet,
    onPriceUpdate,
    onWalletUpdate,
    onPositionUpdate,
    disconnect,
    reconnect,
  };
};