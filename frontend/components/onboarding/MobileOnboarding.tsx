'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useOnboardingContext } from '@/contexts/OnboardingProvider';
import { ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';

/**
 * Mobile-optimized onboarding component with swipe gestures and 
 * bottom sheet pattern for better mobile UX
 */
export function MobileOnboarding() {
  const { state, startOnboarding } = useOnboardingContext();

  if (!state.isFirstVisit || state.showWelcomeModal || state.showFeatureTour || state.showSetupWizard) {
    return null;
  }

  return (
    <motion.div
      className="fixed bottom-0 left-0 right-0 z-40 lg:hidden"
      initial={{ y: '100%' }}
      animate={{ y: 0 }}
      transition={{ 
        type: 'spring',
        stiffness: 300,
        damping: 30,
        delay: 1.5 
      }}
    >
      <div className="bg-gradient-to-t from-gray-900 via-gray-900/95 to-transparent p-6 pb-8">
        <motion.div
          className="bg-gradient-to-br from-purple-600/20 to-pink-600/20 backdrop-blur-xl rounded-2xl p-4 border border-purple-500/30"
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 1.7 }}
        >
          <div className="flex items-center justify-center mb-3">
            <motion.div
              animate={{ y: [-2, 2, -2] }}
              transition={{ 
                duration: 1.5,
                repeat: Infinity,
                ease: 'easeInOut'
              }}
            >
              <ChevronUp className="w-5 h-5 text-purple-400" />
            </motion.div>
          </div>
          
          <h3 className="text-lg font-semibold text-white text-center mb-2">
            Welcome to SolFolio!
          </h3>
          <p className="text-sm text-gray-300 text-center mb-4">
            Track your Solana DeFi portfolio with ease
          </p>
          
          <Button
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-0"
            onClick={startOnboarding}
          >
            Get Started
          </Button>
        </motion.div>
      </div>
    </motion.div>
  );
}