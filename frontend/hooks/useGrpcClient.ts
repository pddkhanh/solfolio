import { useCallback, useEffect, useRef, useState } from 'react';
import PortfolioGrpcClient, {
  Portfolio,
  Token,
  Position,
  UpdateEvent,
} from '@/lib/grpc/portfolio.client';

export interface UseGrpcClientOptions {
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export function useGrpcClient(options: UseGrpcClientOptions = {}) {
  const { autoRefresh = false, refreshInterval = 60000 } = options;
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [tokens, setTokens] = useState<Token[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);
  
  const clientRef = useRef<PortfolioGrpcClient>();
  const unsubscribeRef = useRef<(() => void) | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    clientRef.current = new PortfolioGrpcClient();
    
    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const getPortfolio = useCallback(async (wallet: string, forceRefresh = false) => {
    if (!clientRef.current) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const result = await clientRef.current.getPortfolio({ wallet, forceRefresh });
      setPortfolio(result);
      setTokens(result.tokens);
      setPositions(result.positions);
      return result;
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getTokenBalances = useCallback(async (wallet: string) => {
    if (!clientRef.current) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const result = await clientRef.current.getTokenBalances({ wallet });
      setTokens(result);
      return result;
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getPositions = useCallback(async (wallet: string, protocols?: string[]) => {
    if (!clientRef.current) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const result = await clientRef.current.getPositions({ wallet, protocols });
      setPositions(result);
      return result;
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getPrices = useCallback(async (mints: string[]) => {
    if (!clientRef.current) return;
    
    try {
      const result = await clientRef.current.getPrices({ mints });
      return result;
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  }, []);

  const subscribeToUpdates = useCallback((
    wallet: string,
    eventTypes?: string[],
    onUpdate?: (event: UpdateEvent) => void,
  ) => {
    if (!clientRef.current) return;
    
    if (unsubscribeRef.current) {
      unsubscribeRef.current();
    }
    
    unsubscribeRef.current = clientRef.current.subscribeToUpdates(
      { wallet, eventTypes },
      (event) => {
        switch (event.type) {
          case 'token':
            if (event.data?.tokenUpdate) {
              setTokens((prev) => {
                const index = prev.findIndex(t => t.mint === event.data?.tokenUpdate?.mint);
                if (index >= 0) {
                  const updated = [...prev];
                  updated[index] = event.data.tokenUpdate;
                  return updated;
                }
                return [...prev, event.data.tokenUpdate];
              });
            }
            break;
          
          case 'position':
            if (event.data?.positionUpdate) {
              setPositions((prev) => {
                const index = prev.findIndex(p => 
                  p.protocol === event.data?.positionUpdate?.protocol &&
                  p.address === event.data?.positionUpdate?.address
                );
                if (index >= 0) {
                  const updated = [...prev];
                  updated[index] = event.data.positionUpdate;
                  return updated;
                }
                return [...prev, event.data.positionUpdate];
              });
            }
            break;
          
          case 'price':
            if (event.data?.priceUpdate) {
              setTokens((prev) => prev.map(token => {
                if (token.mint === event.data?.priceUpdate?.mint) {
                  return {
                    ...token,
                    price: event.data.priceUpdate.price,
                    value: token.balance * event.data.priceUpdate.price,
                  };
                }
                return token;
              }));
            }
            break;
        }
        
        if (onUpdate) {
          onUpdate(event);
        }
      },
      (error) => {
        console.error('Update subscription error:', error);
        setError(error);
      }
    );
    
    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
    };
  }, []);

  const startAutoRefresh = useCallback((wallet: string) => {
    if (!autoRefresh) return;
    
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    
    intervalRef.current = setInterval(() => {
      getPortfolio(wallet, false);
    }, refreshInterval);
  }, [autoRefresh, refreshInterval, getPortfolio]);

  const stopAutoRefresh = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const checkHealth = useCallback(async () => {
    if (!clientRef.current) return;
    
    try {
      const result = await clientRef.current.healthCheck();
      return result;
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  }, []);

  return {
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
    checkHealth,
  };
}

export default useGrpcClient;