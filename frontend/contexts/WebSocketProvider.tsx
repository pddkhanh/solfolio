'use client';

import React, { createContext, useContext, useEffect, ReactNode } from 'react';
import { useWebSocket, UseWebSocketReturn } from '../hooks/useWebSocket';

const WebSocketContext = createContext<UseWebSocketReturn | null>(null);

interface WebSocketProviderProps {
  children: ReactNode;
  serverUrl?: string;
}

export const WebSocketProvider: React.FC<WebSocketProviderProps> = ({
  children,
  serverUrl,
}) => {
  const websocket = useWebSocket(serverUrl);

  // Auto-subscribe to price updates when connected
  useEffect(() => {
    if (websocket.isConnected) {
      websocket.subscribeToPrices();
    }
  }, [websocket.isConnected, websocket.subscribeToPrices]);

  return (
    <WebSocketContext.Provider value={websocket}>
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocketContext = (): UseWebSocketReturn => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocketContext must be used within a WebSocketProvider');
  }
  return context;
};

export default WebSocketProvider;