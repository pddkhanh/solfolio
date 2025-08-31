'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, RefreshCw, Home, Bug } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { errorShakeVariants, fadeVariants, scaleVariants } from '@/lib/animations';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  showDetails?: boolean;
  resetKeys?: Array<string | number>;
  resetOnPropsChange?: boolean;
  isolate?: boolean;
  level?: 'page' | 'section' | 'component';
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorCount: number;
}

/**
 * Comprehensive Error Boundary Component
 * Catches JavaScript errors in child components and displays a fallback UI
 */
export class ErrorBoundary extends Component<Props, State> {
  private resetTimeoutId: NodeJS.Timeout | null = null;
  private previousResetKeys: Array<string | number> = [];

  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorCount: 0,
    };
    
    if (props.resetKeys) {
      this.previousResetKeys = props.resetKeys;
    }
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log error to error reporting service
    this.logErrorToService(error, errorInfo);
    
    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Update state with error details
    this.setState((prevState) => ({
      errorInfo,
      errorCount: prevState.errorCount + 1,
    }));

    // Auto-reset after multiple errors (circuit breaker pattern)
    if (this.state.errorCount >= 3) {
      this.scheduleReset(10000); // Reset after 10 seconds
    }
  }

  componentDidUpdate(prevProps: Props): void {
    const { resetKeys, resetOnPropsChange } = this.props;
    const { hasError } = this.state;
    
    // Reset on prop changes if enabled
    if (hasError && resetOnPropsChange && prevProps.children !== this.props.children) {
      this.resetErrorBoundary();
    }
    
    // Reset when resetKeys change
    if (resetKeys && hasError) {
      const hasResetKeyChanged = resetKeys.some(
        (key, index) => key !== this.previousResetKeys[index]
      );
      
      if (hasResetKeyChanged) {
        this.resetErrorBoundary();
        this.previousResetKeys = resetKeys;
      }
    }
  }

  componentWillUnmount(): void {
    if (this.resetTimeoutId) {
      clearTimeout(this.resetTimeoutId);
    }
  }

  private logErrorToService(error: Error, errorInfo: ErrorInfo): void {
    // TODO: Integrate with error logging service (e.g., Sentry, LogRocket)
    console.error('Error caught by boundary:', error, errorInfo);
    
    // Log to external service
    if (typeof window !== 'undefined' && (window as any).errorLogger) {
      (window as any).errorLogger.captureException(error, {
        extra: {
          errorInfo,
          level: this.props.level || 'component',
          errorCount: this.state.errorCount,
        },
      });
    }
  }

  private scheduleReset(delay: number): void {
    if (this.resetTimeoutId) {
      clearTimeout(this.resetTimeoutId);
    }
    
    this.resetTimeoutId = setTimeout(() => {
      this.resetErrorBoundary();
    }, delay);
  }

  resetErrorBoundary = (): void => {
    if (this.resetTimeoutId) {
      clearTimeout(this.resetTimeoutId);
      this.resetTimeoutId = null;
    }
    
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorCount: 0,
    });
  };

  private handleReload = (): void => {
    window.location.reload();
  };

  private handleGoHome = (): void => {
    window.location.href = '/';
  };

  private renderErrorDetails(): ReactNode {
    const { error, errorInfo } = this.state;
    const { showDetails } = this.props;
    
    if (!showDetails || !error || !errorInfo) return null;
    
    return (
      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: 'auto' }}
        exit={{ opacity: 0, height: 0 }}
        transition={{ duration: 0.3 }}
        className="mt-6 p-4 bg-red-950/20 border border-red-900/30 rounded-lg"
      >
        <h3 className="text-sm font-semibold text-red-400 mb-2">Error Details:</h3>
        <pre className="text-xs text-red-300 overflow-x-auto whitespace-pre-wrap">
          {error.toString()}
        </pre>
        {errorInfo && (
          <>
            <h3 className="text-sm font-semibold text-red-400 mt-4 mb-2">Component Stack:</h3>
            <pre className="text-xs text-red-300 overflow-x-auto whitespace-pre-wrap">
              {errorInfo.componentStack}
            </pre>
          </>
        )}
      </motion.div>
    );
  }

  private getErrorContent(): {
    title: string;
    message: string;
    icon: ReactNode;
  } {
    const { level = 'component' } = this.props;
    const { error } = this.state;
    
    // Check for specific error types
    if (error?.message?.includes('Network')) {
      return {
        title: 'Connection Problem',
        message: 'Unable to connect to our servers. Please check your internet connection and try again.',
        icon: <AlertTriangle className="w-12 h-12 text-yellow-500" />,
      };
    }
    
    if (error?.message?.includes('wallet') || error?.message?.includes('Wallet')) {
      return {
        title: 'Wallet Error',
        message: 'There was an issue with your wallet connection. Please try reconnecting.',
        icon: <AlertTriangle className="w-12 h-12 text-orange-500" />,
      };
    }
    
    // Default messages based on error boundary level
    switch (level) {
      case 'page':
        return {
          title: 'Page Error',
          message: 'This page encountered an unexpected error. You can try refreshing or return to the homepage.',
          icon: <AlertTriangle className="w-12 h-12 text-red-500" />,
        };
      case 'section':
        return {
          title: 'Section Unavailable',
          message: 'This section is temporarily unavailable. Other parts of the app should still work.',
          icon: <AlertTriangle className="w-12 h-12 text-orange-500" />,
        };
      default:
        return {
          title: 'Something went wrong',
          message: 'An unexpected error occurred. Please try again or refresh the page.',
          icon: <Bug className="w-12 h-12 text-red-500" />,
        };
    }
  }

  render(): ReactNode {
    const { hasError, errorCount } = this.state;
    const { children, fallback, isolate, level = 'component' } = this.props;

    if (hasError) {
      // Use custom fallback if provided
      if (fallback) {
        return fallback;
      }

      const { title, message, icon } = this.getErrorContent();
      const showReloadButton = level === 'page' || errorCount >= 2;
      const showHomeButton = level === 'page';

      // Default error UI
      return (
        <AnimatePresence mode="wait">
          <motion.div
            key="error-boundary"
            variants={fadeVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className={`flex items-center justify-center ${
              isolate ? 'p-8' : 'min-h-[400px] p-12'
            }`}
          >
            <motion.div
              variants={scaleVariants}
              initial="initial"
              animate="animate"
              className="max-w-md w-full"
            >
              <motion.div
                variants={errorShakeVariants}
                initial="initial"
                animate="animate"
                className="text-center"
              >
                <div className="flex justify-center mb-6">
                  {icon}
                </div>
                
                <h2 className="text-2xl font-bold text-white mb-3">
                  {title}
                </h2>
                
                <p className="text-gray-400 mb-8">
                  {message}
                </p>
                
                <div className="flex gap-3 justify-center">
                  <Button
                    onClick={this.resetErrorBoundary}
                    variant="default"
                    className="bg-gradient-to-r from-primary to-secondary hover:opacity-90"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Try Again
                  </Button>
                  
                  {showReloadButton && (
                    <Button
                      onClick={this.handleReload}
                      variant="outline"
                    >
                      Reload Page
                    </Button>
                  )}
                  
                  {showHomeButton && (
                    <Button
                      onClick={this.handleGoHome}
                      variant="ghost"
                    >
                      <Home className="w-4 h-4 mr-2" />
                      Go Home
                    </Button>
                  )}
                </div>
                
                {this.renderErrorDetails()}
              </motion.div>
            </motion.div>
          </motion.div>
        </AnimatePresence>
      );
    }

    return children;
  }
}

/**
 * Hook to use error boundary programmatically
 */
export function useErrorHandler(): (error: Error) => void {
  const [, setError] = React.useState();
  
  return React.useCallback((error: Error) => {
    setError(() => {
      throw error;
    });
  }, []);
}

/**
 * Higher-order component to wrap components with error boundary
 */
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<Props, 'children'>
): React.ComponentType<P> {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  );
  
  WrappedComponent.displayName = `withErrorBoundary(${
    Component.displayName || Component.name || 'Component'
  })`;
  
  return WrappedComponent;
}