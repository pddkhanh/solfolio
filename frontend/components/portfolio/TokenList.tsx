'use client';

import { useState, useEffect, useMemo, useCallback, ReactNode } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton, SkeletonTokenRow, SkeletonContainer } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { Button } from '@/components/ui/button';
import { VirtualList } from '@/components/ui/virtual-list';
import { Sparkline, generateMockPriceData } from '@/components/ui/sparkline';
import { SwipeableRow } from '@/components/ui/swipeable-row';
import { formatUSD, formatNumber, shortenAddress, cn } from '@/lib/utils';
import { RefreshCw, ExternalLink, Copy, Check, TrendingUp, TrendingDown, Minus, ArrowUpDown, Send, Repeat } from 'lucide-react';
import Image from 'next/image';
import { PortfolioFilters, type SortOption, type FilterType } from '@/components/filters/PortfolioFilters';
import { MOCK_TOKENS, isMockMode, type MockToken } from '@/lib/mock-data';

interface TokenBalance {
  mint: string;
  symbol?: string;
  name?: string;
  logoUri?: string;
  balance: string;
  decimals: number;
  uiAmount?: number;
  valueUSD: number;
  priceHistory?: number[];
  change24h?: number;
  changePercent24h?: number;
  metadata?: {
    symbol: string;
    name: string;
    logoUri?: string;
  };
}

interface WalletBalances {
  wallet: string;
  nativeSol?: {
    amount: string;
    decimals: number;
    uiAmount: number;
  };
  tokens: TokenBalance[];
  totalValueUSD: number;
  lastUpdated: string;
}

export function TokenList() {
  const { publicKey, connected } = useWallet();
  const [balances, setBalances] = useState<WalletBalances | null>(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedMint, setCopiedMint] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('value');
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [hideSmallBalances, setHideSmallBalances] = useState(false);

  useEffect(() => {
    if (connected && publicKey) {
      fetchBalances();
    } else {
      setBalances(null);
    }
  }, [connected, publicKey]);

  const fetchBalances = async (isRefresh = false) => {
    if (!publicKey) return;

    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);

    try {
      // Use mock data if explicitly enabled
      if (isMockMode()) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        setBalances({
          wallet: publicKey.toString(),
          tokens: MOCK_TOKENS.map(t => ({
            mint: t.mint,
            symbol: t.symbol,
            name: t.name,
            logoUri: `/tokens/${t.symbol.toLowerCase()}.png`,
            balance: t.balance.toString(),
            decimals: t.decimals,
            uiAmount: t.balance,
            valueUSD: t.value,
            priceHistory: t.priceHistory || generateMockPriceData(),
            change24h: t.change24h,
            changePercent24h: t.changePercent24h,
            metadata: {
              symbol: t.symbol,
              name: t.name,
              logoUri: `/tokens/${t.symbol.toLowerCase()}.png`
            }
          })),
          totalValueUSD: MOCK_TOKENS.reduce((sum, t) => sum + t.value, 0),
          lastUpdated: new Date().toISOString()
        });
        setLoading(false);
        setRefreshing(false);
        return;
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/wallet/balances/${publicKey.toString()}`
      );

      if (!response.ok) {
        // Handle 404 as empty wallet
        if (response.status === 404) {
          setBalances({
            wallet: publicKey.toString(),
            tokens: [],
            totalValueUSD: 0,
            lastUpdated: new Date().toISOString()
          });
          return;
        }
        throw new Error(`Failed to fetch balances: ${response.statusText}`);
      }

      const data = await response.json();
      setBalances(data);
    } catch (err) {
      console.error('Error fetching balances:', err);
      
      // Better error messages
      if (err instanceof TypeError && err.message.includes('fetch')) {
        setError('Unable to connect to portfolio service');
      } else {
        setError('Failed to load token balances');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    fetchBalances(true);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedMint(text);
    setTimeout(() => setCopiedMint(null), 2000);
  };

  // Animation variants (defined before any conditional returns)
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4,
        ease: [0.4, 0, 0.2, 1] as const,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.3,
        ease: [0.4, 0, 0.2, 1] as const,
      },
    },
    exit: {
      opacity: 0,
      x: 20,
      transition: {
        duration: 0.2,
      },
    },
  };

  // Render individual token row (must be before any conditional returns)
  const renderTokenRow = useCallback((token: TokenBalance, index: number) => {
    const symbol = token.metadata?.symbol || token.symbol || 'Unknown';
    const name = token.metadata?.name || token.name || '';
    const logoUri = token.metadata?.logoUri || token.logoUri;
    const changePercent = token.changePercent24h || 0;
    const isPositive = changePercent > 0;
    const isNeutral = changePercent === 0;
    
    const tokenRow = (
      <motion.div
        layout
        layoutId={token.mint}
        variants={itemVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className={cn(
          "group relative flex items-center gap-4 p-4 rounded-xl border transition-all duration-200",
          "bg-gradient-to-r from-transparent to-transparent",
          "hover:from-purple-500/5 hover:to-green-500/5",
          "hover:border-purple-500/20 hover:shadow-lg hover:shadow-purple-500/10",
          "cursor-pointer"
        )}
        style={{
          animationDelay: `${index * 0.05}s`,
        }}
      >
        {/* Token Icon with Fallback */}
        <div className="relative h-12 w-12 rounded-full bg-gradient-to-br from-purple-500/20 to-green-500/20 p-[1px]">
          <div className="h-full w-full rounded-full bg-background flex items-center justify-center overflow-hidden">
            {logoUri ? (
              <Image
                src={logoUri}
                alt={symbol}
                width={40}
                height={40}
                className="rounded-full"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  const parent = target.parentElement;
                  if (parent) {
                    const fallback = document.createElement('div');
                    fallback.className = 'text-xs font-bold bg-gradient-to-br from-purple-500 to-green-500 bg-clip-text text-transparent';
                    fallback.textContent = symbol.slice(0, 3);
                    parent.appendChild(fallback);
                  }
                }}
              />
            ) : (
              <div className="text-xs font-bold bg-gradient-to-br from-purple-500 to-green-500 bg-clip-text text-transparent">
                {symbol.slice(0, 3)}
              </div>
            )}
          </div>
        </div>

        {/* Token Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-foreground">{symbol}</span>
            {name && (
              <span className="text-sm text-muted-foreground truncate">{name}</span>
            )}
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
            <span>{shortenAddress(token.mint)}</span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                copyToClipboard(token.mint);
              }}
              className="hover:text-primary transition-colors opacity-0 group-hover:opacity-100"
            >
              {copiedMint === token.mint ? (
                <Check className="h-3 w-3" />
              ) : (
                <Copy className="h-3 w-3" />
              )}
            </button>
            <a
              href={`https://solscan.io/token/${token.mint}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="hover:text-primary transition-colors opacity-0 group-hover:opacity-100"
            >
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>

        {/* Sparkline Chart */}
        <div className="hidden sm:block">
          <Sparkline
            data={token.priceHistory || generateMockPriceData()}
            width={80}
            height={32}
            animate={false}
          />
        </div>

        {/* Price Change */}
        <div className="flex items-center gap-1">
          {isPositive ? (
            <TrendingUp className="h-4 w-4 text-green-500" />
          ) : isNeutral ? (
            <Minus className="h-4 w-4 text-gray-500" />
          ) : (
            <TrendingDown className="h-4 w-4 text-red-500" />
          )}
          <span
            className={cn(
              "text-sm font-medium",
              isPositive ? "text-green-500" : isNeutral ? "text-gray-500" : "text-red-500"
            )}
          >
            {Math.abs(changePercent).toFixed(2)}%
          </span>
        </div>

        {/* Token Balance & Value */}
        <div className="text-right">
          <div className="font-semibold text-foreground">
            {formatUSD(token.valueUSD)}
          </div>
          <div className="text-sm text-muted-foreground">
            {formatNumber(token.uiAmount || 0)} {symbol}
          </div>
        </div>

        {/* Quick Actions (shown on hover) */}
        <div className="absolute right-4 top-1/2 -translate-y-1/2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none group-hover:pointer-events-auto">
          <Button
            size="sm"
            variant="ghost"
            className="h-8 w-8 p-0"
            onClick={(e) => {
              e.stopPropagation();
              // Handle send action
            }}
          >
            <Send className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="h-8 w-8 p-0"
            onClick={(e) => {
              e.stopPropagation();
              // Handle swap action
            }}
          >
            <Repeat className="h-4 w-4" />
          </Button>
        </div>
      </motion.div>
    );

    // Wrap with swipeable row for mobile
    return (
      <SwipeableRow
        leftAction={{
          icon: <Send className="h-5 w-5 text-white" />,
          label: 'Send',
          color: '#9945FF',
          onAction: () => {
            // Handle send action
            console.log('Send', symbol);
          },
        }}
        rightAction={{
          icon: <Repeat className="h-5 w-5 text-white" />,
          label: 'Swap',
          color: '#14F195',
          onAction: () => {
            // Handle swap action
            console.log('Swap', symbol);
          },
        }}
      >
        {tokenRow as ReactNode}
      </SwipeableRow>
    );
  }, [copiedMint, copyToClipboard, itemVariants]);

  const getFilteredAndSortedTokens = useMemo(() => {
    if (!balances) return [];

    let tokens = [...balances.tokens];

    // Add SOL as a token if it exists
    if (balances.nativeSol && balances.nativeSol.uiAmount > 0) {
      const solPrice = balances.totalValueUSD > 0 
        ? (balances.totalValueUSD - tokens.reduce((sum, t) => sum + t.valueUSD, 0)) / balances.nativeSol.uiAmount
        : 0;

      tokens.unshift({
        mint: 'So11111111111111111111111111111111111112',
        symbol: 'SOL',
        name: 'Solana',
        logoUri: '/sol-logo.png',
        balance: balances.nativeSol.amount,
        decimals: balances.nativeSol.decimals,
        uiAmount: balances.nativeSol.uiAmount,
        valueUSD: balances.nativeSol.uiAmount * solPrice,
      });
    }

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      tokens = tokens.filter((token) => {
        const symbol = (token.metadata?.symbol || token.symbol || '').toLowerCase();
        const name = (token.metadata?.name || token.name || '').toLowerCase();
        const mint = token.mint.toLowerCase();
        return symbol.includes(query) || name.includes(query) || mint.includes(query);
      });
    }

    // Filter by type (for tokens, we only show 'tokens' type)
    if (filterType !== 'all' && filterType !== 'tokens') {
      return []; // TokenList only shows tokens
    }

    // Filter small balances if enabled
    if (hideSmallBalances) {
      tokens = tokens.filter(t => t.valueUSD >= 1);
    }

    // Sort tokens
    switch (sortBy) {
      case 'value':
        return tokens.sort((a, b) => b.valueUSD - a.valueUSD);
      case 'amount':
        return tokens.sort((a, b) => (b.uiAmount || 0) - (a.uiAmount || 0));
      case 'name':
        return tokens.sort((a, b) => {
          const nameA = a.metadata?.symbol || a.symbol || '';
          const nameB = b.metadata?.symbol || b.symbol || '';
          return nameA.localeCompare(nameB);
        });
      default:
        return tokens;
    }
  }, [balances, searchQuery, filterType, hideSmallBalances, sortBy]);

  if (!connected) {
    return (
      <motion.div
        initial="hidden"
        animate="visible"
        variants={cardVariants}
      >
        <Card className="overflow-hidden border-purple-500/10">
          <CardHeader className="bg-gradient-to-r from-purple-500/5 to-green-500/5">
            <CardTitle className="bg-gradient-to-r from-purple-500 to-green-500 bg-clip-text text-transparent">
              Token Balances
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <EmptyState
              variant="no-wallet"
              action={{
                label: "Connect Wallet",
                onClick: () => {
                  // Trigger wallet connect modal
                  const button = document.querySelector('[data-testid="wallet-connect-button"]') as HTMLButtonElement;
                  if (button) button.click();
                },
              }}
            />
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  if (loading && !balances) {
    return (
      <motion.div
        initial="hidden"
        animate="visible"
        variants={cardVariants}
      >
        <Card className="overflow-hidden border-purple-500/10">
          <CardHeader className="bg-gradient-to-r from-purple-500/5 to-green-500/5">
            <div className="flex items-center gap-3">
              <Skeleton className="h-7 w-32" />
              <Skeleton className="h-5 w-16" />
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <SkeletonContainer className="space-y-2" staggerDelay={0.05}>
              {[1, 2, 3, 4, 5].map((i) => (
                <SkeletonTokenRow key={i} />
              ))}
            </SkeletonContainer>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  if (error) {
    return (
      <motion.div
        initial="hidden"
        animate="visible"
        variants={cardVariants}
      >
        <Card className="overflow-hidden border-red-500/10">
          <CardHeader className="bg-gradient-to-r from-red-500/5 to-orange-500/5">
            <CardTitle className="text-red-500">Token Balances</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <EmptyState
              variant="error"
              description={error}
              action={{
                label: "Try Again",
                onClick: handleRefresh,
              }}
            />
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  const filteredTokens = getFilteredAndSortedTokens;

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={cardVariants}
    >
      <Card className="overflow-hidden border-purple-500/10">
        <CardHeader className="bg-gradient-to-r from-purple-500/5 to-green-500/5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CardTitle className="bg-gradient-to-r from-purple-500 to-green-500 bg-clip-text text-transparent">
                Token Balances
              </CardTitle>
              {filteredTokens.length > 0 && (
                <span className="text-sm text-muted-foreground">
                  ({filteredTokens.length} tokens)
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button
                onClick={handleRefresh}
                variant="outline"
                size="sm"
                disabled={refreshing}
                className="border-purple-500/20 hover:border-purple-500/40"
              >
                <RefreshCw className={cn(
                  "h-4 w-4",
                  refreshing && "animate-spin"
                )} />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
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
            className="mb-6"
          />

          {/* Token List with Virtual Scrolling */}
          {filteredTokens.length === 0 ? (
            <EmptyState
              variant={searchQuery || filterType !== 'all' || hideSmallBalances ? "no-results" : "no-tokens"}
              description={
                searchQuery || filterType !== 'all' || hideSmallBalances
                  ? "No tokens match your current filters. Try adjusting your search or filter criteria."
                  : balances?.tokens?.length === 0 
                    ? "Your wallet doesn't have any tokens yet. Start by acquiring some SOL or other Solana tokens."
                    : "No tokens found in your wallet."
              }
              action={
                searchQuery || filterType !== 'all' || hideSmallBalances
                  ? {
                      label: "Clear Filters",
                      onClick: () => {
                        setSearchQuery('');
                        setFilterType('all');
                        setHideSmallBalances(false);
                      },
                    }
                  : balances?.tokens?.length === 0
                    ? {
                        label: "Get Started",
                        onClick: () => window.open('https://jupiter.ag', '_blank'),
                      }
                    : undefined
              }
              className="py-12"
              animated={true}
            />
          ) : (
            <LayoutGroup>
              <AnimatePresence mode="popLayout">
                {filteredTokens.length > 10 ? (
                  // Use virtual scrolling for large lists
                  <VirtualList
                    items={filteredTokens}
                    height={600}
                    itemHeight={80}
                    renderItem={renderTokenRow}
                    getItemKey={(item) => item.mint}
                    className="space-y-2"
                  />
                ) : (
                  // Regular rendering for small lists
                  <div className="space-y-2">
                    {filteredTokens.map((token, index) => (
                      <div key={token.mint}>
                        {renderTokenRow(token, index)}
                      </div>
                    ))}
                  </div>
                )}
              </AnimatePresence>
            </LayoutGroup>
          )}

          {/* Last Updated */}
          {balances && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-xs text-muted-foreground text-center mt-6 pt-4 border-t border-border/50"
            >
              Last updated: {new Date(balances.lastUpdated).toLocaleTimeString()}
            </motion.div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}