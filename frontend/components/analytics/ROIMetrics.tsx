'use client';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Calculator, TrendingUp, Award, Target, Zap } from 'lucide-react';
import { TimePeriod } from '@/app/analytics/page';

interface ROIMetricsProps {
  timePeriod: TimePeriod;
}

const performanceData = [
  { name: 'Profit', value: 68, color: '#14F195' },
  { name: 'Loss', value: 32, color: '#FF4747' },
];

export default function ROIMetrics({ timePeriod }: ROIMetricsProps) {
  const [animatedROI, setAnimatedROI] = useState(0);
  const targetROI = 24.8;

  useEffect(() => {
    const duration = 1500;
    const steps = 60;
    const increment = targetROI / steps;
    let current = 0;
    
    const timer = setInterval(() => {
      current += increment;
      if (current >= targetROI) {
        setAnimatedROI(targetROI);
        clearInterval(timer);
      } else {
        setAnimatedROI(current);
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, []);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-bg-tertiary border border-border-default rounded-lg p-2 shadow-xl"
        >
          <p className="text-white text-sm font-medium">
            {payload[0].name}: {payload[0].value}%
          </p>
        </motion.div>
      );
    }
    return null;
  };

  const metrics = [
    {
      label: 'Annual ROI',
      value: `${animatedROI.toFixed(1)}%`,
      icon: <TrendingUp className="w-4 h-4" />,
      color: 'text-success',
      change: '+12.3%',
    },
    {
      label: 'Sharpe Ratio',
      value: '1.82',
      icon: <Target className="w-4 h-4" />,
      color: 'text-accent',
      change: 'Good',
    },
    {
      label: 'Max Drawdown',
      value: '-18.2%',
      icon: <TrendingUp className="w-4 h-4 rotate-180" />,
      color: 'text-warning',
      change: 'Moderate',
    },
    {
      label: 'Alpha',
      value: '+8.4%',
      icon: <Award className="w-4 h-4" />,
      color: 'text-primary',
      change: 'vs Market',
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-bg-secondary border border-border-default rounded-xl p-6 h-full"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-white">ROI Analysis</h2>
        <Calculator className="w-5 h-5 text-text-secondary" />
      </div>

      {/* Main ROI Display */}
      <motion.div
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="text-center mb-6"
      >
        <p className="text-text-secondary text-sm mb-2">Total Return ({timePeriod})</p>
        <div className="flex items-center justify-center gap-2">
          <motion.span
            className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            {animatedROI.toFixed(1)}%
          </motion.span>
          <motion.div
            initial={{ rotate: -90 }}
            animate={{ rotate: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <Zap className="w-6 h-6 text-yellow-400" />
          </motion.div>
        </div>
        <p className="text-success text-sm mt-2">
          Outperforming market by 8.4%
        </p>
      </motion.div>

      {/* Win/Loss Pie Chart */}
      <div className="mb-6">
        <p className="text-text-secondary text-sm mb-3">Win/Loss Ratio</p>
        <div className="h-32">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={performanceData}
                cx="50%"
                cy="50%"
                innerRadius={35}
                outerRadius={50}
                paddingAngle={2}
                dataKey="value"
                animationBegin={0}
                animationDuration={1000}
              >
                {performanceData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="flex justify-center gap-4 mt-2">
          {performanceData.map((item) => (
            <div key={item.name} className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-text-secondary text-xs">
                {item.name}: {item.value}%
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="space-y-3">
        {metrics.map((metric, index) => (
          <motion.div
            key={metric.label}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.1 * index }}
            whileHover={{ x: 4 }}
            className="flex items-center justify-between p-3 bg-bg-tertiary rounded-lg border border-border-default hover:border-border-hover transition-all"
          >
            <div className="flex items-center gap-3">
              <div className={`${metric.color}`}>{metric.icon}</div>
              <div>
                <p className="text-text-muted text-xs">{metric.label}</p>
                <p className="text-white font-semibold">{metric.value}</p>
              </div>
            </div>
            <span className="text-text-secondary text-xs">{metric.change}</span>
          </motion.div>
        ))}
      </div>

      {/* Investment Calculator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        className="mt-6 p-4 bg-gradient-to-r from-purple-500/10 to-cyan-500/10 rounded-lg border border-purple-500/20"
      >
        <p className="text-text-secondary text-xs mb-2">If you invested $10,000</p>
        <p className="text-white font-bold text-lg">
          You&apos;d have ${(10000 * (1 + targetROI / 100)).toLocaleString()}
        </p>
        <p className="text-success text-xs mt-1">
          +${(10000 * (targetROI / 100)).toLocaleString()} profit
        </p>
      </motion.div>
    </motion.div>
  );
}