"use client";

import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import React, { useState, useEffect } from "react";
import { Check, Loader2, AlertCircle } from "lucide-react";

interface LoadingStep {
  id: string;
  label: string;
  description?: string;
}

interface ProgressiveLoaderProps {
  steps: LoadingStep[];
  currentStep: number;
  className?: string;
  showProgress?: boolean;
  variant?: "linear" | "circular" | "dots";
}

/**
 * Progressive loader that shows loading progress through multiple steps
 * Perfect for multi-stage data fetching or initialization
 */
export function ProgressiveLoader({
  steps,
  currentStep,
  className,
  showProgress = true,
  variant = "linear",
}: ProgressiveLoaderProps) {
  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <div className={cn("space-y-6", className)}>
      {/* Progress indicator */}
      {showProgress && (
        <div className="relative">
          {variant === "linear" && (
            <LinearProgress progress={progress} />
          )}
          {variant === "circular" && (
            <CircularProgress progress={progress} />
          )}
          {variant === "dots" && (
            <DotsProgress currentStep={currentStep} totalSteps={steps.length} />
          )}
        </div>
      )}

      {/* Steps list */}
      <div className="space-y-3">
        {steps.map((step, index) => (
          <StepItem
            key={step.id}
            step={step}
            status={
              index < currentStep
                ? "completed"
                : index === currentStep
                ? "loading"
                : "pending"
            }
            index={index}
          />
        ))}
      </div>
    </div>
  );
}

/**
 * Individual step item with animations
 */
function StepItem({
  step,
  status,
  index,
}: {
  step: LoadingStep;
  status: "pending" | "loading" | "completed";
  index: number;
}) {
  const variants = {
    pending: { opacity: 0.5, x: 0 },
    loading: { opacity: 1, x: 10 },
    completed: { opacity: 1, x: 0 },
  };

  const iconVariants = {
    pending: { scale: 0.8, rotate: 0 },
    loading: { scale: 1, rotate: 360 },
    completed: { scale: 1, rotate: 0 },
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={variants[status]}
      transition={{
        duration: 0.3,
        delay: index * 0.1,
      }}
      className={cn(
        "flex items-start gap-3 p-3 rounded-lg transition-colors",
        status === "loading" && "bg-purple-500/10 border border-purple-500/20",
        status === "completed" && "bg-green-500/5"
      )}
    >
      {/* Status icon */}
      <motion.div
        variants={iconVariants}
        animate={status}
        transition={{
          duration: status === "loading" ? 1 : 0.3,
          repeat: status === "loading" ? Infinity : 0,
          ease: status === "loading" ? "linear" : "easeOut",
        }}
        className="mt-0.5"
      >
        {status === "pending" && (
          <div className="w-5 h-5 rounded-full border-2 border-gray-600" />
        )}
        {status === "loading" && (
          <Loader2 className="w-5 h-5 text-purple-500" />
        )}
        {status === "completed" && (
          <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
            <Check className="w-3 h-3 text-white" />
          </div>
        )}
      </motion.div>

      {/* Step content */}
      <div className="flex-1">
        <p
          className={cn(
            "font-medium",
            status === "pending" && "text-gray-500",
            status === "loading" && "text-white",
            status === "completed" && "text-gray-300"
          )}
        >
          {step.label}
        </p>
        {step.description && (
          <p className="text-sm text-gray-500 mt-0.5">{step.description}</p>
        )}
      </div>
    </motion.div>
  );
}

/**
 * Linear progress bar
 */
function LinearProgress({ progress }: { progress: number }) {
  return (
    <div className="relative h-2 bg-gray-800 rounded-full overflow-hidden">
      <motion.div
        className="absolute inset-y-0 left-0 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-full"
        initial={{ width: "0%" }}
        animate={{ width: `${progress}%` }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      />
      {/* Shimmer effect */}
      <motion.div
        className="absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-white/20 to-transparent"
        animate={{
          x: ["-100%", "400%"],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "linear",
        }}
      />
    </div>
  );
}

/**
 * Circular progress indicator
 */
function CircularProgress({ progress }: { progress: number }) {
  const circumference = 2 * Math.PI * 40;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative w-24 h-24 mx-auto">
      <svg className="transform -rotate-90 w-24 h-24">
        {/* Background circle */}
        <circle
          cx="48"
          cy="48"
          r="40"
          stroke="currentColor"
          strokeWidth="8"
          fill="none"
          className="text-gray-800"
        />
        {/* Progress circle */}
        <motion.circle
          cx="48"
          cy="48"
          r="40"
          stroke="url(#gradient)"
          strokeWidth="8"
          fill="none"
          strokeLinecap="round"
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          style={{
            strokeDasharray: circumference,
          }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
        <defs>
          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#9945FF" />
            <stop offset="100%" stopColor="#00D4FF" />
          </linearGradient>
        </defs>
      </svg>
      {/* Percentage text */}
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.span
          className="text-2xl font-bold text-white"
          key={progress}
          initial={{ scale: 1.2, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          {Math.round(progress)}%
        </motion.span>
      </div>
    </div>
  );
}

/**
 * Dots progress indicator
 */
function DotsProgress({
  currentStep,
  totalSteps,
}: {
  currentStep: number;
  totalSteps: number;
}) {
  return (
    <div className="flex items-center justify-center gap-2">
      {Array.from({ length: totalSteps }).map((_, index) => (
        <motion.div
          key={index}
          className={cn(
            "w-2 h-2 rounded-full",
            index <= currentStep ? "bg-purple-500" : "bg-gray-600"
          )}
          initial={{ scale: 0 }}
          animate={{
            scale: index === currentStep ? [1, 1.5, 1] : 1,
          }}
          transition={{
            duration: index === currentStep ? 1 : 0.3,
            repeat: index === currentStep ? Infinity : 0,
            delay: index * 0.1,
          }}
        />
      ))}
    </div>
  );
}

/**
 * Full-screen loading overlay with progress
 */
export function FullScreenLoader({
  isLoading,
  steps,
  currentStep,
  title = "Loading Portfolio",
  description,
}: {
  isLoading: boolean;
  steps: LoadingStep[];
  currentStep: number;
  title?: string;
  description?: string;
}) {
  if (!isLoading) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-8"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: "spring", stiffness: 500 }}
          className="bg-bg-secondary rounded-2xl p-8 max-w-md w-full border border-purple-500/20 shadow-2xl"
        >
          {/* Gradient decoration */}
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-purple-500/10 via-transparent to-cyan-500/10 pointer-events-none" />
          
          <div className="relative space-y-6">
            {/* Header */}
            <div className="text-center">
              <h2 className="text-2xl font-bold text-white mb-2">{title}</h2>
              {description && (
                <p className="text-gray-400 text-sm">{description}</p>
              )}
            </div>

            {/* Progress loader */}
            <ProgressiveLoader
              steps={steps}
              currentStep={currentStep}
              variant="circular"
            />

            {/* Cancel button */}
            <button
              className="w-full py-2 text-sm text-gray-500 hover:text-gray-300 transition-colors"
              onClick={() => window.location.reload()}
            >
              Cancel
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export default ProgressiveLoader;