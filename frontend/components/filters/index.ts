/**
 * Advanced Filtering System - TASK-UI-021
 * Complete filtering solution with animations, presets, and mobile support
 */

// Main components
export { FilterPanel } from './FilterPanel';
export { FilterDrawer, MobileFilterButton, useFilterDrawer } from './FilterDrawer';
export { QuickFilterChips, QuickFilterChipsCompact } from './QuickFilterChips';
export { PortfolioFilters } from './PortfolioFilters';

// Animation components
export { 
  AnimatedFilterResults, 
  AnimatedFilterGrid, 
  AnimatedFilterList,
  useFilterAnimations,
  filterAnimationPresets,
} from './AnimatedFilterResults';

// Hooks
export { useAdvancedFilters } from '@/hooks/useAdvancedFilters';

// Types and constants
export type {
  FilterState,
  FilterPreset,
  QuickFilter,
  TokenType,
  ProtocolType,
  ChainType,
  PositionType,
  ValueRange,
} from '@/types/filters';

export {
  DEFAULT_FILTER_STATE,
  QUICK_FILTERS,
  PROTOCOL_INFO,
  TOKEN_TYPE_INFO,
} from '@/types/filters';

// Re-export UI components used by filters
export { MultiSelect, MultiSelectChips } from '@/components/ui/multi-select';
export { RangeSlider, Slider } from '@/components/ui/range-slider';