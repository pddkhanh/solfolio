/**
 * Error Components Barrel Export
 * Central export for all error handling components
 */

// Main error boundary
export { 
  ErrorBoundary, 
  useErrorHandler, 
  withErrorBoundary 
} from './ErrorBoundary';

// Global error boundary
export { 
  GlobalErrorBoundary,
  RootErrorBoundary 
} from './GlobalErrorBoundary';

// Section-specific error boundaries
export {
  SectionErrorBoundary,
  WalletErrorBoundary,
  PortfolioErrorBoundary,
  PositionsErrorBoundary,
  ChartErrorBoundary,
} from './SectionErrorBoundary';

// Error state components
export {
  ErrorState,
  NetworkErrorState,
  ServerErrorState,
  PermissionErrorState,
  NotFoundErrorState,
  InlineError,
  ErrorBanner,
  type ErrorType,
} from './ErrorState';