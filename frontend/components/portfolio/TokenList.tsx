'use client';

import { useState, useEffect, useMemo } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { formatUSD, formatNumber, shortenAddress } from '@/lib/utils';
import { RefreshCw, ExternalLink, Copy, Check } from 'lucide-react';
import Image from 'next/image';
import { PortfolioFilters, type SortOption, type FilterType } from '@/components/filters/PortfolioFilters';
import { MOCK_TOKENS, isMockMode } from '@/lib/mock-data';

interface TokenBalance {
  mint: string;
  symbol?: string;
  name?: string;
  logoUri?: string;
  balance: string;
  decimals: number;
  uiAmount?: number;
  valueUSD: number;
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
      <Card>
        <CardHeader>
          <CardTitle>Token Balances</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">
            Connect your wallet to view your tokens
          </p>
        </CardContent>
      </Card>
    );
  }

  if (loading && !balances) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Token Balances</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center gap-4">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-32" />
                </div>
                <div className="text-right space-y-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-3 w-16" />
                </div>
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
          <CardTitle>Token Balances</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-destructive text-center py-8">{error}</p>
          <div className="flex justify-center">
            <Button onClick={handleRefresh} variant="outline">
              <RefreshCw className="mr-2 h-4 w-4" />
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const filteredTokens = getFilteredAndSortedTokens;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Token Balances</CardTitle>
          <div className="flex items-center gap-2">
            <Button
              onClick={handleRefresh}
              variant="outline"
              size="sm"
              disabled={refreshing}
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
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

        {/* Token List */}
        <div className="space-y-4">
          {filteredTokens.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              {searchQuery || filterType !== 'all' || hideSmallBalances
                ? 'No tokens match your filters'
                : 'No tokens found'}
            </p>
          ) : (
            filteredTokens.map((token) => {
              const symbol = token.metadata?.symbol || token.symbol || 'Unknown';
              const name = token.metadata?.name || token.name || '';
              const logoUri = token.metadata?.logoUri || token.logoUri;
              
              return (
                <div
                  key={token.mint}
                  className="flex items-center gap-4 p-4 rounded-lg border hover:bg-muted/50 transition-colors"
                >
                  {/* Token Icon */}
                  <div className="relative h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                    {logoUri ? (
                      <Image
                        src={logoUri}
                        alt={symbol}
                        width={40}
                        height={40}
                        className="rounded-full"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    ) : (
                      <span className="text-xs font-bold">{symbol.slice(0, 2)}</span>
                    )}
                  </div>

                  {/* Token Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{symbol}</span>
                      {name && (
                        <span className="text-sm text-muted-foreground">{name}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{shortenAddress(token.mint)}</span>
                      <button
                        onClick={() => copyToClipboard(token.mint)}
                        className="hover:text-primary transition-colors"
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
                        className="hover:text-primary transition-colors"
                      >
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  </div>

                  {/* Token Balance & Value */}
                  <div className="text-right">
                    <div className="font-semibold">
                      {formatUSD(token.valueUSD)}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {formatNumber(token.uiAmount || 0)} {symbol}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Last Updated */}
        {balances && (
          <div className="text-xs text-muted-foreground text-center mt-4">
            Last updated: {new Date(balances.lastUpdated).toLocaleTimeString()}
          </div>
        )}
      </CardContent>
    </Card>
  );
}