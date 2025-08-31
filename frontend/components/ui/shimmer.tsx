"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import React from "react";

interface ShimmerProps {
  className?: string;
  duration?: number;
  delay?: number;
  width?: string | number;
  height?: string | number;
  variant?: "default" | "subtle" | "intense";
}

/**
 * Shimmer effect component for enhanced loading states
 * Can be overlaid on any element for a beautiful shimmer effect
 */
export function Shimmer({
  className,
  duration = 1.5,
  delay = 0,
  width = "100%",
  height = "100%",
  variant = "default",
}: ShimmerProps) {
  const variants = {
    default: "from-transparent via-white/10 to-transparent",
    subtle: "from-transparent via-white/5 to-transparent",
    intense: "from-transparent via-white/20 to-transparent",
  };

  return (
    <motion.div
      className={cn(
        "absolute inset-0 -translate-x-full",
        "bg-gradient-to-r",
        variants[variant],
        "pointer-events-none",
        className
      )}
      style={{
        width,
        height,
        backgroundSize: "200% 100%",
      }}
      animate={{
        translateX: ["0%", "200%"],
      }}
      transition={{
        duration,
        delay,
        ease: "linear",
        repeat: Infinity,
        repeatDelay: 0.5,
      }}
    />
  );
}

/**
 * Wrapper component that adds shimmer effect to any child element
 */
export function ShimmerWrapper({
  children,
  isLoading = true,
  className,
  shimmerClassName,
  duration,
  delay,
  variant = "default",
}: {
  children: React.ReactNode;
  isLoading?: boolean;
  className?: string;
  shimmerClassName?: string;
  duration?: number;
  delay?: number;
  variant?: "default" | "subtle" | "intense";
}) {
  return (
    <div className={cn("relative overflow-hidden", className)}>
      {children}
      {isLoading && (
        <Shimmer
          className={shimmerClassName}
          duration={duration}
          delay={delay}
          variant={variant}
        />
      )}
    </div>
  );
}

/**
 * Gradient shimmer effect with multiple colors
 */
export function GradientShimmer({
  className,
  duration = 2,
  colors = ["#9945FF", "#14F195", "#00D4FF"],
}: {
  className?: string;
  duration?: number;
  colors?: string[];
}) {
  const gradientColors = colors.map((color, index) => {
    const opacity = 0.1;
    return `${color}${Math.round(opacity * 255).toString(16).padStart(2, '0')}`;
  });

  return (
    <motion.div
      className={cn(
        "absolute inset-0 opacity-30",
        "pointer-events-none",
        className
      )}
      style={{
        background: `linear-gradient(90deg, ${gradientColors.join(", ")})`,
        backgroundSize: "200% 100%",
      }}
      animate={{
        backgroundPosition: ["0% 50%", "200% 50%"],
      }}
      transition={{
        duration,
        ease: "linear",
        repeat: Infinity,
      }}
    />
  );
}

/**
 * Pulse effect for subtle loading indication
 */
export function PulseEffect({
  className,
  duration = 1.5,
  scale = 1.05,
}: {
  className?: string;
  duration?: number;
  scale?: number;
}) {
  return (
    <motion.div
      className={cn("absolute inset-0", className)}
      animate={{
        scale: [1, scale, 1],
        opacity: [0.5, 0.8, 0.5],
      }}
      transition={{
        duration,
        ease: "easeInOut",
        repeat: Infinity,
      }}
    />
  );
}

/**
 * Wave shimmer effect for cards and larger areas
 */
export function WaveShimmer({
  className,
  waveCount = 3,
  duration = 2,
}: {
  className?: string;
  waveCount?: number;
  duration?: number;
}) {
  return (
    <div className={cn("absolute inset-0 overflow-hidden", className)}>
      {Array.from({ length: waveCount }).map((_, index) => (
        <motion.div
          key={index}
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent"
          initial={{ x: "-100%" }}
          animate={{ x: "200%" }}
          transition={{
            duration,
            delay: index * (duration / waveCount),
            ease: "linear",
            repeat: Infinity,
          }}
        />
      ))}
    </div>
  );
}

export default Shimmer;