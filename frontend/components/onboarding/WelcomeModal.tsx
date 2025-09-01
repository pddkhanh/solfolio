'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowRight, Sparkles, TrendingUp, Shield, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useOnboardingContext } from '@/contexts/OnboardingProvider';

const features = [
  {
    icon: TrendingUp,
    title: 'Real-time Portfolio Tracking',
    description: 'Monitor your DeFi positions across multiple protocols',
    color: 'from-purple-500 to-pink-500',
  },
  {
    icon: Shield,
    title: 'Secure & Private',
    description: 'Your keys, your crypto. We never store private data',
    color: 'from-blue-500 to-cyan-500',
  },
  {
    icon: Zap,
    title: 'Lightning Fast',
    description: 'Optimized for speed with real-time updates',
    color: 'from-green-500 to-emerald-500',
  },
];

// Animation variants
const backdropVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { duration: 0.3, ease: 'easeOut' as const }
  },
  exit: { 
    opacity: 0,
    transition: { duration: 0.2, ease: 'easeIn' as const }
  },
};

const modalVariants = {
  hidden: { 
    opacity: 0, 
    scale: 0.8,
    y: 20,
  },
  visible: { 
    opacity: 1, 
    scale: 1,
    y: 0,
    transition: {
      type: 'spring' as const,
      stiffness: 300,
      damping: 25,
      staggerChildren: 0.1,
      delayChildren: 0.2,
    }
  },
  exit: { 
    opacity: 0, 
    scale: 0.9,
    y: -20,
    transition: { duration: 0.2 }
  },
};

const contentVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.4, ease: 'easeOut' as const }
  },
};

const featureVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: {
      delay: i * 0.1,
      duration: 0.5,
      ease: 'easeOut' as const,
    },
  }),
};

export function WelcomeModal() {
  const { state, dismissWelcomeModal, startFeatureTour, skipTour } = useOnboardingContext();

  if (!state.showWelcomeModal) return null;

  return (
    <AnimatePresence mode="wait">
      {state.showWelcomeModal && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm"
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={dismissWelcomeModal}
          />

          {/* Modal */}
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <div className="relative w-full max-w-2xl bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-2xl shadow-2xl overflow-hidden pointer-events-auto">
              {/* Gradient border effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500 opacity-20 blur-xl" />
              
              <div className="relative bg-gray-900/90 backdrop-blur-xl rounded-2xl p-8 md:p-10">
                {/* Close button */}
                <motion.button
                  className="absolute top-4 right-4 p-2 rounded-lg hover:bg-white/10 transition-colors"
                  onClick={dismissWelcomeModal}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <X className="w-5 h-5 text-gray-400" />
                </motion.button>

                {/* Header */}
                <motion.div 
                  className="text-center mb-8"
                  variants={contentVariants}
                >
                  <motion.div
                    className="inline-flex items-center justify-center w-20 h-20 mb-6 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 shadow-lg"
                    animate={{
                      boxShadow: [
                        '0 0 20px rgba(168, 85, 247, 0.5)',
                        '0 0 40px rgba(168, 85, 247, 0.3)',
                        '0 0 20px rgba(168, 85, 247, 0.5)',
                      ],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: 'easeInOut' as const,
                    }}
                  >
                    <Sparkles className="w-10 h-10 text-white" />
                  </motion.div>

                  <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                    Welcome to SolFolio
                  </h1>
                  <p className="text-lg text-gray-300 max-w-md mx-auto">
                    Your comprehensive Solana DeFi portfolio tracker. Track, analyze, and optimize your positions across multiple protocols.
                  </p>
                </motion.div>

                {/* Features */}
                <motion.div 
                  className="grid gap-4 mb-8"
                  variants={contentVariants}
                >
                  {features.map((feature, index) => (
                    <motion.div
                      key={feature.title}
                      className="flex items-start gap-4 p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
                      custom={index}
                      variants={featureVariants}
                      whileHover={{ 
                        scale: 1.02,
                        transition: { duration: 0.2 }
                      }}
                    >
                      <div className={`p-3 rounded-lg bg-gradient-to-r ${feature.color}`}>
                        <feature.icon className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-white mb-1">
                          {feature.title}
                        </h3>
                        <p className="text-sm text-gray-400">
                          {feature.description}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>

                {/* Actions */}
                <motion.div 
                  className="flex flex-col sm:flex-row gap-3"
                  variants={contentVariants}
                >
                  <Button
                    className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-0"
                    size="lg"
                    onClick={() => {
                      dismissWelcomeModal();
                      startFeatureTour();
                    }}
                  >
                    <span>Take a Tour</span>
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="lg"
                    className="flex-1 border-white/20 hover:bg-white/10"
                    onClick={() => {
                      dismissWelcomeModal();
                      skipTour();
                    }}
                  >
                    Skip Tour
                  </Button>
                </motion.div>

                {/* Footer note */}
                <motion.p 
                  className="text-center text-xs text-gray-500 mt-6"
                  variants={contentVariants}
                >
                  You can restart the tour anytime from Settings
                </motion.p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}