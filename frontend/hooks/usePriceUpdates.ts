import { useEffect, useState, useCallback } from 'react';
import { useWebSocketContext } from '../contexts/WebSocketProvider';
import { PriceUpdate } from './useWebSocket';

export interface TokenPriceMap {
  [tokenMint: string]: {
    price: number;
    change24h?: number;
    lastUpdate: number;
  };
}

export const usePriceUpdates = () => {
  const { onPriceUpdate, isConnected } = useWebSocketContext();
  const [prices, setPrices] = useState<TokenPriceMap>({});
  const [lastUpdate, setLastUpdate] = useState<number>(0);

  const updatePrices = useCallback((priceData: { prices: PriceUpdate[]; timestamp: number }) => {
    setPrices((prevPrices) => {
      const newPrices = { ...prevPrices };
      
      priceData.prices.forEach((update) => {
        newPrices[update.tokenMint] = {
          price: update.price,
          change24h: update.change24h,
          lastUpdate: update.timestamp,
        };
      });

      return newPrices;
    });

    setLastUpdate(priceData.timestamp);
  }, []);

  useEffect(() => {
    if (!isConnected) return;

    const unsubscribe = onPriceUpdate(updatePrices);
    return unsubscribe;
  }, [isConnected, onPriceUpdate, updatePrices]);

  const getPrice = useCallback((tokenMint: string) => {
    return prices[tokenMint]?.price || 0;
  }, [prices]);

  const getPriceChange = useCallback((tokenMint: string) => {
    return prices[tokenMint]?.change24h;
  }, [prices]);

  const isPriceStale = useCallback((tokenMint: string, maxAge: number = 60000) => {
    const priceInfo = prices[tokenMint];
    if (!priceInfo) return true;
    
    return Date.now() - priceInfo.lastUpdate > maxAge;
  }, [prices]);

  return {
    prices,
    lastUpdate,
    getPrice,
    getPriceChange,
    isPriceStale,
    isConnected,
  };
};