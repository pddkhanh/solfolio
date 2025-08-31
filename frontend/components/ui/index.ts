/**
 * UI Components Index
 * Exports all reusable UI components for SolFolio
 */

// Core UI Components
export { default as AnimatedButton, AnimatedIconButton, FloatingActionButton } from './animated-button';
export { default as AnimatedCard, FlipCard, ExpandableCard, ParallaxCard, MetricCard } from './animated-card';
export { default as AnimatedIcons } from './animated-icons';
export { default as AnimatedTooltip, Tooltip, ClickTooltip, RichTooltip, ShortcutTooltip, TooltipProvider, useTooltip } from './animated-tooltip';

// Loading & Skeleton Components
export { 
  Skeleton, 
  SkeletonText, 
  SkeletonCard, 
  SkeletonTableRow, 
  SkeletonContainer,
  SkeletonMetric,
  SkeletonTokenRow,
  SkeletonPositionCard,
  SkeletonChart
} from './skeleton';

export { default as LoadingSpinner, LoadingScreen, InlineLoader, ProgressBar } from './loading-spinner';

// Shimmer Effects
export { Shimmer, ShimmerWrapper, GradientShimmer, PulseEffect, WaveShimmer } from './shimmer';

// Feedback Components
export { 
  default as FeedbackAnimation,
  SuccessAnimation,
  ErrorAnimation,
  WarningAnimation,
  InfoAnimation,
  FloatingFeedback,
  InlineFeedback,
  ProgressSuccess
} from './feedback-animations';

// Existing UI Components (re-export for convenience)
export { Button } from './button';
export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent } from './card';
export { Badge } from './badge';
export { Input } from './input';
export { Label } from './label';
export { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select';
export { Switch } from './switch';
export { Tabs, TabsContent, TabsList, TabsTrigger } from './tabs';
export { ThemeToggle } from './theme-toggle';
export { Alert, AlertDescription, AlertTitle } from './alert';
export { Toaster } from './toaster';
// export { toast } from './toast'; // Not available in current setup

// Specialized Components
export { CountUp } from './count-up';
export { Sparkline } from './sparkline';
export { SwipeableRow } from './swipeable-row';
export { VirtualList } from './virtual-list';
export { EmptyState } from './empty-state';
export { LoadingWrapper } from './loading-wrapper';
export { ProgressiveLoader } from './progressive-loader';

// Component Types
export type { AnimatedButtonProps } from './animated-button';
export type { AnimatedCardProps } from './animated-card';
// Note: Some type exports may not be available - import directly from components as needed