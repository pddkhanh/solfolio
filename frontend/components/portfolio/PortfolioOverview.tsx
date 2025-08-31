'use client';

import { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatUSD, formatNumber } from '@/lib/utils';
import { TrendingUp, TrendingDown, DollarSign, Wallet, Coins, Activity, Sparkles } from 'lucide-react';
import { MultiPeriodChange } from './ChangeIndicator';
import { getMockPortfolioStats, isMockMode } from '@/lib/mock-data';
import { CountUpUSD, CountUp, CountUpPercentage } from '@/components/ui/count-up';
import { Sparkline, generateMockSparklineData } from '@/components/ui/sparkline';
import { staggerContainer, staggerItem, fadeInUp, cardHoverVariants } from '@/lib/animations';
import { cn } from '@/lib/utils';
import { PortfolioOverviewSkeleton } from './PortfolioOverviewSkeleton';

interface PortfolioStats {
  totalValue: number;
  totalTokens: number;
  change24h?: number;
  changePercent24h?: number;
  change7d?: number;
  changePercent7d?: number;
  change30d?: number;
  changePercent30d?: number;
  sparklineData?: number[];
  totalPositions?: number;
  totalProtocols?: number;
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
        // Add mock sparkline data
        setStats({
          ...mockStats,
          sparklineData: generateMockSparklineData(20, mockStats.change24h && mockStats.change24h > 0 ? 'up' : 'down'),
          totalPositions: 5,
          totalProtocols: 3
        });
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
            sparklineData: [],
            totalPositions: 0,
            totalProtocols: 0
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
        sparklineData: data.sparklineData || generateMockSparklineData(20, data.totalChange24h > 0 ? 'up' : 'down'),
        totalPositions: data.totalPositions || 0,
        totalProtocols: data.totalProtocols || 0
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
      <motion.div
        initial="initial"
        animate="animate"
        variants={fadeInUp}
      >
        <Card 
          data-testid="portfolio-overview-card"
          className="relative overflow-hidden border-border-default bg-gradient-to-br from-bg-secondary to-bg-tertiary"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-green-500/5" />
          <CardHeader className="relative">
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-purple-500" />
              Portfolio Overview
            </CardTitle>
          </CardHeader>
          <CardContent className="relative">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="text-center py-12"
            >
              <Wallet className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">
                Connect your wallet to view your portfolio
              </p>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  if (loading) {
    return <PortfolioOverviewSkeleton />;
  }

  if (error) {
    return (
      <motion.div
        initial="initial"
        animate="animate"
        variants={fadeInUp}
      >
        <Card 
          data-testid="portfolio-overview-card" 
          data-error="true"
          className="relative overflow-hidden border-red-500/20 bg-gradient-to-br from-bg-secondary to-bg-tertiary"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-red-600/5" />
          <CardHeader className="relative">
            <CardTitle className="text-red-500">Portfolio Overview</CardTitle>
          </CardHeader>
          <CardContent className="relative">
            <motion.p 
              className="text-red-500 text-center py-8" 
              data-testid="error-message"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              {error}
            </motion.p>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  if (!stats) {
    return null;
  }

  // Show empty state if wallet has no holdings
  if (stats.totalValue === 0 && stats.totalTokens === 0) {
    return (
      <motion.div
        initial="initial"
        animate="animate"
        variants={fadeInUp}
      >
        <Card 
          data-testid="portfolio-overview-card" 
          data-empty="true"
          className="relative overflow-hidden border-border-default bg-gradient-to-br from-bg-secondary to-bg-tertiary"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-green-500/5" />
          <CardHeader className="relative">
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-purple-500" />
              Portfolio Overview
            </CardTitle>
          </CardHeader>
          <CardContent className="relative">
            <motion.div
              className="text-center py-12"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
              >
                <Wallet className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              </motion.div>
              <p className="text-muted-foreground mb-2 font-medium">No tokens or positions found</p>
              <p className="text-sm text-muted-foreground">
                Your portfolio will appear here once you have tokens or DeFi positions
              </p>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  const isPositiveChange = (stats.change24h || 0) >= 0;

  return (
    <motion.div
      initial="initial"
      animate="animate"
      variants={fadeInUp}
    >
      <motion.div
        variants={cardHoverVariants}
        initial="rest"
        whileHover="hover"
        animate="rest"
      >
        <Card 
          data-testid="portfolio-overview-card"
          className="relative overflow-hidden border-border-default bg-gradient-to-br from-bg-secondary to-bg-tertiary backdrop-blur-xl"
        >
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-green-500/5 pointer-events-none" />
          
          <CardHeader className="relative pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-purple-500" />
                Portfolio Overview
              </CardTitle>
              {stats.sparklineData && stats.sparklineData.length > 0 && (
                <Sparkline 
                  data={stats.sparklineData}
                  width={80}
                  height={24}
                  color={isPositiveChange ? '#14F195' : '#FF4747'}
                />
              )}
            </div>
          </CardHeader>
          
          <CardContent className="relative space-y-6">
            {/* Main Stats Grid with stagger animation */}
            <motion.div 
              className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
              variants={staggerContainer}
              initial="initial"
              animate="animate"
            >
              {/* Total Value - Featured */}
              <motion.div 
                variants={staggerItem}
                className="sm:col-span-2 lg:col-span-1 p-4 rounded-lg bg-gradient-to-br from-purple-500/10 to-transparent border border-purple-500/20"
              >
                <div className="flex items-center gap-2 text-sm text-purple-400 mb-2">
                  <DollarSign className="h-4 w-4" />
                  <span className="font-medium">Total Value</span>
                </div>
                <div className="flex items-baseline gap-2">
                  <CountUpUSD
                    value={stats.totalValue}
                    className="text-3xl font-bold text-white"
                    duration={1500}
                    enableScrollSpy={false}
                  />
                </div>
                {stats.sparklineData && (
                  <div className="mt-2">
                    <Sparkline 
                      data={stats.sparklineData}
                      width={120}
                      height={32}
                      strokeWidth={1.5}
                    />
                  </div>
                )}
              </motion.div>

              {/* 24h Change */}
              <motion.div 
                variants={staggerItem}
                className={cn(
                  "p-4 rounded-lg border",
                  isPositiveChange 
                    ? "bg-green-500/10 border-green-500/20" 
                    : "bg-red-500/10 border-red-500/20"
                )}
              >
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                  {isPositiveChange ? (
                    <TrendingUp className="h-4 w-4 text-green-500" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-red-500" />
                  )}
                  <span className="font-medium">24h Change</span>
                </div>
                <div className="space-y-1">
                  <div className={cn(
                    "text-2xl font-bold",
                    isPositiveChange ? "text-green-500" : "text-red-500"
                  )}>
                    <span>{isPositiveChange ? '+' : '-'}</span>
                    <CountUpUSD
                      value={Math.abs(stats.change24h || 0)}
                      className=""
                      duration={1200}
                    />
                  </div>
                  <div className="text-sm opacity-80">
                    <CountUpPercentage
                      value={stats.changePercent24h || 0}
                      className={isPositiveChange ? "text-green-500" : "text-red-500"}
                      duration={1000}
                    />
                  </div>
                </div>
              </motion.div>

              {/* Total Tokens */}
              <motion.div 
                variants={staggerItem}
                className="p-4 rounded-lg bg-gradient-to-br from-cyan-500/10 to-transparent border border-cyan-500/20"
              >
                <div className="flex items-center gap-2 text-sm text-cyan-400 mb-2">
                  <Coins className="h-4 w-4" />
                  <span className="font-medium">Total Tokens</span>
                </div>
                <CountUp
                  value={stats.totalTokens}
                  className="text-3xl font-bold text-white"
                  duration={1000}
                />
              </motion.div>

              {/* Active Positions */}
              <motion.div 
                variants={staggerItem}
                className="p-4 rounded-lg bg-gradient-to-br from-pink-500/10 to-transparent border border-pink-500/20"
              >
                <div className="flex items-center gap-2 text-sm text-pink-400 mb-2">
                  <Activity className="h-4 w-4" />
                  <span className="font-medium">Active Positions</span>
                </div>
                <CountUp
                  value={stats.totalPositions || 0}
                  className="text-3xl font-bold text-white"
                  duration={800}
                />
                <div className="text-xs text-muted-foreground mt-1">
                  across {stats.totalProtocols || 0} protocols
                </div>
              </motion.div>
            </motion.div>

            {/* Multi-period Changes */}
            <motion.div 
              className="border-t border-border-default pt-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <div className="flex items-center justify-between flex-wrap gap-4">
                <span className="text-sm font-medium text-muted-foreground">Performance Metrics</span>
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
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}