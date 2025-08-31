'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { SkeletonPositionCard, SkeletonContainer } from '@/components/ui/skeleton';

interface PositionCardSkeletonProps {
  index?: number;
}

export function PositionCardSkeleton({ index = 0 }: PositionCardSkeletonProps) {
  return <SkeletonPositionCard className="" />;
}

// Grid skeleton for multiple cards
export function PositionCardsGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <SkeletonContainer
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
      staggerDelay={0.05}
    >
      {Array.from({ length: count }).map((_, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            delay: index * 0.05,
            duration: 0.3,
            ease: [0.4, 0, 0.2, 1],
          }}
        >
          <SkeletonPositionCard />
        </motion.div>
      ))}
    </SkeletonContainer>
  );
}