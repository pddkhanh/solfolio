"use client";

import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import React, { ReactNode } from "react";
import { Skeleton, SkeletonCard, SkeletonContainer } from "./skeleton";
import { EmptyState, EmptyStateProps } from "./empty-state";
import { Loader2 } from "lucide-react";

interface LoadingWrapperProps {
  isLoading: boolean;
  error?: string | null;
  isEmpty?: boolean;
  emptyStateProps?: EmptyStateProps;
  loadingComponent?: ReactNode;
  errorComponent?: ReactNode;
  children: ReactNode;
  className?: string;
  fadeIn?: boolean;
  minHeight?: string;
}

/**
 * Wrapper component that handles loading, error, and empty states
 * Provides smooth transitions between different states
 */
export function LoadingWrapper({
  isLoading,
  error,
  isEmpty = false,
  emptyStateProps,
  loadingComponent,
  errorComponent,
  children,
  className,
  fadeIn = true,
  minHeight = "400px",
}: LoadingWrapperProps) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: {
        duration: 0.3,
        ease: [0.4, 0, 0.2, 1] as [number, number, number, number],
      }
    },
    exit: { 
      opacity: 0,
      transition: {
        duration: 0.2,
      }
    },
  };

  if (isLoading) {
    return (
      <AnimatePresence mode="wait">
        <motion.div
          key="loading"
          variants={fadeIn ? containerVariants : undefined}
          initial={fadeIn ? "hidden" : undefined}
          animate={fadeIn ? "visible" : undefined}
          exit={fadeIn ? "exit" : undefined}
          className={cn("relative", className)}
          style={{ minHeight }}
        >
          {loadingComponent || <DefaultLoadingState />}
        </motion.div>
      </AnimatePresence>
    );
  }

  if (error) {
    return (
      <AnimatePresence mode="wait">
        <motion.div
          key="error"
          variants={fadeIn ? containerVariants : undefined}
          initial={fadeIn ? "hidden" : undefined}
          animate={fadeIn ? "visible" : undefined}
          exit={fadeIn ? "exit" : undefined}
          className={cn("relative", className)}
          style={{ minHeight }}
        >
          {errorComponent || (
            <EmptyState
              variant="error"
              description={error}
              action={{
                label: "Try Again",
                onClick: () => window.location.reload(),
              }}
              animated={true}
            />
          )}
        </motion.div>
      </AnimatePresence>
    );
  }

  if (isEmpty) {
    return (
      <AnimatePresence mode="wait">
        <motion.div
          key="empty"
          variants={fadeIn ? containerVariants : undefined}
          initial={fadeIn ? "hidden" : undefined}
          animate={fadeIn ? "visible" : undefined}
          exit={fadeIn ? "exit" : undefined}
          className={cn("relative", className)}
          style={{ minHeight }}
        >
          <EmptyState {...(emptyStateProps || {})} animated={true} />
        </motion.div>
      </AnimatePresence>
    );
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key="content"
        variants={fadeIn ? containerVariants : undefined}
        initial={fadeIn ? "hidden" : undefined}
        animate={fadeIn ? "visible" : undefined}
        exit={fadeIn ? "exit" : undefined}
        className={className}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

/**
 * Default loading state with centered spinner
 */
function DefaultLoadingState() {
  return (
    <div className="flex items-center justify-center h-full">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      >
        <Loader2 className="w-8 h-8 text-purple-500" />
      </motion.div>
    </div>
  );
}

/**
 * Staggered loading state for lists
 */
export function StaggeredLoadingState({ count = 3 }: { count?: number }) {
  return (
    <SkeletonContainer className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.1 }}
        >
          <SkeletonCard />
        </motion.div>
      ))}
    </SkeletonContainer>
  );
}

/**
 * Grid loading state for card layouts
 */
export function GridLoadingState({ 
  columns = 3, 
  rows = 2 
}: { 
  columns?: number; 
  rows?: number;
}) {
  const totalCards = columns * rows;
  
  return (
    <SkeletonContainer 
      className={cn(
        "grid gap-4",
        `grid-cols-1 sm:grid-cols-2 lg:grid-cols-${columns}`
      )}
    >
      {Array.from({ length: totalCards }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: i * 0.05 }}
        >
          <SkeletonCard showAvatar={true} />
        </motion.div>
      ))}
    </SkeletonContainer>
  );
}

/**
 * Pulse loading overlay for refreshing data
 */
export function RefreshingOverlay({ isRefreshing }: { isRefreshing: boolean }) {
  if (!isRefreshing) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center"
    >
      <motion.div
        className="bg-bg-secondary rounded-lg p-4 shadow-xl border border-purple-500/20"
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 500 }}
      >
        <div className="flex items-center gap-3">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          >
            <Loader2 className="w-5 h-5 text-purple-500" />
          </motion.div>
          <span className="text-sm text-gray-300">Refreshing data...</span>
        </div>
      </motion.div>
    </motion.div>
  );
}

/**
 * Progressive content reveal with stagger
 */
export function ProgressiveReveal({
  children,
  delay = 0,
  stagger = 0.1,
}: {
  children: ReactNode[];
  delay?: number;
  stagger?: number;
}) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            delayChildren: delay,
            staggerChildren: stagger,
          },
        },
      }}
    >
      {React.Children.map(children, (child, index) => (
        <motion.div
          key={index}
          variants={{
            hidden: { opacity: 0, y: 20 },
            visible: {
              opacity: 1,
              y: 0,
              transition: {
                duration: 0.4,
                ease: [0.4, 0, 0.2, 1] as [number, number, number, number],
              },
            },
          }}
        >
          {child}
        </motion.div>
      ))}
    </motion.div>
  );
}

export default LoadingWrapper;