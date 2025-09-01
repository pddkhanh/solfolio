'use client';

import React, { useEffect } from 'react';
import { useOnboardingContext } from '@/contexts/OnboardingProvider';
import { WelcomeModal } from './WelcomeModal';
import { FeatureTour } from './FeatureTour';
import { TooltipHints } from './TooltipHints';
import { SampleDataPreview } from './SampleDataPreview';
import { SetupWizard } from './SetupWizard';
import { MobileOnboarding } from './MobileOnboarding';
import { motion, AnimatePresence } from 'framer-motion';
import { HelpCircle, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function Onboarding() {
  const { state, startOnboarding, resetOnboarding } = useOnboardingContext();

  // Automatically start onboarding for first-time users
  useEffect(() => {
    if (state.isFirstVisit && !state.showWelcomeModal && !state.showFeatureTour && !state.showSetupWizard) {
      // Small delay to ensure page is loaded
      const timer = setTimeout(() => {
        startOnboarding();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [state.isFirstVisit, state.showWelcomeModal, state.showFeatureTour, state.showSetupWizard, startOnboarding]);

  return (
    <>
      {/* Onboarding Components */}
      <WelcomeModal />
      <FeatureTour />
      <TooltipHints />
      <SampleDataPreview />
      <SetupWizard />
      <MobileOnboarding />

      {/* Onboarding Controls (for returning users) */}
      {!state.isFirstVisit && !state.showWelcomeModal && !state.showFeatureTour && !state.showSetupWizard && (
        <AnimatePresence>
          <motion.div
            className="fixed bottom-4 right-4 z-30"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
          >
            <div className="flex flex-col gap-2">
              <Button
                size="sm"
                variant="outline"
                className="bg-gray-900/90 backdrop-blur-sm border-gray-700 hover:border-purple-500 text-gray-300 hover:text-white"
                onClick={startOnboarding}
              >
                <HelpCircle className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Take Tour</span>
                <span className="sm:hidden">Tour</span>
              </Button>
              
              {process.env.NODE_ENV === 'development' && (
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-gray-500 hover:text-gray-300"
                  onClick={resetOnboarding}
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Reset
                </Button>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      )}
    </>
  );
}

// Mobile-responsive wrapper for onboarding elements
export function OnboardingWrapper({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen">
      {children}
      <Onboarding />
    </div>
  );
}