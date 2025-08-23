'use client';

import React, { useEffect, useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { PositionCard } from './PositionCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RefreshCw, TrendingUp, DollarSign, Percent } from 'lucide-react';

interface Position {
  protocol: string;
  protocolName: string;
  positionType: string;
  tokenSymbol?: string;
  tokenName?: string;
  logoUri?: string;
  amount: number;
  underlyingAmount?: number;
  usdValue: number;
  apy?: number;
  rewards?: number;
  metadata?: any;
}

interface PortfolioSummary {
  walletAddress: string;
  totalValue: number;
  totalPositions: number;
  positions: Position[];
  breakdown: {
    tokens: number;
    staking: number;
    lending: number;
    liquidity: number;
    other: number;
  };
  performance: {
    totalApy: number;
    dailyRewards: number;
    monthlyRewards: number;
  };
}

export function PositionsList() {
  const { publicKey } = useWallet();
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [portfolio, setPortfolio] = useState<PortfolioSummary | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchPositions = async (refresh = false) => {
    if (!publicKey) return;

    try {
      if (refresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      const response = await fetch(
        `/api/positions/${publicKey.toString()}/summary${refresh ? '?refresh=true' : ''}`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch positions');
      }

      const result = await response.json();
      
      if (result.success) {
        setPortfolio(result.data);
      } else {
        throw new Error(result.error || 'Failed to fetch positions');
      }
    } catch (err) {
      console.error('Error fetching positions:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch positions');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchPositions();
  }, [publicKey]);

  const formatUSD = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  if (!publicKey) {
    return (
      <Card className="w-full">
        <CardContent className="py-8">
          <div className="text-center text-gray-500 dark:text-gray-400">
            Connect your wallet to view positions
          </div>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-32" />
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-48" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="w-full">
        <CardContent className="py-8">
          <div className="text-center text-red-500">
            Error: {error}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!portfolio || portfolio.positions.length === 0) {
    return (
      <Card className="w-full">
        <CardContent className="py-8">
          <div className="text-center text-gray-500 dark:text-gray-400">
            No positions found. Start by staking SOL on Marinade Finance!
          </div>
        </CardContent>
      </Card>
    );
  }

  const stakingValue = portfolio.breakdown.staking || 0;
  const hasPositions = portfolio.positions.length > 0;

  return (
    <div className="space-y-6">
      {/* Portfolio Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400 flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              Total Staked Value
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatUSD(stakingValue)}</div>
            <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
              Across {portfolio.totalPositions} position{portfolio.totalPositions !== 1 ? 's' : ''}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400 flex items-center gap-2">
              <Percent className="w-4 h-4" />
              Average APY
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {formatNumber(portfolio.performance.totalApy)}%
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
              Weighted by position value
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400 flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Monthly Rewards
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {formatUSD(portfolio.performance.monthlyRewards)}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
              ≈ {formatUSD(portfolio.performance.dailyRewards)}/day
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Section Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Staking Positions</h2>
        <button
          onClick={() => fetchPositions(true)}
          disabled={refreshing}
          className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Position Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {portfolio.positions.map((position, index) => (
          <PositionCard key={index} position={position} />
        ))}
      </div>

      {/* Breakdown by Type */}
      {hasPositions && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Portfolio Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {portfolio.breakdown.staking > 0 && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Staking</span>
                  <div className="flex items-center gap-2">
                    <div className="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-green-500 h-2 rounded-full"
                        style={{
                          width: `${(portfolio.breakdown.staking / stakingValue) * 100}%`,
                        }}
                      />
                    </div>
                    <span className="text-sm font-medium min-w-[80px] text-right">
                      {formatUSD(portfolio.breakdown.staking)}
                    </span>
                  </div>
                </div>
              )}
              {portfolio.breakdown.lending > 0 && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Lending</span>
                  <div className="flex items-center gap-2">
                    <div className="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full"
                        style={{
                          width: `${(portfolio.breakdown.lending / stakingValue) * 100}%`,
                        }}
                      />
                    </div>
                    <span className="text-sm font-medium min-w-[80px] text-right">
                      {formatUSD(portfolio.breakdown.lending)}
                    </span>
                  </div>
                </div>
              )}
              {portfolio.breakdown.liquidity > 0 && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Liquidity</span>
                  <div className="flex items-center gap-2">
                    <div className="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-purple-500 h-2 rounded-full"
                        style={{
                          width: `${(portfolio.breakdown.liquidity / stakingValue) * 100}%`,
                        }}
                      />
                    </div>
                    <span className="text-sm font-medium min-w-[80px] text-right">
                      {formatUSD(portfolio.breakdown.liquidity)}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}