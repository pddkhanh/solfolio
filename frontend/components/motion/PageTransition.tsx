/**
 * Page Transition Wrapper Component
 * Provides smooth transitions between page navigations
 */

'use client';

import React from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { usePathname } from 'next/navigation';
import { pageVariants, animationConfig } from '@/lib/animations';

interface PageTransitionProps {
  children: React.ReactNode;
  className?: string;
  /**
   * Custom animation variants
   */
  variants?: typeof pageVariants;
  /**
   * Animation mode for presence
   */
  mode?: 'sync' | 'wait' | 'popLayout';
  /**
   * Whether to animate on initial mount
   */
  initial?: boolean;
}

/**
 * Wrapper component that adds page transitions
 * Should be used in app layout or individual page components
 */
export const PageTransition: React.FC<PageTransitionProps> = ({
  children,
  className,
  variants = pageVariants,
  mode = 'wait',
  initial = false,
}) => {
  const pathname = usePathname();
  const shouldReduceMotion = useReducedMotion();

  // Skip animations if user prefers reduced motion
  if (shouldReduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <AnimatePresence mode={mode} initial={initial}>
      <motion.div
        key={pathname}
        initial="initial"
        animate="enter"
        exit="exit"
        variants={variants}
        className={className}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};

/**
 * HOC to wrap any component with page transitions
 */
export function withPageTransition<P extends object>(
  Component: React.ComponentType<P>,
  transitionProps?: Omit<PageTransitionProps, 'children'>
) {
  const WithTransition = (props: P) => {
    return (
      <PageTransition {...transitionProps}>
        <Component {...props} />
      </PageTransition>
    );
  };

  WithTransition.displayName = `withPageTransition(${Component.displayName || Component.name || 'Component'})`;

  return WithTransition;
}

/**
 * Layout-specific transition wrapper
 * Optimized for layout shifts and shared element transitions
 */
export const LayoutTransition: React.FC<{
  children: React.ReactNode;
  className?: string;
  layoutId?: string;
}> = ({ children, className, layoutId }) => {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      layout
      layoutId={layoutId}
      transition={{
        layout: {
          duration: animationConfig.duration.normal,
          ease: animationConfig.ease.default,
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

/**
 * Section transition for individual page sections
 * Useful for staggering content appearance
 */
export const SectionTransition: React.FC<{
  children: React.ReactNode;
  className?: string;
  delay?: number;
}> = ({ children, className, delay = 0 }) => {
  const shouldReduceMotion = useReducedMotion();

  const sectionVariants = {
    initial: {
      opacity: 0,
      y: 20,
    },
    enter: {
      opacity: 1,
      y: 0,
      transition: {
        duration: animationConfig.duration.slow,
        ease: animationConfig.ease.default,
        delay,
      },
    },
  };

  if (shouldReduceMotion) {
    return <section className={className}>{children}</section>;
  }

  return (
    <motion.section
      initial="initial"
      animate="enter"
      variants={sectionVariants}
      className={className}
    >
      {children}
    </motion.section>
  );
};