'use client';

import React from 'react';
import { OnboardingProvider } from '@/contexts/OnboardingProvider';
import { OnboardingWrapper, HintTarget } from '@/components/onboarding';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { 
  Wallet, 
  TrendingUp, 
  Filter, 
  Download, 
  Settings,
  RefreshCw,
  Play
} from 'lucide-react';
import { useOnboardingContext } from '@/contexts/OnboardingProvider';

function OnboardingDemoContent() {
  const { state, startOnboarding, resetOnboarding, toggleSampleData } = useOnboardingContext();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Header */}
      <header className="border-b border-gray-800 backdrop-blur-xl bg-gray-900/50 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-8">
              <h1 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                SolFolio
              </h1>
              <nav className="hidden md:flex items-center gap-6">
                <a href="#" className="text-gray-300 hover:text-white transition-colors">Portfolio</a>
                <a href="#" className="text-gray-300 hover:text-white transition-colors">Positions</a>
                <a href="#" className="text-gray-300 hover:text-white transition-colors">Analytics</a>
              </nav>
            </div>
            
            <div className="flex items-center gap-4">
              <HintTarget hint="filter">
                <Button 
                  variant="ghost" 
                  size="sm"
                  data-tour="filters"
                  className="text-gray-400 hover:text-white"
                >
                  <Filter className="w-4 h-4" />
                </Button>
              </HintTarget>

              <HintTarget hint="export">
                <Button 
                  variant="ghost" 
                  size="sm"
                  data-tour="export"
                  className="text-gray-400 hover:text-white"
                >
                  <Download className="w-4 h-4" />
                </Button>
              </HintTarget>

              <Button 
                variant="ghost" 
                size="sm"
                data-tour="settings"
                className="text-gray-400 hover:text-white"
              >
                <Settings className="w-4 h-4" />
              </Button>

              <HintTarget hint="wallet">
                <Button 
                  data-tour="wallet-button"
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-0"
                >
                  <Wallet className="w-4 h-4 mr-2" />
                  Connect Wallet
                </Button>
              </HintTarget>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Demo Controls */}
        <motion.div 
          className="mb-8 p-6 bg-gray-800/50 rounded-xl border border-gray-700"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h2 className="text-lg font-semibold text-white mb-4">Onboarding Demo Controls</h2>
          <div className="flex flex-wrap gap-3">
            <Button
              onClick={startOnboarding}
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-0"
            >
              <Play className="w-4 h-4 mr-2" />
              Start Onboarding
            </Button>
            
            <Button
              onClick={resetOnboarding}
              variant="outline"
              className="border-gray-600 hover:bg-gray-700"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Reset Onboarding
            </Button>

            <Button
              onClick={toggleSampleData}
              variant="outline"
              className="border-gray-600 hover:bg-gray-700"
            >
              Sample Data: {state.showSampleData ? 'ON' : 'OFF'}
            </Button>
          </div>

          <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-gray-400">First Visit:</span>
              <span className="ml-2 text-white">{state.isFirstVisit ? 'Yes' : 'No'}</span>
            </div>
            <div>
              <span className="text-gray-400">Current Step:</span>
              <span className="ml-2 text-white">{state.currentStep}</span>
            </div>
            <div>
              <span className="text-gray-400">Tour Progress:</span>
              <span className="ml-2 text-white">{state.tourProgress}%</span>
            </div>
            <div>
              <span className="text-gray-400">Wizard Progress:</span>
              <span className="ml-2 text-white">{state.wizardProgress}%</span>
            </div>
          </div>
        </motion.div>

        {/* Portfolio Overview */}
        <HintTarget hint="portfolio">
          <motion.div 
            data-tour="portfolio-overview"
            className="mb-8 p-6 bg-gray-800/50 rounded-xl border border-gray-700"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <h2 className="text-lg font-semibold text-white mb-4">Portfolio Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-gray-900/50 rounded-lg">
                <p className="text-gray-400 text-sm mb-1">Total Value</p>
                <p className="text-2xl font-bold text-white">$0.00</p>
              </div>
              <div className="p-4 bg-gray-900/50 rounded-lg">
                <p className="text-gray-400 text-sm mb-1">24h Change</p>
                <p className="text-2xl font-bold text-green-500">+0.00%</p>
              </div>
              <div className="p-4 bg-gray-900/50 rounded-lg">
                <p className="text-gray-400 text-sm mb-1">Total Positions</p>
                <p className="text-2xl font-bold text-white">0</p>
              </div>
            </div>
          </motion.div>
        </HintTarget>

        {/* Token List */}
        <motion.div 
          data-tour="token-list"
          className="mb-8 p-6 bg-gray-800/50 rounded-xl border border-gray-700"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-lg font-semibold text-white mb-4">Token Holdings</h2>
          <div className="text-center py-8 text-gray-400">
            Connect your wallet to view tokens
          </div>
        </motion.div>

        {/* Positions */}
        <motion.div 
          data-tour="positions"
          className="mb-8 p-6 bg-gray-800/50 rounded-xl border border-gray-700"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h2 className="text-lg font-semibold text-white mb-4">DeFi Positions</h2>
          <div className="text-center py-8 text-gray-400">
            No positions found
          </div>
        </motion.div>

        {/* Charts */}
        <motion.div 
          data-tour="charts"
          className="p-6 bg-gray-800/50 rounded-xl border border-gray-700"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h2 className="text-lg font-semibold text-white mb-4">Analytics</h2>
          <div className="text-center py-8 text-gray-400">
            Charts will appear here
          </div>
        </motion.div>
      </main>
    </div>
  );
}

export default function OnboardingDemoPage() {
  return (
    <OnboardingProvider>
      <OnboardingWrapper>
        <OnboardingDemoContent />
      </OnboardingWrapper>
    </OnboardingProvider>
  );
}