'use client';

import * as React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { cn } from '@/lib/utils';
import { buttonHoverVariants, animationConfig } from '@/lib/animations';
import { Loader2 } from 'lucide-react';

export interface AnimatedButtonProps extends HTMLMotionProps<"button"> {
  variant?: 'default' | 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive' | 'gradient';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  loading?: boolean;
  success?: boolean;
  error?: boolean;
  ripple?: boolean;
  glow?: boolean;
  children?: React.ReactNode;
}

/**
 * Animated button component with micro-interactions
 * Features ripple effects, loading states, and smooth hover animations
 */
export const AnimatedButton = React.forwardRef<HTMLButtonElement, AnimatedButtonProps>(
  ({ 
    className, 
    variant = 'default', 
    size = 'md', 
    loading = false,
    success = false,
    error = false,
    ripple = true,
    glow = false,
    disabled,
    children, 
    onClick,
    ...props 
  }, ref) => {
    const [ripples, setRipples] = React.useState<Array<{ x: number; y: number; id: number }>>([]);
    
    // Handle ripple effect
    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (ripple && !disabled && !loading) {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const id = Date.now();
        
        setRipples(prev => [...prev, { x, y, id }]);
        
        // Remove ripple after animation
        setTimeout(() => {
          setRipples(prev => prev.filter(r => r.id !== id));
        }, 600);
      }
      
      if (onClick && !disabled && !loading) {
        onClick(e as any);
      }
    };
    
    // Base styles
    const baseStyles = cn(
      "relative inline-flex items-center justify-center font-medium",
      "transition-all duration-200 rounded-lg",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
      "disabled:pointer-events-none disabled:opacity-50",
      "overflow-hidden" // For ripple effect
    );
    
    // Variant styles
    const variantStyles = {
      default: "bg-bg-secondary text-text-primary hover:bg-bg-tertiary border border-border-default",
      primary: "bg-primary text-primary-foreground hover:bg-primary/90",
      secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/90",
      outline: "border border-border-default hover:bg-accent hover:text-accent-foreground",
      ghost: "hover:bg-accent hover:text-accent-foreground",
      destructive: "bg-red-500 text-white hover:bg-red-600",
      gradient: "bg-solana-gradient-primary text-white hover:shadow-glow-purple",
    };
    
    // Size styles
    const sizeStyles = {
      sm: "h-8 px-3 text-xs",
      md: "h-9 px-4 text-sm",
      lg: "h-11 px-8 text-base",
      icon: "h-9 w-9",
    };
    
    // State styles
    const stateStyles = cn(
      success && "bg-green-500 hover:bg-green-600 text-white",
      error && "bg-red-500 hover:bg-red-600 text-white"
    );
    
    // Animation variants
    const buttonVariants = {
      rest: {
        scale: 1,
        rotate: 0,
      },
      hover: {
        scale: glow ? 1.05 : 1.02,
        transition: {
          duration: animationConfig.duration.fast,
          ease: animationConfig.ease.default,
        },
      },
      tap: {
        scale: 0.95,
        transition: {
          duration: animationConfig.duration.instant,
        },
      },
      loading: {
        scale: 1,
        transition: {
          duration: animationConfig.duration.normal,
        },
      },
    };
    
    return (
      <motion.button
        ref={ref as any}
        className={cn(
          baseStyles,
          variantStyles[variant],
          sizeStyles[size],
          stateStyles,
          className
        )}
        onClick={handleClick}
        disabled={disabled || loading}
        variants={buttonVariants}
        initial="rest"
        whileHover={!disabled && !loading ? "hover" : "rest"}
        whileTap={!disabled && !loading ? "tap" : "rest"}
        animate={loading ? "loading" : "rest"}
        {...props}
      >
        {/* Glow effect */}
        {glow && !disabled && (
          <motion.div
            className="absolute inset-0 -z-10 bg-gradient-to-r from-purple-600 to-pink-600 opacity-0 blur-xl"
            animate={{
              opacity: [0, 0.5, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        )}
        
        {/* Ripple effects */}
        {ripples.map(ripple => (
          <motion.span
            key={ripple.id}
            className="absolute rounded-full bg-white/30 pointer-events-none"
            style={{
              left: ripple.x,
              top: ripple.y,
            }}
            initial={{
              width: 0,
              height: 0,
              x: 0,
              y: 0,
              opacity: 1,
            }}
            animate={{
              width: 300,
              height: 300,
              x: -150,
              y: -150,
              opacity: 0,
            }}
            transition={{
              duration: 0.6,
              ease: "easeOut",
            }}
          />
        ))}
        
        {/* Content */}
        <motion.span
          className="relative z-10 flex items-center gap-2"
          animate={{
            opacity: loading ? 0.7 : 1,
          }}
        >
          {loading && (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{
                duration: 1,
                repeat: Infinity,
                ease: "linear",
              }}
            >
              <Loader2 className="h-4 w-4" />
            </motion.div>
          )}
          
          {success && !loading && (
            <motion.svg
              className="h-4 w-4"
              viewBox="0 0 24 24"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.3 }}
            >
              <motion.path
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                d="M5 12l5 5L20 7"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.3 }}
              />
            </motion.svg>
          )}
          
          {error && !loading && (
            <motion.svg
              className="h-4 w-4"
              viewBox="0 0 24 24"
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 0.3 }}
            >
              <path
                fill="currentColor"
                d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z"
              />
            </motion.svg>
          )}
          
          {children}
        </motion.span>
      </motion.button>
    );
  }
);

AnimatedButton.displayName = 'AnimatedButton';

/**
 * Icon button variant with rotation animation
 */
export const AnimatedIconButton = React.forwardRef<
  HTMLButtonElement,
  AnimatedButtonProps & { rotate?: boolean }
>(({ className, rotate = true, children, ...props }, ref) => {
  return (
    <AnimatedButton
      ref={ref}
      size="icon"
      className={cn("rounded-full", className)}
      {...props}
    >
      <motion.div
        whileHover={rotate ? { rotate: 180 } : {}}
        transition={{ duration: 0.3 }}
      >
        {children}
      </motion.div>
    </AnimatedButton>
  );
});

AnimatedIconButton.displayName = 'AnimatedIconButton';

/**
 * Floating action button with bounce animation
 */
export const FloatingActionButton = React.forwardRef<
  HTMLButtonElement,
  AnimatedButtonProps
>(({ className, children, ...props }, ref) => {
  return (
    <motion.div
      className="fixed bottom-6 right-6 z-50"
      initial={{ scale: 0, rotate: -180 }}
      animate={{ scale: 1, rotate: 0 }}
      transition={{
        type: "spring",
        stiffness: 260,
        damping: 20,
      }}
    >
      <AnimatedButton
        ref={ref}
        variant="gradient"
        size="icon"
        className={cn(
          "h-14 w-14 rounded-full shadow-lg",
          "hover:shadow-glow-purple",
          className
        )}
        glow
        {...props}
      >
        {children}
      </AnimatedButton>
    </motion.div>
  );
});

FloatingActionButton.displayName = 'FloatingActionButton';

export default AnimatedButton;