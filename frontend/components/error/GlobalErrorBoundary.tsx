'use client';

import React, { useEffect } from 'react';
import { ErrorBoundary } from './ErrorBoundary';
import { motion, AnimatePresence } from 'framer-motion';
import { XCircle, RefreshCw, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { pageVariants } from '@/lib/animations';

interface GlobalErrorBoundaryProps {
  children: React.ReactNode;
}

/**
 * Global error boundary wrapper for the entire application
 */
export function GlobalErrorBoundary({ children }: GlobalErrorBoundaryProps) {
  return (
    <ErrorBoundary
      level="page"
      showDetails={process.env.NODE_ENV === 'development'}
      onError={(error, errorInfo) => {
        // Log to error tracking service
        logErrorToService(error, errorInfo);
      }}
      fallback={<GlobalErrorFallback />}
    >
      {children}
    </ErrorBoundary>
  );
}

/**
 * Global error fallback UI
 */
function GlobalErrorFallback() {
  const [countdown, setCountdown] = React.useState<number | null>(null);
  
  useEffect(() => {
    // Auto-reload after 30 seconds
    setCountdown(30);
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev === null || prev <= 1) {
          window.location.reload();
          return null;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(interval);
  }, []);
  
  const handleReload = () => {
    window.location.reload();
  };
  
  const handleGoHome = () => {
    window.location.href = '/';
  };
  
  return (
    <AnimatePresence mode="wait">
      <motion.div
        variants={pageVariants}
        initial="initial"
        animate="enter"
        exit="exit"
        className="min-h-screen bg-gradient-to-br from-bg-primary via-bg-secondary to-bg-primary flex items-center justify-center p-4"
      >
        <div className="max-w-lg w-full">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ 
              type: "spring",
              stiffness: 260,
              damping: 20,
              delay: 0.1 
            }}
            className="bg-bg-secondary/80 backdrop-blur-xl rounded-2xl p-8 border border-border-default shadow-2xl"
          >
            <div className="text-center">
              <motion.div
                initial={{ rotate: 0 }}
                animate={{ rotate: [0, -10, 10, -10, 0] }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="inline-block mb-6"
              >
                <XCircle className="w-20 h-20 text-red-500" />
              </motion.div>
              
              <h1 className="text-3xl font-bold text-white mb-4">
                Application Error
              </h1>
              
              <p className="text-gray-400 mb-8">
                We encountered an unexpected error. The application will automatically reload in{' '}
                <span className="text-primary font-semibold">
                  {countdown || 0} seconds
                </span>
                , or you can try again now.
              </p>
              
              <div className="space-y-3">
                <Button
                  onClick={handleReload}
                  className="w-full bg-gradient-to-r from-primary to-secondary hover:opacity-90"
                  size="lg"
                >
                  <RefreshCw className="w-5 h-5 mr-2" />
                  Reload Now
                </Button>
                
                <Button
                  onClick={handleGoHome}
                  variant="outline"
                  className="w-full"
                  size="lg"
                >
                  <Home className="w-5 h-5 mr-2" />
                  Go to Homepage
                </Button>
              </div>
              
              {process.env.NODE_ENV === 'development' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="mt-8 p-4 bg-red-950/30 rounded-lg border border-red-900/30"
                >
                  <p className="text-xs text-red-400 mb-2">Development Mode</p>
                  <p className="text-xs text-gray-500">
                    Check the console for detailed error information.
                  </p>
                </motion.div>
              )}
            </div>
          </motion.div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

/**
 * Error logging service integration
 */
function logErrorToService(error: Error, errorInfo: React.ErrorInfo) {
  // In production, integrate with error tracking service
  if (process.env.NODE_ENV === 'production') {
    // Example: Sentry integration
    if (typeof window !== 'undefined' && (window as any).Sentry) {
      (window as any).Sentry.captureException(error, {
        contexts: {
          react: {
            componentStack: errorInfo.componentStack,
          },
        },
      });
    }
    
    // Example: Custom error logging endpoint
    fetch('/api/errors', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href,
      }),
    }).catch(console.error);
  } else {
    // Development logging
    console.group('🔴 Error Boundary Caught:');
    console.error('Error:', error);
    console.error('Error Info:', errorInfo);
    console.error('Component Stack:', errorInfo.componentStack);
    console.groupEnd();
  }
}

/**
 * React Error Boundary for handling errors in server components
 */
export function RootErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Root error boundary:', error);
  }, [error]);
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-bg-primary via-bg-secondary to-bg-primary flex items-center justify-center p-4">
      <div className="max-w-lg w-full bg-bg-secondary/80 backdrop-blur-xl rounded-2xl p-8 border border-border-default shadow-2xl">
        <div className="text-center">
          <XCircle className="w-20 h-20 text-red-500 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-white mb-4">
            Something went wrong!
          </h2>
          <p className="text-gray-400 mb-6">
            {error.message || 'An unexpected error occurred'}
          </p>
          <Button
            onClick={reset}
            className="w-full bg-gradient-to-r from-primary to-secondary hover:opacity-90"
            size="lg"
          >
            Try again
          </Button>
        </div>
      </div>
    </div>
  );
}