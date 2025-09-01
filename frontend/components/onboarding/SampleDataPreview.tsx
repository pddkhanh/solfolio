'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, TrendingUp, DollarSign, Coins, Activity } from 'lucide-react';
import { useOnboardingContext } from '@/contexts/OnboardingProvider';
import { Button } from '@/components/ui/button';

// Sample data for preview
const SAMPLE_PORTFOLIO = {
  totalValue: 125432.78,
  change24h: 3.45,
  tokens: [
    { symbol: 'SOL', name: 'Solana', balance: 245.5, value: 24550, change: 5.2 },
    { symbol: 'USDC', name: 'USD Coin', balance: 10000, value: 10000, change: 0 },
    { symbol: 'RAY', name: 'Raydium', balance: 1500, value: 4500, change: -2.1 },
  ],
  positions: [
    { protocol: 'Marinade', type: 'Staking', value: 45000, apy: 7.2 },
    { protocol: 'Kamino', type: 'Lending', value: 35000, apy: 12.5 },
    { protocol: 'Orca', type: 'LP', value: 6382.78, apy: 24.3 },
  ],
};

const bannerVariants = {
  hidden: { opacity: 0, y: -20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: {
      type: 'spring' as const,
      stiffness: 300,
      damping: 25,
    }
  },
  exit: { 
    opacity: 0, 
    y: -20,
    transition: { duration: 0.2 }
  },
};

const cardVariants = {
  hidden: { opacity: 0.3, scale: 0.98 },
  visible: { 
    opacity: 1, 
    scale: 1,
    transition: { duration: 0.3 }
  },
};

export function SampleDataPreview() {
  const { state, toggleSampleData } = useOnboardingContext();

  if (!state.showSampleData) return null;

  return (
    <AnimatePresence>
      {state.showSampleData && (
        <>
          {/* Preview Banner */}
          <motion.div
            className="fixed top-16 left-0 right-0 z-40 px-4 py-2"
            variants={bannerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <div className="max-w-7xl mx-auto">
              <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 backdrop-blur-xl border border-purple-500/30 rounded-lg px-4 py-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-500/20 rounded-lg">
                      <Eye className="w-4 h-4 text-purple-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">
                        Sample Data Preview Mode
                      </p>
                      <p className="text-xs text-gray-400">
                        Exploring with example portfolio data
                      </p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={toggleSampleData}
                    className="text-purple-400 hover:text-purple-300"
                  >
                    <EyeOff className="w-4 h-4 mr-2" />
                    Exit Preview
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Sample Data Overlay */}
          <motion.div
            className="fixed inset-0 z-30 pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Portfolio Overview Sample */}
            <motion.div
              className="absolute top-32 left-8 right-8 max-w-6xl mx-auto pointer-events-auto"
              variants={cardVariants}
              initial="hidden"
              animate="visible"
            >
              <div className="bg-gray-900/95 backdrop-blur-xl rounded-xl p-6 border border-purple-500/20">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <motion.div
                    className="space-y-2"
                    whileHover={{ scale: 1.02 }}
                    transition={{ type: 'spring' as const, stiffness: 300 }}
                  >
                    <div className="flex items-center gap-2 text-gray-400">
                      <DollarSign className="w-4 h-4" />
                      <span className="text-sm">Total Value</span>
                    </div>
                    <div className="text-3xl font-bold text-white">
                      ${SAMPLE_PORTFOLIO.totalValue.toLocaleString()}
                    </div>
                    <div className="flex items-center gap-1">
                      <TrendingUp className="w-4 h-4 text-green-500" />
                      <span className="text-sm text-green-500">
                        +{SAMPLE_PORTFOLIO.change24h}%
                      </span>
                    </div>
                  </motion.div>

                  <motion.div
                    className="space-y-2"
                    whileHover={{ scale: 1.02 }}
                    transition={{ type: 'spring' as const, stiffness: 300 }}
                  >
                    <div className="flex items-center gap-2 text-gray-400">
                      <Coins className="w-4 h-4" />
                      <span className="text-sm">Tokens</span>
                    </div>
                    <div className="text-2xl font-semibold text-white">
                      {SAMPLE_PORTFOLIO.tokens.length}
                    </div>
                  </motion.div>

                  <motion.div
                    className="space-y-2"
                    whileHover={{ scale: 1.02 }}
                    transition={{ type: 'spring' as const, stiffness: 300 }}
                  >
                    <div className="flex items-center gap-2 text-gray-400">
                      <Activity className="w-4 h-4" />
                      <span className="text-sm">Positions</span>
                    </div>
                    <div className="text-2xl font-semibold text-white">
                      {SAMPLE_PORTFOLIO.positions.length}
                    </div>
                  </motion.div>

                  <motion.div
                    className="space-y-2"
                    whileHover={{ scale: 1.02 }}
                    transition={{ type: 'spring' as const, stiffness: 300 }}
                  >
                    <div className="flex items-center gap-2 text-gray-400">
                      <TrendingUp className="w-4 h-4" />
                      <span className="text-sm">Avg APY</span>
                    </div>
                    <div className="text-2xl font-semibold text-white">
                      14.7%
                    </div>
                  </motion.div>
                </div>
              </div>
            </motion.div>

            {/* Token List Sample */}
            <motion.div
              className="absolute top-64 left-8 w-96 pointer-events-auto"
              variants={cardVariants}
              initial="hidden"
              animate="visible"
            >
              <div className="bg-gray-900/95 backdrop-blur-xl rounded-xl p-4 border border-purple-500/20">
                <h3 className="text-lg font-semibold text-white mb-4">Top Tokens</h3>
                <div className="space-y-3">
                  {SAMPLE_PORTFOLIO.tokens.map((token, index) => (
                    <motion.div
                      key={token.symbol}
                      className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ scale: 1.02 }}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full" />
                        <div>
                          <p className="text-sm font-medium text-white">{token.symbol}</p>
                          <p className="text-xs text-gray-400">{token.name}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-white">
                          ${token.value.toLocaleString()}
                        </p>
                        <p className={`text-xs ${token.change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                          {token.change >= 0 ? '+' : ''}{token.change}%
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Positions Sample */}
            <motion.div
              className="absolute top-64 right-8 w-96 pointer-events-auto"
              variants={cardVariants}
              initial="hidden"
              animate="visible"
            >
              <div className="bg-gray-900/95 backdrop-blur-xl rounded-xl p-4 border border-purple-500/20">
                <h3 className="text-lg font-semibold text-white mb-4">DeFi Positions</h3>
                <div className="space-y-3">
                  {SAMPLE_PORTFOLIO.positions.map((position, index) => (
                    <motion.div
                      key={position.protocol}
                      className="p-3 bg-gray-800/50 rounded-lg"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ scale: 1.02 }}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-cyan-500 rounded" />
                          <span className="text-sm font-medium text-white">
                            {position.protocol}
                          </span>
                        </div>
                        <span className="text-xs text-gray-400">{position.type}</span>
                      </div>
                      <div className="flex justify-between items-end">
                        <p className="text-sm text-white">
                          ${position.value.toLocaleString()}
                        </p>
                        <p className="text-xs text-green-500">
                          APY: {position.apy}%
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}