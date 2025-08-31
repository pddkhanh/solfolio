'use client';

import { motion } from 'framer-motion';
import { Skeleton, SkeletonContainer } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { staggerContainer, staggerItem } from '@/lib/animations';

/**
 * Skeleton component for the navigation header
 * Shows loading state with animated shimmers
 */
export function HeaderSkeleton() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border-default/50">
      {/* Glassmorphism background */}
      <div className="absolute inset-0 bg-bg-primary/80 backdrop-blur-xl" />
      
      {/* Gradient border effect */}
      <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-border-default to-transparent opacity-50" />
      
      <div className="container relative mx-auto px-4">
        <div className="flex h-[72px] items-center justify-between">
          {/* Logo skeleton */}
          <SkeletonContainer className="flex items-center">
            <motion.div variants={staggerItem} className="flex items-center space-x-2">
              <Skeleton variant="circular" className="h-10 w-10" animation="shimmer" />
              <Skeleton className="h-6 w-24" animation="shimmer" delay={0.1} />
            </motion.div>
          </SkeletonContainer>

          {/* Desktop Navigation skeleton */}
          <motion.nav 
            className="hidden md:flex items-center space-x-1"
            variants={staggerContainer}
            initial="initial"
            animate="animate"
          >
            {[1, 2, 3, 4].map((_, index) => (
              <motion.div
                key={index}
                variants={staggerItem}
                custom={index}
              >
                <Skeleton 
                  className="h-8 w-20 rounded-lg" 
                  animation="shimmer" 
                  delay={index * 0.1}
                />
              </motion.div>
            ))}
          </motion.nav>

          {/* Right side actions skeleton */}
          <SkeletonContainer className="flex items-center space-x-4">
            {/* Connection Status skeleton */}
            <motion.div variants={staggerItem} className="hidden lg:block">
              <Skeleton className="h-8 w-24 rounded-full" animation="shimmer" delay={0.2} />
            </motion.div>
            
            <motion.div variants={staggerItem} className="lg:hidden">
              <Skeleton variant="circular" className="h-8 w-8" animation="shimmer" delay={0.2} />
            </motion.div>

            {/* Theme Toggle skeleton */}
            <motion.div variants={staggerItem}>
              <Skeleton variant="circular" className="h-9 w-9" animation="shimmer" delay={0.3} />
            </motion.div>

            {/* Wallet button skeleton */}
            <motion.div variants={staggerItem} className="hidden md:block">
              <Skeleton className="h-9 w-32 rounded-lg" animation="shimmer" delay={0.4} />
            </motion.div>

            {/* Mobile menu button skeleton */}
            <motion.div variants={staggerItem} className="md:hidden">
              <Skeleton variant="circular" className="h-9 w-9" animation="shimmer" delay={0.5} />
            </motion.div>
          </SkeletonContainer>
        </div>
      </div>
    </header>
  );
}

/**
 * Minimal header skeleton for faster initial load
 */
export function HeaderSkeletonMinimal() {
  return (
    <header className="sticky top-0 z-50 w-full h-[72px] border-b border-border-default/50 bg-bg-primary/80 backdrop-blur-xl">
      <div className="container mx-auto px-4 h-full">
        <div className="flex h-full items-center justify-between">
          <Skeleton className="h-10 w-32" animation="pulse" />
          <Skeleton className="h-9 w-32 rounded-lg" animation="pulse" />
        </div>
      </div>
    </header>
  );
}