'use client';

import { motion } from 'framer-motion';
import { useMemo } from 'react';

interface SparklineProps {
  data: number[];
  width?: number;
  height?: number;
  strokeWidth?: number;
  color?: string;
  gradientId?: string;
  showGradient?: boolean;
  className?: string;
  animate?: boolean;
  animationDuration?: number;
}

export function Sparkline({
  data,
  width = 120,
  height = 32,
  strokeWidth = 2,
  color,
  gradientId = 'sparkline-gradient',
  showGradient = true,
  className = '',
  animate = true,
  animationDuration = 1000
}: SparklineProps) {
  // Calculate SVG path from data points
  const path = useMemo(() => {
    if (!data || data.length < 2) return '';

    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;
    const padding = 2;
    
    // Calculate points
    const points = data.map((value, index) => {
      const x = (index / (data.length - 1)) * (width - padding * 2) + padding;
      const y = height - ((value - min) / range) * (height - padding * 2) - padding;
      return { x, y };
    });

    // Create smooth bezier curve path
    let pathData = `M ${points[0].x} ${points[0].y}`;
    
    for (let i = 1; i < points.length; i++) {
      const prev = points[i - 1];
      const curr = points[i];
      
      // Calculate control points for smooth curve
      const cpx = (prev.x + curr.x) / 2;
      const cpy1 = prev.y;
      const cpy2 = curr.y;
      
      pathData += ` C ${cpx} ${cpy1}, ${cpx} ${cpy2}, ${curr.x} ${curr.y}`;
    }

    return pathData;
  }, [data, width, height]);

  // Determine color based on trend
  const trendColor = useMemo(() => {
    if (color) return color;
    if (!data || data.length < 2) return '#6B7280'; // gray
    
    const firstValue = data[0];
    const lastValue = data[data.length - 1];
    
    if (lastValue > firstValue) {
      return '#14F195'; // green - positive trend
    } else if (lastValue < firstValue) {
      return '#FF4747'; // red - negative trend
    } else {
      return '#6B7280'; // gray - neutral
    }
  }, [data, color]);

  if (!data || data.length < 2) {
    return (
      <div className={`inline-block ${className}`} style={{ width, height }}>
        <svg width={width} height={height} className="opacity-20">
          <line
            x1={0}
            y1={height / 2}
            x2={width}
            y2={height / 2}
            stroke={trendColor}
            strokeWidth={strokeWidth}
            strokeDasharray="2 2"
          />
        </svg>
      </div>
    );
  }

  return (
    <div className={`inline-block ${className}`} style={{ width, height }}>
      <svg 
        width={width} 
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="none"
      >
        {showGradient && (
          <defs>
            <linearGradient id={gradientId} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={trendColor} stopOpacity="0.3" />
              <stop offset="100%" stopColor={trendColor} stopOpacity="0" />
            </linearGradient>
          </defs>
        )}
        
        {/* Area fill */}
        {showGradient && (
          <motion.path
            d={`${path} L ${width} ${height} L 0 ${height} Z`}
            fill={`url(#${gradientId})`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: animationDuration / 1000, delay: 0.2 }}
          />
        )}
        
        {/* Line */}
        <motion.path
          d={path}
          fill="none"
          stroke={trendColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={animate ? { pathLength: 0, opacity: 0 } : {}}
          animate={animate ? { pathLength: 1, opacity: 1 } : {}}
          transition={{
            pathLength: { duration: animationDuration / 1000, ease: [0.4, 0, 0.2, 1] },
            opacity: { duration: 0.2 }
          }}
        />
        
        {/* End dot */}
        <motion.circle
          cx={width - 2}
          cy={height - ((data[data.length - 1] - Math.min(...data)) / (Math.max(...data) - Math.min(...data) || 1)) * (height - 4) - 2}
          r={strokeWidth * 1.5}
          fill={trendColor}
          initial={animate ? { scale: 0, opacity: 0 } : {}}
          animate={animate ? { scale: 1, opacity: 1 } : {}}
          transition={{
            duration: 0.3,
            delay: animationDuration / 1000,
            ease: [0.4, 0, 0.2, 1]
          }}
        />
      </svg>
    </div>
  );
}

// Generate mock data for testing
export function generateMockSparklineData(
  length: number = 20,
  trend: 'up' | 'down' | 'volatile' = 'volatile'
): number[] {
  const data: number[] = [];
  let value = 50;
  
  for (let i = 0; i < length; i++) {
    if (trend === 'up') {
      value += Math.random() * 5 - 1;
    } else if (trend === 'down') {
      value -= Math.random() * 5 - 1;
    } else {
      value += Math.random() * 10 - 5;
    }
    
    value = Math.max(0, Math.min(100, value));
    data.push(value);
  }
  
  return data;
}