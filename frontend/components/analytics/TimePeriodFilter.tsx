'use client';

import { motion } from 'framer-motion';
import { Calendar } from 'lucide-react';
import { TimePeriod } from '@/app/analytics/page';

interface TimePeriodFilterProps {
  selected: TimePeriod;
  onChange: (period: TimePeriod) => void;
}

const periods: { value: TimePeriod; label: string; shortLabel: string }[] = [
  { value: '24h', label: '24 Hours', shortLabel: '24H' },
  { value: '7d', label: '7 Days', shortLabel: '7D' },
  { value: '30d', label: '30 Days', shortLabel: '30D' },
  { value: '90d', label: '90 Days', shortLabel: '90D' },
  { value: '1y', label: '1 Year', shortLabel: '1Y' },
  { value: 'all', label: 'All Time', shortLabel: 'ALL' },
];

export default function TimePeriodFilter({ selected, onChange }: TimePeriodFilterProps) {
  return (
    <div className="flex items-center gap-2">
      <Calendar className="w-4 h-4 text-text-secondary hidden sm:block" />
      <div className="flex bg-bg-tertiary rounded-lg border border-border-default p-1">
        {periods.map((period) => (
          <motion.button
            key={period.value}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onChange(period.value)}
            className={`relative px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
              selected === period.value
                ? 'text-white'
                : 'text-text-secondary hover:text-white'
            }`}
          >
            {selected === period.value && (
              <motion.div
                layoutId="timePeriodIndicator"
                className="absolute inset-0 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-md"
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              />
            )}
            <span className="relative z-10">
              <span className="hidden sm:inline">{period.label}</span>
              <span className="sm:hidden">{period.shortLabel}</span>
            </span>
          </motion.button>
        ))}
      </div>
    </div>
  );
}