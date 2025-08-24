'use client';

import { useState, useEffect, useMemo } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { formatUSD, formatNumber } from '@/lib/utils';

interface TokenBalance {
  mint: string;
  symbol?: string;
  name?: string;
  balance: string;
  decimals: number;
  uiAmount?: number;
  valueUSD: number;
}

interface WalletBalances {
  wallet: string;
  nativeSol?: {
    amount: string;
    decimals: number;
    uiAmount: number;
    valueUSD?: number;
  };
  tokens: TokenBalance[];
  totalValueUSD: number;
  lastUpdated: string;
}

interface ChartData {
  name: string;
  value: number;
  percentage: number;
}

// Define a color palette for the pie chart
const COLORS = [
  '#0ea5e9', // sky-500
  '#8b5cf6', // violet-500
  '#ec4899', // pink-500
  '#f97316', // orange-500
  '#84cc16', // lime-500
  '#14b8a6', // teal-500
  '#6366f1', // indigo-500
  '#f59e0b', // amber-500
  '#ef4444', // red-500
  '#10b981', // emerald-500
];

// Custom tooltip component
const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload[0]) {
    const data = payload[0];
    return (
      <div className="bg-background border rounded-lg shadow-lg p-3">
        <p className="font-semibold">{data.name}</p>
        <p className="text-sm text-muted-foreground">
          Value: {formatUSD(data.value)}
        </p>
        <p className="text-sm text-muted-foreground">
          Share: {formatNumber(data.payload.percentage)}%
        </p>
      </div>
    );
  }
  return null;
};

// Custom label for the pie slices
const renderCustomLabel = (entry: ChartData) => {
  // Only show label if the slice is more than 5% of the total
  if (entry.percentage > 5) {
    return `${formatNumber(entry.percentage)}%`;
  }
  return '';
};

export function PortfolioPieChart() {
  const { publicKey, connected } = useWallet();
  const [balances, setBalances] = useState<WalletBalances | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (connected && publicKey) {
      fetchBalances();
    } else {
      setBalances(null);
    }
  }, [connected, publicKey]);

  const fetchBalances = async () => {
    if (!publicKey) return;

    setLoading(true);
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
      setError('Failed to load portfolio data');
    } finally {
      setLoading(false);
    }
  };

  // Process data for the pie chart
  const chartData = useMemo<ChartData[]>(() => {
    if (!balances) return [];

    const data: ChartData[] = [];
    const totalValue = balances.totalValueUSD;

    if (totalValue === 0) return [];

    // Add native SOL if it has value
    if (balances.nativeSol && balances.nativeSol.valueUSD && balances.nativeSol.valueUSD > 0) {
      const percentage = (balances.nativeSol.valueUSD / totalValue) * 100;
      data.push({
        name: 'SOL',
        value: balances.nativeSol.valueUSD,
        percentage,
      });
    }

    // Add tokens
    balances.tokens
      .filter(token => token.valueUSD > 0)
      .sort((a, b) => b.valueUSD - a.valueUSD)
      .forEach(token => {
        const percentage = (token.valueUSD / totalValue) * 100;
        const name = token.symbol || token.name || 'Unknown';
        
        // Group small holdings (less than 1%) into "Others"
        if (percentage < 1 && data.length >= 9) {
          const othersIndex = data.findIndex(item => item.name === 'Others');
          if (othersIndex >= 0) {
            data[othersIndex].value += token.valueUSD;
            data[othersIndex].percentage += percentage;
          } else {
            data.push({
              name: 'Others',
              value: token.valueUSD,
              percentage,
            });
          }
        } else {
          data.push({
            name,
            value: token.valueUSD,
            percentage,
          });
        }
      });

    // Sort by value descending, but keep "Others" at the end
    return data.sort((a, b) => {
      if (a.name === 'Others') return 1;
      if (b.name === 'Others') return -1;
      return b.value - a.value;
    });
  }, [balances]);

  if (!connected) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Portfolio Distribution</CardTitle>
          <CardDescription>Token allocation by value</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">
            Connect your wallet to view portfolio distribution
          </p>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Portfolio Distribution</CardTitle>
          <CardDescription>Token allocation by value</CardDescription>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[400px] w-full" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Portfolio Distribution</CardTitle>
          <CardDescription>Token allocation by value</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-destructive text-center py-8">{error}</p>
        </CardContent>
      </Card>
    );
  }

  if (!balances || chartData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Portfolio Distribution</CardTitle>
          <CardDescription>Token allocation by value</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">
            No tokens found in your wallet
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Portfolio Distribution</CardTitle>
        <CardDescription>
          Token allocation by value - Total: {formatUSD(balances.totalValueUSD)}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={renderCustomLabel}
              outerRadius={120}
              fill="#8884d8"
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={COLORS[index % COLORS.length]}
                  className="hover:opacity-80 transition-opacity cursor-pointer"
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              verticalAlign="bottom" 
              height={36}
              formatter={(value, entry: any) => (
                <span className="text-sm">
                  {value} ({formatNumber(entry.payload.percentage)}%)
                </span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}