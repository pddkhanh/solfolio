'use client';

import { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { formatUSD, formatNumber } from '@/lib/utils';
import { TrendingUp, TrendingDown, DollarSign, Wallet, Coins } from 'lucide-react';

interface PortfolioStats {
  totalValue: number;
  totalTokens: number;
  change24h?: number;
  changePercent24h?: number;
}

export function PortfolioOverview() {
  const { publicKey, connected } = useWallet();
  const [stats, setStats] = useState<PortfolioStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (connected && publicKey) {
      fetchPortfolioStats();
    } else {
      setStats(null);
    }
  }, [connected, publicKey]);

  const fetchPortfolioStats = async () => {
    if (!publicKey) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/wallet/balances/${publicKey.toString()}`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch portfolio data');
      }

      const data = await response.json();
      
      setStats({
        totalValue: data.totalValueUSD || 0,
        totalTokens: data.totalAccounts || 0,
        change24h: 0, // TODO: Implement 24h change tracking
        changePercent24h: 0,
      });
    } catch (err) {
      console.error('Error fetching portfolio stats:', err);
      setError('Failed to load portfolio data');
    } finally {
      setLoading(false);
    }
  };

  if (!connected) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Portfolio Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">
            Connect your wallet to view your portfolio
          </p>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Portfolio Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-8 w-32" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Portfolio Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-destructive text-center py-8">{error}</p>
        </CardContent>
      </Card>
    );
  }

  if (!stats) {
    return null;
  }

  const isPositiveChange = (stats.change24h || 0) >= 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Portfolio Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-3">
          {/* Total Value */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <DollarSign className="h-4 w-4" />
              <span>Total Value</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold">
                {formatUSD(stats.totalValue)}
              </span>
              {stats.change24h !== undefined && stats.change24h !== 0 && (
                <div className={`flex items-center gap-1 text-sm ${
                  isPositiveChange ? 'text-green-600' : 'text-red-600'
                }`}>
                  {isPositiveChange ? (
                    <TrendingUp className="h-3 w-3" />
                  ) : (
                    <TrendingDown className="h-3 w-3" />
                  )}
                  <span>{formatNumber(Math.abs(stats.changePercent24h || 0))}%</span>
                </div>
              )}
            </div>
          </div>

          {/* 24h Change */}
          {stats.change24h !== undefined && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                {isPositiveChange ? (
                  <TrendingUp className="h-4 w-4" />
                ) : (
                  <TrendingDown className="h-4 w-4" />
                )}
                <span>24h Change</span>
              </div>
              <div className={`text-2xl font-bold ${
                isPositiveChange ? 'text-green-600' : 'text-red-600'
              }`}>
                {isPositiveChange ? '+' : ''}{formatUSD(stats.change24h)}
              </div>
            </div>
          )}

          {/* Total Tokens */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Coins className="h-4 w-4" />
              <span>Total Tokens</span>
            </div>
            <div className="text-2xl font-bold">
              {stats.totalTokens}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}