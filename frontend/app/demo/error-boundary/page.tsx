'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ErrorBoundary, withErrorBoundary } from '@/components/error/ErrorBoundary';
import { 
  SectionErrorBoundary, 
  WalletErrorBoundary,
  PortfolioErrorBoundary,
  ChartErrorBoundary 
} from '@/components/error/SectionErrorBoundary';
import { 
  ErrorState, 
  NetworkErrorState, 
  ServerErrorState,
  InlineError,
  ErrorBanner 
} from '@/components/error/ErrorState';
import { SectionTransition, SlideTransition, ScaleTransition } from '@/components/layout/PageTransition';
import { staggerItem } from '@/lib/animations';
import { AlertTriangle, Bug, WifiOff, ServerCrash } from 'lucide-react';

// Component that intentionally throws an error
function BuggyComponent({ shouldError }: { shouldError: boolean }) {
  if (shouldError) {
    throw new Error('This is a test error from BuggyComponent!');
  }
  
  return (
    <div className="p-6 bg-bg-secondary rounded-lg border border-border-default">
      <h3 className="text-lg font-semibold text-white mb-2">Working Component</h3>
      <p className="text-gray-400">This component is working normally.</p>
    </div>
  );
}

// Component wrapped with HOC error boundary
const SafeComponent = withErrorBoundary(
  ({ children }: { children: React.ReactNode }) => (
    <div className="p-6 bg-bg-secondary rounded-lg border border-border-default">
      {children}
    </div>
  ),
  { level: 'component', showDetails: true }
);

export default function ErrorBoundaryDemo() {
  const [triggerError, setTriggerError] = useState(false);
  const [showNetworkError, setShowNetworkError] = useState(false);
  const [showServerError, setShowServerError] = useState(false);
  const [showInlineError, setShowInlineError] = useState(false);
  const [showErrorBanner, setShowErrorBanner] = useState(false);
  const [sectionError, setSectionError] = useState(false);
  
  return (
    <div className="container mx-auto px-4 py-8">
      <SectionTransition>
        <motion.div variants={staggerItem}>
          <h1 className="text-4xl font-bold text-white mb-2">
            Error Boundary & Transitions Demo
          </h1>
          <p className="text-gray-400 mb-8">
            Comprehensive demonstration of error handling and page transitions
          </p>
        </motion.div>
        
        {/* Error Banner Demo */}
        {showErrorBanner && (
          <ErrorBanner
            message="Network connection lost. Some features may be unavailable."
            onDismiss={() => setShowErrorBanner(false)}
            onRetry={() => {
              setShowErrorBanner(false);
              console.log('Retrying...');
            }}
          />
        )}
        
        {/* Control Panel */}
        <motion.div 
          variants={staggerItem}
          className="mb-12 p-6 bg-bg-secondary rounded-lg border border-border-default"
        >
          <h2 className="text-2xl font-semibold text-white mb-6">
            Error Boundary Controls
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Button
              onClick={() => setTriggerError(!triggerError)}
              variant={triggerError ? 'destructive' : 'default'}
              className="w-full"
            >
              <Bug className="w-4 h-4 mr-2" />
              {triggerError ? 'Fix Component' : 'Trigger Component Error'}
            </Button>
            
            <Button
              onClick={() => setSectionError(!sectionError)}
              variant={sectionError ? 'destructive' : 'default'}
              className="w-full"
            >
              <AlertTriangle className="w-4 h-4 mr-2" />
              {sectionError ? 'Fix Section' : 'Break Section'}
            </Button>
            
            <Button
              onClick={() => setShowNetworkError(!showNetworkError)}
              variant="outline"
              className="w-full"
            >
              <WifiOff className="w-4 h-4 mr-2" />
              Toggle Network Error
            </Button>
            
            <Button
              onClick={() => setShowServerError(!showServerError)}
              variant="outline"
              className="w-full"
            >
              <ServerCrash className="w-4 h-4 mr-2" />
              Toggle Server Error
            </Button>
            
            <Button
              onClick={() => setShowInlineError(!showInlineError)}
              variant="outline"
              className="w-full"
            >
              Show Inline Error
            </Button>
            
            <Button
              onClick={() => setShowErrorBanner(!showErrorBanner)}
              variant="outline"
              className="w-full"
            >
              Toggle Error Banner
            </Button>
          </div>
        </motion.div>
        
        {/* Error States Demo */}
        <div className="space-y-8">
          {/* Component Error Boundary */}
          <SlideTransition>
            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">
                Component Error Boundary
              </h2>
              <ErrorBoundary
                level="component"
                showDetails={true}
                resetKeys={[String(triggerError)]}
              >
                <BuggyComponent shouldError={triggerError} />
              </ErrorBoundary>
            </section>
          </SlideTransition>
          
          {/* Section Error Boundaries */}
          <ScaleTransition>
            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">
                Section Error Boundaries
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <WalletErrorBoundary>
                  {sectionError ? (
                    <BuggyComponent shouldError={true} />
                  ) : (
                    <div className="p-6 bg-bg-secondary rounded-lg border border-border-default">
                      <h3 className="text-lg font-semibold text-white mb-2">
                        Wallet Section
                      </h3>
                      <p className="text-gray-400">
                        Protected by wallet-specific error boundary
                      </p>
                    </div>
                  )}
                </WalletErrorBoundary>
                
                <PortfolioErrorBoundary>
                  <div className="p-6 bg-bg-secondary rounded-lg border border-border-default">
                    <h3 className="text-lg font-semibold text-white mb-2">
                      Portfolio Section
                    </h3>
                    <p className="text-gray-400">
                      Protected by portfolio-specific error boundary
                    </p>
                  </div>
                </PortfolioErrorBoundary>
              </div>
            </section>
          </ScaleTransition>
          
          {/* Error State Components */}
          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">
              Error State Components
            </h2>
            
            {showInlineError && (
              <div className="mb-4">
                <InlineError
                  message="Failed to fetch wallet balance. Please try again."
                  onRetry={() => setShowInlineError(false)}
                />
              </div>
            )}
            
            {showNetworkError && (
              <div className="mb-6">
                <NetworkErrorState onRetry={() => setShowNetworkError(false)} />
              </div>
            )}
            
            {showServerError && (
              <div className="mb-6">
                <ServerErrorState onRetry={() => setShowServerError(false)} />
              </div>
            )}
            
            {!showNetworkError && !showServerError && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-6 bg-bg-secondary rounded-lg border border-border-default">
                  <ErrorState
                    type="timeout"
                    compact
                    onRetry={() => console.log('Retry timeout')}
                  />
                </div>
                
                <div className="p-6 bg-bg-secondary rounded-lg border border-border-default">
                  <ErrorState
                    type="permission"
                    compact
                    onGoBack={() => console.log('Go back')}
                  />
                </div>
              </div>
            )}
          </section>
          
          {/* HOC Example */}
          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">
              HOC Error Boundary
            </h2>
            <SafeComponent>
              <h3 className="text-lg font-semibold text-white mb-2">
                Protected Component
              </h3>
              <p className="text-gray-400">
                This component is wrapped with the withErrorBoundary HOC.
              </p>
            </SafeComponent>
          </section>
          
          {/* Animation Transitions */}
          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">
              Page Transition Effects
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <SlideTransition direction="up">
                <div className="p-6 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-lg border border-primary/30">
                  <h3 className="text-lg font-semibold text-white mb-2">
                    Slide Up
                  </h3>
                  <p className="text-gray-400">
                    This card slides up on mount
                  </p>
                </div>
              </SlideTransition>
              
              <SlideTransition direction="left" >
                <div className="p-6 bg-gradient-to-br from-secondary/20 to-accent/20 rounded-lg border border-secondary/30">
                  <h3 className="text-lg font-semibold text-white mb-2">
                    Slide Left
                  </h3>
                  <p className="text-gray-400">
                    This card slides from right
                  </p>
                </div>
              </SlideTransition>
              
              <ScaleTransition scale={0.8}>
                <div className="p-6 bg-gradient-to-br from-accent/20 to-primary/20 rounded-lg border border-accent/30">
                  <h3 className="text-lg font-semibold text-white mb-2">
                    Scale In
                  </h3>
                  <p className="text-gray-400">
                    This card scales in
                  </p>
                </div>
              </ScaleTransition>
            </div>
          </section>
        </div>
      </SectionTransition>
    </div>
  );
}