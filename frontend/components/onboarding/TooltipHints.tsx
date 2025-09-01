'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Info, X } from 'lucide-react';
import { useOnboardingContext } from '@/contexts/OnboardingProvider';

interface TooltipHint {
  id: string;
  target: string;
  content: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  delay?: number;
  persistent?: boolean;
}

const TOOLTIP_HINTS: TooltipHint[] = [
  {
    id: 'wallet-hint',
    target: '[data-hint="wallet"]',
    content: 'Connect your wallet to start tracking your portfolio',
    position: 'bottom',
    delay: 2000,
  },
  {
    id: 'portfolio-hint',
    target: '[data-hint="portfolio"]',
    content: 'Your total portfolio value updates in real-time',
    position: 'bottom',
    delay: 3000,
  },
  {
    id: 'filter-hint',
    target: '[data-hint="filter"]',
    content: 'Use filters to customize your view',
    position: 'left',
    delay: 4000,
  },
  {
    id: 'export-hint',
    target: '[data-hint="export"]',
    content: 'Export your data in multiple formats',
    position: 'left',
    delay: 5000,
  },
];

const hintVariants = {
  hidden: { opacity: 0, scale: 0.8, y: -10 },
  visible: { 
    opacity: 1, 
    scale: 1, 
    y: 0,
    transition: {
      type: 'spring' as const,
      stiffness: 500,
      damping: 30,
    }
  },
  exit: { 
    opacity: 0, 
    scale: 0.8,
    y: -10,
    transition: { duration: 0.2 }
  },
};

interface ActiveHint extends TooltipHint {
  rect: DOMRect;
}

export function TooltipHints() {
  const { state, markStepCompleted } = useOnboardingContext();
  const [activeHints, setActiveHints] = useState<ActiveHint[]>([]);
  const [dismissedHints, setDismissedHints] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!state.showTooltips || state.showFeatureTour || state.showSetupWizard) {
      setActiveHints([]);
      return;
    }

    const timers: NodeJS.Timeout[] = [];
    const observers: IntersectionObserver[] = [];

    TOOLTIP_HINTS.forEach((hint) => {
      if (dismissedHints.has(hint.id)) return;

      const timer = setTimeout(() => {
        const element = document.querySelector(hint.target);
        if (element) {
          const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
              if (entry.isIntersecting) {
                const rect = entry.target.getBoundingClientRect();
                setActiveHints((prev) => {
                  const exists = prev.some(h => h.id === hint.id);
                  if (!exists) {
                    return [...prev, { ...hint, rect }];
                  }
                  return prev;
                });
              } else {
                setActiveHints((prev) => prev.filter(h => h.id !== hint.id));
              }
            });
          });

          observer.observe(element);
          observers.push(observer);
        }
      }, hint.delay || 0);

      timers.push(timer);
    });

    return () => {
      timers.forEach(clearTimeout);
      observers.forEach(observer => observer.disconnect());
    };
  }, [state.showTooltips, state.showFeatureTour, state.showSetupWizard, dismissedHints]);

  const dismissHint = (hintId: string) => {
    setDismissedHints(prev => new Set(prev).add(hintId));
    setActiveHints(prev => prev.filter(h => h.id !== hintId));
    markStepCompleted(`hint-${hintId}`);
  };

  const getPosition = (hint: ActiveHint) => {
    const { rect, position = 'top' } = hint;
    const offset = 12;

    switch (position) {
      case 'top':
        return {
          top: rect.top - offset,
          left: rect.left + rect.width / 2,
          transform: 'translate(-50%, -100%)',
        };
      case 'bottom':
        return {
          top: rect.bottom + offset,
          left: rect.left + rect.width / 2,
          transform: 'translateX(-50%)',
        };
      case 'left':
        return {
          top: rect.top + rect.height / 2,
          left: rect.left - offset,
          transform: 'translate(-100%, -50%)',
        };
      case 'right':
        return {
          top: rect.top + rect.height / 2,
          left: rect.right + offset,
          transform: 'translateY(-50%)',
        };
    }
  };

  return (
    <AnimatePresence>
      {activeHints.map((hint) => {
        const position = getPosition(hint);
        
        return (
          <motion.div
            key={hint.id}
            className="fixed z-[90] pointer-events-auto"
            style={position}
            variants={hintVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <div className="relative">
              {/* Pulse animation */}
              <motion.div
                className="absolute inset-0 bg-purple-500 rounded-lg blur-xl opacity-30"
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.3, 0.1, 0.3],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeInOut' as const,
                }}
              />

              {/* Hint content */}
              <div className="relative bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg shadow-xl p-3 pr-8 max-w-xs">
                <div className="flex items-start gap-2">
                  <Info className="w-4 h-4 text-white flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-white leading-tight">
                    {hint.content}
                  </p>
                </div>

                {/* Dismiss button */}
                <button
                  className="absolute top-2 right-2 p-1 rounded hover:bg-white/20 transition-colors"
                  onClick={() => dismissHint(hint.id)}
                >
                  <X className="w-3 h-3 text-white" />
                </button>

                {/* Arrow pointer */}
                <div 
                  className={`absolute w-0 h-0 border-8 border-transparent ${
                    hint.position === 'top' 
                      ? 'bottom-[-16px] left-1/2 -translate-x-1/2 border-t-purple-600'
                      : hint.position === 'bottom'
                      ? 'top-[-16px] left-1/2 -translate-x-1/2 border-b-purple-600'
                      : hint.position === 'left'
                      ? 'right-[-16px] top-1/2 -translate-y-1/2 border-l-purple-600'
                      : 'left-[-16px] top-1/2 -translate-y-1/2 border-r-purple-600'
                  }`}
                />
              </div>
            </div>
          </motion.div>
        );
      })}
    </AnimatePresence>
  );
}

// Helper component to add hint targets
export function HintTarget({ 
  hint, 
  children, 
  className = '' 
}: { 
  hint: string; 
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div data-hint={hint} className={className}>
      {children}
    </div>
  );
}