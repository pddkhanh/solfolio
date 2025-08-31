'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  AlertTriangle, 
  WifiOff, 
  ServerCrash, 
  ShieldOff,
  RefreshCw,
  Home,
  ArrowLeft,
  HelpCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { fadeInUp, scaleVariants } from '@/lib/animations';

export type ErrorType = 
  | 'network' 
  | 'server' 
  | 'permission' 
  | 'not-found' 
  | 'timeout' 
  | 'generic';

interface ErrorStateProps {
  type?: ErrorType;
  title?: string;
  message?: string;
  onRetry?: () => void;
  onGoBack?: () => void;
  onGoHome?: () => void;
  showDetails?: boolean;
  details?: string;
  compact?: boolean;
}

/**
 * Reusable error state component for different error scenarios
 */
export function ErrorState({
  type = 'generic',
  title,
  message,
  onRetry,
  onGoBack,
  onGoHome,
  showDetails = false,
  details,
  compact = false,
}: ErrorStateProps) {
  const errorConfig = getErrorConfig(type, { title, message });
  
  return (
    <motion.div
      variants={fadeInUp}
      initial="initial"
      animate="animate"
      className={`flex items-center justify-center ${
        compact ? 'p-6' : 'min-h-[400px] p-12'
      }`}
    >
      <div className="text-center max-w-md">
        <motion.div
          variants={scaleVariants}
          initial="initial"
          animate="animate"
          className="mb-6"
        >
          {errorConfig.icon}
        </motion.div>
        
        <h2 className={`font-bold text-white mb-3 ${
          compact ? 'text-xl' : 'text-2xl'
        }`}>
          {errorConfig.title}
        </h2>
        
        <p className="text-gray-400 mb-6">
          {errorConfig.message}
        </p>
        
        <div className="flex gap-3 justify-center flex-wrap">
          {onRetry && (
            <Button
              onClick={onRetry}
              variant="default"
              size={compact ? 'sm' : 'default'}
              className="bg-gradient-to-r from-primary to-secondary hover:opacity-90"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
          )}
          
          {onGoBack && (
            <Button
              onClick={onGoBack}
              variant="outline"
              size={compact ? 'sm' : 'default'}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Back
            </Button>
          )}
          
          {onGoHome && (
            <Button
              onClick={onGoHome}
              variant="ghost"
              size={compact ? 'sm' : 'default'}
            >
              <Home className="w-4 h-4 mr-2" />
              Home
            </Button>
          )}
        </div>
        
        {showDetails && details && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mt-6 p-4 bg-red-950/20 border border-red-900/30 rounded-lg text-left"
          >
            <p className="text-xs text-red-300 font-mono">
              {details}
            </p>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}

/**
 * Network error state component
 */
export function NetworkErrorState({ onRetry }: { onRetry?: () => void }) {
  return (
    <ErrorState
      type="network"
      onRetry={onRetry}
    />
  );
}

/**
 * Server error state component
 */
export function ServerErrorState({ onRetry }: { onRetry?: () => void }) {
  return (
    <ErrorState
      type="server"
      onRetry={onRetry}
    />
  );
}

/**
 * Permission error state component
 */
export function PermissionErrorState({ 
  onGoBack,
  onGoHome 
}: { 
  onGoBack?: () => void;
  onGoHome?: () => void;
}) {
  return (
    <ErrorState
      type="permission"
      onGoBack={onGoBack}
      onGoHome={onGoHome}
    />
  );
}

/**
 * Not found error state component
 */
export function NotFoundErrorState({ 
  onGoHome 
}: { 
  onGoHome?: () => void;
}) {
  return (
    <ErrorState
      type="not-found"
      onGoHome={onGoHome || (() => window.location.href = '/')}
    />
  );
}

/**
 * Inline error message component
 */
export function InlineError({ 
  message,
  onRetry,
  className = ''
}: { 
  message: string;
  onRetry?: () => void;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={`flex items-center gap-3 p-3 bg-red-950/20 border border-red-900/30 rounded-lg ${className}`}
    >
      <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0" />
      <p className="text-sm text-red-300 flex-1">{message}</p>
      {onRetry && (
        <Button
          onClick={onRetry}
          variant="ghost"
          size="sm"
          className="text-red-400 hover:text-red-300"
        >
          <RefreshCw className="w-3 h-3" />
        </Button>
      )}
    </motion.div>
  );
}

/**
 * Error banner component for global errors
 */
export function ErrorBanner({ 
  message,
  onDismiss,
  onRetry
}: { 
  message: string;
  onDismiss?: () => void;
  onRetry?: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="fixed top-0 left-0 right-0 z-50 bg-red-900/90 backdrop-blur-sm border-b border-red-800"
    >
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-white" />
            <p className="text-sm text-white font-medium">{message}</p>
          </div>
          <div className="flex items-center gap-2">
            {onRetry && (
              <Button
                onClick={onRetry}
                variant="ghost"
                size="sm"
                className="text-white hover:bg-red-800"
              >
                Retry
              </Button>
            )}
            {onDismiss && (
              <button
                onClick={onDismiss}
                className="text-white hover:text-red-200 transition-colors"
                aria-label="Dismiss"
              >
                ✕
              </button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// Helper function to get error configuration
function getErrorConfig(
  type: ErrorType,
  custom?: { title?: string; message?: string }
) {
  const configs = {
    network: {
      icon: <WifiOff className="w-16 h-16 text-yellow-500 mx-auto" />,
      title: 'Connection Problem',
      message: 'Unable to connect to our servers. Please check your internet connection and try again.',
    },
    server: {
      icon: <ServerCrash className="w-16 h-16 text-red-500 mx-auto" />,
      title: 'Server Error',
      message: 'Our servers are experiencing issues. Please try again in a few moments.',
    },
    permission: {
      icon: <ShieldOff className="w-16 h-16 text-orange-500 mx-auto" />,
      title: 'Access Denied',
      message: 'You don\'t have permission to access this resource.',
    },
    'not-found': {
      icon: <HelpCircle className="w-16 h-16 text-gray-500 mx-auto" />,
      title: 'Page Not Found',
      message: 'The page you\'re looking for doesn\'t exist or has been moved.',
    },
    timeout: {
      icon: <AlertTriangle className="w-16 h-16 text-yellow-500 mx-auto" />,
      title: 'Request Timeout',
      message: 'The request took too long to complete. Please try again.',
    },
    generic: {
      icon: <AlertTriangle className="w-16 h-16 text-red-500 mx-auto" />,
      title: 'Something went wrong',
      message: 'An unexpected error occurred. Please try again later.',
    },
  };
  
  const config = configs[type];
  
  return {
    ...config,
    title: custom?.title || config.title,
    message: custom?.message || config.message,
  };
}