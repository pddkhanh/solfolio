'use client';

import React from 'react';
import { ErrorBoundary } from './ErrorBoundary';
import { motion } from 'framer-motion';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { fadeVariants } from '@/lib/animations';

interface SectionErrorBoundaryProps {
  children: React.ReactNode;
  sectionName: string;
  fallbackHeight?: string;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

/**
 * Section-specific error boundary for isolated error handling
 */
export function SectionErrorBoundary({
  children,
  sectionName,
  fallbackHeight = '200px',
  onError,
}: SectionErrorBoundaryProps) {
  return (
    <ErrorBoundary
      level="section"
      isolate
      onError={onError}
      fallback={
        <SectionErrorFallback
          sectionName={sectionName}
          height={fallbackHeight}
        />
      }
    >
      {children}
    </ErrorBoundary>
  );
}

interface SectionErrorFallbackProps {
  sectionName: string;
  height: string;
  onRetry?: () => void;
}

function SectionErrorFallback({
  sectionName,
  height,
  onRetry,
}: SectionErrorFallbackProps) {
  return (
    <motion.div
      variants={fadeVariants}
      initial="initial"
      animate="animate"
      style={{ minHeight: height }}
      className="flex items-center justify-center p-8 bg-bg-secondary/50 rounded-lg border border-border-default"
    >
      <div className="text-center">
        <AlertCircle className="w-8 h-8 text-yellow-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-white mb-2">
          {sectionName} Unavailable
        </h3>
        <p className="text-sm text-gray-400 mb-4">
          This section encountered an error but the rest of the app is still functional.
        </p>
        {onRetry && (
          <Button
            onClick={onRetry}
            variant="outline"
            size="sm"
          >
            <RefreshCw className="w-3 h-3 mr-2" />
            Retry
          </Button>
        )}
      </div>
    </motion.div>
  );
}

/**
 * Wallet-specific error boundary
 */
export function WalletErrorBoundary({ children }: { children: React.ReactNode }) {
  return (
    <SectionErrorBoundary
      sectionName="Wallet Connection"
      fallbackHeight="100px"
      onError={(error) => {
        console.error('Wallet error:', error);
        // Additional wallet-specific error handling
      }}
    >
      {children}
    </SectionErrorBoundary>
  );
}

/**
 * Portfolio-specific error boundary
 */
export function PortfolioErrorBoundary({ children }: { children: React.ReactNode }) {
  return (
    <SectionErrorBoundary
      sectionName="Portfolio"
      fallbackHeight="400px"
      onError={(error) => {
        console.error('Portfolio error:', error);
        // Additional portfolio-specific error handling
      }}
    >
      {children}
    </SectionErrorBoundary>
  );
}

/**
 * DeFi positions-specific error boundary
 */
export function PositionsErrorBoundary({ children }: { children: React.ReactNode }) {
  return (
    <SectionErrorBoundary
      sectionName="DeFi Positions"
      fallbackHeight="300px"
      onError={(error) => {
        console.error('Positions error:', error);
        // Additional positions-specific error handling
      }}
    >
      {children}
    </SectionErrorBoundary>
  );
}

/**
 * Chart-specific error boundary
 */
export function ChartErrorBoundary({ children }: { children: React.ReactNode }) {
  return (
    <SectionErrorBoundary
      sectionName="Chart"
      fallbackHeight="350px"
      onError={(error) => {
        console.error('Chart error:', error);
        // Additional chart-specific error handling
      }}
    >
      {children}
    </SectionErrorBoundary>
  );
}