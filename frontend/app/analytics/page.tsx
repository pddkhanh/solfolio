'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import AnalyticsOverview from '@/components/analytics/AnalyticsOverview';
import PerformanceChart from '@/components/analytics/PerformanceChart';
import PnLChart from '@/components/analytics/PnLChart';
import AssetAllocation from '@/components/analytics/AssetAllocation';
import ROIMetrics from '@/components/analytics/ROIMetrics';
import TransactionHistory from '@/components/analytics/TransactionHistory';
import TimePeriodFilter from '@/components/analytics/TimePeriodFilter';
import CorrelationMatrix from '@/components/analytics/CorrelationMatrix';
import ExportControls from '@/components/analytics/ExportControls';

// Animation variants from animation guide
const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.4,
      ease: [0.4, 0, 0.2, 1] as const,
    }
  },
  exit: { 
    opacity: 0, 
    y: -20,
    transition: {
      duration: 0.3,
      ease: [0.4, 0, 1, 1] as const,
    }
  }
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1
    }
  }
};

export type TimePeriod = '24h' | '7d' | '30d' | '90d' | '1y' | 'all';

export default function AnalyticsPage() {
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('30d');
  const [selectedAsset, setSelectedAsset] = useState<string | null>(null);

  return (
    <motion.div
      initial="initial"
      animate="animate"
      exit="exit"
      variants={pageVariants}
      className="min-h-screen bg-bg-primary"
    >
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Page Header */}
        <motion.div 
          className="mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
        >
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">
                Analytics Dashboard
              </h1>
              <p className="text-text-secondary">
                Advanced portfolio metrics and performance analysis
              </p>
            </div>
            <div className="flex gap-3">
              <TimePeriodFilter 
                selected={timePeriod} 
                onChange={setTimePeriod} 
              />
              <ExportControls />
            </div>
          </div>
        </motion.div>

        {/* Main Grid Layout */}
        <motion.div 
          variants={staggerContainer}
          initial="initial"
          animate="animate"
          className="grid grid-cols-1 lg:grid-cols-12 gap-6"
        >
          {/* Overview Cards - Full Width */}
          <motion.div 
            className="lg:col-span-12"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <AnalyticsOverview timePeriod={timePeriod} />
          </motion.div>

          {/* Performance Chart - 8 cols */}
          <motion.div 
            className="lg:col-span-8"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <PerformanceChart 
              timePeriod={timePeriod}
              onAssetSelect={setSelectedAsset}
            />
          </motion.div>

          {/* ROI Metrics - 4 cols */}
          <motion.div 
            className="lg:col-span-4"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.15 }}
          >
            <ROIMetrics timePeriod={timePeriod} />
          </motion.div>

          {/* P&L Chart - 6 cols */}
          <motion.div 
            className="lg:col-span-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <PnLChart 
              timePeriod={timePeriod}
              selectedAsset={selectedAsset}
            />
          </motion.div>

          {/* Asset Allocation - 6 cols */}
          <motion.div 
            className="lg:col-span-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.25 }}
          >
            <AssetAllocation 
              onAssetSelect={setSelectedAsset}
              selectedAsset={selectedAsset}
            />
          </motion.div>

          {/* Correlation Matrix - 12 cols */}
          <motion.div 
            className="lg:col-span-12"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.3 }}
          >
            <CorrelationMatrix timePeriod={timePeriod} />
          </motion.div>

          {/* Transaction History - 12 cols */}
          <motion.div 
            className="lg:col-span-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.35 }}
          >
            <TransactionHistory 
              timePeriod={timePeriod}
              selectedAsset={selectedAsset}
            />
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
}