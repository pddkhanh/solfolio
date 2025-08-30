'use client';

import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { formatUSD, formatNumber } from '@/lib/utils';
import { cn } from '@/lib/utils';

interface ChangeIndicatorProps {
  value: number;
  percent: number;
  period: '24h' | '7d' | '30d';
  size?: 'sm' | 'md' | 'lg';
  showValue?: boolean;
  className?: string;
}

export function ChangeIndicator({
  value,
  percent,
  period,
  size = 'md',
  showValue = true,
  className,
}: ChangeIndicatorProps) {
  const isPositive = value > 0;
  const isNeutral = value === 0;

  const sizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  };

  const iconSizes = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5',
  };

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <span className="text-muted-foreground">{period}</span>
      <div
        className={cn(
          'flex items-center gap-1',
          sizeClasses[size],
          isNeutral
            ? 'text-muted-foreground'
            : isPositive
            ? 'text-green-600 dark:text-green-500'
            : 'text-red-600 dark:text-red-500'
        )}
      >
        {isNeutral ? (
          <Minus className={iconSizes[size]} />
        ) : isPositive ? (
          <TrendingUp className={iconSizes[size]} />
        ) : (
          <TrendingDown className={iconSizes[size]} />
        )}
        <span className="font-medium">
          {isPositive ? '+' : ''}{formatNumber(percent, 2)}%
        </span>
        {showValue && (
          <span className="text-muted-foreground">
            ({isPositive ? '+' : ''}{formatUSD(value)})
          </span>
        )}
      </div>
    </div>
  );
}

interface MultiPeriodChangeProps {
  change24h?: number;
  changePercent24h?: number;
  change7d?: number;
  changePercent7d?: number;
  change30d?: number;
  changePercent30d?: number;
  size?: 'sm' | 'md' | 'lg';
  showValues?: boolean;
  className?: string;
}

export function MultiPeriodChange({
  change24h = 0,
  changePercent24h = 0,
  change7d = 0,
  changePercent7d = 0,
  change30d = 0,
  changePercent30d = 0,
  size = 'md',
  showValues = false,
  className,
}: MultiPeriodChangeProps) {
  return (
    <div className={cn('flex flex-wrap gap-4', className)}>
      <ChangeIndicator
        value={change24h}
        percent={changePercent24h}
        period="24h"
        size={size}
        showValue={showValues}
      />
      <ChangeIndicator
        value={change7d}
        percent={changePercent7d}
        period="7d"
        size={size}
        showValue={showValues}
      />
      <ChangeIndicator
        value={change30d}
        percent={changePercent30d}
        period="30d"
        size={size}
        showValue={showValues}
      />
    </div>
  );
}