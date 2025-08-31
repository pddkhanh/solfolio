'use client';

import * as React from 'react';
import { motion, HTMLMotionProps, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { cardHoverVariants, animationConfig, scaleVariants } from '@/lib/animations';
import { Shimmer, GradientShimmer } from './shimmer';

export interface AnimatedCardProps extends HTMLMotionProps<"div"> {
  variant?: 'default' | 'elevated' | 'gradient' | 'glass' | 'glow';
  hover?: 'lift' | 'scale' | 'glow' | 'tilt' | 'none';
  loading?: boolean;
  shimmer?: boolean;
  delay?: number;
  children?: React.ReactNode;
}

/**
 * Animated card component with hover effects and loading states
 * Provides smooth elevation changes and interactive feedback
 */
export const AnimatedCard = React.forwardRef<HTMLDivElement, AnimatedCardProps>(
  ({ 
    className, 
    variant = 'default', 
    hover = 'lift',
    loading = false,
    shimmer = false,
    delay = 0,
    children,
    ...props 
  }, ref) => {
    const [isHovered, setIsHovered] = React.useState(false);
    
    // Base styles
    const baseStyles = cn(
      "relative rounded-xl transition-all duration-300",
      "overflow-hidden" // For shimmer and gradient effects
    );
    
    // Variant styles
    const variantStyles = {
      default: "bg-bg-secondary border border-border-default",
      elevated: "bg-bg-secondary shadow-lg",
      gradient: "bg-gradient-to-br from-bg-secondary to-bg-tertiary border border-border-default",
      glass: "bg-white/5 backdrop-blur-md border border-white/10",
      glow: "bg-bg-secondary border border-purple-500/20 shadow-glow-purple/20",
    };
    
    // Hover animation variants
    const hoverAnimations = {
      lift: {
        rest: {
          y: 0,
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        },
        hover: {
          y: -8,
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.2)',
          transition: {
            duration: animationConfig.duration.normal,
            ease: animationConfig.ease.default,
          },
        },
      },
      scale: {
        rest: { scale: 1 },
        hover: { 
          scale: 1.02,
          transition: {
            duration: animationConfig.duration.fast,
            ease: animationConfig.ease.default,
          },
        },
      },
      glow: {
        rest: { boxShadow: '0 0 0 rgba(153, 69, 255, 0)' },
        hover: { 
          boxShadow: '0 0 30px rgba(153, 69, 255, 0.3)',
          transition: {
            duration: animationConfig.duration.normal,
          },
        },
      },
      tilt: {
        rest: { rotateX: 0, rotateY: 0 },
        hover: { 
          rotateX: -5,
          rotateY: 5,
          transition: {
            duration: animationConfig.duration.normal,
            ease: animationConfig.ease.default,
          },
        },
      },
      none: {
        rest: {},
        hover: {},
      },
    };
    
    return (
      <motion.div
        ref={ref as any}
        className={cn(
          baseStyles,
          variantStyles[variant],
          className
        )}
        variants={hover !== 'none' ? hoverAnimations[hover] : undefined}
        initial="rest"
        whileHover="hover"
        animate={isHovered ? "hover" : "rest"}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        style={{ perspective: 1000 }}
        {...props}
      >
        {/* Shimmer effect overlay */}
        {(loading || shimmer) && (
          <Shimmer 
            className="absolute inset-0 z-10"
            variant="subtle"
            delay={delay}
          />
        )}
        
        {/* Gradient border animation for glow variant */}
        {variant === 'glow' && (
          <motion.div
            className="absolute inset-0 rounded-xl opacity-0"
            style={{
              background: 'linear-gradient(45deg, #9945FF, #14F195, #00D4FF)',
              padding: '1px',
            }}
            animate={isHovered ? { opacity: 1 } : { opacity: 0 }}
            transition={{ duration: 0.3 }}
          />
        )}
        
        {/* Content wrapper with padding for gradient border */}
        <div className={cn(
          "relative z-20",
          variant === 'glow' && "bg-bg-secondary rounded-xl"
        )}>
          {children}
        </div>
      </motion.div>
    );
  }
);

AnimatedCard.displayName = 'AnimatedCard';

/**
 * Flip card component with front and back faces
 */
export const FlipCard = React.forwardRef<
  HTMLDivElement,
  {
    front: React.ReactNode;
    back: React.ReactNode;
    className?: string;
    height?: string | number;
  }
>(({ front, back, className, height = 300 }, ref) => {
  const [isFlipped, setIsFlipped] = React.useState(false);
  
  return (
    <div
      ref={ref}
      className={cn("relative", className)}
      style={{ 
        height,
        perspective: 1000,
      }}
    >
      <motion.div
        className="absolute inset-0 w-full h-full"
        style={{
          transformStyle: "preserve-3d",
        }}
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.6, ease: animationConfig.ease.default }}
        onClick={() => setIsFlipped(!isFlipped)}
      >
        {/* Front face */}
        <div
          className="absolute inset-0 w-full h-full rounded-xl"
          style={{
            backfaceVisibility: "hidden",
          }}
        >
          {front}
        </div>
        
        {/* Back face */}
        <div
          className="absolute inset-0 w-full h-full rounded-xl"
          style={{
            backfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
          }}
        >
          {back}
        </div>
      </motion.div>
    </div>
  );
});

FlipCard.displayName = 'FlipCard';

/**
 * Expandable card component
 */
export const ExpandableCard = React.forwardRef<
  HTMLDivElement,
  AnimatedCardProps & {
    preview: React.ReactNode;
    expanded: React.ReactNode;
    defaultExpanded?: boolean;
  }
>(({ preview, expanded, defaultExpanded = false, className, ...props }, ref) => {
  const [isExpanded, setIsExpanded] = React.useState(defaultExpanded);
  
  return (
    <AnimatedCard
      ref={ref}
      className={cn("cursor-pointer", className)}
      onClick={() => setIsExpanded(!isExpanded)}
      {...props}
    >
      <AnimatePresence mode="wait">
        {!isExpanded ? (
          <motion.div
            key="preview"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {preview}
          </motion.div>
        ) : (
          <motion.div
            key="expanded"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            {expanded}
          </motion.div>
        )}
      </AnimatePresence>
    </AnimatedCard>
  );
});

ExpandableCard.displayName = 'ExpandableCard';

/**
 * Parallax card with depth effect
 */
export const ParallaxCard = React.forwardRef<
  HTMLDivElement,
  AnimatedCardProps & {
    layers?: React.ReactNode[];
  }
>(({ layers = [], children, className, ...props }, ref) => {
  const [mousePosition, setMousePosition] = React.useState({ x: 0, y: 0 });
  const cardRef = React.useRef<HTMLDivElement>(null);
  
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!cardRef.current) return;
    
    const rect = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    
    setMousePosition({ x, y });
  };
  
  const handleMouseLeave = () => {
    setMousePosition({ x: 0, y: 0 });
  };
  
  return (
    <motion.div
      ref={cardRef}
      className={cn("relative", className)}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ perspective: 1000 }}
      animate={{
        rotateX: mousePosition.y * -10,
        rotateY: mousePosition.x * 10,
      }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      {...props}
    >
      {layers.map((layer, index) => (
        <motion.div
          key={index}
          className="absolute inset-0"
          animate={{
            x: mousePosition.x * (index + 1) * 10,
            y: mousePosition.y * (index + 1) * 10,
          }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          {layer}
        </motion.div>
      ))}
      <div className="relative z-10">{children}</div>
    </motion.div>
  );
});

ParallaxCard.displayName = 'ParallaxCard';

/**
 * Metric card with animated value display
 */
export const MetricCard = React.forwardRef<
  HTMLDivElement,
  AnimatedCardProps & {
    title: string;
    value: string | number;
    change?: number;
    icon?: React.ReactNode;
    trend?: 'up' | 'down' | 'neutral';
  }
>(({ title, value, change, icon, trend, className, ...props }, ref) => {
  return (
    <AnimatedCard
      ref={ref}
      variant="gradient"
      hover="lift"
      className={cn("p-6", className)}
      {...props}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            {icon && (
              <motion.div
                initial={{ rotate: 0 }}
                animate={{ rotate: 360 }}
                transition={{ duration: 1, delay: 0.5 }}
              >
                {icon}
              </motion.div>
            )}
            <p className="text-sm text-text-secondary">{title}</p>
          </div>
          
          <motion.div
            className="text-2xl font-bold"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {value}
          </motion.div>
          
          {change !== undefined && (
            <motion.div
              className={cn(
                "flex items-center gap-1 mt-2 text-sm",
                trend === 'up' && "text-green-500",
                trend === 'down' && "text-red-500",
                trend === 'neutral' && "text-text-secondary"
              )}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              {trend === 'up' && "↑"}
              {trend === 'down' && "↓"}
              {change > 0 && "+"}
              {change}%
            </motion.div>
          )}
        </div>
      </div>
    </AnimatedCard>
  );
});

MetricCard.displayName = 'MetricCard';

export default AnimatedCard;