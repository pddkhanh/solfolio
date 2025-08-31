'use client';

import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Activity, DollarSign, Percent, Clock, Award, Target } from 'lucide-react';
import { useEffect, useState } from 'react';
import { TimePeriod } from '@/app/analytics/page';

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon: React.ReactNode;
  color: 'primary' | 'secondary' | 'accent' | 'success' | 'warning' | 'danger';
  delay?: number;
}

const MetricCard = ({ title, value, change, changeLabel, icon, color, delay = 0 }: MetricCardProps) => {
  const [displayValue, setDisplayValue] = useState<string | number>(
    typeof value === 'number' ? 0 : value
  );

  useEffect(() => {
    if (typeof value === 'number') {
      // Count-up animation
      const duration = 1500;
      const steps = 60;
      const increment = value / steps;
      let current = 0;
      const timer = setInterval(() => {
        current += increment;
        if (current >= value) {
          setDisplayValue(value);
          clearInterval(timer);
        } else {
          setDisplayValue(Math.floor(current));
        }
      }, duration / steps);
      return () => clearInterval(timer);
    } else {
      setDisplayValue(value);
    }
  }, [value]);

  const colorClasses = {
    primary: 'from-purple-500 to-purple-600',
    secondary: 'from-green-500 to-green-600',
    accent: 'from-cyan-500 to-cyan-600',
    success: 'from-emerald-500 to-emerald-600',
    warning: 'from-yellow-500 to-yellow-600',
    danger: 'from-red-500 to-red-600',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: [0.4, 0, 0.2, 1] }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className="relative group"
    >
      <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-cyan-500/20 rounded-xl blur-xl group-hover:blur-2xl transition-all duration-300 opacity-0 group-hover:opacity-100" />
      <div className="relative bg-bg-secondary border border-border-default rounded-xl p-6 hover:border-border-hover transition-all duration-300">
        <div className="flex items-start justify-between mb-4">
          <div className={`p-3 rounded-lg bg-gradient-to-br ${colorClasses[color]} bg-opacity-10`}>
            <div className="text-white">
              {icon}
            </div>
          </div>
          {change !== undefined && (
            <div className={`flex items-center gap-1 text-sm ${change >= 0 ? 'text-success' : 'text-danger'}`}>
              {change >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
              <span className="font-medium">{Math.abs(change).toFixed(2)}%</span>
            </div>
          )}
        </div>
        <div>
          <p className="text-text-secondary text-sm mb-1">{title}</p>
          <div className="flex items-baseline gap-2">
            <motion.p 
              className="text-2xl font-bold text-white"
              initial={{ scale: 0.5 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.3, delay: delay + 0.2 }}
            >
              {typeof displayValue === 'number' 
                ? displayValue.toLocaleString() 
                : displayValue}
            </motion.p>
            {changeLabel && (
              <span className="text-text-muted text-sm">{changeLabel}</span>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

interface AnalyticsOverviewProps {
  timePeriod: TimePeriod;
}

export default function AnalyticsOverview({ timePeriod }: AnalyticsOverviewProps) {
  // Mock data - replace with real data from API
  const metrics = [
    {
      title: 'Total Portfolio Value',
      value: '$124,532.45',
      change: 12.5,
      changeLabel: `vs last ${timePeriod}`,
      icon: <DollarSign className="w-5 h-5" />,
      color: 'primary' as const,
    },
    {
      title: 'Total P&L',
      value: '+$8,432.12',
      change: 8.3,
      changeLabel: `${timePeriod} return`,
      icon: <TrendingUp className="w-5 h-5" />,
      color: 'success' as const,
    },
    {
      title: 'ROI',
      value: '18.4%',
      change: 3.2,
      changeLabel: 'vs benchmark',
      icon: <Percent className="w-5 h-5" />,
      color: 'accent' as const,
    },
    {
      title: 'Best Performer',
      value: 'SOL',
      change: 45.2,
      changeLabel: '+$4,235',
      icon: <Award className="w-5 h-5" />,
      color: 'secondary' as const,
    },
    {
      title: 'Active Positions',
      value: 24,
      change: 4.2,
      changeLabel: 'positions',
      icon: <Activity className="w-5 h-5" />,
      color: 'warning' as const,
    },
    {
      title: 'Avg Hold Time',
      value: '42 days',
      change: -12.5,
      changeLabel: 'vs avg',
      icon: <Clock className="w-5 h-5" />,
      color: 'primary' as const,
    },
    {
      title: 'Win Rate',
      value: '68%',
      change: 5.2,
      changeLabel: 'profitable',
      icon: <Target className="w-5 h-5" />,
      color: 'success' as const,
    },
    {
      title: 'Risk Score',
      value: 'Medium',
      change: -2.1,
      changeLabel: 'improved',
      icon: <Activity className="w-5 h-5" />,
      color: 'warning' as const,
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
    >
      {metrics.map((metric, index) => (
        <MetricCard
          key={metric.title}
          {...metric}
          delay={index * 0.05}
        />
      ))}
    </motion.div>
  );
}