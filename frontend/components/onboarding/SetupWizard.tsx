'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronRight, 
  ChevronLeft, 
  Wallet, 
  Settings, 
  Bell, 
  Check,
  X,
  Globe,
  Moon,
  Sun,
  DollarSign,
  Euro,
  Bitcoin
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useOnboardingContext } from '@/contexts/OnboardingProvider';
import { WIZARD_STEPS } from '@/hooks/useOnboarding';
import { useWallet } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';

interface WizardFormData {
  currency: 'USD' | 'EUR' | 'BTC';
  theme: 'dark' | 'light' | 'system';
  notifications: boolean;
  priceAlerts: boolean;
  weeklyReports: boolean;
}

const wizardVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { duration: 0.3 }
  },
  exit: { 
    opacity: 0,
    transition: { duration: 0.2 }
  },
};

const stepVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 300 : -300,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
    transition: {
      type: 'spring' as const,
      stiffness: 300,
      damping: 30,
    },
  },
  exit: (direction: number) => ({
    x: direction < 0 ? 300 : -300,
    opacity: 0,
    transition: {
      duration: 0.3,
    },
  }),
};

export function SetupWizard() {
  const { 
    state, 
    nextWizardStep, 
    prevWizardStep, 
    completeWizard, 
    skipWizard,
    markStepCompleted 
  } = useOnboardingContext();
  
  const { connected } = useWallet();
  const { setVisible } = useWalletModal();
  
  const [direction, setDirection] = useState(0);
  const [formData, setFormData] = useState<WizardFormData>({
    currency: 'USD',
    theme: 'dark',
    notifications: true,
    priceAlerts: true,
    weeklyReports: false,
  });

  const currentStep = WIZARD_STEPS[state.currentStep];
  const isLastStep = state.currentStep === WIZARD_STEPS.length - 1;
  const isFirstStep = state.currentStep === 0;

  const handleNext = () => {
    markStepCompleted(currentStep.id);
    setDirection(1);
    
    if (isLastStep) {
      // Save preferences
      localStorage.setItem('solfolio-preferences', JSON.stringify(formData));
      completeWizard();
    } else {
      nextWizardStep();
    }
  };

  const handlePrev = () => {
    setDirection(-1);
    prevWizardStep();
  };

  const renderStepContent = () => {
    switch (currentStep.id) {
      case 'welcome':
        return (
          <motion.div
            key="welcome"
            custom={direction}
            variants={stepVariants}
            initial="enter"
            animate="center"
            exit="exit"
            className="space-y-6"
          >
            <div className="text-center">
              <motion.div
                className="inline-flex items-center justify-center w-20 h-20 mb-6 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 shadow-lg mx-auto"
                animate={{
                  rotate: [0, 5, -5, 0],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeInOut' as const,
                }}
              >
                <Settings className="w-10 h-10 text-white" />
              </motion.div>
              <h2 className="text-2xl font-bold text-white mb-2">
                Let&apos;s Get Started
              </h2>
              <p className="text-gray-400">
                We&apos;ll help you set up your portfolio tracker in just a few steps
              </p>
            </div>
            
            <div className="space-y-3">
              {WIZARD_STEPS.slice(1, -1).map((step, index) => (
                <motion.div
                  key={step.id}
                  className="flex items-center gap-3 p-3 rounded-lg bg-gray-800/50 border border-gray-700"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400 text-sm font-medium">
                    {index + 1}
                  </div>
                  <p className="text-white">{step.title}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        );

      case 'wallet':
        return (
          <motion.div
            key="wallet"
            custom={direction}
            variants={stepVariants}
            initial="enter"
            animate="center"
            exit="exit"
            className="space-y-6"
          >
            <div className="text-center">
              <Wallet className="w-16 h-16 text-purple-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-white mb-2">
                Connect Your Wallet
              </h2>
              <p className="text-gray-400">
                Connect your Solana wallet to start tracking your portfolio
              </p>
            </div>

            {connected ? (
              <motion.div
                className="p-4 rounded-lg bg-green-500/10 border border-green-500/30"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
              >
                <div className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-green-500" />
                  <p className="text-green-400">Wallet connected successfully!</p>
                </div>
              </motion.div>
            ) : (
              <Button
                size="lg"
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-0"
                onClick={() => setVisible(true)}
              >
                Connect Wallet
              </Button>
            )}

            <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/30">
              <p className="text-sm text-blue-400">
                💡 Tip: We support all major Solana wallets including Phantom, Solflare, and Backpack
              </p>
            </div>
          </motion.div>
        );

      case 'preferences':
        return (
          <motion.div
            key="preferences"
            custom={direction}
            variants={stepVariants}
            initial="enter"
            animate="center"
            exit="exit"
            className="space-y-6"
          >
            <div className="text-center">
              <Settings className="w-16 h-16 text-purple-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-white mb-2">
                Set Your Preferences
              </h2>
              <p className="text-gray-400">
                Customize your dashboard experience
              </p>
            </div>

            <div className="space-y-4">
              {/* Currency Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Display Currency
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { value: 'USD', icon: DollarSign, label: 'USD' },
                    { value: 'EUR', icon: Euro, label: 'EUR' },
                    { value: 'BTC', icon: Bitcoin, label: 'BTC' },
                  ].map((currency) => (
                    <motion.button
                      key={currency.value}
                      className={`p-3 rounded-lg border transition-colors ${
                        formData.currency === currency.value
                          ? 'bg-purple-500/20 border-purple-500'
                          : 'bg-gray-800/50 border-gray-700 hover:border-gray-600'
                      }`}
                      onClick={() => setFormData({ ...formData, currency: currency.value as any })}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <currency.icon className="w-5 h-5 mx-auto mb-1 text-white" />
                      <p className="text-sm text-white">{currency.label}</p>
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Theme Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Theme
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { value: 'dark', icon: Moon, label: 'Dark' },
                    { value: 'light', icon: Sun, label: 'Light' },
                    { value: 'system', icon: Globe, label: 'System' },
                  ].map((theme) => (
                    <motion.button
                      key={theme.value}
                      className={`p-3 rounded-lg border transition-colors ${
                        formData.theme === theme.value
                          ? 'bg-purple-500/20 border-purple-500'
                          : 'bg-gray-800/50 border-gray-700 hover:border-gray-600'
                      }`}
                      onClick={() => setFormData({ ...formData, theme: theme.value as any })}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <theme.icon className="w-5 h-5 mx-auto mb-1 text-white" />
                      <p className="text-sm text-white">{theme.label}</p>
                    </motion.button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        );

      case 'notifications':
        return (
          <motion.div
            key="notifications"
            custom={direction}
            variants={stepVariants}
            initial="enter"
            animate="center"
            exit="exit"
            className="space-y-6"
          >
            <div className="text-center">
              <Bell className="w-16 h-16 text-purple-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-white mb-2">
                Enable Notifications
              </h2>
              <p className="text-gray-400">
                Stay updated with your portfolio changes
              </p>
            </div>

            <div className="space-y-3">
              {[
                {
                  key: 'notifications',
                  label: 'Enable Notifications',
                  description: 'Get notified about important portfolio events',
                },
                {
                  key: 'priceAlerts',
                  label: 'Price Alerts',
                  description: 'Alert when tokens reach target prices',
                },
                {
                  key: 'weeklyReports',
                  label: 'Weekly Reports',
                  description: 'Receive weekly portfolio summaries',
                },
              ].map((option) => (
                <motion.button
                  key={option.key}
                  className={`w-full p-4 rounded-lg border text-left transition-colors ${
                    formData[option.key as keyof WizardFormData]
                      ? 'bg-purple-500/10 border-purple-500/50'
                      : 'bg-gray-800/50 border-gray-700 hover:border-gray-600'
                  }`}
                  onClick={() => 
                    setFormData({ 
                      ...formData, 
                      [option.key]: !formData[option.key as keyof WizardFormData] 
                    })
                  }
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white font-medium">{option.label}</p>
                      <p className="text-sm text-gray-400 mt-1">{option.description}</p>
                    </div>
                    <div className={`w-5 h-5 rounded ${
                      formData[option.key as keyof WizardFormData]
                        ? 'bg-purple-500'
                        : 'bg-gray-700'
                    }`}>
                      {formData[option.key as keyof WizardFormData] && (
                        <Check className="w-5 h-5 text-white" />
                      )}
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.div>
        );

      case 'complete':
        return (
          <motion.div
            key="complete"
            custom={direction}
            variants={stepVariants}
            initial="enter"
            animate="center"
            exit="exit"
            className="space-y-6 text-center"
          >
            <motion.div
              className="inline-flex items-center justify-center w-20 h-20 mb-6 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 shadow-lg mx-auto"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ 
                type: 'spring' as const,
                stiffness: 300,
                damping: 20,
              }}
            >
              <Check className="w-10 h-10 text-white" />
            </motion.div>

            <div>
              <h2 className="text-2xl font-bold text-white mb-2">
                You&apos;re All Set!
              </h2>
              <p className="text-gray-400">
                Your portfolio tracker is ready to use
              </p>
            </div>

            <motion.div
              className="p-4 rounded-lg bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/30"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <p className="text-sm text-purple-300">
                🎉 Welcome to SolFolio! Start exploring your DeFi portfolio now.
              </p>
            </motion.div>
          </motion.div>
        );

      default:
        return null;
    }
  };

  if (!state.showSetupWizard) return null;

  return (
    <AnimatePresence mode="wait">
      {state.showSetupWizard && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm"
            variants={wizardVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          />

          {/* Wizard Modal */}
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            variants={wizardVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <div className="relative w-full max-w-lg bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-2xl shadow-2xl overflow-hidden">
              {/* Gradient border effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500 opacity-20 blur-xl" />
              
              <div className="relative bg-gray-900/90 backdrop-blur-xl rounded-2xl p-8">
                {/* Progress bar */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gray-800 rounded-t-2xl overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                    initial={{ width: '0%' }}
                    animate={{ 
                      width: `${((state.currentStep + 1) / WIZARD_STEPS.length) * 100}%` 
                    }}
                    transition={{ duration: 0.3, ease: 'easeOut' as const }}
                  />
                </div>

                {/* Close button */}
                <motion.button
                  className="absolute top-4 right-4 p-2 rounded-lg hover:bg-white/10 transition-colors"
                  onClick={skipWizard}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <X className="w-5 h-5 text-gray-400" />
                </motion.button>

                {/* Step indicator */}
                <div className="text-center mb-6">
                  <span className="text-sm text-gray-400">
                    Step {state.currentStep + 1} of {WIZARD_STEPS.length}
                  </span>
                </div>

                {/* Content */}
                <AnimatePresence mode="wait" custom={direction}>
                  {renderStepContent()}
                </AnimatePresence>

                {/* Navigation */}
                <div className="flex items-center justify-between gap-3 mt-8">
                  <Button
                    variant="ghost"
                    onClick={handlePrev}
                    disabled={isFirstStep}
                    className="text-gray-400 hover:text-white"
                  >
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    Previous
                  </Button>

                  <div className="flex gap-1">
                    {WIZARD_STEPS.map((_, index) => (
                      <motion.div
                        key={index}
                        className={`w-2 h-2 rounded-full ${
                          index === state.currentStep
                            ? 'bg-gradient-to-r from-purple-500 to-pink-500'
                            : index < state.currentStep
                            ? 'bg-purple-600'
                            : 'bg-gray-600'
                        }`}
                        animate={index === state.currentStep ? {
                          scale: [1, 1.3, 1],
                        } : {}}
                        transition={{
                          duration: 1,
                          repeat: Infinity,
                        }}
                      />
                    ))}
                  </div>

                  <Button
                    onClick={handleNext}
                    disabled={currentStep.id === 'wallet' && !connected}
                    className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-0"
                  >
                    {isLastStep ? 'Finish' : 'Next'}
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>

                {/* Skip option */}
                {!isLastStep && (
                  <button
                    className="w-full text-center text-xs text-gray-500 hover:text-gray-400 mt-4 transition-colors"
                    onClick={skipWizard}
                  >
                    Skip setup
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}