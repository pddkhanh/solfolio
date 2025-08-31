'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { X, Sparkles, TrendingUp, Lock, Waves, Zap } from 'lucide-react';
import { QuickFilter, QUICK_FILTERS, FilterState } from '@/types/filters';

interface QuickFilterChipsProps {
  onApplyFilter: (filters: Partial<FilterState>) => void;
  activeFilters: FilterState;
  className?: string;
  showCustom?: boolean;
  customFilters?: QuickFilter[];
}

const iconMap: Record<string, React.ReactNode> = {
  '💰': <Sparkles className="h-4 w-4" />,
  '🔒': <Lock className="h-4 w-4" />,
  '🌊': <Waves className="h-4 w-4" />,
  '📈': <TrendingUp className="h-4 w-4" />,
  '⚡': <Zap className="h-4 w-4" />,
};

export function QuickFilterChips({
  onApplyFilter,
  activeFilters,
  className,
  showCustom = false,
  customFilters = [],
}: QuickFilterChipsProps) {
  const [selectedFilters, setSelectedFilters] = React.useState<Set<string>>(new Set());
  const [isExpanded, setIsExpanded] = React.useState(false);

  const allFilters = [...QUICK_FILTERS, ...customFilters];
  const visibleFilters = isExpanded ? allFilters : allFilters.slice(0, 4);

  const handleFilterClick = (filter: QuickFilter) => {
    const isSelected = selectedFilters.has(filter.id);
    
    if (isSelected) {
      // Remove filter
      const newSelected = new Set(selectedFilters);
      newSelected.delete(filter.id);
      setSelectedFilters(newSelected);
      
      // Reset to default for this filter's properties
      const resetFilters: Partial<FilterState> = {};
      if (filter.filters.valueRange) resetFilters.valueRange = null;
      if (filter.filters.apyRange) resetFilters.apyRange = null;
      if (filter.filters.positionTypes) resetFilters.positionTypes = [];
      if (filter.filters.chains) resetFilters.chains = [];
      if (filter.filters.showOnlyStaked !== undefined) resetFilters.showOnlyStaked = false;
      
      onApplyFilter(resetFilters);
    } else {
      // Apply filter
      const newSelected = new Set(selectedFilters);
      newSelected.add(filter.id);
      setSelectedFilters(newSelected);
      onApplyFilter(filter.filters);
    }
  };

  const clearAllQuickFilters = () => {
    setSelectedFilters(new Set());
    // Reset all quick filter properties
    onApplyFilter({
      valueRange: null,
      apyRange: null,
      positionTypes: [],
      chains: [],
      showOnlyStaked: false,
    });
  };

  const chipVariants = {
    initial: { opacity: 0, scale: 0.8, y: -10 },
    animate: { 
      opacity: 1, 
      scale: 1, 
      y: 0,
      transition: {
        type: 'spring' as const,
        stiffness: 300,
        damping: 20,
      },
    },
    exit: { 
      opacity: 0, 
      scale: 0.8, 
      y: -10,
      transition: { duration: 0.2 },
    },
    hover: {
      scale: 1.05,
      transition: { duration: 0.2 },
    },
    tap: {
      scale: 0.95,
    },
  };

  const getChipColor = (color?: QuickFilter['color'], isSelected?: boolean) => {
    if (isSelected) {
      switch (color) {
        case 'primary': return 'bg-primary text-primary-foreground';
        case 'secondary': return 'bg-secondary text-secondary-foreground';
        case 'success': return 'bg-green-500 text-white dark:bg-green-600';
        case 'warning': return 'bg-yellow-500 text-white dark:bg-yellow-600';
        case 'danger': return 'bg-red-500 text-white dark:bg-red-600';
        case 'info': return 'bg-blue-500 text-white dark:bg-blue-600';
        default: return 'bg-primary text-primary-foreground';
      }
    }
    return 'bg-secondary/50 hover:bg-secondary/70 text-secondary-foreground';
  };

  return (
    <div className={cn('space-y-3', className)}>
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-muted-foreground">Quick Filters</h3>
        {selectedFilters.size > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAllQuickFilters}
            className="h-7 px-2 text-xs"
          >
            Clear all
            <X className="ml-1 h-3 w-3" />
          </Button>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        <AnimatePresence mode="popLayout">
          {visibleFilters.map((filter, index) => {
            const isSelected = selectedFilters.has(filter.id);
            const Icon = filter.icon ? iconMap[filter.icon] : null;

            return (
              <motion.button
                key={filter.id}
                variants={chipVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                whileHover="hover"
                whileTap="tap"
                transition={{ delay: index * 0.05 }}
                onClick={() => handleFilterClick(filter)}
                className={cn(
                  'inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-colors',
                  getChipColor(filter.color, isSelected),
                  'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2'
                )}
              >
                {Icon && <span className="flex-shrink-0">{Icon}</span>}
                <span>{filter.label}</span>
                {isSelected && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="ml-1 flex-shrink-0"
                  >
                    <X className="h-3 w-3" />
                  </motion.span>
                )}
              </motion.button>
            );
          })}
        </AnimatePresence>

        {allFilters.length > 4 && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsExpanded(!isExpanded)}
            className="inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            {isExpanded ? 'Show less' : `+${allFilters.length - 4} more`}
          </motion.button>
        )}
      </div>

      {/* Active filter summary */}
      {selectedFilters.size > 0 && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="flex flex-wrap gap-1 pt-2 border-t border-border"
        >
          {Array.from(selectedFilters).map(id => {
            const filter = allFilters.find(f => f.id === id);
            if (!filter) return null;
            
            return (
              <Badge
                key={id}
                variant="outline"
                className="text-xs"
              >
                {filter.label}
              </Badge>
            );
          })}
        </motion.div>
      )}
    </div>
  );
}

// Compact version for mobile
export function QuickFilterChipsCompact({
  onApplyFilter,
  activeFilters,
  className,
}: QuickFilterChipsProps) {
  const [showMenu, setShowMenu] = React.useState(false);

  return (
    <div className={cn('relative', className)}>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setShowMenu(!showMenu)}
        className="gap-2"
      >
        <Sparkles className="h-4 w-4" />
        Quick Filters
        {activeFilters && (
          <Badge variant="secondary" className="ml-1 h-5 px-1">
            {/* Count active quick filters */}
            2
          </Badge>
        )}
      </Button>

      <AnimatePresence>
        {showMenu && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full mt-2 left-0 z-50 w-64 rounded-lg border bg-popover p-3 shadow-lg"
          >
            <QuickFilterChips
              onApplyFilter={onApplyFilter}
              activeFilters={activeFilters}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}