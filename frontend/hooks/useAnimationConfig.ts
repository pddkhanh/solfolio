/**
 * Custom hook for animation configuration
 * Handles reduced motion preferences and animation settings
 */

import { useReducedMotion } from 'framer-motion';
import { useMemo } from 'react';
import { 
  animationConfig, 
  pageVariants,
  fadeVariants,
  getReducedMotionVariants,
  type AnimationDuration,
  type AnimationEasing,
} from '@/lib/animations';

interface UseAnimationConfigOptions {
  /**
   * Override default duration
   */
  duration?: AnimationDuration;
  /**
   * Override default easing
   */
  ease?: AnimationEasing;
  /**
   * Force disable animations
   */
  disabled?: boolean;
}

/**
 * Hook to get animation configuration with reduced motion support
 */
export function useAnimationConfig(options: UseAnimationConfigOptions = {}) {
  const shouldReduceMotion = useReducedMotion();
  const isDisabled = options.disabled || shouldReduceMotion;

  const config = useMemo(() => {
    if (isDisabled) {
      return {
        duration: 0,
        ease: 'linear' as const,
        variants: {},
        transition: { duration: 0 },
        initial: false,
        animate: false,
        exit: false,
        whileHover: undefined,
        whileTap: undefined,
        isDisabled: true,
      };
    }

    const duration = options.duration 
      ? animationConfig.duration[options.duration]
      : animationConfig.duration.normal;

    const ease = options.ease
      ? animationConfig.ease[options.ease]
      : animationConfig.ease.default;

    return {
      duration,
      ease,
      variants: pageVariants,
      transition: { duration, ease },
      initial: 'initial',
      animate: 'animate',
      exit: 'exit',
      whileHover: 'hover',
      whileTap: 'tap',
      isDisabled: false,
    };
  }, [isDisabled, options.duration, options.ease]);

  return config;
}

/**
 * Hook to get safe animation variants that respect reduced motion
 */
export function useSafeAnimationVariants<T extends Record<string, any>>(
  variants: T,
  override?: boolean
): T | {} {
  const shouldReduceMotion = useReducedMotion();

  return useMemo(() => {
    if (shouldReduceMotion && !override) {
      return getReducedMotionVariants(variants);
    }
    return variants;
  }, [shouldReduceMotion, variants, override]);
}

/**
 * Hook for spring animations with reduced motion support
 */
export function useSpringAnimation(
  stiffness: number = 500,
  damping: number = 30
) {
  const shouldReduceMotion = useReducedMotion();

  return useMemo(() => {
    if (shouldReduceMotion) {
      return { type: 'tween' as const, duration: 0 };
    }

    return {
      type: 'spring' as const,
      stiffness,
      damping,
    };
  }, [shouldReduceMotion, stiffness, damping]);
}

/**
 * Hook for scroll-triggered animations
 */
export function useScrollAnimation(threshold: number = 0.3) {
  const shouldReduceMotion = useReducedMotion();

  return useMemo(() => ({
    initial: shouldReduceMotion ? false : 'initial',
    whileInView: shouldReduceMotion ? false : 'whileInView',
    viewport: {
      once: true,
      amount: threshold,
    },
  }), [shouldReduceMotion, threshold]);
}

/**
 * Hook for gesture animations (drag, hover, tap)
 */
export function useGestureAnimation() {
  const shouldReduceMotion = useReducedMotion();

  return {
    whileHover: shouldReduceMotion ? undefined : { scale: 1.02 },
    whileTap: shouldReduceMotion ? undefined : { scale: 0.98 },
    whileDrag: shouldReduceMotion ? undefined : { scale: 1.05 },
    transition: shouldReduceMotion 
      ? { duration: 0 }
      : { type: 'spring' as const, stiffness: 400, damping: 25 },
  };
}