'use client';

import { motion } from 'framer-motion';
import { useState, useMemo } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ReferenceLine,
} from 'recharts';
import { Calendar, TrendingUp, Info } from 'lucide-react';
import { TimePeriod } from '@/app/analytics/page';

interface PerformanceChartProps {
  timePeriod: TimePeriod;
  onAssetSelect: (asset: string | null) => void;
}

// Generate mock data based on time period
const generateMockData = (period: TimePeriod) => {
  const dataPoints = {
    '24h': 24,
    '7d': 7 * 4,
    '30d': 30,
    '90d': 90,
    '1y': 52,
    'all': 100,
  };

  const points = dataPoints[period];
  const baseValue = 100000;
  const data = [];

  for (let i = 0; i < points; i++) {
    const variance = Math.random() * 0.1 - 0.05;
    const trend = i * 0.002;
    const value = baseValue * (1 + variance + trend);
    
    data.push({
      date: new Date(Date.now() - (points - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      portfolio: Math.round(value),
      benchmark: Math.round(baseValue * (1 + trend * 0.8)),
      sol: Math.round(value * 0.3),
      usdc: Math.round(value * 0.2),
      ray: Math.round(value * 0.15),
      other: Math.round(value * 0.35),
    });
  }

  return data;
};

export default function PerformanceChart({ timePeriod, onAssetSelect }: PerformanceChartProps) {
  const [selectedLines, setSelectedLines] = useState({
    portfolio: true,
    benchmark: true,
    sol: false,
    usdc: false,
    ray: false,
    other: false,
  });

  const data = useMemo(() => generateMockData(timePeriod), [timePeriod]);

  const toggleLine = (key: keyof typeof selectedLines) => {
    setSelectedLines(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-bg-tertiary border border-border-default rounded-lg p-4 shadow-xl"
        >
          <p className="text-text-secondary text-sm mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: entry.color }}
                />
                <span className="text-text-secondary text-sm capitalize">
                  {entry.dataKey}
                </span>
              </div>
              <span className="text-white font-medium">
                ${entry.value.toLocaleString()}
              </span>
            </div>
          ))}
        </motion.div>
      );
    }
    return null;
  };

  const CustomLegend = ({ payload }: any) => {
    return (
      <div className="flex flex-wrap gap-3 justify-center mt-4">
        {payload.map((entry: any, index: number) => (
          <motion.button
            key={entry.value}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => toggleLine(entry.value as keyof typeof selectedLines)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all ${
              selectedLines[entry.value as keyof typeof selectedLines]
                ? 'bg-bg-tertiary border-border-hover'
                : 'bg-bg-secondary border-border-default opacity-50'
            }`}
          >
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-text-secondary text-sm capitalize">
              {entry.value}
            </span>
          </motion.button>
        ))}
      </div>
    );
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
            Portfolio Performance
          </h2>
          <p className="text-text-secondary text-sm flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Historical performance over {timePeriod}
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="p-2 rounded-lg bg-bg-tertiary border border-border-default hover:border-border-hover transition-all"
        >
          <Info className="w-4 h-4 text-text-secondary" />
        </motion.button>
      </div>

      {/* Chart */}
      <div className="h-[400px] -mx-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 10, right: 30, left: 0, bottom: 40 }}
          >
            <defs>
              <linearGradient id="portfolioGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#9945FF" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#9945FF" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="benchmarkGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#14F195" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#14F195" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="solGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#00D4FF" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#00D4FF" stopOpacity={0} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            
            <XAxis
              dataKey="date"
              stroke="#6B7280"
              tick={{ fill: '#6B7280', fontSize: 12 }}
              tickFormatter={(value) => {
                const date = new Date(value);
                return date.toLocaleDateString('en', { month: 'short', day: 'numeric' });
              }}
            />
            
            <YAxis
              stroke="#6B7280"
              tick={{ fill: '#6B7280', fontSize: 12 }}
              tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
            />

            <Tooltip content={<CustomTooltip />} />

            <ReferenceLine
              y={100000}
              stroke="rgba(255,255,255,0.1)"
              strokeDasharray="5 5"
              label={{ value: "Initial", fill: "#6B7280", fontSize: 12 }}
            />

            {selectedLines.portfolio && (
              <Area
                type="monotone"
                dataKey="portfolio"
                stroke="#9945FF"
                strokeWidth={2}
                fill="url(#portfolioGradient)"
                animationDuration={1000}
                onClick={() => onAssetSelect('portfolio')}
              />
            )}

            {selectedLines.benchmark && (
              <Area
                type="monotone"
                dataKey="benchmark"
                stroke="#14F195"
                strokeWidth={2}
                fill="url(#benchmarkGradient)"
                animationDuration={1200}
                onClick={() => onAssetSelect('benchmark')}
              />
            )}

            {selectedLines.sol && (
              <Area
                type="monotone"
                dataKey="sol"
                stroke="#00D4FF"
                strokeWidth={2}
                fill="url(#solGradient)"
                animationDuration={1400}
                onClick={() => onAssetSelect('sol')}
              />
            )}

            <Legend content={<CustomLegend />} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mt-6">
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-bg-tertiary rounded-lg p-3 border border-border-default"
        >
          <p className="text-text-muted text-xs mb-1">Peak Value</p>
          <p className="text-white font-semibold">$142,853</p>
          <p className="text-success text-xs mt-1">+42.8%</p>
        </motion.div>
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-bg-tertiary rounded-lg p-3 border border-border-default"
        >
          <p className="text-text-muted text-xs mb-1">Low Value</p>
          <p className="text-white font-semibold">$98,432</p>
          <p className="text-danger text-xs mt-1">-1.6%</p>
        </motion.div>
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-bg-tertiary rounded-lg p-3 border border-border-default"
        >
          <p className="text-text-muted text-xs mb-1">Volatility</p>
          <p className="text-white font-semibold">18.2%</p>
          <p className="text-text-secondary text-xs mt-1">Medium</p>
        </motion.div>
      </div>
    </motion.div>
  );
}