'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { useEffect, useState, useRef } from 'react';
import { cn } from '@/lib/utils';

interface PriceTickerProps {
  symbol: string;
  price: number;
  previousPrice?: number;
  change24h?: number;
  changePercent24h?: number;
  decimals?: number;
  showTrend?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function PriceTicker({
  symbol,
  price,
  previousPrice,
  change24h,
  changePercent24h,
  decimals = 2,
  showTrend = true,
  size = 'md',
  className,
}: PriceTickerProps) {
  const [displayPrice, setDisplayPrice] = useState(price);
  const [priceDirection, setPriceDirection] = useState<'up' | 'down' | 'neutral'>('neutral');
  const [isUpdating, setIsUpdating] = useState(false);
  const prevPriceRef = useRef(price);

  useEffect(() => {
    if (price !== prevPriceRef.current) {
      setIsUpdating(true);
      setPriceDirection(price > prevPriceRef.current ? 'up' : price < prevPriceRef.current ? 'down' : 'neutral');
      
      // Animate price change
      const startPrice = prevPriceRef.current;
      const endPrice = price;
      const duration = 500; // ms
      const startTime = Date.now();

      const animatePrice = () => {
        const now = Date.now();
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Easing function
        const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
        const easedProgress = easeOutCubic(progress);
        
        const currentPrice = startPrice + (endPrice - startPrice) * easedProgress;
        setDisplayPrice(currentPrice);

        if (progress < 1) {
          requestAnimationFrame(animatePrice);
        } else {
          setIsUpdating(false);
          prevPriceRef.current = price;
        }
      };

      requestAnimationFrame(animatePrice);
    }
  }, [price]);

  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
  };

  const iconSize = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  const formatPrice = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(value);
  };

  const getTrendIcon = () => {
    if (changePercent24h === undefined) return null;
    if (changePercent24h > 0) return TrendingUp;
    if (changePercent24h < 0) return TrendingDown;
    return Minus;
  };

  const TrendIcon = getTrendIcon();

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div className="flex flex-col">
        <div className="flex items-center gap-1">
          <span className={cn('font-medium text-gray-600 dark:text-gray-400', sizeClasses[size])}>
            {symbol}
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Price with animation */}
          <motion.div
            className={cn(
              'font-mono font-semibold transition-colors duration-300',
              sizeClasses[size],
              {
                'text-green-500': isUpdating && priceDirection === 'up',
                'text-red-500': isUpdating && priceDirection === 'down',
                'text-gray-900 dark:text-gray-100': !isUpdating,
              }
            )}
            animate={
              isUpdating
                ? {
                    scale: [1, 1.05, 1],
                    opacity: [1, 0.8, 1],
                  }
                : {}
            }
            transition={{ duration: 0.3 }}
          >
            ${formatPrice(displayPrice)}
          </motion.div>

          {/* Flash effect on update */}
          <AnimatePresence>
            {isUpdating && (
              <motion.div
                className={cn('absolute inset-0 rounded-md pointer-events-none', {
                  'bg-green-500/20': priceDirection === 'up',
                  'bg-red-500/20': priceDirection === 'down',
                })}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              />
            )}
          </AnimatePresence>

          {/* 24h change */}
          {showTrend && changePercent24h !== undefined && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className={cn(
                'flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium',
                {
                  'bg-green-500/10 text-green-500': changePercent24h > 0,
                  'bg-red-500/10 text-red-500': changePercent24h < 0,
                  'bg-gray-500/10 text-gray-500': changePercent24h === 0,
                }
              )}
            >
              {TrendIcon && <TrendIcon className={iconSize[size]} />}
              <span>{Math.abs(changePercent24h).toFixed(2)}%</span>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}

// Multi-price ticker for header/banner
export function PriceTickerStrip({ prices }: { prices: Array<{ symbol: string; price: number; change24h?: number }> }) {
  return (
    <motion.div
      className="flex items-center gap-6 overflow-x-auto scrollbar-hide"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {prices.map((item, index) => (
        <motion.div
          key={item.symbol}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.05 }}
        >
          <PriceTicker
            symbol={item.symbol}
            price={item.price}
            changePercent24h={item.change24h}
            size="sm"
            showTrend={true}
          />
        </motion.div>
      ))}
    </motion.div>
  );
}