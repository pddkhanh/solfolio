'use client';

import { useState, useEffect, useMemo } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
// Note: Using native select until shadcn/ui select component is added
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { formatUSD, formatNumber } from '@/lib/utils';
import { TrendingUp, TrendingDown, Minus, LineChart } from 'lucide-react';

interface HistoricalDataPoint {
  timestamp: string;
  date: string;
  value: number;
  percentageChange?: number;
}

interface HistoricalData {
  wallet: string;
  dataPoints: HistoricalDataPoint[];
  currentValue: number;
  previousValue: number;
  changeAmount: number;
  changePercentage: number;
  period: string;
}

type TimePeriod = '24h' | '7d' | '30d' | '90d' | 'all';

const TIME_PERIOD_LABELS: Record<TimePeriod, string> = {
  '24h': '24 Hours',
  '7d': '7 Days',
  '30d': '30 Days',
  '90d': '90 Days',
  'all': 'All Time',
};

// Custom tooltip component
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload[0]) {
    const data = payload[0];
    return (
      <div className="bg-background border rounded-lg shadow-lg p-3">
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="font-semibold">{formatUSD(data.value)}</p>
        {data.payload.percentageChange !== undefined && (
          <p className={`text-sm ${data.payload.percentageChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
            {data.payload.percentageChange >= 0 ? '+' : ''}{formatNumber(data.payload.percentageChange)}%
          </p>
        )}
      </div>
    );
  }
  return null;
};

// Generate mock historical data for demonstration
const generateMockData = (period: TimePeriod, currentValue: number): HistoricalDataPoint[] => {
  const now = new Date();
  const dataPoints: HistoricalDataPoint[] = [];
  
  let intervals: number;
  let hoursPerInterval: number;
  
  switch (period) {
    case '24h':
      intervals = 24;
      hoursPerInterval = 1;
      break;
    case '7d':
      intervals = 28;
      hoursPerInterval = 6;
      break;
    case '30d':
      intervals = 30;
      hoursPerInterval = 24;
      break;
    case '90d':
      intervals = 30;
      hoursPerInterval = 72;
      break;
    case 'all':
      intervals = 30;
      hoursPerInterval = 168; // Weekly
      break;
    default:
      intervals = 24;
      hoursPerInterval = 1;
  }
  
  // Generate realistic price movements
  let value = currentValue * (1 - Math.random() * 0.3); // Start 0-30% lower
  const volatility = 0.05; // 5% volatility
  
  for (let i = intervals; i >= 0; i--) {
    const date = new Date(now.getTime() - i * hoursPerInterval * 60 * 60 * 1000);
    
    // Random walk with mean reversion towards current value
    const randomChange = (Math.random() - 0.5) * volatility;
    const meanReversion = (currentValue - value) / (intervals * 2);
    value = value * (1 + randomChange) + meanReversion;
    
    // Ensure value stays positive
    value = Math.max(value, currentValue * 0.1);
    
    const percentageChange = i > 0 ? 
      ((value - dataPoints[dataPoints.length - 1]?.value || value) / (dataPoints[dataPoints.length - 1]?.value || value)) * 100 : 
      0;
    
    dataPoints.push({
      timestamp: date.toISOString(),
      date: formatDateForPeriod(date, period),
      value: value,
      percentageChange,
    });
  }
  
  // Ensure the last value matches the current value
  if (dataPoints.length > 0) {
    dataPoints[dataPoints.length - 1].value = currentValue;
  }
  
  return dataPoints;
};

function formatDateForPeriod(date: Date, period: TimePeriod): string {
  const options: Intl.DateTimeFormatOptions = {};
  
  switch (period) {
    case '24h':
      return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    case '7d':
      return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    case '30d':
    case '90d':
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    case 'all':
      return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    default:
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }
}

export function HistoricalValueChart() {
  const { publicKey, connected } = useWallet();
  const [period, setPeriod] = useState<TimePeriod>('7d');
  const [historicalData, setHistoricalData] = useState<HistoricalData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPortfolioValue, setCurrentPortfolioValue] = useState<number>(0);

  // Fetch current portfolio value
  useEffect(() => {
    if (connected && publicKey) {
      fetchCurrentValue();
    } else {
      setCurrentPortfolioValue(0);
      setHistoricalData(null);
    }
  }, [connected, publicKey]);

  // Generate historical data when period or value changes
  useEffect(() => {
    if (currentPortfolioValue > 0 && publicKey) {
      generateHistoricalData();
    }
  }, [period, currentPortfolioValue, publicKey]);

  const fetchCurrentValue = async () => {
    if (!publicKey) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/wallet/balances/${publicKey.toString()}`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch portfolio value');
      }

      const data = await response.json();
      setCurrentPortfolioValue(data.totalValueUSD || 0);
    } catch (err) {
      console.error('Error fetching portfolio value:', err);
      setError('Failed to load portfolio value');
      setCurrentPortfolioValue(0);
    } finally {
      setLoading(false);
    }
  };

  const generateHistoricalData = () => {
    if (!publicKey || currentPortfolioValue <= 0) return;

    const dataPoints = generateMockData(period, currentPortfolioValue);
    
    if (dataPoints.length < 2) {
      setHistoricalData(null);
      return;
    }

    const previousValue = dataPoints[0].value;
    const currentValue = dataPoints[dataPoints.length - 1].value;
    const changeAmount = currentValue - previousValue;
    const changePercentage = (changeAmount / previousValue) * 100;

    setHistoricalData({
      wallet: publicKey.toString(),
      dataPoints,
      currentValue,
      previousValue,
      changeAmount,
      changePercentage,
      period,
    });
  };

  // Calculate chart domain for better visualization
  const chartDomain = useMemo(() => {
    if (!historicalData || historicalData.dataPoints.length === 0) {
      return [0, 100];
    }

    const values = historicalData.dataPoints.map(d => d.value);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const padding = (max - min) * 0.1;

    return [Math.max(0, min - padding), max + padding];
  }, [historicalData]);

  // Determine trend icon
  const TrendIcon = useMemo(() => {
    if (!historicalData) return Minus;
    if (historicalData.changePercentage > 0.5) return TrendingUp;
    if (historicalData.changePercentage < -0.5) return TrendingDown;
    return Minus;
  }, [historicalData]);

  const trendColor = useMemo(() => {
    if (!historicalData) return 'text-muted-foreground';
    if (historicalData.changePercentage > 0) return 'text-green-500';
    if (historicalData.changePercentage < 0) return 'text-red-500';
    return 'text-muted-foreground';
  }, [historicalData]);

  if (!connected) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Card className="overflow-hidden border-purple-500/10">
          <CardHeader className="bg-gradient-to-r from-purple-500/5 to-green-500/5">
            <CardTitle className="bg-gradient-to-r from-purple-500 to-green-500 bg-clip-text text-transparent">
              Portfolio Value History
            </CardTitle>
            <CardDescription>Track your portfolio performance over time</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <EmptyState
              variant="no-wallet"
              icon={<LineChart className="w-16 h-16" />}
              title="Connect to View History"
              description="Track your portfolio's performance over time with beautiful charts and insights"
              action={{
                label: "Connect Wallet",
                onClick: () => {
                  const button = document.querySelector('[data-testid="wallet-connect-button"]') as HTMLButtonElement;
                  if (button) button.click();
                },
              }}
              className="py-12"
              animated={true}
            />
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Portfolio Value History</CardTitle>
            <CardDescription>Track your portfolio performance over time</CardDescription>
          </div>
          <select 
            value={period} 
            onChange={(e) => setPeriod(e.target.value as TimePeriod)}
            className="w-[120px] px-3 py-2 text-sm rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          >
            {Object.entries(TIME_PERIOD_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Skeleton className="h-8 w-32" />
              <Skeleton className="h-6 w-24" />
            </div>
            <Skeleton className="h-[300px] w-full" />
          </div>
        ) : error ? (
          <EmptyState
            variant="error"
            title="Unable to Load Chart"
            description={error}
            action={{
              label: "Try Again",
              onClick: () => fetchCurrentValue(),
            }}
            className="py-8"
            animated={true}
          />
        ) : historicalData && historicalData.dataPoints.length > 0 ? (
          <div className="space-y-4">
            {/* Value and Change Display */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">{formatUSD(currentPortfolioValue)}</p>
                <div className={`flex items-center gap-1 ${trendColor}`}>
                  <TrendIcon className="h-4 w-4" />
                  <span className="text-sm font-medium">
                    {historicalData.changeAmount >= 0 ? '+' : ''}
                    {formatUSD(historicalData.changeAmount)}
                  </span>
                  <span className="text-sm">
                    ({historicalData.changePercentage >= 0 ? '+' : ''}
                    {formatNumber(historicalData.changePercentage)}%)
                  </span>
                </div>
              </div>
            </div>

            {/* Chart */}
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart
                data={historicalData.dataPoints}
                margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 12 }}
                  className="text-muted-foreground"
                  interval="preserveStartEnd"
                />
                <YAxis
                  domain={chartDomain}
                  tick={{ fontSize: 12 }}
                  className="text-muted-foreground"
                  tickFormatter={(value) => `$${formatNumber(value)}`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorValue)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <EmptyState
            variant="custom"
            icon={<LineChart className="w-16 h-16" />}
            title="No Historical Data"
            description={currentPortfolioValue > 0 
              ? "Historical data will be available soon. Check back later to see your portfolio's performance over time." 
              : "Add tokens to your wallet to start tracking your portfolio history"}
            action={currentPortfolioValue === 0 ? {
              label: "Get Started",
              onClick: () => window.open('https://jupiter.ag', '_blank'),
            } : undefined}
            className="py-8"
            animated={true}
          />
        )}
      </CardContent>
    </Card>
  );
}