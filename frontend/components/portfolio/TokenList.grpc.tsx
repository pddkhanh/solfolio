'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { formatUSD, formatNumber } from '@/lib/utils';
import { useGrpc } from '@/contexts/GrpcProvider';
import { useWallet } from '@solana/wallet-adapter-react';

export function TokenListGrpc() {
  const { connected } = useWallet();
  const { loading, error, tokens } = useGrpc();

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

  if (loading && tokens.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Token Balances</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center justify-between py-2">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="space-y-1">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
                <div className="text-right space-y-1">
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
          <p className="text-destructive text-center py-8">
            Failed to load token balances
          </p>
        </CardContent>
      </Card>
    );
  }

  if (tokens.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Token Balances</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">
            No tokens found in your wallet
          </p>
        </CardContent>
      </Card>
    );
  }

  const sortedTokens = [...tokens].sort((a, b) => b.value - a.value);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Token Balances</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {sortedTokens.map((token) => (
            <div
              key={token.mint}
              className="flex items-center justify-between py-2 hover:bg-muted/50 rounded-lg px-2 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-xs font-bold">
                    {token.symbol?.slice(0, 2).toUpperCase() || '??'}
                  </span>
                </div>
                <div>
                  <div className="font-medium">{token.symbol || 'Unknown'}</div>
                  <div className="text-sm text-muted-foreground">
                    {formatNumber(token.balance)} {token.symbol}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-medium">{formatUSD(token.value)}</div>
                <div className="text-sm text-muted-foreground">
                  ${formatNumber(token.price, 4)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}