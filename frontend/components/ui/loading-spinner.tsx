'use client';

import * as React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { cn } from '@/lib/utils';
import { animationConfig } from '@/lib/animations';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'default' | 'dots' | 'bars' | 'pulse' | 'gradient' | 'orbital';
  color?: 'primary' | 'secondary' | 'accent' | 'white';
  className?: string;
  speed?: number;
}

/**
 * Default circular spinner
 */
export const LoadingSpinner = ({ 
  size = 'md', 
  variant = 'default',
  color = 'primary',
  className,
  speed = 1 
}: LoadingSpinnerProps) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
    xl: 'h-12 w-12',
  };
  
  const colorClasses = {
    primary: 'border-primary',
    secondary: 'border-secondary',
    accent: 'border-accent',
    white: 'border-white',
  };
  
  if (variant === 'default') {
    return (
      <motion.div
        className={cn(
          "rounded-full border-2 border-transparent",
          sizeClasses[size],
          className
        )}
        style={{
          borderTopColor: 'currentColor',
          borderRightColor: 'currentColor',
        }}
        animate={{ rotate: 360 }}
        transition={{
          duration: 1 / speed,
          repeat: Infinity,
          ease: "linear",
        }}
      />
    );
  }
  
  if (variant === 'dots') {
    return <DotsSpinner size={size} className={className} speed={speed} />;
  }
  
  if (variant === 'bars') {
    return <BarsSpinner size={size} className={className} speed={speed} />;
  }
  
  if (variant === 'pulse') {
    return <PulseSpinner size={size} className={className} speed={speed} />;
  }
  
  if (variant === 'gradient') {
    return <GradientSpinner size={size} className={className} speed={speed} />;
  }
  
  if (variant === 'orbital') {
    return <OrbitalSpinner size={size} className={className} speed={speed} />;
  }
  
  return null;
};

/**
 * Three dots spinner
 */
const DotsSpinner = ({ size, className, speed }: { size: string; className?: string; speed: number }) => {
  const dotSize = {
    sm: 'h-1 w-1',
    md: 'h-1.5 w-1.5',
    lg: 'h-2 w-2',
    xl: 'h-3 w-3',
  }[size];
  
  return (
    <div className={cn("flex items-center space-x-1", className)}>
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className={cn("rounded-full bg-current", dotSize)}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 0.6 / speed,
            repeat: Infinity,
            delay: i * 0.1,
          }}
        />
      ))}
    </div>
  );
};

/**
 * Bars spinner
 */
const BarsSpinner = ({ size, className, speed }: { size: string; className?: string; speed: number }) => {
  const barHeight = {
    sm: 'h-4',
    md: 'h-6',
    lg: 'h-8',
    xl: 'h-12',
  }[size];
  
  return (
    <div className={cn("flex items-center space-x-1", className)}>
      {[0, 1, 2, 3].map((i) => (
        <motion.div
          key={i}
          className={cn("w-1 bg-current rounded-full", barHeight)}
          animate={{
            scaleY: [1, 0.5, 1],
          }}
          transition={{
            duration: 0.8 / speed,
            repeat: Infinity,
            delay: i * 0.1,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
};

/**
 * Pulse spinner
 */
const PulseSpinner = ({ size, className, speed }: { size: string; className?: string; speed: number }) => {
  const sizeClass = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
    xl: 'h-12 w-12',
  }[size];
  
  return (
    <motion.div
      className={cn("rounded-full bg-current", sizeClass, className)}
      animate={{
        scale: [1, 1.2, 1],
        opacity: [1, 0.7, 1],
      }}
      transition={{
        duration: 1 / speed,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    />
  );
};

/**
 * Gradient spinner with Solana colors
 */
const GradientSpinner = ({ size, className, speed }: { size: string; className?: string; speed: number }) => {
  const sizeClass = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
    xl: 'h-12 w-12',
  }[size];
  
  return (
    <motion.div
      className={cn("rounded-full", sizeClass, className)}
      style={{
        background: 'conic-gradient(from 0deg, #9945FF, #14F195, #00D4FF, #9945FF)',
        borderRadius: '50%',
      }}
      animate={{ rotate: 360 }}
      transition={{
        duration: 1 / speed,
        repeat: Infinity,
        ease: "linear",
      }}
    >
      <div 
        className="rounded-full bg-bg-primary m-1 h-[calc(100%-8px)] w-[calc(100%-8px)]"
        style={{ 
          position: 'absolute',
          top: '2px',
          left: '2px',
        }}
      />
    </motion.div>
  );
};

/**
 * Orbital spinner with multiple circles
 */
const OrbitalSpinner = ({ size, className, speed }: { size: string; className?: string; speed: number }) => {
  const containerSize = {
    sm: 'h-6 w-6',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
    xl: 'h-16 w-16',
  }[size];
  
  const dotSize = {
    sm: 'h-1 w-1',
    md: 'h-1.5 w-1.5',
    lg: 'h-2 w-2',
    xl: 'h-3 w-3',
  }[size];
  
  return (
    <div className={cn("relative", containerSize, className)}>
      <motion.div
        className="absolute inset-0"
        animate={{ rotate: 360 }}
        transition={{
          duration: 2 / speed,
          repeat: Infinity,
          ease: "linear",
        }}
      >
        <div className={cn("absolute top-0 left-1/2 -translate-x-1/2 rounded-full bg-purple-500", dotSize)} />
      </motion.div>
      
      <motion.div
        className="absolute inset-0"
        animate={{ rotate: -360 }}
        transition={{
          duration: 1.5 / speed,
          repeat: Infinity,
          ease: "linear",
        }}
      >
        <div className={cn("absolute top-1/4 right-0 rounded-full bg-green-500", dotSize)} />
      </motion.div>
      
      <motion.div
        className="absolute inset-0"
        animate={{ rotate: 360 }}
        transition={{
          duration: 1 / speed,
          repeat: Infinity,
          ease: "linear",
        }}
      >
        <div className={cn("absolute bottom-0 left-1/2 -translate-x-1/2 rounded-full bg-cyan-500", dotSize)} />
      </motion.div>
    </div>
  );
};

/**
 * Loading screen component with full page overlay
 */
export const LoadingScreen = ({ 
  title = "Loading...",
  subtitle,
  spinner = 'gradient',
  className 
}: {
  title?: string;
  subtitle?: string;
  spinner?: LoadingSpinnerProps['variant'];
  className?: string;
}) => {
  return (
    <motion.div
      className={cn(
        "fixed inset-0 z-50 flex items-center justify-center",
        "bg-bg-primary/80 backdrop-blur-sm",
        className
      )}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      <div className="text-center">
        <motion.div
          className="mb-4"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{
            type: "spring",
            stiffness: 260,
            damping: 20,
          }}
        >
          <LoadingSpinner variant={spinner} size="xl" />
        </motion.div>
        
        <motion.h3
          className="text-lg font-semibold mb-2"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          {title}
        </motion.h3>
        
        {subtitle && (
          <motion.p
            className="text-sm text-text-secondary"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            {subtitle}
          </motion.p>
        )}
      </div>
    </motion.div>
  );
};

/**
 * Inline loading component for buttons and small elements
 */
export const InlineLoader = ({ 
  text = "Loading...",
  size = 'sm',
  className 
}: {
  text?: string;
  size?: LoadingSpinnerProps['size'];
  className?: string;
}) => {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <LoadingSpinner size={size} variant="default" />
      <span className="text-sm">{text}</span>
    </div>
  );
};

/**
 * Progress indicator with animated bar
 */
export const ProgressBar = ({
  progress = 0,
  className,
  showPercentage = true,
}: {
  progress?: number;
  className?: string;
  showPercentage?: boolean;
}) => {
  const clampedProgress = Math.max(0, Math.min(100, progress));
  
  return (
    <div className={cn("w-full", className)}>
      {showPercentage && (
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-text-secondary">Progress</span>
          <motion.span
            className="text-sm font-medium"
            key={clampedProgress}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {Math.round(clampedProgress)}%
          </motion.span>
        </div>
      )}
      
      <div className="w-full bg-bg-tertiary rounded-full h-2">
        <motion.div
          className="h-2 rounded-full bg-solana-gradient-primary"
          initial={{ width: 0 }}
          animate={{ width: `${clampedProgress}%` }}
          transition={{ 
            duration: 0.5, 
            ease: animationConfig.ease.default 
          }}
        />
      </div>
    </div>
  );
};

export default LoadingSpinner;