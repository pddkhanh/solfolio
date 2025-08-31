'use client';

import { motion } from 'framer-motion';
import { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  ReferenceLine,
} from 'recharts';
import { TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import { TimePeriod } from '@/app/analytics/page';

interface PnLChartProps {
  timePeriod: TimePeriod;
  selectedAsset: string | null;
}

const generatePnLData = (period: TimePeriod, asset: string | null) => {
  const dataPoints = {
    '24h': 24,
    '7d': 7,
    '30d': 30,
    '90d': 12, // Weekly
    '1y': 12, // Monthly
    'all': 20,
  };

  const points = dataPoints[period];
  const data = [];

  for (let i = 0; i < points; i++) {
    const profit = (Math.random() - 0.3) * 5000;
    data.push({
      period: period === '24h' ? `${i}:00` : 
              period === '7d' ? `Day ${i + 1}` :
              period === '30d' ? `${i + 1}` :
              period === '90d' ? `W${i + 1}` :
              period === '1y' ? `M${i + 1}` :
              `P${i + 1}`,
      pnl: Math.round(profit),
      realized: Math.round(profit * 0.6),
      unrealized: Math.round(profit * 0.4),
    });
  }

  return data;
};

export default function PnLChart({ timePeriod, selectedAsset }: PnLChartProps) {
  const data = useMemo(() => generatePnLData(timePeriod, selectedAsset), [timePeriod, selectedAsset]);
  
  const totalPnL = data.reduce((sum, item) => sum + item.pnl, 0);
  const totalRealized = data.reduce((sum, item) => sum + item.realized, 0);
  const totalUnrealized = data.reduce((sum, item) => sum + item.unrealized, 0);
  const winRate = (data.filter(item => item.pnl > 0).length / data.length) * 100;

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const value = payload[0].value;
      const isProfit = value >= 0;
      
      return (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-bg-tertiary border border-border-default rounded-lg p-3 shadow-xl"
        >
          <p className="text-text-secondary text-sm mb-2">{label}</p>
          <div className="flex items-center gap-2">
            {isProfit ? (
              <TrendingUp className="w-4 h-4 text-success" />
            ) : (
              <TrendingDown className="w-4 h-4 text-danger" />
            )}
            <span className={`font-semibold ${isProfit ? 'text-success' : 'text-danger'}`}>
              {isProfit ? '+' : ''}${Math.abs(value).toLocaleString()}
            </span>
          </div>
          {payload[0].payload.realized !== undefined && (
            <>
              <div className="text-xs text-text-muted mt-2">
                Realized: ${payload[0].payload.realized.toLocaleString()}
              </div>
              <div className="text-xs text-text-muted">
                Unrealized: ${payload[0].payload.unrealized.toLocaleString()}
              </div>
            </>
          )}
        </motion.div>
      );
    }
    return null;
  };

  const getBarColor = (value: number) => {
    return value >= 0 ? '#14F195' : '#FF4747';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-bg-secondary border border-border-default rounded-xl p-6"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-white mb-1">
            Profit & Loss
          </h2>
          <p className="text-text-secondary text-sm">
            {selectedAsset ? `${selectedAsset} P&L` : 'Portfolio P&L'} over {timePeriod}
          </p>
        </div>
        <div className="text-right">
          <p className="text-text-muted text-xs mb-1">Total P&L</p>
          <p className={`text-xl font-bold ${totalPnL >= 0 ? 'text-success' : 'text-danger'}`}>
            {totalPnL >= 0 ? '+' : ''}${Math.abs(totalPnL).toLocaleString()}
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-bg-tertiary rounded-lg p-3 border border-border-default"
        >
          <p className="text-text-muted text-xs mb-1">Win Rate</p>
          <p className="text-white font-semibold">{winRate.toFixed(1)}%</p>
        </motion.div>
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-bg-tertiary rounded-lg p-3 border border-border-default"
        >
          <p className="text-text-muted text-xs mb-1">Realized</p>
          <p className={`font-semibold ${totalRealized >= 0 ? 'text-success' : 'text-danger'}`}>
            ${Math.abs(totalRealized).toLocaleString()}
          </p>
        </motion.div>
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-bg-tertiary rounded-lg p-3 border border-border-default"
        >
          <p className="text-text-muted text-xs mb-1">Unrealized</p>
          <p className={`font-semibold ${totalUnrealized >= 0 ? 'text-success' : 'text-danger'}`}>
            ${Math.abs(totalUnrealized).toLocaleString()}
          </p>
        </motion.div>
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-bg-tertiary rounded-lg p-3 border border-border-default"
        >
          <p className="text-text-muted text-xs mb-1">Avg P&L</p>
          <p className="text-white font-semibold">
            ${Math.abs(Math.round(totalPnL / data.length)).toLocaleString()}
          </p>
        </motion.div>
      </div>

      {/* Chart */}
      <div className="h-[300px] -mx-2">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 10, right: 30, left: 0, bottom: 20 }}
          >
            <defs>
              <linearGradient id="profitGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#14F195" stopOpacity={1} />
                <stop offset="100%" stopColor="#14F195" stopOpacity={0.6} />
              </linearGradient>
              <linearGradient id="lossGradient" x1="0" y1="1" x2="0" y2="0">
                <stop offset="0%" stopColor="#FF4747" stopOpacity={1} />
                <stop offset="100%" stopColor="#FF4747" stopOpacity={0.6} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            
            <XAxis
              dataKey="period"
              stroke="#6B7280"
              tick={{ fill: '#6B7280', fontSize: 11 }}
            />
            
            <YAxis
              stroke="#6B7280"
              tick={{ fill: '#6B7280', fontSize: 11 }}
              tickFormatter={(value) => `$${(value / 1000).toFixed(1)}k`}
            />

            <Tooltip content={<CustomTooltip />} />

            <ReferenceLine y={0} stroke="rgba(255,255,255,0.2)" />

            <Bar
              dataKey="pnl"
              radius={[4, 4, 0, 0]}
              animationDuration={1000}
              animationBegin={0}
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.pnl >= 0 ? 'url(#profitGradient)' : 'url(#lossGradient)'}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}