"use client";

import { cn } from "@/lib/utils";
import { motion, HTMLMotionProps } from "framer-motion";
import React from "react";
import { shimmerVariants, pulseVariants } from "@/lib/animations";

interface SkeletonProps extends Omit<HTMLMotionProps<"div">, "children"> {
  className?: string;
  variant?: "default" | "circular" | "text" | "rectangular";
  width?: string | number;
  height?: string | number;
  animation?: "shimmer" | "pulse" | "wave" | "none";
  delay?: number;
  children?: never;
}

/**
 * Base skeleton component for loading states
 * Supports different shapes and animation types
 */
function Skeleton({
  className,
  variant = "default",
  width,
  height,
  animation = "shimmer",
  delay = 0,
  ...props
}: SkeletonProps) {
  // Base styles for all skeleton variants
  const baseStyles = cn(
    "relative overflow-hidden",
    "bg-gradient-to-r from-[#1C1D26]/80 via-[#242530]/80 to-[#1C1D26]/80",
    "dark:from-[#1C1D26]/80 dark:via-[#242530]/80 dark:to-[#1C1D26]/80",
    "light:from-gray-200 light:via-gray-100 light:to-gray-200"
  );

  // Variant-specific styles
  const variantStyles = {
    default: "rounded-lg",
    circular: "rounded-full aspect-square",
    text: "rounded h-4",
    rectangular: "rounded-md",
  };

  // Animation configurations
  const animationVariants: Record<string, any> = {
    shimmer: delay > 0 ? {
      backgroundPosition: '200% 0',
      transition: {
        duration: 1.5,
        ease: 'linear',
        repeat: Infinity,
        delay,
      },
    } : shimmerVariants.animate,
    pulse: delay > 0 ? {
      opacity: [0.5, 1, 0.5],
      transition: {
        duration: 1.5,
        repeat: Infinity,
        ease: 'easeInOut',
        delay,
      },
    } : pulseVariants.animate,
    wave: {
      opacity: [0.5, 0.8, 0.5],
      scale: [1, 1.02, 1],
      transition: {
        duration: 2,
        ease: "easeInOut" as const,
        repeat: Infinity,
        delay,
      },
    },
    none: {},
  };

  // Apply shimmer gradient background for shimmer animation
  const shimmerBackground = animation === "shimmer" 
    ? "bg-[length:200%_100%] bg-gradient-to-r from-transparent via-white/10 to-transparent" 
    : "";

  return (
    <motion.div
      className={cn(
        baseStyles,
        variantStyles[variant],
        shimmerBackground,
        className
      )}
      style={{
        width: width || undefined,
        height: height || undefined,
      }}
      animate={animation !== "none" ? animationVariants[animation] : undefined}
      aria-busy="true"
      aria-live="polite"
      role="status"
      {...props}
    >
      <span className="sr-only">Loading...</span>
    </motion.div>
  );
}

/**
 * Skeleton component specifically for text content
 * Supports multiple lines with varying widths
 */
function SkeletonText({
  lines = 1,
  className,
  widths,
}: {
  lines?: number;
  className?: string;
  widths?: string[];
}) {
  const defaultWidths = ["100%", "90%", "95%", "85%"];
  const lineWidths = widths || defaultWidths.slice(0, lines);

  return (
    <div className={cn("space-y-2", className)}>
      {Array.from({ length: lines }).map((_, index) => (
        <Skeleton
          key={index}
          variant="text"
          width={lineWidths[index] || lineWidths[lineWidths.length - 1]}
          className="h-4"
        />
      ))}
    </div>
  );
}

/**
 * Skeleton component for cards with common layouts
 */
function SkeletonCard({
  className,
  showAvatar = false,
  showTitle = true,
  showDescription = true,
  showActions = false,
}: {
  className?: string;
  showAvatar?: boolean;
  showTitle?: boolean;
  showDescription?: boolean;
  showActions?: boolean;
}) {
  return (
    <div
      className={cn(
        "bg-[#13141A] rounded-xl border border-white/[0.08] p-6",
        className
      )}
    >
      <div className="flex items-start gap-4">
        {showAvatar && (
          <Skeleton variant="circular" className="w-12 h-12 flex-shrink-0" />
        )}
        <div className="flex-1 space-y-3">
          {showTitle && <Skeleton className="h-6 w-3/4" />}
          {showDescription && <SkeletonText lines={2} />}
          {showActions && (
            <div className="flex gap-2 mt-4">
              <Skeleton className="h-9 w-24" />
              <Skeleton className="h-9 w-24" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Skeleton component for table rows
 */
function SkeletonTableRow({
  columns = 4,
  className,
}: {
  columns?: number;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-4 px-4 py-3 border-b border-white/[0.08]",
        className
      )}
    >
      {Array.from({ length: columns }).map((_, index) => (
        <div key={index} className="flex-1">
          <Skeleton
            className="h-4"
            width={index === 0 ? "60%" : index === columns - 1 ? "40%" : "80%"}
          />
        </div>
      ))}
    </div>
  );
}

/**
 * Container that staggers the appearance of skeleton items
 */
function SkeletonContainer({
  children,
  className,
  staggerDelay = 0.05,
}: {
  children: React.ReactNode;
  className?: string;
  staggerDelay?: number;
}) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      animate="visible"
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            staggerChildren: staggerDelay,
            delayChildren: 0.1,
          },
        },
      }}
    >
      {children}
    </motion.div>
  );
}

/**
 * Skeleton component for portfolio overview metrics
 */
function SkeletonMetric({
  className,
  showIcon = true,
  showTrend = false,
}: {
  className?: string;
  showIcon?: boolean;
  showTrend?: boolean;
}) {
  return (
    <div
      className={cn(
        "bg-[#13141A] rounded-xl border border-white/[0.08] p-4",
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 space-y-3">
          <div className="flex items-center gap-2">
            {showIcon && <Skeleton variant="circular" className="w-8 h-8" />}
            <Skeleton className="h-4 w-24" />
          </div>
          <Skeleton className="h-8 w-32" />
          {showTrend && (
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-12" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Skeleton component for token list items
 */
function SkeletonTokenRow({
  className,
  showActions = true,
}: {
  className?: string;
  showActions?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-4 px-4 py-3 border-b border-white/[0.08]",
        "hover:bg-white/[0.02] transition-colors",
        className
      )}
    >
      {/* Token info */}
      <div className="flex items-center gap-3 flex-1">
        <Skeleton variant="circular" className="w-10 h-10" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-3 w-24" variant="text" />
        </div>
      </div>
      
      {/* Balance */}
      <div className="flex-1 text-right space-y-2">
        <Skeleton className="h-4 w-20 ml-auto" />
        <Skeleton className="h-3 w-16 ml-auto" variant="text" />
      </div>
      
      {/* Price */}
      <div className="flex-1 text-right space-y-2">
        <Skeleton className="h-4 w-24 ml-auto" />
        <Skeleton className="h-3 w-16 ml-auto" variant="text" />
      </div>
      
      {/* Change */}
      <div className="flex-1 text-right">
        <Skeleton className="h-6 w-16 ml-auto rounded-full" />
      </div>
      
      {/* Actions */}
      {showActions && (
        <div className="flex gap-2">
          <Skeleton className="h-8 w-8 rounded-lg" />
          <Skeleton className="h-8 w-8 rounded-lg" />
        </div>
      )}
    </div>
  );
}

/**
 * Skeleton component for position cards
 */
function SkeletonPositionCard({
  className,
}: {
  className?: string;
}) {
  return (
    <div
      className={cn(
        "bg-gradient-to-br from-[#13141A] to-[#1C1D26]",
        "rounded-xl border border-white/[0.08] p-6",
        "relative overflow-hidden",
        className
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <Skeleton variant="circular" className="w-12 h-12" />
          <div className="space-y-2">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-3 w-16" variant="text" />
          </div>
        </div>
        <Skeleton className="h-6 w-20 rounded-full" />
      </div>
      
      {/* Metrics */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="space-y-2">
          <Skeleton className="h-3 w-16" variant="text" />
          <Skeleton className="h-6 w-24" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-3 w-12" variant="text" />
          <Skeleton className="h-6 w-20" />
        </div>
      </div>
      
      {/* Tokens */}
      <div className="flex items-center gap-2 mb-4">
        <Skeleton variant="circular" className="w-6 h-6" />
        <Skeleton variant="circular" className="w-6 h-6" />
        <Skeleton className="h-4 w-32" variant="text" />
      </div>
      
      {/* Actions */}
      <Skeleton className="h-10 w-full rounded-lg" />
    </div>
  );
}

/**
 * Skeleton component for charts
 */
function SkeletonChart({
  className,
  type = "area",
  height = 300,
}: {
  className?: string;
  type?: "area" | "bar" | "pie" | "line";
  height?: number;
}) {
  return (
    <div
      className={cn(
        "bg-[#13141A] rounded-xl border border-white/[0.08] p-6",
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <Skeleton className="h-6 w-32" />
        <div className="flex gap-2">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-8 w-16 rounded-lg" />
          ))}
        </div>
      </div>
      
      {/* Chart area */}
      {type === "pie" ? (
        <div className="flex items-center justify-center" style={{ height }}>
          <Skeleton variant="circular" className="w-48 h-48" />
        </div>
      ) : (
        <div className="relative" style={{ height }}>
          {type === "bar" ? (
            <div className="flex items-end justify-between h-full gap-2">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton
                  key={i}
                  className="flex-1"
                  height={`${Math.random() * 70 + 30}%`}
                  delay={i * 0.05}
                />
              ))}
            </div>
          ) : (
            <Skeleton className="w-full h-full" animation="wave" />
          )}
        </div>
      )}
      
      {/* Legend */}
      <div className="flex items-center justify-center gap-4 mt-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center gap-2">
            <Skeleton variant="circular" className="w-3 h-3" />
            <Skeleton className="h-3 w-16" variant="text" />
          </div>
        ))}
      </div>
    </div>
  );
}

export { 
  Skeleton, 
  SkeletonText, 
  SkeletonCard, 
  SkeletonTableRow, 
  SkeletonContainer,
  SkeletonMetric,
  SkeletonTokenRow,
  SkeletonPositionCard,
  SkeletonChart
};
