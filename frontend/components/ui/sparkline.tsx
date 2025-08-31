'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface SparklineProps {
  data: number[];
  width?: number;
  height?: number;
  strokeWidth?: number;
  strokeColor?: string;
  fillColor?: string;
  className?: string;
  animate?: boolean;
  showDots?: boolean;
}

export function Sparkline({
  data,
  width = 100,
  height = 32,
  strokeWidth = 2,
  strokeColor,
  fillColor,
  className,
  animate = true,
  showDots = false,
}: SparklineProps) {
  const { path, fillPath, dots, trend } = useMemo(() => {
    if (!data || data.length < 2) {
      return { path: '', fillPath: '', dots: [], trend: 'neutral' };
    }

    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;
    const padding = 2;

    const points = data.map((value, index) => {
      const x = (index / (data.length - 1)) * (width - padding * 2) + padding;
      const y = height - ((value - min) / range) * (height - padding * 2) - padding;
      return { x, y, value };
    });

    const pathData = points
      .map((point, index) => {
        if (index === 0) return `M ${point.x},${point.y}`;
        
        // Create smooth curve using quadratic bezier
        const prevPoint = points[index - 1];
        const cpx = (prevPoint.x + point.x) / 2;
        const cpy = (prevPoint.y + point.y) / 2;
        
        return `Q ${cpx},${prevPoint.y} ${cpx},${cpy} T ${point.x},${point.y}`;
      })
      .join(' ');

    const fillPathData = `${pathData} L ${points[points.length - 1].x},${height} L ${points[0].x},${height} Z`;

    const trendDirection = data[data.length - 1] > data[0] ? 'up' : data[data.length - 1] < data[0] ? 'down' : 'neutral';

    return {
      path: pathData,
      fillPath: fillPathData,
      dots: points,
      trend: trendDirection,
    };
  }, [data, width, height]);

  const getColor = () => {
    if (strokeColor) return strokeColor;
    switch (trend) {
      case 'up':
        return '#14F195'; // Solana green
      case 'down':
        return '#F43F5E'; // Red
      default:
        return '#94A3B8'; // Gray
    }
  };

  const getFillColor = () => {
    if (fillColor) return fillColor;
    const color = getColor();
    return `${color}20`; // 20% opacity
  };

  if (!data || data.length < 2) {
    return (
      <div className={cn('flex items-center justify-center', className)} style={{ width, height }}>
        <div className="h-px w-full bg-gray-700" />
      </div>
    );
  }

  return (
    <svg
      width={width}
      height={height}
      className={cn('overflow-visible', className)}
      viewBox={`0 0 ${width} ${height}`}
    >
      {/* Gradient definition */}
      <defs>
        <linearGradient id={`sparkline-gradient-${trend}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={getColor()} stopOpacity="0.3" />
          <stop offset="100%" stopColor={getColor()} stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Fill area */}
      <motion.path
        d={fillPath}
        fill={`url(#sparkline-gradient-${trend})`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      />

      {/* Line */}
      <motion.path
        d={path}
        fill="none"
        stroke={getColor()}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={animate ? { pathLength: 0 } : { pathLength: 1 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1, ease: 'easeOut' }}
      />

      {/* Optional dots */}
      {showDots && dots.map((dot, index) => (
        <motion.circle
          key={index}
          cx={dot.x}
          cy={dot.y}
          r={2}
          fill={getColor()}
          initial={animate ? { scale: 0 } : { scale: 1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.3, delay: index * 0.05 }}
        />
      ))}

      {/* Hover area for last point */}
      <circle
        cx={dots[dots.length - 1]?.x}
        cy={dots[dots.length - 1]?.y}
        r={4}
        fill={getColor()}
        opacity={0}
        className="hover:opacity-100 transition-opacity"
      />
    </svg>
  );
}

// Generate mock price data for testing
export function generateMockPriceData(points: number = 20, volatility: number = 0.1): number[] {
  const data: number[] = [];
  let value = 100;
  
  for (let i = 0; i < points; i++) {
    const change = (Math.random() - 0.5) * volatility * value;
    value = Math.max(value + change, 1);
    data.push(value);
  }
  
  return data;
}