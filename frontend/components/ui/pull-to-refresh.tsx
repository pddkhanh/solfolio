'use client';

import { ReactNode } from 'react';
import { animated } from '@react-spring/web';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw, Loader2 } from 'lucide-react';
import { usePullToRefresh } from '@/hooks/use-touch-gestures';
import { cn } from '@/lib/utils';

interface PullToRefreshProps {
  children: ReactNode;
  onRefresh: () => Promise<void>;
  disabled?: boolean;
  threshold?: number;
  className?: string;
  refreshText?: string;
  pullingText?: string;
  releaseText?: string;
}

export function PullToRefresh({
  children,
  onRefresh,
  disabled = false,
  threshold = 80,
  className,
  refreshText = 'Refreshing...',
  pullingText = 'Pull to refresh',
  releaseText = 'Release to refresh'
}: PullToRefreshProps) {
  const {
    containerRef,
    isPulling,
    pullDistance,
    isRefreshing,
    springProps,
    pullProgress
  } = usePullToRefresh(onRefresh, {
    threshold,
    disabled
  });

  const isReadyToRefresh = pullProgress >= 1;

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      {/* Pull indicator */}
      <AnimatePresence>
        {(isPulling || isRefreshing) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute left-0 right-0 flex justify-center pointer-events-none z-10"
            style={{ top: -60 }}
          >
            <animated.div
              style={{
                transform: springProps.y.to(y => `translateY(${y}px)`),
              }}
              className="flex items-center gap-2 px-4 py-2 bg-bg-secondary rounded-full shadow-lg"
            >
              <motion.div
                animate={{
                  rotate: isRefreshing ? 360 : pullProgress * 180,
                }}
                transition={{
                  duration: isRefreshing ? 1 : 0,
                  repeat: isRefreshing ? Infinity : 0,
                  ease: 'linear'
                }}
              >
                {isRefreshing ? (
                  <Loader2 className="w-5 h-5 text-primary" />
                ) : (
                  <RefreshCw 
                    className={cn(
                      'w-5 h-5 transition-colors',
                      isReadyToRefresh ? 'text-primary' : 'text-muted-foreground'
                    )} 
                  />
                )}
              </motion.div>
              <span className="text-sm font-medium">
                {isRefreshing 
                  ? refreshText 
                  : isReadyToRefresh 
                    ? releaseText 
                    : pullingText}
              </span>
            </animated.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main content with pull animation */}
      <animated.div
        style={{
          transform: springProps.y.to(y => 
            !isRefreshing && y > 0 ? `translateY(${y * 0.5}px)` : 'none'
          ),
        }}
      >
        {children}
      </animated.div>

      {/* Pull progress indicator bar */}
      {isPulling && !isRefreshing && (
        <motion.div
          className="absolute top-0 left-0 right-0 h-1 bg-gray-200 dark:bg-gray-800 overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="h-full bg-gradient-to-r from-primary to-secondary"
            style={{
              width: `${Math.min(pullProgress * 100, 100)}%`,
            }}
            animate={{
              opacity: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: 'easeInOut'
            }}
          />
        </motion.div>
      )}
    </div>
  );
}

// Simplified pull-to-refresh wrapper for common use cases
interface SimplePullToRefreshProps {
  children: ReactNode;
  onRefresh: () => Promise<void>;
  className?: string;
}

export function SimplePullToRefresh({ 
  children, 
  onRefresh, 
  className 
}: SimplePullToRefreshProps) {
  return (
    <PullToRefresh
      onRefresh={onRefresh}
      className={className}
      threshold={60}
    >
      {children}
    </PullToRefresh>
  );
}