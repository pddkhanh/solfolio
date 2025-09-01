'use client';

import { useState, useEffect, useCallback } from 'react';

export interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  target?: string; // CSS selector for feature tour
  position?: 'top' | 'bottom' | 'left' | 'right';
  action?: () => void;
  skippable?: boolean;
}

export interface OnboardingState {
  isFirstVisit: boolean;
  currentStep: number;
  completedSteps: string[];
  showWelcomeModal: boolean;
  showFeatureTour: boolean;
  showTooltips: boolean;
  showSampleData: boolean;
  showSetupWizard: boolean;
  tourProgress: number;
  wizardProgress: number;
}

const ONBOARDING_STORAGE_KEY = 'solfolio-onboarding';
const ONBOARDING_VERSION = '1.0.0';

const defaultState: OnboardingState = {
  isFirstVisit: true,
  currentStep: 0,
  completedSteps: [],
  showWelcomeModal: true,
  showFeatureTour: false,
  showTooltips: true,
  showSampleData: false,
  showSetupWizard: false,
  tourProgress: 0,
  wizardProgress: 0,
};

export function useOnboarding() {
  const [state, setState] = useState<OnboardingState>(defaultState);
  const [isLoading, setIsLoading] = useState(true);

  // Load onboarding state from localStorage
  useEffect(() => {
    const loadState = () => {
      try {
        const stored = localStorage.getItem(ONBOARDING_STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          // Check version compatibility
          if (parsed.version === ONBOARDING_VERSION) {
            setState(parsed.state);
          } else {
            // Reset if version mismatch
            setState(defaultState);
          }
        }
      } catch (error) {
        console.error('Failed to load onboarding state:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadState();
  }, []);

  // Save state to localStorage
  useEffect(() => {
    if (!isLoading) {
      try {
        localStorage.setItem(
          ONBOARDING_STORAGE_KEY,
          JSON.stringify({
            version: ONBOARDING_VERSION,
            state,
            timestamp: Date.now(),
          })
        );
      } catch (error) {
        console.error('Failed to save onboarding state:', error);
      }
    }
  }, [state, isLoading]);

  const updateState = useCallback((updates: Partial<OnboardingState>) => {
    setState((prev) => ({ ...prev, ...updates }));
  }, []);

  const startOnboarding = useCallback(() => {
    updateState({
      showWelcomeModal: true,
      currentStep: 0,
    });
  }, [updateState]);

  const dismissWelcomeModal = useCallback(() => {
    updateState({
      showWelcomeModal: false,
      showFeatureTour: true,
    });
  }, [updateState]);

  const startFeatureTour = useCallback(() => {
    updateState({
      showWelcomeModal: false,
      showFeatureTour: true,
      currentStep: 0,
    });
  }, [updateState]);

  const nextTourStep = useCallback(() => {
    setState((prev) => ({
      ...prev,
      currentStep: prev.currentStep + 1,
      tourProgress: Math.min(100, ((prev.currentStep + 1) / 10) * 100),
    }));
  }, []);

  const prevTourStep = useCallback(() => {
    setState((prev) => ({
      ...prev,
      currentStep: Math.max(0, prev.currentStep - 1),
      tourProgress: Math.max(0, ((prev.currentStep - 1) / 10) * 100),
    }));
  }, []);

  const skipTour = useCallback(() => {
    updateState({
      showFeatureTour: false,
      showTooltips: true,
      currentStep: 0,
    });
  }, [updateState]);

  const completeTour = useCallback(() => {
    updateState({
      showFeatureTour: false,
      showSetupWizard: true,
      tourProgress: 100,
      currentStep: 0,
    });
  }, [updateState]);

  const startSetupWizard = useCallback(() => {
    updateState({
      showSetupWizard: true,
      currentStep: 0,
    });
  }, [updateState]);

  const nextWizardStep = useCallback(() => {
    setState((prev) => ({
      ...prev,
      currentStep: prev.currentStep + 1,
      wizardProgress: Math.min(100, ((prev.currentStep + 1) / 5) * 100),
    }));
  }, []);

  const prevWizardStep = useCallback(() => {
    setState((prev) => ({
      ...prev,
      currentStep: Math.max(0, prev.currentStep - 1),
      wizardProgress: Math.max(0, ((prev.currentStep - 1) / 5) * 100),
    }));
  }, []);

  const completeWizard = useCallback(() => {
    updateState({
      showSetupWizard: false,
      wizardProgress: 100,
      isFirstVisit: false,
      currentStep: 0,
    });
  }, [updateState]);

  const skipWizard = useCallback(() => {
    updateState({
      showSetupWizard: false,
      isFirstVisit: false,
      currentStep: 0,
    });
  }, [updateState]);

  const toggleSampleData = useCallback(() => {
    setState((prev) => ({
      ...prev,
      showSampleData: !prev.showSampleData,
    }));
  }, []);

  const toggleTooltips = useCallback(() => {
    setState((prev) => ({
      ...prev,
      showTooltips: !prev.showTooltips,
    }));
  }, []);

  const markStepCompleted = useCallback((stepId: string) => {
    setState((prev) => ({
      ...prev,
      completedSteps: [...new Set([...prev.completedSteps, stepId])],
    }));
  }, []);

  const resetOnboarding = useCallback(() => {
    setState(defaultState);
    localStorage.removeItem(ONBOARDING_STORAGE_KEY);
  }, []);

  const completeOnboarding = useCallback(() => {
    updateState({
      isFirstVisit: false,
      showWelcomeModal: false,
      showFeatureTour: false,
      showSetupWizard: false,
      showTooltips: true,
      currentStep: 0,
      tourProgress: 100,
      wizardProgress: 100,
    });
  }, [updateState]);

  return {
    state,
    isLoading,
    actions: {
      startOnboarding,
      dismissWelcomeModal,
      startFeatureTour,
      nextTourStep,
      prevTourStep,
      skipTour,
      completeTour,
      startSetupWizard,
      nextWizardStep,
      prevWizardStep,
      completeWizard,
      skipWizard,
      toggleSampleData,
      toggleTooltips,
      markStepCompleted,
      resetOnboarding,
      completeOnboarding,
    },
  };
}

// Tour steps definition
export const TOUR_STEPS: OnboardingStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to SolFolio',
    description: 'Your unified dashboard for tracking Solana DeFi positions',
  },
  {
    id: 'wallet',
    title: 'Connect Your Wallet',
    description: 'Start by connecting your Solana wallet to view your portfolio',
    target: '[data-tour="wallet-button"]',
    position: 'bottom',
  },
  {
    id: 'portfolio-overview',
    title: 'Portfolio Overview',
    description: 'See your total portfolio value and performance at a glance',
    target: '[data-tour="portfolio-overview"]',
    position: 'bottom',
  },
  {
    id: 'token-list',
    title: 'Token Holdings',
    description: 'View all your tokens with real-time prices and 24h changes',
    target: '[data-tour="token-list"]',
    position: 'top',
  },
  {
    id: 'positions',
    title: 'DeFi Positions',
    description: 'Track your positions across multiple protocols',
    target: '[data-tour="positions"]',
    position: 'top',
  },
  {
    id: 'charts',
    title: 'Analytics & Charts',
    description: 'Visualize your portfolio allocation and historical performance',
    target: '[data-tour="charts"]',
    position: 'left',
  },
  {
    id: 'filters',
    title: 'Advanced Filters',
    description: 'Filter and sort your portfolio data',
    target: '[data-tour="filters"]',
    position: 'bottom',
  },
  {
    id: 'export',
    title: 'Export Your Data',
    description: 'Export portfolio data in various formats',
    target: '[data-tour="export"]',
    position: 'left',
  },
  {
    id: 'settings',
    title: 'Customize Settings',
    description: 'Personalize your dashboard experience',
    target: '[data-tour="settings"]',
    position: 'left',
  },
  {
    id: 'complete',
    title: 'You\'re All Set!',
    description: 'Start exploring your Solana DeFi portfolio',
  },
];

// Wizard steps definition
export const WIZARD_STEPS = [
  {
    id: 'welcome',
    title: 'Welcome to SolFolio',
    description: 'Let\'s set up your portfolio tracker',
  },
  {
    id: 'wallet',
    title: 'Connect Wallet',
    description: 'Connect your Solana wallet to get started',
  },
  {
    id: 'preferences',
    title: 'Set Preferences',
    description: 'Choose your display currency and theme',
  },
  {
    id: 'notifications',
    title: 'Enable Notifications',
    description: 'Get alerts for important portfolio changes',
  },
  {
    id: 'complete',
    title: 'Setup Complete',
    description: 'Your portfolio tracker is ready to use!',
  },
];