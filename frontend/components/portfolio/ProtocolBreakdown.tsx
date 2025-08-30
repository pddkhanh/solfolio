'use client';

import { useState, useEffect, useMemo } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend } from 'recharts';
import { formatUSD, formatNumber } from '@/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Layers, DollarSign, Percent } from 'lucide-react';

interface ProtocolData {
  protocol: string;
  type: string;
  totalValue: number;
  positions: number;
  apy: number;
  rewards: number;
  percentage: number;
}

interface ProtocolBreakdownData {
  walletAddress: string;
  protocols: ProtocolData[];
  totalValue: number;
  totalProtocols: number;
  lastUpdated: string;
}

// Protocol colors mapping
const PROTOCOL_COLORS: Record<string, string> = {
  'Marinade': '#3b82f6', // blue
  'Kamino': '#8b5cf6', // violet
  'Jito': '#ec4899', // pink
  'Orca': '#14b8a6', // teal
  'Raydium': '#f97316', // orange
  'Wallet Tokens': '#6b7280', // gray
  'Others': '#9ca3af', // lighter gray
};

// Fallback colors for unknown protocols
const FALLBACK_COLORS = [
  '#84cc16', // lime
  '#6366f1', // indigo
  '#f59e0b', // amber
  '#ef4444', // red
  '#10b981', // emerald
];

// Custom tooltip component
const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload[0]) {
    const data = payload[0].payload;
    return (
      <div className="bg-background border rounded-lg shadow-lg p-3">
        <p className="font-semibold">{data.protocol}</p>
        <p className="text-sm text-muted-foreground">
          Value: {formatUSD(data.totalValue)}
        </p>
        <p className="text-sm text-muted-foreground">
          Share: {formatNumber(data.percentage)}%
        </p>
        {data.apy > 0 && (
          <p className="text-sm text-muted-foreground">
            APY: {formatNumber(data.apy)}%
          </p>
        )}
        <p className="text-sm text-muted-foreground">
          Positions: {data.positions}
        </p>
      </div>
    );
  }
  return null;
};

const getProtocolColor = (protocol: string, index: number): string => {
  return PROTOCOL_COLORS[protocol] || FALLBACK_COLORS[index % FALLBACK_COLORS.length];
};

export function ProtocolBreakdown() {
  const { publicKey, connected } = useWallet();
  const [data, setData] = useState<ProtocolBreakdownData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [viewType, setViewType] = useState<'bar' | 'pie'>('bar');

  useEffect(() => {
    if (connected && publicKey) {
      fetchProtocolBreakdown();
    } else {
      setData(null);
    }
  }, [connected, publicKey]);

  const fetchProtocolBreakdown = async () => {
    if (!publicKey) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/positions/${publicKey.toString()}/protocol-breakdown`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch protocol breakdown');
      }

      const result = await response.json();
      setData(result.data);
    } catch (err) {
      console.error('Error fetching protocol breakdown:', err);
      setError('Failed to load protocol breakdown');
    } finally {
      setLoading(false);
    }
  };

  // Calculate summary statistics
  const stats = useMemo(() => {
    if (!data || !data.protocols) return null;

    const defiProtocols = data.protocols.filter(p => p.type !== 'TOKENS');
    const totalDefiValue = defiProtocols.reduce((sum, p) => sum + p.totalValue, 0);
    const totalPositions = data.protocols.reduce((sum, p) => sum + p.positions, 0);
    const weightedApy = defiProtocols.reduce((sum, p) => {
      const weight = totalDefiValue > 0 ? p.totalValue / totalDefiValue : 0;
      return sum + (p.apy * weight);
    }, 0);

    return {
      totalValue: data.totalValue,
      totalProtocols: defiProtocols.length,
      totalPositions,
      averageApy: weightedApy,
      largestProtocol: data.protocols[0],
    };
  }, [data]);

  if (!connected) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Protocol Breakdown</CardTitle>
          <CardDescription>Distribution across DeFi protocols</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">
            Connect your wallet to view protocol breakdown
          </p>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Protocol Breakdown</CardTitle>
          <CardDescription>Distribution across DeFi protocols</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-8 w-32" />
                </div>
              ))}
            </div>
            <Skeleton className="h-[400px] w-full rounded-lg" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Protocol Breakdown</CardTitle>
          <CardDescription>Distribution across DeFi protocols</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-destructive text-center py-8">{error}</p>
        </CardContent>
      </Card>
    );
  }

  if (!data || !data.protocols || data.protocols.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Protocol Breakdown</CardTitle>
          <CardDescription>Distribution across DeFi protocols</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">
            No protocol positions found
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Protocol Breakdown</CardTitle>
        <CardDescription>
          Distribution across {stats?.totalProtocols || 0} DeFi protocols
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Summary Stats */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <DollarSign className="h-4 w-4" />
                <span>Total Value</span>
              </div>
              <p className="text-2xl font-bold">{formatUSD(stats.totalValue)}</p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Layers className="h-4 w-4" />
                <span>Protocols</span>
              </div>
              <p className="text-2xl font-bold">{stats.totalProtocols}</p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Percent className="h-4 w-4" />
                <span>Avg APY</span>
              </div>
              <p className="text-2xl font-bold">{formatNumber(stats.averageApy)}%</p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <TrendingUp className="h-4 w-4" />
                <span>Largest</span>
              </div>
              <p className="text-lg font-bold">{stats.largestProtocol?.protocol}</p>
              <p className="text-sm text-muted-foreground">
                {formatNumber(stats.largestProtocol?.percentage)}%
              </p>
            </div>
          </div>
        )}

        {/* Chart Tabs */}
        <Tabs value={viewType} onValueChange={(v) => setViewType(v as 'bar' | 'pie')}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="bar">Bar Chart</TabsTrigger>
            <TabsTrigger value="pie">Pie Chart</TabsTrigger>
          </TabsList>

          <TabsContent value="bar" className="mt-4">
            <div className="h-[400px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={data.protocols}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis 
                    dataKey="protocol" 
                    tick={{ fontSize: 12 }}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis 
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="totalValue" radius={[8, 8, 0, 0]}>
                    {data.protocols.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={getProtocolColor(entry.protocol, index)} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>

          <TabsContent value="pie" className="mt-4">
            <div className="h-[400px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.protocols}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(entry) => entry.percentage > 5 ? `${formatNumber(entry.percentage)}%` : ''}
                    outerRadius="80%"
                    fill="#8884d8"
                    dataKey="totalValue"
                    animationBegin={0}
                    animationDuration={800}
                  >
                    {data.protocols.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={getProtocolColor(entry.protocol, index)}
                        className="hover:opacity-80 transition-opacity cursor-pointer stroke-background"
                        strokeWidth={2}
                      />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend 
                    verticalAlign="bottom" 
                    height={36}
                    wrapperStyle={{
                      paddingTop: '20px',
                      fontSize: '12px',
                    }}
                    formatter={(value) => value}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>
        </Tabs>

        {/* Protocol List */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-muted-foreground">Protocol Details</h3>
          {data.protocols.map((protocol, index) => (
            <div
              key={protocol.protocol}
              className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: getProtocolColor(protocol.protocol, index) }}
                />
                <div>
                  <p className="font-medium">{protocol.protocol}</p>
                  <p className="text-sm text-muted-foreground">
                    {protocol.positions} position{protocol.positions !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                {protocol.apy > 0 && (
                  <Badge variant="secondary" className="font-mono">
                    {formatNumber(protocol.apy)}% APY
                  </Badge>
                )}
                <div className="text-right">
                  <p className="font-semibold">{formatUSD(protocol.totalValue)}</p>
                  <p className="text-sm text-muted-foreground">{formatNumber(protocol.percentage)}%</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}