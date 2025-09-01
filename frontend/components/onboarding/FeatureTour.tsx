'use client';

import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, X, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useOnboardingContext } from '@/contexts/OnboardingProvider';
import { TOUR_STEPS } from '@/hooks/useOnboarding';
import { useOnboardingSwipe } from '@/hooks/useOnboardingSwipe';

interface SpotlightPosition {
  top: number;
  left: number;
  width: number;
  height: number;
}

const spotlightVariants = {
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

const tooltipVariants = {
  hidden: { opacity: 0, scale: 0.8, y: 10 },
  visible: { 
    opacity: 1, 
    scale: 1, 
    y: 0,
    transition: {
      type: 'spring' as const,
      stiffness: 300,
      damping: 25,
    }
  },
  exit: { 
    opacity: 0, 
    scale: 0.9,
    transition: { duration: 0.2 }
  },
};

export function FeatureTour() {
  const { 
    state, 
    nextTourStep, 
    prevTourStep, 
    skipTour, 
    completeTour,
    markStepCompleted 
  } = useOnboardingContext();
  
  const [spotlightPos, setSpotlightPos] = useState<SpotlightPosition | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ top: '50%', left: '50%' });
  const tooltipRef = useRef<HTMLDivElement>(null);

  const currentStep = TOUR_STEPS[state.currentStep];
  const isLastStep = state.currentStep === TOUR_STEPS.length - 1;
  const isFirstStep = state.currentStep === 0;

  // Add swipe support for mobile
  useOnboardingSwipe({
    onSwipeLeft: () => {
      if (!isLastStep) nextTourStep();
    },
    onSwipeRight: () => {
      if (!isFirstStep) prevTourStep();
    },
    onSwipeUp: () => {
      skipTour();
    },
  });

  // Calculate spotlight position based on target element
  useEffect(() => {
    if (currentStep?.target) {
      const element = document.querySelector(currentStep.target);
      if (element) {
        const rect = element.getBoundingClientRect();
        setSpotlightPos({
          top: rect.top - 10,
          left: rect.left - 10,
          width: rect.width + 20,
          height: rect.height + 20,
        });

        // Calculate tooltip position
        let tooltipTop = '50%';
        let tooltipLeft = '50%';

        switch (currentStep.position) {
          case 'top':
            tooltipTop = `${rect.top - 150}px`;
            tooltipLeft = `${rect.left + rect.width / 2}px`;
            break;
          case 'bottom':
            tooltipTop = `${rect.bottom + 20}px`;
            tooltipLeft = `${rect.left + rect.width / 2}px`;
            break;
          case 'left':
            tooltipTop = `${rect.top + rect.height / 2}px`;
            tooltipLeft = `${rect.left - 420}px`;
            break;
          case 'right':
            tooltipTop = `${rect.top + rect.height / 2}px`;
            tooltipLeft = `${rect.right + 20}px`;
            break;
          default:
            tooltipTop = '50%';
            tooltipLeft = '50%';
        }

        setTooltipPosition({ top: tooltipTop, left: tooltipLeft });
      } else {
        setSpotlightPos(null);
        setTooltipPosition({ top: '50%', left: '50%' });
      }
    } else {
      setSpotlightPos(null);
      setTooltipPosition({ top: '50%', left: '50%' });
    }
  }, [currentStep, state.currentStep]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!state.showFeatureTour) return;
      
      switch (e.key) {
        case 'Escape':
          skipTour();
          break;
        case 'ArrowRight':
          if (!isLastStep) nextTourStep();
          break;
        case 'ArrowLeft':
          if (!isFirstStep) prevTourStep();
          break;
        case 'Enter':
          if (isLastStep) {
            completeTour();
          } else {
            nextTourStep();
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [state.showFeatureTour, isLastStep, isFirstStep, nextTourStep, prevTourStep, skipTour, completeTour]);

  const handleNext = () => {
    markStepCompleted(currentStep.id);
    if (isLastStep) {
      completeTour();
    } else {
      nextTourStep();
    }
  };

  if (!state.showFeatureTour || !currentStep) return null;

  return (
    <AnimatePresence mode="wait">
      {state.showFeatureTour && (
        <>
          {/* Overlay with spotlight */}
          <motion.div
            className="fixed inset-0 z-[100] pointer-events-none"
            variants={spotlightVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            {/* Dark overlay */}
            <div className="absolute inset-0 bg-black/80" />
            
            {/* Spotlight cutout */}
            {spotlightPos && (
              <motion.div
                className="absolute bg-transparent"
                style={{
                  top: spotlightPos.top,
                  left: spotlightPos.left,
                  width: spotlightPos.width,
                  height: spotlightPos.height,
                  boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.8)',
                  borderRadius: '8px',
                }}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ 
                  type: 'spring' as const,
                  stiffness: 300,
                  damping: 25,
                }}
              >
                {/* Glow effect */}
                <div className="absolute inset-0 rounded-lg animate-pulse">
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 opacity-30 blur-xl" />
                </div>
              </motion.div>
            )}
          </motion.div>

          {/* Tooltip */}
          <motion.div
            ref={tooltipRef}
            className="fixed z-[101] w-[400px] max-w-[90vw] pointer-events-auto"
            style={{
              top: tooltipPosition.top,
              left: tooltipPosition.left,
              transform: currentStep.target ? 
                (currentStep.position === 'left' || currentStep.position === 'right' ? 
                  'translateY(-50%)' : 'translateX(-50%)') 
                : 'translate(-50%, -50%)',
            }}
            variants={tooltipVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <div className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-xl shadow-2xl overflow-hidden">
              {/* Gradient border effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500 opacity-20 blur-xl" />
              
              <div className="relative bg-gray-900/95 backdrop-blur-xl rounded-xl p-6">
                {/* Progress bar */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gray-800 rounded-t-xl overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                    initial={{ width: '0%' }}
                    animate={{ 
                      width: `${((state.currentStep + 1) / TOUR_STEPS.length) * 100}%` 
                    }}
                    transition={{ duration: 0.3, ease: 'easeOut' as const }}
                  />
                </div>

                {/* Step indicator */}
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs text-gray-400">
                    Step {state.currentStep + 1} of {TOUR_STEPS.length}
                  </span>
                  <button
                    className="p-1 rounded-lg hover:bg-white/10 transition-colors"
                    onClick={skipTour}
                  >
                    <X className="w-4 h-4 text-gray-400" />
                  </button>
                </div>

                {/* Content */}
                <motion.div
                  key={currentStep.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <h3 className="text-xl font-semibold text-white mb-2">
                    {currentStep.title}
                  </h3>
                  <p className="text-gray-300 mb-6">
                    {currentStep.description}
                  </p>
                </motion.div>

                {/* Navigation */}
                <div className="flex items-center justify-between gap-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={prevTourStep}
                    disabled={isFirstStep}
                    className="text-gray-400 hover:text-white"
                  >
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    Previous
                  </Button>

                  <div className="flex gap-1">
                    {TOUR_STEPS.map((_, index) => (
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
                          scale: [1, 1.2, 1],
                        } : {}}
                        transition={{
                          duration: 1,
                          repeat: Infinity,
                        }}
                      />
                    ))}
                  </div>

                  <Button
                    size="sm"
                    onClick={handleNext}
                    className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-0"
                  >
                    {isLastStep ? (
                      <>
                        Finish
                        <Check className="w-4 h-4 ml-1" />
                      </>
                    ) : (
                      <>
                        Next
                        <ChevronRight className="w-4 h-4 ml-1" />
                      </>
                    )}
                  </Button>
                </div>

                {/* Skip option */}
                <button
                  className="w-full text-center text-xs text-gray-500 hover:text-gray-400 mt-4 transition-colors"
                  onClick={skipTour}
                >
                  Skip tour
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}