'use client';

import { EmptyState } from '@/components/ui/empty-state';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, FileText, Wallet, TrendingUp, Coins, AlertCircle } from 'lucide-react';

export default function TestEmptyStatesPage() {
  const [selectedVariant, setSelectedVariant] = useState<'no-wallet' | 'no-tokens' | 'no-positions' | 'no-results' | 'no-history' | 'network-error' | 'maintenance' | 'error' | 'loading' | 'custom'>('no-wallet');

  const variants = [
    { key: 'no-wallet' as const, label: 'No Wallet Connected', icon: <Wallet className="w-4 h-4" /> },
    { key: 'no-tokens' as const, label: 'No Tokens Found', icon: <Coins className="w-4 h-4" /> },
    { key: 'no-positions' as const, label: 'No DeFi Positions', icon: <TrendingUp className="w-4 h-4" /> },
    { key: 'no-results' as const, label: 'No Search Results', icon: <Search className="w-4 h-4" /> },
    { key: 'no-history' as const, label: 'No Transaction History', icon: <FileText className="w-4 h-4" /> },
    { key: 'network-error' as const, label: 'Network Error', icon: <AlertCircle className="w-4 h-4" /> },
    { key: 'maintenance' as const, label: 'Maintenance Mode', icon: <div className="w-4 h-4 border-2 border-current border-r-transparent rounded-full animate-spin" /> },
    { key: 'error' as const, label: 'General Error', icon: <AlertCircle className="w-4 h-4" /> },
    { key: 'loading' as const, label: 'Loading State', icon: <div className="w-4 h-4 border-2 border-current border-r-transparent rounded-full animate-spin" /> },
    { key: 'custom' as const, label: 'Custom State', icon: <FileText className="w-4 h-4" /> },
  ];

  const handleAction = (variant: string) => {
    alert(`Action clicked for ${variant} variant!`);
  };

  const handleSecondaryAction = () => {
    alert('Secondary action clicked!');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black">
      <div className="container mx-auto p-8 max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 via-green-400 to-cyan-400 bg-clip-text text-transparent mb-4">
            SolFolio Empty States Test
          </h1>
          <p className="text-gray-400 text-lg">
            Test all empty state variants with Solana-inspired gradients and animations
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Variant Selector */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white">Select Variant</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {variants.map((variant) => (
                  <Button
                    key={variant.key}
                    onClick={() => setSelectedVariant(variant.key)}
                    variant={selectedVariant === variant.key ? "default" : "outline"}
                    className="w-full justify-start gap-2"
                    size="sm"
                  >
                    {variant.icon}
                    {variant.label}
                  </Button>
                ))}
              </CardContent>
            </Card>
          </motion.div>

          {/* Empty State Display */}
          <div className="lg:col-span-2">
            <motion.div
              key={selectedVariant}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-sm overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-purple-500/5 to-green-500/5">
                  <CardTitle className="text-white">
                    {variants.find(v => v.key === selectedVariant)?.label} Demo
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0 min-h-[600px] relative">
                  <EmptyState
                    variant={selectedVariant}
                    action={{
                      label: selectedVariant === 'loading' ? '' : 'Primary Action',
                      onClick: () => handleAction(selectedVariant),
                    }}
                    secondaryAction={
                      selectedVariant === 'no-positions' ? {
                        label: 'Secondary Action',
                        onClick: handleSecondaryAction,
                      } : undefined
                    }
                    showRetryAfter={
                      selectedVariant === 'maintenance' ? 120 : 
                      selectedVariant === 'network-error' ? 30 : 
                      undefined
                    }
                    animated={true}
                  />
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>

        {/* Additional Examples */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-12"
        >
          <h2 className="text-2xl font-bold text-white mb-6">Additional Examples</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {/* Custom Empty State */}
            <Card className="bg-gray-900/50 border-gray-800">
              <CardContent className="p-4">
                <EmptyState
                  variant="custom"
                  title="Transaction History"
                  description="No transaction history available yet. Your transactions will appear here once you start interacting with DeFi protocols."
                  icon={<FileText className="w-16 h-16" />}
                  action={{
                    label: "Explore Protocols",
                    onClick: () => alert('Navigate to protocols'),
                  }}
                  animated={false}
                  className="py-8"
                />
              </CardContent>
            </Card>

            {/* Network Error State */}
            <Card className="bg-gray-900/50 border-gray-800">
              <CardContent className="p-4">
                <EmptyState
                  variant="error"
                  title="Network Connection Error"
                  description="Unable to connect to the Solana network. Please check your internet connection and try again."
                  action={{
                    label: "Retry Connection",
                    onClick: () => alert('Retrying connection...'),
                  }}
                  secondaryAction={{
                    label: "Switch RPC",
                    onClick: () => alert('Switching RPC...'),
                  }}
                  animated={false}
                  className="py-8"
                />
              </CardContent>
            </Card>

            {/* Search No Results */}
            <Card className="bg-gray-900/50 border-gray-800">
              <CardContent className="p-4">
                <EmptyState
                  variant="no-results"
                  title="No tokens found"
                  description="No tokens match your search for 'FAKE'. Try searching for a different token symbol or name."
                  action={{
                    label: "Clear Search",
                    onClick: () => alert('Clearing search...'),
                  }}
                  animated={false}
                  className="py-8"
                />
              </CardContent>
            </Card>
          </div>
        </motion.div>

        {/* Performance Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-12"
        >
          <Card className="bg-gradient-to-r from-purple-900/20 to-green-900/20 border-purple-500/20">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Performance Notes</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-300">
                <div>
                  <div className="font-medium text-green-400 mb-1">✓ GPU Accelerated</div>
                  <div>All animations use transform and opacity for 60 FPS performance</div>
                </div>
                <div>
                  <div className="font-medium text-green-400 mb-1">✓ Accessibility</div>
                  <div>Respects prefers-reduced-motion and includes proper ARIA labels</div>
                </div>
                <div>
                  <div className="font-medium text-green-400 mb-1">✓ Responsive</div>
                  <div>Adapts to all screen sizes with touch-friendly interactions</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}