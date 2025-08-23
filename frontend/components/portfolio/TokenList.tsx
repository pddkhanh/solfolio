'use client';

import { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { formatUSD, formatNumber, shortenAddress } from '@/lib/utils';
import { RefreshCw, ExternalLink, Copy, Check } from 'lucide-react';
import Image from 'next/image';

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
  const [sortBy, setSortBy] = useState<'value' | 'amount' | 'name'>('value');
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
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/wallet/balances/${publicKey.toString()}`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch balances');
      }

      const data = await response.json();
      setBalances(data);
    } catch (err) {
      console.error('Error fetching balances:', err);
      setError('Failed to load token balances');
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

  const getSortedTokens = () => {
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
        logoUri: '/sol-logo.png', // You'll need to add this logo
        balance: balances.nativeSol.amount,
        decimals: balances.nativeSol.decimals,
        uiAmount: balances.nativeSol.uiAmount,
        valueUSD: balances.nativeSol.uiAmount * solPrice,
      });
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
  };

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

  const sortedTokens = getSortedTokens();

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
        <div className="flex items-center gap-4 mb-4">
          <div className="flex items-center gap-2">
            <label className="text-sm text-muted-foreground">Sort by:</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="text-sm border rounded px-2 py-1"
            >
              <option value="value">Value</option>
              <option value="amount">Amount</option>
              <option value="name">Name</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="hideSmall"
              checked={hideSmallBalances}
              onChange={(e) => setHideSmallBalances(e.target.checked)}
            />
            <label htmlFor="hideSmall" className="text-sm text-muted-foreground">
              Hide small balances (&lt; $1)
            </label>
          </div>
        </div>

        {/* Token List */}
        <div className="space-y-4">
          {sortedTokens.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              No tokens found
            </p>
          ) : (
            sortedTokens.map((token) => {
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