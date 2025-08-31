'use client';

import React from 'react';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import { X, Filter, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FilterPanel } from './FilterPanel';
import { QuickFilterChipsCompact } from './QuickFilterChips';
import { FilterState } from '@/types/filters';
import { useAdvancedFilters } from '@/hooks/useAdvancedFilters';

interface FilterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onFiltersChange?: (filters: FilterState) => void;
  className?: string;
}

const DRAWER_HEIGHT = '85vh';
const DRAWER_SNAP_POINTS = [0.3, 0.6, 0.85]; // 30%, 60%, 85% of viewport height

export function FilterDrawer({ 
  isOpen, 
  onClose, 
  onFiltersChange, 
  className 
}: FilterDrawerProps) {
  const [snapPoint, setSnapPoint] = React.useState(DRAWER_SNAP_POINTS[1]);
  const [isDragging, setIsDragging] = React.useState(false);
  
  const { hasActiveFilters, activeFilterCount } = useAdvancedFilters();

  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const { offset, velocity } = info;
    const swipeConfidenceThreshold = 10000;
    const swipePower = Math.abs(offset.y) * velocity.y;

    // If dragging down with enough force, close drawer
    if (offset.y > 50 && swipePower > swipeConfidenceThreshold) {
      onClose();
      return;
    }

    // Snap to closest snap point
    const currentProgress = Math.abs(offset.y) / window.innerHeight;
    let closestSnapPoint = snapPoint;
    let minDistance = Infinity;

    DRAWER_SNAP_POINTS.forEach((point) => {
      const distance = Math.abs(point - (snapPoint + currentProgress));
      if (distance < minDistance) {
        minDistance = distance;
        closestSnapPoint = point;
      }
    });

    setSnapPoint(closestSnapPoint);
    setIsDragging(false);
  };

  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { duration: 0.3 }
    },
  };

  const drawerVariants = {
    hidden: {
      y: '100%',
      opacity: 0,
    },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: 'spring' as const,
        stiffness: 300,
        damping: 30,
        mass: 0.8,
      },
    },
    exit: {
      y: '100%',
      opacity: 0,
      transition: {
        duration: 0.2,
      },
    },
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Drawer */}
          <motion.div
            variants={drawerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.2 }}
            onDragStart={() => setIsDragging(true)}
            onDragEnd={handleDragEnd}
            className={cn(
              'fixed bottom-0 left-0 right-0 z-50 bg-background border-t rounded-t-xl shadow-2xl',
              className
            )}
            style={{ 
              height: `${snapPoint * 100}vh`,
              maxHeight: DRAWER_HEIGHT,
            }}
          >
            {/* Drag Handle */}
            <div className="flex flex-col items-center py-2 px-4 border-b bg-secondary/20">
              <div className="w-12 h-1 bg-muted-foreground/30 rounded-full mb-2" />
              
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2">
                  <Filter className="h-5 w-5" />
                  <span className="font-semibold">Filters</span>
                  {hasActiveFilters && (
                    <Badge variant="secondary">
                      {activeFilterCount}
                    </Badge>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {/* Snap point indicators */}
                  <div className="flex gap-1">
                    {DRAWER_SNAP_POINTS.map((point) => (
                      <button
                        key={point}
                        onClick={() => setSnapPoint(point)}
                        className={cn(
                          'w-2 h-2 rounded-full transition-colors',
                          snapPoint === point 
                            ? 'bg-primary' 
                            : 'bg-muted-foreground/30'
                        )}
                      />
                    ))}
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onClose}
                    className="p-1"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-auto">
              <div className="p-4">
                <FilterPanel
                  onFiltersChange={onFiltersChange}
                  showQuickFilters={true}
                  collapsible={true}
                  defaultExpanded={false}
                />
              </div>
            </div>

            {/* Action Bar */}
            <div className="border-t bg-background p-4">
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    // Clear all filters
                    onFiltersChange?.({
                      searchQuery: '',
                      tokenTypes: [],
                      protocols: [],
                      chains: [],
                      positionTypes: [],
                      valueRange: null,
                      apyRange: null,
                      hideSmallBalances: false,
                      hideZeroBalances: false,
                      showOnlyStaked: false,
                      showOnlyActive: false,
                      sortBy: 'value',
                      sortOrder: 'desc',
                      viewMode: 'list',
                      groupBy: 'none',
                    });
                  }}
                  className="flex-1"
                  disabled={!hasActiveFilters}
                >
                  Clear All
                </Button>
                
                <Button 
                  onClick={onClose}
                  className="flex-1"
                >
                  Apply Filters
                </Button>
              </div>
            </div>

            {/* Pull-up indicator when minimized */}
            {snapPoint === DRAWER_SNAP_POINTS[0] && (
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                onClick={() => setSnapPoint(DRAWER_SNAP_POINTS[1])}
                className="absolute -top-12 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground rounded-full p-2 shadow-lg"
              >
                <ChevronUp className="h-5 w-5" />
              </motion.button>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// Filter button for mobile that opens the drawer
interface MobileFilterButtonProps {
  onOpen: () => void;
  hasActiveFilters?: boolean;
  activeFilterCount?: number;
  className?: string;
}

export function MobileFilterButton({
  onOpen,
  hasActiveFilters = false,
  activeFilterCount = 0,
  className
}: MobileFilterButtonProps) {
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onOpen}
      className={cn(
        'relative flex items-center gap-2 rounded-full bg-primary text-primary-foreground px-4 py-2 shadow-lg',
        className
      )}
    >
      <Filter className="h-4 w-4" />
      <span className="font-medium">Filters</span>
      
      {hasActiveFilters && (
        <Badge 
          variant="secondary" 
          className="ml-1 bg-white/20 text-primary-foreground border-0"
        >
          {activeFilterCount}
        </Badge>
      )}

      {/* Animated pulse when filters are active */}
      {hasActiveFilters && (
        <motion.div
          className="absolute inset-0 rounded-full bg-primary"
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.5, 0, 0.5],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
          }}
        />
      )}
    </motion.button>
  );
}

// Hook for managing drawer state
export function useFilterDrawer() {
  const [isOpen, setIsOpen] = React.useState(false);

  const open = React.useCallback(() => setIsOpen(true), []);
  const close = React.useCallback(() => setIsOpen(false), []);
  const toggle = React.useCallback(() => setIsOpen(prev => !prev), []);

  return {
    isOpen,
    open,
    close,
    toggle,
  };
}