"use client";

import { cn } from "@/lib/utils";
import { motion, HTMLMotionProps } from "framer-motion";
import React from "react";

interface SkeletonProps extends Omit<HTMLMotionProps<"div">, "children"> {
  className?: string;
  variant?: "default" | "circular" | "text" | "rectangular";
  width?: string | number;
  height?: string | number;
  animation?: "shimmer" | "pulse" | "none";
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
  ...props
}: SkeletonProps) {
  // Base styles for all skeleton variants
  const baseStyles = cn(
    "relative overflow-hidden",
    "bg-gradient-to-r from-gray-800/50 via-gray-700/50 to-gray-800/50",
    "dark:from-gray-800/50 dark:via-gray-700/50 dark:to-gray-800/50"
  );

  // Variant-specific styles
  const variantStyles = {
    default: "rounded-lg",
    circular: "rounded-full aspect-square",
    text: "rounded h-4",
    rectangular: "rounded-md",
  };

  // Animation configurations
  const animationVariants = {
    shimmer: {
      backgroundPosition: ["200% 0%", "-200% 0%"],
      transition: {
        duration: 1.5,
        ease: "linear" as const,
        repeat: Infinity,
      },
    },
    pulse: {
      opacity: [0.5, 1, 0.5],
      transition: {
        duration: 1.5,
        ease: "easeInOut" as const,
        repeat: Infinity,
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
      {...props}
    />
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

export { 
  Skeleton, 
  SkeletonText, 
  SkeletonCard, 
  SkeletonTableRow, 
  SkeletonContainer 
};
