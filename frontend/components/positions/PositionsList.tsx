'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { motion, AnimatePresence } from 'framer-motion';
import { PositionCard } from './PositionCard';
import { PositionCardsGridSkeleton } from './PositionCardSkeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RefreshCw, TrendingUp, DollarSign, Percent, Wallet, Sparkles } from 'lucide-react';
import { PortfolioFilters, type SortOption, type FilterType } from '@/components/filters/PortfolioFilters';
import { MOCK_POSITIONS, isMockMode } from '@/lib/mock-data';
import { staggerContainer } from '@/lib/animations';

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
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('value');
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [hideSmallBalances, setHideSmallBalances] = useState(false);
  const [selectedProtocol, setSelectedProtocol] = useState('all');

  const fetchPositions = async (refresh = false) => {
    if (!publicKey) return;

    try {
      if (refresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      // Use mock data if explicitly enabled
      if (isMockMode()) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        const mockPortfolio: PortfolioSummary = {
          walletAddress: publicKey.toString(),
          totalValue: MOCK_POSITIONS.reduce((sum, p) => sum + p.value, 0),
          totalPositions: MOCK_POSITIONS.length,
          positions: MOCK_POSITIONS.map(p => ({
            protocol: p.protocol.toLowerCase(),
            protocolName: p.protocol,
            positionType: p.type,
            tokenSymbol: p.tokens[0]?.symbol,
            amount: p.tokens[0]?.amount || 0,
            usdValue: p.value,
            apy: p.apy,
            rewards: p.rewards
          })),
          breakdown: {
            tokens: 0,
            staking: 815.26,
            lending: 500,
            liquidity: 1200,
            other: 0
          },
          performance: {
            totalApy: 8.2,
            dailyRewards: 0.75,
            monthlyRewards: 22.5
          }
        };
        setPortfolio(mockPortfolio);
        setLoading(false);
        setRefreshing(false);
        return;
      }

      const response = await fetch(
        `/api/positions/${publicKey.toString()}/summary${refresh ? '?refresh=true' : ''}`
      );

      if (!response.ok) {
        // Handle 404 as no positions
        if (response.status === 404) {
          setPortfolio({
            walletAddress: publicKey.toString(),
            totalValue: 0,
            totalPositions: 0,
            positions: [],
            breakdown: {
              tokens: 0,
              staking: 0,
              lending: 0,
              liquidity: 0,
              other: 0
            },
            performance: {
              totalApy: 0,
              dailyRewards: 0,
              monthlyRewards: 0
            }
          });
          return;
        }
        throw new Error(`Failed to fetch positions: ${response.statusText}`);
      }

      const result = await response.json();
      
      if (result.success) {
        setPortfolio(result.data);
      } else {
        throw new Error(result.error || 'Failed to fetch positions');
      }
    } catch (err) {
      console.error('Error fetching positions:', err);
      
      // Better error messages
      if (err instanceof TypeError && err.message.includes('fetch')) {
        setError('Unable to connect to portfolio service');
      } else {
        setError(err instanceof Error ? err.message : 'Failed to fetch positions');
      }
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

  // Get unique protocols from positions
  const availableProtocols = useMemo(() => {
    if (!portfolio) return [];
    const protocols = new Set(portfolio.positions.map(p => p.protocolName));
    return Array.from(protocols).sort();
  }, [portfolio]);

  // Filter and sort positions
  const filteredPositions = useMemo(() => {
    if (!portfolio) return [];
    
    let positions = [...portfolio.positions];

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      positions = positions.filter((position) => {
        const protocol = (position.protocolName || '').toLowerCase();
        const type = (position.positionType || '').toLowerCase();
        const symbol = (position.tokenSymbol || '').toLowerCase();
        const name = (position.tokenName || '').toLowerCase();
        return (
          protocol.includes(query) ||
          type.includes(query) ||
          symbol.includes(query) ||
          name.includes(query)
        );
      });
    }

    // Filter by type
    if (filterType !== 'all' && filterType !== 'tokens') {
      positions = positions.filter((position) => {
        const type = position.positionType.toLowerCase();
        switch (filterType) {
          case 'staking':
            return type.includes('stak');
          case 'lending':
            return type.includes('lend');
          case 'liquidity':
            return type.includes('liquid') || type.includes('lp');
          default:
            return true;
        }
      });
    }

    // Filter by protocol
    if (selectedProtocol !== 'all') {
      positions = positions.filter(p => p.protocolName === selectedProtocol);
    }

    // Filter small balances
    if (hideSmallBalances) {
      positions = positions.filter(p => p.usdValue >= 1);
    }

    // Sort positions
    switch (sortBy) {
      case 'value':
        return positions.sort((a, b) => b.usdValue - a.usdValue);
      case 'amount':
        return positions.sort((a, b) => b.amount - a.amount);
      case 'name':
        return positions.sort((a, b) => {
          const nameA = a.tokenSymbol || '';
          const nameB = b.tokenSymbol || '';
          return nameA.localeCompare(nameB);
        });
      case 'apy':
        return positions.sort((a, b) => (b.apy || 0) - (a.apy || 0));
      case 'protocol':
        return positions.sort((a, b) => {
          const protocolA = a.protocolName || '';
          const protocolB = b.protocolName || '';
          return protocolA.localeCompare(protocolB);
        });
      default:
        return positions;
    }
  }, [portfolio, searchQuery, filterType, selectedProtocol, hideSmallBalances, sortBy]);

  if (!publicKey) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col items-center justify-center min-h-[400px] p-8"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 500 }}
          className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500/20 to-cyan-500/20 flex items-center justify-center mb-4"
        >
          <Wallet className="w-10 h-10 text-purple-400" />
        </motion.div>
        <h3 className="text-xl font-semibold text-white mb-2">Connect Your Wallet</h3>
        <p className="text-gray-400 text-center max-w-md">
          Connect your Solana wallet to view your DeFi positions across all supported protocols
        </p>
      </motion.div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Stats skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="relative rounded-xl bg-gradient-to-r from-purple-500/5 via-cyan-500/5 to-purple-500/5 p-[1px]"
            >
              <div className="rounded-xl bg-[#16171F] p-4">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-full bg-white/5 animate-pulse" />
                  <div className="h-3 w-24 bg-white/5 rounded animate-pulse" />
                </div>
                <div className="h-7 w-32 bg-white/5 rounded animate-pulse mb-2" />
                <div className="h-3 w-20 bg-white/5 rounded animate-pulse" />
              </div>
            </motion.div>
          ))}
        </div>
        
        {/* Section header skeleton */}
        <div className="flex items-center justify-between">
          <div className="h-6 w-32 bg-white/5 rounded animate-pulse" />
          <div className="h-8 w-24 bg-white/5 rounded animate-pulse" />
        </div>
        
        {/* Position cards skeleton */}
        <PositionCardsGridSkeleton count={6} />
      </div>
    );
  }

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center min-h-[400px] p-8"
      >
        <div className="w-20 h-20 rounded-full bg-red-500/10 flex items-center justify-center mb-4">
          <span className="text-3xl">❌</span>
        </div>
        <h3 className="text-xl font-semibold text-white mb-2">Error Loading Positions</h3>
        <p className="text-red-400 text-center max-w-md mb-4">{error}</p>
        <button
          onClick={() => fetchPositions(true)}
          className="px-4 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-cyan-500 text-white font-medium hover:opacity-90 transition-opacity"
        >
          Try Again
        </button>
      </motion.div>
    );
  }

  if (!portfolio || portfolio.positions.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col items-center justify-center min-h-[400px] p-8"
      >
        <motion.div
          animate={{ rotate: [0, 10, -10, 0] }}
          transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
          className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500/20 to-cyan-500/20 flex items-center justify-center mb-4"
        >
          <Sparkles className="w-10 h-10 text-purple-400" />
        </motion.div>
        <h3 className="text-xl font-semibold text-white mb-2">No Positions Yet</h3>
        <p className="text-gray-400 text-center max-w-md">
          Start by staking SOL or providing liquidity on supported protocols to see your positions here!
        </p>
      </motion.div>
    );
  }

  const stakingValue = portfolio.breakdown.staking || 0;
  const hasPositions = portfolio.positions.length > 0;

  return (
    <div className="space-y-6">
      {/* Portfolio Stats with animations */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative group"
        >
          <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-500/10 to-cyan-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl" />
          <div className="relative rounded-xl bg-gradient-to-r from-purple-500/5 via-transparent to-cyan-500/5 p-[1px]">
            <div className="rounded-xl bg-[#16171F] p-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="p-2 rounded-full bg-purple-500/10">
                  <DollarSign className="w-4 h-4 text-purple-400" />
                </div>
                <span className="text-sm text-gray-400">Total Staked Value</span>
              </div>
              <motion.div
                key={stakingValue}
                initial={{ scale: 1.1 }}
                animate={{ scale: 1 }}
                className="text-2xl font-bold text-white"
              >
                {formatUSD(stakingValue)}
              </motion.div>
              <p className="text-xs text-gray-500 mt-1">
                Across {portfolio.totalPositions} position{portfolio.totalPositions !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="relative group"
        >
          <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-green-500/10 to-emerald-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl" />
          <div className="relative rounded-xl bg-gradient-to-r from-green-500/5 via-transparent to-emerald-500/5 p-[1px]">
            <div className="rounded-xl bg-[#16171F] p-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="p-2 rounded-full bg-green-500/10">
                  <Percent className="w-4 h-4 text-green-400" />
                </div>
                <span className="text-sm text-gray-400">Average APY</span>
              </div>
              <motion.div
                key={portfolio.performance.totalApy}
                initial={{ scale: 1.1 }}
                animate={{ scale: 1 }}
                className="text-2xl font-bold text-green-400"
              >
                {formatNumber(portfolio.performance.totalApy)}%
              </motion.div>
              <p className="text-xs text-gray-500 mt-1">
                Weighted by position value
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="relative group"
        >
          <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/10 to-cyan-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl" />
          <div className="relative rounded-xl bg-gradient-to-r from-blue-500/5 via-transparent to-cyan-500/5 p-[1px]">
            <div className="rounded-xl bg-[#16171F] p-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="p-2 rounded-full bg-blue-500/10">
                  <TrendingUp className="w-4 h-4 text-blue-400" />
                </div>
                <span className="text-sm text-gray-400">Monthly Rewards</span>
              </div>
              <motion.div
                key={portfolio.performance.monthlyRewards}
                initial={{ scale: 1.1 }}
                animate={{ scale: 1 }}
                className="text-2xl font-bold text-blue-400"
              >
                {formatUSD(portfolio.performance.monthlyRewards)}
              </motion.div>
              <p className="text-xs text-gray-500 mt-1">
                ≈ {formatUSD(portfolio.performance.dailyRewards)}/day
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Section Header with animation */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="flex items-center justify-between mb-4"
      >
        <h2 className="text-xl font-semibold text-white">DeFi Positions</h2>
        <motion.button
          onClick={() => fetchPositions(true)}
          disabled={refreshing}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''} text-gray-400`} />
          <span className="text-sm text-gray-400">Refresh</span>
        </motion.button>
      </motion.div>

      {/* Filters */}
      <PortfolioFilters
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        sortBy={sortBy}
        onSortChange={setSortBy}
        filterType={filterType}
        onFilterTypeChange={setFilterType}
        hideSmallBalances={hideSmallBalances}
        onHideSmallBalancesChange={setHideSmallBalances}
        showProtocolFilter={true}
        protocols={availableProtocols}
        selectedProtocol={selectedProtocol}
        onProtocolChange={setSelectedProtocol}
        showApySort={true}
        className="mb-6"
      />

      {/* Position Cards with stagger animation */}
      <AnimatePresence mode="wait">
        {filteredPositions.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="col-span-full text-center py-16 text-gray-400"
          >
            <div className="w-16 h-16 rounded-full bg-gray-800 flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🔍</span>
            </div>
            <p className="text-lg">
              {searchQuery || filterType !== 'all' || hideSmallBalances || selectedProtocol !== 'all'
                ? 'No positions match your filters'
                : 'No positions found'}
            </p>
            {(searchQuery || filterType !== 'all' || hideSmallBalances || selectedProtocol !== 'all') && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setFilterType('all');
                  setHideSmallBalances(false);
                  setSelectedProtocol('all');
                }}
                className="mt-4 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-sm text-gray-300 transition-colors"
              >
                Clear Filters
              </button>
            )}
          </motion.div>
        ) : (
          <motion.div
            variants={staggerContainer}
            initial="initial"
            animate="animate"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            {filteredPositions.map((position, index) => (
              <PositionCard key={`${position.protocol}-${index}`} position={position} index={index} />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Breakdown by Type with animations */}
      {hasPositions && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="relative rounded-xl bg-gradient-to-r from-purple-500/5 via-transparent to-cyan-500/5 p-[1px]"
        >
          <div className="rounded-xl bg-[#16171F] p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Portfolio Breakdown</h3>
            <div className="space-y-4">
              {portfolio.breakdown.staking > 0 && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 }}
                  className="flex justify-between items-center"
                >
                  <span className="text-sm text-gray-400">Staking</span>
                  <div className="flex items-center gap-3">
                    <div className="w-32 bg-white/5 rounded-full h-2 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(portfolio.breakdown.staking / stakingValue) * 100}%` }}
                        transition={{ duration: 1, delay: 0.7 }}
                        className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full"
                      />
                    </div>
                    <span className="text-sm font-medium min-w-[80px] text-right text-white">
                      {formatUSD(portfolio.breakdown.staking)}
                    </span>
                  </div>
                </motion.div>
              )}
              {portfolio.breakdown.lending > 0 && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7 }}
                  className="flex justify-between items-center"
                >
                  <span className="text-sm text-gray-400">Lending</span>
                  <div className="flex items-center gap-3">
                    <div className="w-32 bg-white/5 rounded-full h-2 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(portfolio.breakdown.lending / stakingValue) * 100}%` }}
                        transition={{ duration: 1, delay: 0.8 }}
                        className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2 rounded-full"
                      />
                    </div>
                    <span className="text-sm font-medium min-w-[80px] text-right text-white">
                      {formatUSD(portfolio.breakdown.lending)}
                    </span>
                  </div>
                </motion.div>
              )}
              {portfolio.breakdown.liquidity > 0 && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.8 }}
                  className="flex justify-between items-center"
                >
                  <span className="text-sm text-gray-400">Liquidity</span>
                  <div className="flex items-center gap-3">
                    <div className="w-32 bg-white/5 rounded-full h-2 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(portfolio.breakdown.liquidity / stakingValue) * 100}%` }}
                        transition={{ duration: 1, delay: 0.9 }}
                        className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full"
                      />
                    </div>
                    <span className="text-sm font-medium min-w-[80px] text-right text-white">
                      {formatUSD(portfolio.breakdown.liquidity)}
                    </span>
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}