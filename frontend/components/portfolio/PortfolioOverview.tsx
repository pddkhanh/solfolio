'use client';

import { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { formatUSD, formatNumber } from '@/lib/utils';
import { TrendingUp, TrendingDown, DollarSign, Wallet, Coins } from 'lucide-react';
import { MultiPeriodChange } from './ChangeIndicator';
import { getMockPortfolioStats, isMockMode } from '@/lib/mock-data';

interface PortfolioStats {
  totalValue: number;
  totalTokens: number;
  change24h?: number;
  changePercent24h?: number;
  change7d?: number;
  changePercent7d?: number;
  change30d?: number;
  changePercent30d?: number;
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
      // Use mock data only if explicitly enabled via environment variable
      if (process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true') {
        await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay
        const mockStats = getMockPortfolioStats();
        setStats(mockStats);
        setLoading(false);
        return;
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/wallet/balances/${publicKey.toString()}`
      );

      if (!response.ok) {
        // Handle different error codes
        if (response.status === 404) {
          // 404 might mean wallet has no data, treat as empty
          setStats({
            totalValue: 0,
            totalTokens: 0,
            change24h: 0,
            changePercent24h: 0,
            change7d: 0,
            changePercent7d: 0,
            change30d: 0,
            changePercent30d: 0,
          });
          return;
        }
        throw new Error(`Failed to fetch portfolio data: ${response.statusText}`);
      }

      const data = await response.json();
      
      // Handle empty response gracefully
      setStats({
        totalValue: data.totalValueUSD || 0,
        totalTokens: data.totalAccounts || 0,
        change24h: data.totalChange24h || 0,
        changePercent24h: data.totalChangePercent24h || 0,
        change7d: data.totalChange7d || 0,
        changePercent7d: data.totalChangePercent7d || 0,
        change30d: data.totalChange30d || 0,
        changePercent30d: data.totalChangePercent30d || 0,
      });
    } catch (err) {
      console.error('Error fetching portfolio stats:', err);
      
      // Check if it's a network error vs other errors
      if (err instanceof TypeError && err.message.includes('fetch')) {
        setError('Unable to connect to portfolio service. Please check your connection.');
      } else {
        setError('Failed to load portfolio data. Please try again later.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (!connected) {
    return (
      <Card data-testid="portfolio-overview-card">
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
      <Card data-testid="portfolio-overview-card" data-loading="true">
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
      <Card data-testid="portfolio-overview-card" data-error="true">
        <CardHeader>
          <CardTitle>Portfolio Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-destructive text-center py-8" data-testid="error-message">{error}</p>
        </CardContent>
      </Card>
    );
  }

  if (!stats) {
    return null;
  }

  // Show empty state if wallet has no holdings
  if (stats.totalValue === 0 && stats.totalTokens === 0) {
    return (
      <Card data-testid="portfolio-overview-card" data-empty="true">
        <CardHeader>
          <CardTitle>Portfolio Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Wallet className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground mb-2">No tokens or positions found</p>
            <p className="text-sm text-muted-foreground">
              Your portfolio will appear here once you have tokens or DeFi positions
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const isPositiveChange = (stats.change24h || 0) >= 0;

  return (
    <Card data-testid="portfolio-overview-card">
      <CardHeader className="pb-2">
        <CardTitle>Portfolio Overview</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Main Stats Grid */}
        <div className="grid gap-4 md:grid-cols-3">
          {/* Total Value */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <DollarSign className="h-4 w-4" />
              <span>Total Value</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold" data-testid="total-value">
                {formatUSD(stats.totalValue)}
              </span>
            </div>
          </div>

          {/* 24h Change (Primary) */}
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
              isPositiveChange ? 'text-green-600 dark:text-green-500' : 'text-red-600 dark:text-red-500'
            }`}>
              {isPositiveChange ? '+' : ''}{formatUSD(stats.change24h || 0)}
              <span className="text-base ml-2 font-normal">
                ({isPositiveChange ? '+' : ''}{formatNumber(stats.changePercent24h || 0, 2)}%)
              </span>
            </div>
          </div>

          {/* Total Tokens */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Coins className="h-4 w-4" />
              <span>Total Tokens</span>
            </div>
            <div className="text-3xl font-bold" data-testid="total-tokens">
              {stats.totalTokens}
            </div>
          </div>
        </div>

        {/* Multi-period Changes */}
        <div className="border-t pt-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">Performance</span>
            <MultiPeriodChange
              change24h={stats.change24h}
              changePercent24h={stats.changePercent24h}
              change7d={stats.change7d}
              changePercent7d={stats.changePercent7d}
              change30d={stats.change30d}
              changePercent30d={stats.changePercent30d}
              size="sm"
              showValues={false}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}