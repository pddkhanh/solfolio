'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import { useOnboarding, OnboardingState, OnboardingStep } from '@/hooks/useOnboarding';

interface OnboardingContextValue {
  state: OnboardingState;
  isLoading: boolean;
  startOnboarding: () => void;
  dismissWelcomeModal: () => void;
  startFeatureTour: () => void;
  nextTourStep: () => void;
  prevTourStep: () => void;
  skipTour: () => void;
  completeTour: () => void;
  startSetupWizard: () => void;
  nextWizardStep: () => void;
  prevWizardStep: () => void;
  completeWizard: () => void;
  skipWizard: () => void;
  toggleSampleData: () => void;
  toggleTooltips: () => void;
  markStepCompleted: (stepId: string) => void;
  resetOnboarding: () => void;
  completeOnboarding: () => void;
}

const OnboardingContext = createContext<OnboardingContextValue | undefined>(undefined);

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const { state, isLoading, actions } = useOnboarding();

  const value: OnboardingContextValue = {
    state,
    isLoading,
    ...actions,
  };

  return (
    <OnboardingContext.Provider value={value}>
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboardingContext() {
  const context = useContext(OnboardingContext);
  if (!context) {
    throw new Error('useOnboardingContext must be used within OnboardingProvider');
  }
  return context;
}