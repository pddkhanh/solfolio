'use client';

import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import { useEffect, useRef } from 'react';

interface CountUpProps {
  value: number;
  duration?: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
  formatValue?: (value: number) => string;
  startFrom?: number;
  enableScrollSpy?: boolean;
  scrollSpyDelay?: number;
  separator?: string;
}

export function CountUp({
  value,
  duration = 1000,
  decimals = 0,
  prefix = '',
  suffix = '',
  className = '',
  formatValue,
  startFrom = 0,
  enableScrollSpy = false,
  scrollSpyDelay = 0,
  separator = ','
}: CountUpProps) {
  const count = useMotionValue(startFrom);
  const hasAnimated = useRef(false);
  const ref = useRef<HTMLSpanElement>(null);

  // Format number with separator
  const formatNumber = (num: number): string => {
    const fixed = num.toFixed(decimals);
    if (separator) {
      const parts = fixed.split('.');
      parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, separator);
      return parts.join('.');
    }
    return fixed;
  };

  // Transform motion value to formatted string
  const displayValue = useTransform(count, (latest) => {
    if (formatValue) {
      return `${prefix}${formatValue(latest)}${suffix}`;
    }
    return `${prefix}${formatNumber(latest)}${suffix}`;
  });

  useEffect(() => {
    const startAnimation = () => {
      if (!hasAnimated.current) {
        hasAnimated.current = true;
        const controls = animate(count, value, {
          duration: duration / 1000,
          ease: [0.4, 0, 0.2, 1], // Material Design easing
          onComplete: () => {
            // Ensure final value is exact
            count.set(value);
          }
        });

        return () => controls.stop();
      }
    };

    if (!enableScrollSpy) {
      return startAnimation();
    }

    // Scroll spy functionality
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasAnimated.current) {
            setTimeout(startAnimation, scrollSpyDelay);
          }
        });
      },
      { threshold: 0.1 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, [value, duration, count, enableScrollSpy, scrollSpyDelay]);

  // Update animation when value changes
  useEffect(() => {
    if (hasAnimated.current) {
      animate(count, value, {
        duration: duration / 1000 / 2, // Faster for updates
        ease: [0.4, 0, 0.2, 1],
      });
    }
  }, [value, duration, count]);

  return (
    <motion.span ref={ref} className={className}>
      {displayValue}
    </motion.span>
  );
}

// Specialized USD counter with currency formatting
export function CountUpUSD({
  value,
  ...props
}: Omit<CountUpProps, 'prefix' | 'decimals' | 'formatValue'>) {
  const formatUSD = (num: number): string => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(2)}M`;
    }
    if (num >= 1000) {
      return `${(num / 1000).toFixed(2)}K`;
    }
    return num.toFixed(2);
  };

  return (
    <CountUp
      value={value}
      prefix="$"
      decimals={2}
      formatValue={formatUSD}
      {...props}
    />
  );
}

// Percentage counter
export function CountUpPercentage({
  value,
  showSign = true,
  ...props
}: Omit<CountUpProps, 'suffix' | 'decimals'> & { showSign?: boolean }) {
  const prefix = showSign && value > 0 ? '+' : '';
  
  return (
    <CountUp
      value={Math.abs(value)}
      prefix={prefix}
      suffix="%"
      decimals={2}
      {...props}
    />
  );
}