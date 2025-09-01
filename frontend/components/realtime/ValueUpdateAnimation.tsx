'use client';

import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface ValueUpdateAnimationProps {
  value: number;
  previousValue?: number;
  format?: 'currency' | 'percent' | 'number' | 'compact';
  prefix?: string;
  suffix?: string;
  decimals?: number;
  showChange?: boolean;
  animationDuration?: number;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export function ValueUpdateAnimation({
  value,
  previousValue,
  format = 'currency',
  prefix = '',
  suffix = '',
  decimals = 2,
  showChange = true,
  animationDuration = 750,
  className,
  size = 'md',
}: ValueUpdateAnimationProps) {
  const count = useMotionValue(previousValue ?? value);
  const rounded = useTransform(count, (latest) => {
    return formatValue(latest, format, decimals);
  });
  
  const [direction, setDirection] = useState<'up' | 'down' | 'neutral'>('neutral');
  const [isAnimating, setIsAnimating] = useState(false);
  const prevValueRef = useRef(value);

  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-xl',
    xl: 'text-2xl',
  };

  function formatValue(val: number, formatType: string, dec: number) {
    switch (formatType) {
      case 'currency':
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
          minimumFractionDigits: dec,
          maximumFractionDigits: dec,
        }).format(val);
      
      case 'percent':
        return `${val.toFixed(dec)}%`;
      
      case 'compact':
        return new Intl.NumberFormat('en-US', {
          notation: 'compact',
          compactDisplay: 'short',
          minimumFractionDigits: dec > 0 ? 1 : 0,
          maximumFractionDigits: dec,
        }).format(val);
      
      default:
        return val.toFixed(dec);
    }
  }

  useEffect(() => {
    if (value !== prevValueRef.current) {
      setIsAnimating(true);
      setDirection(value > prevValueRef.current ? 'up' : value < prevValueRef.current ? 'down' : 'neutral');
      
      const animation = animate(count, value, {
        duration: animationDuration / 1000,
        ease: [0.4, 0, 0.2, 1],
        onComplete: () => {
          setIsAnimating(false);
          prevValueRef.current = value;
        },
      });

      return animation.stop;
    }
  }, [value, count, animationDuration]);

  const changeAmount = previousValue !== undefined ? value - previousValue : 0;
  const changePercent = previousValue !== undefined && previousValue !== 0 
    ? ((value - previousValue) / previousValue) * 100 
    : 0;

  return (
    <div className={cn('inline-flex items-center gap-2', className)}>
      <motion.span
        className={cn(
          'font-mono font-semibold transition-colors duration-300',
          sizeClasses[size],
          {
            'text-green-500': isAnimating && direction === 'up',
            'text-red-500': isAnimating && direction === 'down',
            'text-gray-900 dark:text-gray-100': !isAnimating,
          }
        )}
        animate={
          isAnimating
            ? {
                scale: [1, 1.05, 1],
                opacity: [1, 0.8, 1],
              }
            : {}
        }
        transition={{ duration: 0.3 }}
      >
        {prefix}
        <motion.span>{rounded}</motion.span>
        {suffix}
      </motion.span>

      {/* Change indicator */}
      {showChange && changeAmount !== 0 && (
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 10 }}
          className={cn(
            'flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium',
            {
              'bg-green-500/10 text-green-500': changeAmount > 0,
              'bg-red-500/10 text-red-500': changeAmount < 0,
            }
          )}
        >
          {changeAmount > 0 ? (
            <TrendingUp className="w-3 h-3" />
          ) : (
            <TrendingDown className="w-3 h-3" />
          )}
          <span>{Math.abs(changePercent).toFixed(2)}%</span>
        </motion.div>
      )}

      {/* Flash effect overlay */}
      {isAnimating && (
        <motion.div
          className={cn(
            'absolute inset-0 rounded-md pointer-events-none',
            {
              'bg-green-500/10': direction === 'up',
              'bg-red-500/10': direction === 'down',
            }
          )}
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 1, 0] }}
          transition={{ duration: 0.5 }}
        />
      )}
    </div>
  );
}

// Animated counter for statistics
export function AnimatedCounter({
  from = 0,
  to,
  duration = 1000,
  delay = 0,
  format = 'number',
  decimals = 0,
  className,
}: {
  from?: number;
  to: number;
  duration?: number;
  delay?: number;
  format?: 'currency' | 'percent' | 'number' | 'compact';
  decimals?: number;
  className?: string;
}) {
  const [hasAnimated, setHasAnimated] = useState(false);
  const count = useMotionValue(from);
  const rounded = useTransform(count, (latest) => {
    switch (format) {
      case 'currency':
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
          minimumFractionDigits: decimals,
          maximumFractionDigits: decimals,
        }).format(latest);
      case 'percent':
        return `${latest.toFixed(decimals)}%`;
      case 'compact':
        return new Intl.NumberFormat('en-US', {
          notation: 'compact',
          compactDisplay: 'short',
        }).format(latest);
      default:
        return latest.toFixed(decimals);
    }
  });

  useEffect(() => {
    if (!hasAnimated) {
      const timer = setTimeout(() => {
        const animation = animate(count, to, {
          duration: duration / 1000,
          ease: [0.4, 0, 0.2, 1],
        });
        setHasAnimated(true);
        return animation.stop;
      }, delay);
      
      return () => clearTimeout(timer);
    }
  }, [count, to, duration, delay, hasAnimated]);

  return (
    <motion.span className={className}>
      {rounded}
    </motion.span>
  );
}

// Sparkline with animated drawing
export function AnimatedSparkline({
  data,
  width = 100,
  height = 30,
  color = '#10b981',
  animate = true,
  className,
}: {
  data: number[];
  width?: number;
  height?: number;
  color?: string;
  animate?: boolean;
  className?: string;
}) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  
  const points = data.map((value, index) => {
    const x = (index / (data.length - 1)) * width;
    const y = height - ((value - min) / range) * height;
    return `${x},${y}`;
  }).join(' ');

  return (
    <svg
      width={width}
      height={height}
      className={className}
      viewBox={`0 0 ${width} ${height}`}
    >
      <defs>
        <linearGradient id="sparkline-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={color} stopOpacity={0.3} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </linearGradient>
      </defs>
      
      {/* Area fill */}
      <motion.polygon
        points={`${points} ${width},${height} 0,${height}`}
        fill="url(#sparkline-gradient)"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      />
      
      {/* Line */}
      <motion.polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={animate ? { pathLength: 0 } : { pathLength: 1 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1, ease: 'easeInOut' }}
      />
      
      {/* Current value dot */}
      <motion.circle
        cx={width}
        cy={height - ((data[data.length - 1] - min) / range) * height}
        r="3"
        fill={color}
        initial={{ scale: 0 }}
        animate={{ scale: [0, 1.5, 1] }}
        transition={{ duration: 0.5, delay: 0.8 }}
      />
    </svg>
  );
}