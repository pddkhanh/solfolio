'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface PositionCardSkeletonProps {
  index?: number;
}

export function PositionCardSkeleton({ index = 0 }: PositionCardSkeletonProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.5,
        delay: index * 0.05,
        ease: [0.4, 0, 0.2, 1],
      }}
      className="relative"
    >
      {/* Card container with gradient border */}
      <div className="relative rounded-xl bg-gradient-to-r from-purple-500/5 via-cyan-500/5 to-purple-500/5 p-[1px]">
        <div className="relative rounded-xl bg-[#16171F] dark:bg-[#16171F] overflow-hidden">
          {/* Shimmer effect overlay */}
          <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite]">
            <div className="h-full w-full bg-gradient-to-r from-transparent via-white/5 to-transparent" />
          </div>
          
          {/* Card Header */}
          <div className="relative p-5 pb-0">
            <div className="flex items-start justify-between mb-4">
              {/* Protocol Logo and Info */}
              <div className="flex items-center gap-4">
                {/* Logo skeleton */}
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500/10 to-cyan-500/10 animate-pulse" />
                
                <div className="space-y-2">
                  {/* Protocol name skeleton */}
                  <div className="h-5 w-24 bg-white/5 rounded animate-pulse" />
                  {/* Badge skeleton */}
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-16 bg-white/5 rounded-full animate-pulse" />
                    <div className="h-3 w-10 bg-white/5 rounded animate-pulse" />
                  </div>
                </div>
              </div>
              
              {/* Action buttons skeleton */}
              <div className="flex items-center gap-1">
                <div className="w-8 h-8 rounded-lg bg-white/5 animate-pulse" />
                <div className="w-8 h-8 rounded-lg bg-white/5 animate-pulse" />
              </div>
            </div>
          </div>
          
          {/* Card Content */}
          <div className="relative p-5 space-y-4">
            {/* Value Section skeleton */}
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <div className="h-3 w-16 bg-white/5 rounded animate-pulse" />
                <div className="h-7 w-32 bg-white/5 rounded animate-pulse" />
                <div className="h-3 w-20 bg-white/5 rounded animate-pulse" />
              </div>
              
              {/* APY Badge skeleton */}
              <div className="w-20 h-8 rounded-lg bg-green-500/10 animate-pulse" />
            </div>
            
            {/* Rewards Section skeleton */}
            <div className="p-3 rounded-lg bg-gradient-to-r from-blue-500/5 to-cyan-500/5 animate-pulse">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-blue-500/10 animate-pulse" />
                  <div className="h-3 w-20 bg-white/5 rounded animate-pulse" />
                </div>
                <div className="space-y-1">
                  <div className="h-4 w-24 bg-white/5 rounded animate-pulse" />
                  <div className="h-3 w-16 bg-white/5 rounded animate-pulse" />
                </div>
              </div>
            </div>
            
            {/* Stats Grid skeleton */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-2.5 rounded-lg bg-white/5 animate-pulse">
                <div className="h-3 w-16 bg-white/10 rounded mb-1" />
                <div className="h-4 w-20 bg-white/10 rounded" />
              </div>
              <div className="p-2.5 rounded-lg bg-white/5 animate-pulse">
                <div className="h-3 w-12 bg-white/10 rounded mb-1" />
                <div className="h-4 w-16 bg-white/10 rounded" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// Grid skeleton for multiple cards
export function PositionCardsGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: count }).map((_, index) => (
        <PositionCardSkeleton key={index} index={index} />
      ))}
    </div>
  );
}