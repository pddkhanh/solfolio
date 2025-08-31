'use client';

import React from 'react';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';
import { cn } from '@/lib/utils';
import { FilterState } from '@/types/filters';

interface AnimatedFilterResultsProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  keyExtractor: (item: T) => string;
  filters: FilterState;
  className?: string;
  staggerChildren?: number;
  layoutTransition?: boolean;
  emptyState?: React.ReactNode;
  loadingState?: React.ReactNode;
  isLoading?: boolean;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1,
    },
  },
  exit: {
    opacity: 0,
    transition: {
      staggerChildren: 0.03,
      staggerDirection: -1,
    },
  },
};

const itemVariants = {
  hidden: {
    opacity: 0,
    y: 20,
    scale: 0.95,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: 'spring' as const,
      stiffness: 400,
      damping: 25,
      mass: 0.8,
    },
  },
  exit: {
    opacity: 0,
    y: -10,
    scale: 0.95,
    transition: {
      duration: 0.2,
    },
  },
};

const loadingVariants = {
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

export function AnimatedFilterResults<T>({
  items,
  renderItem,
  keyExtractor,
  filters,
  className,
  staggerChildren = 0.05,
  layoutTransition = true,
  emptyState,
  loadingState,
  isLoading = false,
}: AnimatedFilterResultsProps<T>) {
  const [prevItemCount, setPrevItemCount] = React.useState(items.length);
  const [isFiltering, setIsFiltering] = React.useState(false);

  React.useEffect(() => {
    if (items.length !== prevItemCount) {
      setIsFiltering(true);
      const timer = setTimeout(() => {
        setIsFiltering(false);
        setPrevItemCount(items.length);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [items.length, prevItemCount]);

  // Enhanced container variants with custom stagger timing
  const customContainerVariants = {
    ...containerVariants,
    visible: {
      ...containerVariants.visible,
      transition: {
        ...containerVariants.visible.transition,
        staggerChildren,
      },
    },
  };

  if (isLoading && loadingState) {
    return (
      <AnimatePresence mode="wait">
        <motion.div
          key="loading"
          variants={loadingVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className={className}
        >
          {loadingState}
        </motion.div>
      </AnimatePresence>
    );
  }

  if (items.length === 0 && emptyState) {
    return (
      <AnimatePresence mode="wait">
        <motion.div
          key="empty"
          variants={loadingVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className={cn('flex flex-col items-center justify-center py-12', className)}
        >
          {emptyState}
        </motion.div>
      </AnimatePresence>
    );
  }

  return (
    <LayoutGroup>
      <motion.div
        layout={layoutTransition}
        variants={customContainerVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        className={className}
      >
        <AnimatePresence mode="popLayout">
          {items.map((item, index) => (
            <motion.div
              key={keyExtractor(item)}
              layout={layoutTransition}
              variants={itemVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              whileHover={{
                scale: 1.02,
                transition: { duration: 0.2 },
              }}
              className="relative"
            >
              {renderItem(item, index)}
              
              {/* Highlight animation for newly filtered items */}
              {isFiltering && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0, 0.2, 0] }}
                  transition={{ duration: 1, ease: 'easeInOut' }}
                  className="absolute inset-0 bg-primary/10 rounded-lg pointer-events-none"
                />
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Filter count indicator */}
        <AnimatePresence>
          {isFiltering && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="fixed bottom-4 right-4 bg-primary text-primary-foreground px-3 py-2 rounded-full text-sm font-medium shadow-lg z-50"
            >
              {items.length} result{items.length !== 1 ? 's' : ''}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </LayoutGroup>
  );
}

// Specialized version for grid layouts
export function AnimatedFilterGrid<T>({
  items,
  renderItem,
  keyExtractor,
  filters,
  className,
  columns = { sm: 1, md: 2, lg: 3 },
  gap = 4,
  ...props
}: AnimatedFilterResultsProps<T> & {
  columns?: { sm?: number; md?: number; lg?: number; xl?: number };
  gap?: number;
}) {
  const gridClasses = cn(
    'grid gap-4',
    columns.sm && `grid-cols-${columns.sm}`,
    columns.md && `md:grid-cols-${columns.md}`,
    columns.lg && `lg:grid-cols-${columns.lg}`,
    columns.xl && `xl:grid-cols-${columns.xl}`,
    gap && `gap-${gap}`,
    className
  );

  return (
    <AnimatedFilterResults
      {...props}
      items={items}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      filters={filters}
      className={gridClasses}
    />
  );
}

// Specialized version for list layouts
export function AnimatedFilterList<T>({
  items,
  renderItem,
  keyExtractor,
  filters,
  className,
  divider = false,
  ...props
}: AnimatedFilterResultsProps<T> & {
  divider?: boolean;
}) {
  const listClasses = cn(
    'space-y-2',
    divider && 'divide-y divide-border',
    className
  );

  return (
    <AnimatedFilterResults
      {...props}
      items={items}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      filters={filters}
      className={listClasses}
    />
  );
}

// Hook for managing filter animations
export function useFilterAnimations() {
  const [isAnimating, setIsAnimating] = React.useState(false);
  const [pendingFilters, setPendingFilters] = React.useState<FilterState | null>(null);

  const applyFiltersWithAnimation = React.useCallback(
    (newFilters: FilterState, onApply: (filters: FilterState) => void) => {
      setIsAnimating(true);
      setPendingFilters(newFilters);
      
      // Small delay to show loading state
      setTimeout(() => {
        onApply(newFilters);
        
        // Animation completion
        setTimeout(() => {
          setIsAnimating(false);
          setPendingFilters(null);
        }, 500);
      }, 100);
    },
    []
  );

  return {
    isAnimating,
    pendingFilters,
    applyFiltersWithAnimation,
  };
}

// Animation presets for different scenarios
export const filterAnimationPresets = {
  fast: {
    staggerChildren: 0.03,
    itemDuration: 0.2,
  },
  normal: {
    staggerChildren: 0.05,
    itemDuration: 0.3,
  },
  slow: {
    staggerChildren: 0.08,
    itemDuration: 0.4,
  },
  bounce: {
    staggerChildren: 0.05,
    itemType: 'spring',
    itemStiffness: 600,
    itemDamping: 20,
  },
};