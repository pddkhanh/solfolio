/**
 * Motion Component Wrappers
 * Reusable animated components built with Framer Motion
 */

'use client';

import React, { forwardRef } from 'react';
import { motion, AnimatePresence, useReducedMotion, MotionProps } from 'framer-motion';
import { 
  fadeVariants, 
  fadeInUp,
  staggerContainer, 
  staggerItem,
  cardHoverVariants,
  buttonHoverVariants,
  shimmerVariants,
  pulseVariants,
  scrollRevealVariants,
  hoverScale,
  tapScale,
  animationConfig,
} from '@/lib/animations';
import { cn } from '@/lib/utils';

// ============================
// Base Motion Components
// ============================

/**
 * Animated div with common animation presets
 */
export const MotionDiv = motion.div;
export const MotionSection = motion.section;
export const MotionArticle = motion.article;
export const MotionAside = motion.aside;
export const MotionNav = motion.nav;
export const MotionSpan = motion.span;
export const MotionButton = motion.button;
export const MotionImage = motion.img;

// ============================
// Fade Components
// ============================

interface FadeInProps extends MotionProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}

/**
 * Simple fade-in animation wrapper
 */
export const FadeIn = forwardRef<HTMLDivElement, FadeInProps>(
  ({ children, className, delay = 0, ...props }, ref) => {
    const shouldReduceMotion = useReducedMotion();
    
    return (
      <MotionDiv
        ref={ref}
        initial={shouldReduceMotion ? false : "initial"}
        animate="animate"
        exit="exit"
        variants={fadeVariants}
        custom={{ delay }}
        className={className}
        {...props}
      >
        {children}
      </MotionDiv>
    );
  }
);

FadeIn.displayName = 'FadeIn';

/**
 * Fade in with upward motion
 */
export const FadeInUp = forwardRef<HTMLDivElement, FadeInProps>(
  ({ children, className, delay = 0, ...props }, ref) => {
    const shouldReduceMotion = useReducedMotion();
    
    return (
      <MotionDiv
        ref={ref}
        initial={shouldReduceMotion ? false : "initial"}
        animate="animate"
        variants={fadeInUp}
        custom={{ delay }}
        className={className}
        {...props}
      >
        {children}
      </MotionDiv>
    );
  }
);

FadeInUp.displayName = 'FadeInUp';

// ============================
// Stagger Components
// ============================

interface StaggerContainerProps extends MotionProps {
  children: React.ReactNode;
  className?: string;
  staggerDelay?: number;
}

/**
 * Container that staggers the animation of its children
 */
export const StaggerContainer = forwardRef<HTMLDivElement, StaggerContainerProps>(
  ({ children, className, staggerDelay = 0.05, ...props }, ref) => {
    const shouldReduceMotion = useReducedMotion();
    
    return (
      <MotionDiv
        ref={ref}
        initial={shouldReduceMotion ? false : "initial"}
        animate="animate"
        exit="exit"
        variants={{
          ...staggerContainer,
          animate: {
            ...staggerContainer.animate,
            transition: {
              staggerChildren: staggerDelay,
              delayChildren: 0.1,
            },
          },
        }}
        className={className}
        {...props}
      >
        {children}
      </MotionDiv>
    );
  }
);

StaggerContainer.displayName = 'StaggerContainer';

/**
 * Individual item within a stagger container
 */
export const StaggerItem = forwardRef<HTMLDivElement, FadeInProps>(
  ({ children, className, ...props }, ref) => {
    return (
      <MotionDiv
        ref={ref}
        variants={staggerItem}
        className={className}
        {...props}
      >
        {children}
      </MotionDiv>
    );
  }
);

StaggerItem.displayName = 'StaggerItem';

// ============================
// Interactive Components
// ============================

interface AnimatedCardProps extends MotionProps {
  children: React.ReactNode;
  className?: string;
  enableHover?: boolean;
}

/**
 * Card with hover elevation effect
 */
export const AnimatedCard = forwardRef<HTMLDivElement, AnimatedCardProps>(
  ({ children, className, enableHover = true, ...props }, ref) => {
    const shouldReduceMotion = useReducedMotion();
    
    return (
      <MotionDiv
        ref={ref}
        initial={shouldReduceMotion ? false : "rest"}
        whileHover={enableHover && !shouldReduceMotion ? "hover" : undefined}
        animate="rest"
        variants={cardHoverVariants}
        className={cn(
          "rounded-lg border border-border bg-card transition-colors",
          className
        )}
        {...props}
      >
        {children}
      </MotionDiv>
    );
  }
);

AnimatedCard.displayName = 'AnimatedCard';

interface AnimatedButtonProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
}

/**
 * Button with scale animation on hover and tap
 */
export const AnimatedButton = forwardRef<HTMLButtonElement, AnimatedButtonProps>(
  ({ children, className, variant = 'default', size = 'md', onClick, disabled, type = 'button' }, ref) => {
    const shouldReduceMotion = useReducedMotion();
    
    const sizeClasses = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2',
      lg: 'px-6 py-3 text-lg',
    };
    
    const variantClasses = {
      default: 'bg-primary text-primary-foreground hover:bg-primary/90',
      ghost: 'hover:bg-accent hover:text-accent-foreground',
      outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
    };
    
    return (
      <MotionButton
        ref={ref}
        initial={shouldReduceMotion ? false : "rest"}
        whileHover={!shouldReduceMotion ? "hover" : undefined}
        whileTap={!shouldReduceMotion ? "tap" : undefined}
        variants={buttonHoverVariants}
        className={cn(
          "inline-flex items-center justify-center rounded-md font-medium transition-colors",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          "disabled:pointer-events-none disabled:opacity-50",
          sizeClasses[size],
          variantClasses[variant],
          className
        )}
        onClick={onClick}
        disabled={disabled}
        type={type}
      >
        {children}
      </MotionButton>
    );
  }
);

AnimatedButton.displayName = 'AnimatedButton';

// ============================
// Loading Components
// ============================

interface SkeletonProps {
  className?: string;
  width?: string | number;
  height?: string | number;
}

/**
 * Skeleton loader with shimmer effect
 */
export const Skeleton: React.FC<SkeletonProps> = ({ 
  className, 
  width = '100%', 
  height = 20 
}) => {
  return (
    <MotionDiv
      className={cn(
        "relative overflow-hidden rounded bg-muted",
        className
      )}
      style={{ width, height }}
      animate="animate"
      variants={pulseVariants}
    >
      <MotionDiv
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
        initial="initial"
        animate="animate"
        variants={shimmerVariants}
        style={{
          backgroundSize: '200% 100%',
        }}
      />
    </MotionDiv>
  );
};

interface SpinnerProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

/**
 * Loading spinner animation
 */
export const Spinner: React.FC<SpinnerProps> = ({ 
  className, 
  size = 'md' 
}) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
  };
  
  return (
    <MotionDiv
      className={cn(
        "rounded-full border-2 border-muted border-t-primary",
        sizeClasses[size],
        className
      )}
      animate={{ rotate: 360 }}
      transition={{
        duration: 1,
        repeat: Infinity,
        ease: "linear",
      }}
    />
  );
};

// ============================
// Scroll Animation Components
// ============================

interface ScrollRevealProps extends MotionProps {
  children: React.ReactNode;
  className?: string;
  threshold?: number;
}

/**
 * Reveals content when scrolled into view
 */
export const ScrollReveal = forwardRef<HTMLDivElement, ScrollRevealProps>(
  ({ children, className, threshold = 0.3, ...props }, ref) => {
    const shouldReduceMotion = useReducedMotion();
    
    return (
      <MotionDiv
        ref={ref}
        initial={shouldReduceMotion ? false : "initial"}
        whileInView="whileInView"
        viewport={{ once: true, amount: threshold }}
        variants={scrollRevealVariants}
        className={className}
        {...props}
      >
        {children}
      </MotionDiv>
    );
  }
);

ScrollReveal.displayName = 'ScrollReveal';

// ============================
// Layout Animation Components
// ============================

interface AnimatedLayoutProps extends MotionProps {
  children: React.ReactNode;
  className?: string;
  layoutId?: string;
  onClick?: () => void;
}

/**
 * Component with automatic layout animations
 */
export const AnimatedLayout = forwardRef<HTMLDivElement, AnimatedLayoutProps>(
  ({ children, className, layoutId, ...props }, ref) => {
    const shouldReduceMotion = useReducedMotion();
    
    return (
      <MotionDiv
        ref={ref}
        layout={!shouldReduceMotion}
        layoutId={layoutId}
        transition={{
          layout: {
            duration: animationConfig.duration.normal,
            ease: animationConfig.ease.default,
          },
        }}
        className={className}
        {...props}
      >
        {children}
      </MotionDiv>
    );
  }
);

AnimatedLayout.displayName = 'AnimatedLayout';

// ============================
// Utility Components
// ============================

interface AnimatePresenceWrapperProps {
  children: React.ReactNode;
  mode?: 'sync' | 'wait' | 'popLayout';
  initial?: boolean;
}

/**
 * Wrapper for AnimatePresence with common defaults
 */
export const AnimatePresenceWrapper: React.FC<AnimatePresenceWrapperProps> = ({ 
  children, 
  mode = 'wait',
  initial = false,
}) => {
  return (
    <AnimatePresence mode={mode} initial={initial}>
      {children}
    </AnimatePresence>
  );
};

// ============================
// Export AnimatePresence for convenience
// ============================

export { AnimatePresence, useReducedMotion } from 'framer-motion';