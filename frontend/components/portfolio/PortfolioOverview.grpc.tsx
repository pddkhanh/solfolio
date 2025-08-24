'use client';

import { useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { formatUSD, formatNumber } from '@/lib/utils';
import { TrendingUp, TrendingDown, DollarSign, Wallet, Coins } from 'lucide-react';
import { useGrpc } from '@/contexts/GrpcProvider';

export function PortfolioOverviewGrpc() {
  const { publicKey, connected } = useWallet();
  const { loading, error, portfolio, refresh } = useGrpc();

  useEffect(() => {
    if (connected && publicKey) {
      refresh();
    }
  }, [connected, publicKey]);

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

  if (loading && !portfolio) {
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
          <p className="text-destructive text-center py-8">{error.message}</p>
        </CardContent>
      </Card>
    );
  }

  if (!portfolio) {
    return null;
  }

  const stats = {
    totalValue: portfolio.totalValue,
    totalTokens: portfolio.tokens.length,
    totalPositions: portfolio.positions.length,
    change24h: 0, // TODO: Implement 24h change tracking
    changePercent24h: 0,
  };

  const isPositiveChange = stats.change24h >= 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Portfolio Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-4">
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
              {stats.change24h !== 0 && (
                <div className={`flex items-center gap-1 text-sm ${
                  isPositiveChange ? 'text-green-600' : 'text-red-600'
                }`}>
                  {isPositiveChange ? (
                    <TrendingUp className="h-3 w-3" />
                  ) : (
                    <TrendingDown className="h-3 w-3" />
                  )}
                  <span>{formatNumber(Math.abs(stats.changePercent24h))}%</span>
                </div>
              )}
            </div>
          </div>

          {/* 24h Change */}
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

          {/* Total Positions */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Wallet className="h-4 w-4" />
              <span>DeFi Positions</span>
            </div>
            <div className="text-2xl font-bold">
              {stats.totalPositions}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}