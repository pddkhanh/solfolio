'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';
import { formatUSD, formatNumber, cn } from '@/lib/utils';
import { TrendingUp, TrendingDown, Minus, LineChart, Clock } from 'lucide-react';

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

type TimePeriod = '1h' | '24h' | '7d' | '30d' | '90d' | 'all';

const TIME_PERIOD_LABELS: Record<TimePeriod, string> = {
  '1h': '1 Hour',
  '24h': '24 Hours',
  '7d': '7 Days',
  '30d': '30 Days',
  '90d': '90 Days',
  'all': 'All Time',
};

// Time period button configuration for styling
const TIME_PERIOD_CONFIG: Record<TimePeriod, { label: string; shortLabel: string }> = {
  '1h': { label: '1 Hour', shortLabel: '1H' },
  '24h': { label: '24 Hours', shortLabel: '24H' },
  '7d': { label: '7 Days', shortLabel: '7D' },
  '30d': { label: '30 Days', shortLabel: '30D' },
  '90d': { label: '90 Days', shortLabel: '90D' },
  'all': { label: 'All Time', shortLabel: 'ALL' },
};

// Enhanced custom tooltip with glassmorphism effect
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload[0]) {
    const data = payload[0];
    const isPositive = data.payload.percentageChange >= 0;
    
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.15 }}
        className="relative"
      >
        <div className="bg-background/95 backdrop-blur-lg border border-border-default rounded-lg shadow-xl p-3 min-w-[180px]">
          <div className="flex items-center gap-2 mb-1">
            <Clock className="w-3 h-3 text-muted-foreground" />
            <p className="text-xs text-muted-foreground font-medium">{label}</p>
          </div>
          <p className="text-lg font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            {formatUSD(data.value)}
          </p>
          {data.payload.percentageChange !== undefined && (
            <div className="flex items-center gap-1 mt-1">
              {isPositive ? (
                <TrendingUp className="w-3 h-3 text-green-500" />
              ) : (
                <TrendingDown className="w-3 h-3 text-red-500" />
              )}
              <p className={cn(
                "text-sm font-medium",
                isPositive ? 'text-green-500' : 'text-red-500'
              )}>
                {isPositive ? '+' : ''}{formatNumber(data.payload.percentageChange)}%
              </p>
            </div>
          )}
        </div>
        {/* Tooltip arrow */}
        <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-background/95 border-b border-r border-border-default rotate-45" />
      </motion.div>
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
    case '1h':
      intervals = 12;
      hoursPerInterval = 0.083; // 5 minutes
      break;
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
  switch (period) {
    case '1h':
      return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
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
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [hoveredDataPoint, setHoveredDataPoint] = useState<number | null>(null);
  const chartRef = useRef<HTMLDivElement>(null);

  // Fetch current portfolio value
  useEffect(() => {
    if (connected && publicKey) {
      fetchCurrentValue();
    } else {
      setCurrentPortfolioValue(0);
      setHistoricalData(null);
    }
  }, [connected, publicKey]);

  // Generate historical data when period or value changes with smooth transition
  useEffect(() => {
    if (currentPortfolioValue > 0 && publicKey) {
      setIsTransitioning(true);
      const timer = setTimeout(() => {
        generateHistoricalData();
        setIsTransitioning(false);
      }, 150);
      return () => clearTimeout(timer);
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
    <Card className="overflow-hidden">
      <CardHeader className="pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            <CardTitle className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Portfolio Value History
            </CardTitle>
            <CardDescription>Track your portfolio performance over time</CardDescription>
          </motion.div>
          
          {/* Enhanced time period selector with animation */}
          <motion.div 
            className="flex gap-1 p-1 bg-background/50 backdrop-blur-sm rounded-lg border border-border-default"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            {Object.entries(TIME_PERIOD_CONFIG).map(([value, config], index) => (
              <motion.button
                key={value}
                onClick={() => setPeriod(value as TimePeriod)}
                className={cn(
                  "relative px-3 py-1.5 text-xs font-medium rounded-md transition-all duration-200",
                  "hover:text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50",
                  period === value
                    ? "text-foreground"
                    : "text-muted-foreground hover:bg-background/80"
                )}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: index * 0.05 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {period === value && (
                  <motion.div
                    layoutId="activePeriod"
                    className="absolute inset-0 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-md border border-primary/30"
                    initial={false}
                    transition={{
                      type: "spring",
                      stiffness: 500,
                      damping: 30
                    }}
                  />
                )}
                <span className="relative z-10 hidden sm:inline">{config.label}</span>
                <span className="relative z-10 sm:hidden">{config.shortLabel}</span>
              </motion.button>
            ))}
          </motion.div>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <motion.div 
            className="space-y-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <Skeleton className="h-8 w-32 bg-gradient-to-r from-gray-800 to-gray-700" />
                <Skeleton className="h-4 w-24 bg-gradient-to-r from-gray-800 to-gray-700" />
              </div>
              <Skeleton className="h-6 w-20 bg-gradient-to-r from-gray-800 to-gray-700" />
            </div>
            <div className="relative h-[320px] w-full overflow-hidden rounded-lg">
              <Skeleton className="h-full w-full bg-gradient-to-r from-gray-800 to-gray-700" />
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent"
                animate={{ x: [-1000, 1000] }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "linear"
                }}
              />
            </div>
          </motion.div>
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
          <AnimatePresence mode="wait">
            <motion.div 
              key={period}
              className="space-y-4"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              {/* Enhanced Value and Change Display */}
              <motion.div 
                className="flex items-center justify-between"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
              >
                <div>
                  <motion.p 
                    className="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent"
                    initial={{ scale: 0.9 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  >
                    {formatUSD(currentPortfolioValue)}
                  </motion.p>
                  <motion.div 
                    className={cn("flex items-center gap-2 mt-1", trendColor)}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    <motion.div
                      animate={{ 
                        y: historicalData.changePercentage > 0 ? [0, -2, 0] : historicalData.changePercentage < 0 ? [0, 2, 0] : 0
                      }}
                      transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 3 }}
                    >
                      <TrendIcon className="h-4 w-4" />
                    </motion.div>
                    <span className="text-sm font-semibold">
                      {historicalData.changeAmount >= 0 ? '+' : ''}
                      {formatUSD(historicalData.changeAmount)}
                    </span>
                    <span className="text-sm opacity-80">
                      ({historicalData.changePercentage >= 0 ? '+' : ''}
                      {formatNumber(historicalData.changePercentage)}%)
                    </span>
                  </motion.div>
                </div>
                <motion.div
                  className="text-right"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  <p className="text-xs text-muted-foreground">{TIME_PERIOD_LABELS[period]}</p>
                  <p className="text-xs text-muted-foreground/70">Performance</p>
                </motion.div>
              </motion.div>

              {/* Enhanced Chart with Solana gradients */}
              <motion.div
                ref={chartRef}
                className="relative"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: isTransitioning ? 0.5 : 1, scale: 1 }}
                transition={{ duration: 0.3, delay: 0.2 }}
              >
                <ResponsiveContainer width="100%" height={320}>
                  <AreaChart
                    data={historicalData.dataPoints}
                    margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                    onMouseMove={(e: any) => {
                      if (e && e.activeTooltipIndex !== undefined && typeof e.activeTooltipIndex === 'number') {
                        setHoveredDataPoint(e.activeTooltipIndex);
                      }
                    }}
                    onMouseLeave={() => setHoveredDataPoint(null)}
                  >
                    <defs>
                      {/* Solana gradient */}
                      <linearGradient id="solanaGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#9945FF" stopOpacity={0.4} />
                        <stop offset="50%" stopColor="#14F195" stopOpacity={0.2} />
                        <stop offset="100%" stopColor="#14F195" stopOpacity={0} />
                      </linearGradient>
                      {/* Line gradient */}
                      <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#9945FF" />
                        <stop offset="100%" stopColor="#14F195" />
                      </linearGradient>
                      {/* Positive gradient */}
                      <linearGradient id="positiveGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#14F195" stopOpacity={0.3} />
                        <stop offset="100%" stopColor="#14F195" stopOpacity={0} />
                      </linearGradient>
                      {/* Negative gradient */}
                      <linearGradient id="negativeGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#FF4747" stopOpacity={0.3} />
                        <stop offset="100%" stopColor="#FF4747" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    
                    <CartesianGrid 
                      strokeDasharray="3 3" 
                      stroke="rgba(255, 255, 255, 0.05)"
                      vertical={false}
                    />
                    
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 11, fill: 'rgba(255, 255, 255, 0.5)' }}
                      stroke="rgba(255, 255, 255, 0.1)"
                      interval="preserveStartEnd"
                      tickMargin={8}
                    />
                    
                    <YAxis
                      domain={chartDomain}
                      tick={{ fontSize: 11, fill: 'rgba(255, 255, 255, 0.5)' }}
                      stroke="rgba(255, 255, 255, 0.1)"
                      tickFormatter={(value) => `$${formatNumber(value)}`}
                      width={60}
                    />
                    
                    {/* Reference line at starting value */}
                    {historicalData && (
                      <ReferenceLine 
                        y={historicalData.previousValue} 
                        stroke="rgba(255, 255, 255, 0.2)"
                        strokeDasharray="5 5"
                        label={{ 
                          value: "Start", 
                          position: "left",
                          style: { fill: 'rgba(255, 255, 255, 0.3)', fontSize: 10 }
                        }}
                      />
                    )}
                    
                    {/* Hover crosshair */}
                    {hoveredDataPoint !== null && historicalData && (
                      <ReferenceLine 
                        x={historicalData.dataPoints[hoveredDataPoint]?.date}
                        stroke="rgba(255, 255, 255, 0.15)"
                        strokeDasharray="3 3"
                      />
                    )}
                    
                    <Tooltip 
                      content={<CustomTooltip />}
                      cursor={{
                        stroke: 'rgba(153, 69, 255, 0.2)',
                        strokeWidth: 1,
                        strokeDasharray: '5 5'
                      }}
                      animationDuration={200}
                      animationEasing="ease-out"
                    />
                    
                    <Area
                      type="monotone"
                      dataKey="value"
                      stroke="url(#lineGradient)"
                      strokeWidth={2.5}
                      fillOpacity={1}
                      fill={historicalData.changePercentage >= 0 ? "url(#solanaGradient)" : "url(#negativeGradient)"}
                      animationDuration={600}
                      animationEasing="ease-out"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </motion.div>
            </motion.div>
          </AnimatePresence>
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