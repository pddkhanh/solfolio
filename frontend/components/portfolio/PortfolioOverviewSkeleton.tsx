'use client';

import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles } from 'lucide-react';
import { shimmerVariants, staggerContainer, staggerItem } from '@/lib/animations';

export function PortfolioOverviewSkeleton() {
  return (
    <Card 
      data-testid="portfolio-overview-card" 
      data-loading="true"
      className="relative overflow-hidden border-border-default bg-gradient-to-br from-bg-secondary to-bg-tertiary"
    >
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-green-500/5 pointer-events-none" />
      
      <CardHeader className="relative pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-500" />
            Portfolio Overview
          </CardTitle>
          <div className="w-20 h-6 bg-gray-800 rounded animate-pulse" />
        </div>
      </CardHeader>
      
      <CardContent className="relative space-y-6">
        <motion.div 
          className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
          variants={staggerContainer}
          initial="initial"
          animate="animate"
        >
          {/* Total Value Skeleton */}
          <motion.div 
            variants={staggerItem}
            className="sm:col-span-2 lg:col-span-1 p-4 rounded-lg bg-gradient-to-br from-purple-500/10 to-transparent border border-purple-500/20"
          >
            <SkeletonCard />
          </motion.div>

          {/* 24h Change Skeleton */}
          <motion.div 
            variants={staggerItem}
            className="p-4 rounded-lg bg-green-500/10 border border-green-500/20"
          >
            <SkeletonCard />
          </motion.div>

          {/* Total Tokens Skeleton */}
          <motion.div 
            variants={staggerItem}
            className="p-4 rounded-lg bg-gradient-to-br from-cyan-500/10 to-transparent border border-cyan-500/20"
          >
            <SkeletonCard />
          </motion.div>

          {/* Active Positions Skeleton */}
          <motion.div 
            variants={staggerItem}
            className="p-4 rounded-lg bg-gradient-to-br from-pink-500/10 to-transparent border border-pink-500/20"
          >
            <SkeletonCard />
          </motion.div>
        </motion.div>

        {/* Performance Metrics Skeleton */}
        <div className="border-t border-border-default pt-4">
          <div className="flex items-center justify-between">
            <div className="w-32 h-4 bg-gray-800 rounded animate-pulse" />
            <div className="flex gap-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="w-16 h-6 bg-gray-800 rounded animate-pulse" />
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function SkeletonCard() {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <div className="w-4 h-4 bg-gray-700 rounded animate-pulse" />
        <div className="w-20 h-4 bg-gray-700 rounded animate-pulse" />
      </div>
      <div className="space-y-2">
        <div className="w-32 h-8 bg-gray-800 rounded animate-pulse" />
        <div className="w-24 h-4 bg-gray-700 rounded animate-pulse" />
      </div>
    </div>
  );
}

// Shimmer skeleton variant with gradient animation
export function ShimmerSkeleton({ className = "" }: { className?: string }) {
  return (
    <motion.div
      className={`relative overflow-hidden bg-gray-800 rounded ${className}`}
      variants={shimmerVariants}
      initial="initial"
      animate="animate"
      style={{
        background: 'linear-gradient(90deg, #1a1a1a 0%, #2a2a2a 50%, #1a1a1a 100%)',
        backgroundSize: '200% 100%',
      }}
    />
  );
}