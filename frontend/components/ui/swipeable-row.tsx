'use client';

import { ReactNode, useState } from 'react';
import { motion, useMotionValue, useTransform, PanInfo } from 'framer-motion';
import { cn } from '@/lib/utils';

interface SwipeableRowProps {
  children: ReactNode;
  leftAction?: {
    icon: ReactNode;
    label: string;
    color: string;
    onAction: () => void;
  };
  rightAction?: {
    icon: ReactNode;
    label: string;
    color: string;
    onAction: () => void;
  };
  threshold?: number;
  className?: string;
}

export function SwipeableRow({
  children,
  leftAction,
  rightAction,
  threshold = 100,
  className,
}: SwipeableRowProps) {
  const [isDragging, setIsDragging] = useState(false);
  const x = useMotionValue(0);
  
  // Transform values for action backgrounds
  const leftActionOpacity = useTransform(x, [0, threshold], [0, 1]);
  const rightActionOpacity = useTransform(x, [-threshold, 0], [1, 0]);
  const leftActionScale = useTransform(x, [0, threshold], [0.8, 1]);
  const rightActionScale = useTransform(x, [-threshold, 0], [1, 0.8]);

  const handleDragEnd = (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    setIsDragging(false);
    
    if (info.offset.x > threshold && leftAction) {
      // Trigger left action
      leftAction.onAction();
      // Animate back to center
      x.set(0);
    } else if (info.offset.x < -threshold && rightAction) {
      // Trigger right action
      rightAction.onAction();
      // Animate back to center
      x.set(0);
    } else {
      // Snap back to center
      x.set(0);
    }
  };

  const handleDragStart = () => {
    setIsDragging(true);
  };

  // Only enable on touch devices
  const isTouchDevice = typeof window !== 'undefined' && 'ontouchstart' in window;

  if (!isTouchDevice || (!leftAction && !rightAction)) {
    return <div className={className}>{children}</div>;
  }

  return (
    <div className={cn('relative overflow-hidden', className)}>
      {/* Left Action Background */}
      {leftAction && (
        <motion.div
          className="absolute left-0 top-0 h-full flex items-center px-4"
          style={{
            backgroundColor: leftAction.color,
            opacity: leftActionOpacity,
            scale: leftActionScale,
          }}
        >
          <div className="flex flex-col items-center gap-1">
            {leftAction.icon}
            <span className="text-xs font-medium text-white">
              {leftAction.label}
            </span>
          </div>
        </motion.div>
      )}

      {/* Right Action Background */}
      {rightAction && (
        <motion.div
          className="absolute right-0 top-0 h-full flex items-center px-4"
          style={{
            backgroundColor: rightAction.color,
            opacity: rightActionOpacity,
            scale: rightActionScale,
          }}
        >
          <div className="flex flex-col items-center gap-1">
            {rightAction.icon}
            <span className="text-xs font-medium text-white">
              {rightAction.label}
            </span>
          </div>
        </motion.div>
      )}

      {/* Draggable Content */}
      <motion.div
        drag="x"
        dragElastic={0.2}
        dragConstraints={{ left: rightAction ? -threshold * 1.5 : 0, right: leftAction ? threshold * 1.5 : 0 }}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        style={{ x }}
        className={cn(
          'relative bg-background',
          isDragging && 'cursor-grabbing'
        )}
      >
        {children}
      </motion.div>
    </div>
  );
}