'use client';

import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';
import { pageVariants, staggerContainer } from '@/lib/animations';

interface PageTransitionProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Page transition wrapper component
 * Provides smooth transitions between pages using Framer Motion
 */
export function PageTransition({ children, className = '' }: PageTransitionProps) {
  const pathname = usePathname();
  const previousPathname = useRef(pathname);
  const [mounted, setMounted] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  
  useEffect(() => {
    setMounted(true);
    // Check for reduced motion preference on client only
    setReduceMotion(window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  }, []);
  
  useEffect(() => {
    // Track page changes for analytics or other purposes
    if (mounted && previousPathname.current !== pathname) {
      console.log(`Page transition: ${previousPathname.current} -> ${pathname}`);
      previousPathname.current = pathname;
      
      // Scroll to top on page change
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [pathname, mounted]);
  
  // During SSR or before mount, render without animations to prevent hydration mismatch
  if (!mounted || reduceMotion) {
    return <div className={className}>{children}</div>;
  }
  
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pathname}
        variants={pageVariants}
        initial="initial"
        animate="enter"
        exit="exit"
        className={className}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

/**
 * Section transition wrapper for page sections
 * Provides staggered animations for child elements
 */
export function SectionTransition({ 
  children, 
  className = '',
  delay = 0,
}: { 
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    <motion.div
      variants={staggerContainer}
      initial="initial"
      animate="animate"
      exit="exit"
      className={className}
      transition={{ delay }}
    >
      {children}
    </motion.div>
  );
}

/**
 * Fade transition wrapper for smooth opacity transitions
 */
export function FadeTransition({ 
  children,
  className = '',
  duration = 0.3,
}: {
  children: React.ReactNode;
  className?: string;
  duration?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/**
 * Slide transition wrapper for directional transitions
 */
export function SlideTransition({ 
  children,
  className = '',
  direction = 'up',
  distance = 30,
}: {
  children: React.ReactNode;
  className?: string;
  direction?: 'up' | 'down' | 'left' | 'right';
  distance?: number;
}) {
  const getInitialPosition = () => {
    switch (direction) {
      case 'up':
        return { y: distance };
      case 'down':
        return { y: -distance };
      case 'left':
        return { x: distance };
      case 'right':
        return { x: -distance };
      default:
        return { y: distance };
    }
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, ...getInitialPosition() }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      exit={{ opacity: 0, ...getInitialPosition() }}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/**
 * Scale transition wrapper for zoom effects
 */
export function ScaleTransition({ 
  children,
  className = '',
  scale = 0.95,
}: {
  children: React.ReactNode;
  className?: string;
  scale?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale }}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}