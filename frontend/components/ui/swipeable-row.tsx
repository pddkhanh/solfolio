'use client';

import { ReactNode, useState, useCallback, useRef, useEffect } from 'react';
import { motion, useMotionValue, useTransform, PanInfo, useAnimation } from 'framer-motion';
import { cn } from '@/lib/utils';
import { triggerHapticFeedback } from '@/hooks/use-touch-gestures';

interface SwipeAction {
  icon: ReactNode;
  label: string;
  color: string;
  onAction: () => void;
}

interface SwipeableRowProps {
  children: ReactNode;
  leftAction?: SwipeAction;
  rightAction?: SwipeAction;
  threshold?: number;
  className?: string;
  hapticFeedback?: boolean;
  autoClose?: boolean;
  autoCloseDelay?: number;
}

export function SwipeableRow({
  children,
  leftAction,
  rightAction,
  threshold = 100,
  className,
  hapticFeedback = true,
  autoClose = true,
  autoCloseDelay = 2000,
}: SwipeableRowProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isActive, setIsActive] = useState<'left' | 'right' | null>(null);
  const x = useMotionValue(0);
  const controls = useAnimation();
  const autoCloseTimer = useRef<NodeJS.Timeout | undefined>(undefined);
  
  // Transform values for action backgrounds with improved easing
  const leftActionOpacity = useTransform(x, [0, threshold], [0, 1]);
  const rightActionOpacity = useTransform(x, [-threshold, 0], [1, 0]);
  const leftActionScale = useTransform(x, [0, threshold * 1.2], [0.8, 1.1]);
  const rightActionScale = useTransform(x, [-threshold * 1.2, 0], [1.1, 0.8]);

  const handleDrag = useCallback((_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const offset = info.offset.x;
    
    // Visual feedback when threshold is reached
    if (offset > threshold && leftAction && isActive !== 'left') {
      setIsActive('left');
      if (hapticFeedback) triggerHapticFeedback('light');
    } else if (offset < -threshold && rightAction && isActive !== 'right') {
      setIsActive('right');
      if (hapticFeedback) triggerHapticFeedback('light');
    } else if (Math.abs(offset) < threshold) {
      setIsActive(null);
    }
  }, [threshold, leftAction, rightAction, isActive, hapticFeedback]);

  const handleDragEnd = useCallback((_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    setIsDragging(false);
    
    const offset = info.offset.x;
    const velocity = info.velocity.x;
    
    // Enhanced swipe detection with velocity
    const shouldTrigger = Math.abs(offset) > threshold || Math.abs(velocity) > 500;
    
    if (shouldTrigger && offset > 0 && leftAction) {
      // Trigger left action with animation
      if (hapticFeedback) triggerHapticFeedback('medium');
      controls.start({ x: threshold * 1.5 }).then(() => {
        leftAction.onAction();
        if (autoClose) {
          autoCloseTimer.current = setTimeout(() => {
            controls.start({ x: 0 });
          }, autoCloseDelay);
        }
      });
    } else if (shouldTrigger && offset < 0 && rightAction) {
      // Trigger right action with animation
      if (hapticFeedback) triggerHapticFeedback('medium');
      controls.start({ x: -threshold * 1.5 }).then(() => {
        rightAction.onAction();
        if (autoClose) {
          autoCloseTimer.current = setTimeout(() => {
            controls.start({ x: 0 });
          }, autoCloseDelay);
        }
      });
    } else {
      // Smooth snap back with spring animation
      controls.start({ 
        x: 0,
        transition: { type: 'spring', stiffness: 300, damping: 30 }
      });
    }
    
    setIsActive(null);
  }, [threshold, leftAction, rightAction, controls, hapticFeedback, autoClose, autoCloseDelay]);

  const handleDragStart = useCallback(() => {
    setIsDragging(true);
    if (autoCloseTimer.current) {
      clearTimeout(autoCloseTimer.current);
    }
  }, []);

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (autoCloseTimer.current) {
        clearTimeout(autoCloseTimer.current);
      }
    };
  }, []);

  // Enable for all devices but optimize for touch
  const isTouchDevice = typeof window !== 'undefined' && 
    ('ontouchstart' in window || navigator.maxTouchPoints > 0);

  if (!leftAction && !rightAction) {
    return <div className={className}>{children}</div>;
  }

  return (
    <div className={cn('relative overflow-hidden touch-pan-y', className)}>
      {/* Left Action Background */}
      {leftAction && (
        <motion.div
          className="absolute left-0 top-0 h-full flex items-center px-4 min-w-[88px]"
          style={{
            backgroundColor: leftAction.color,
            opacity: leftActionOpacity,
            scale: leftActionScale,
          }}
        >
          <button
            onClick={() => {
              if (hapticFeedback) triggerHapticFeedback('light');
              leftAction.onAction();
              controls.start({ x: 0 });
            }}
            className="flex flex-col items-center gap-1 min-h-[44px] min-w-[44px] p-2"
          >
            {leftAction.icon}
            <span className="text-xs font-medium text-white">
              {leftAction.label}
            </span>
          </button>
        </motion.div>
      )}

      {/* Right Action Background */}
      {rightAction && (
        <motion.div
          className="absolute right-0 top-0 h-full flex items-center px-4 min-w-[88px]"
          style={{
            backgroundColor: rightAction.color,
            opacity: rightActionOpacity,
            scale: rightActionScale,
          }}
        >
          <button
            onClick={() => {
              if (hapticFeedback) triggerHapticFeedback('light');
              rightAction.onAction();
              controls.start({ x: 0 });
            }}
            className="flex flex-col items-center gap-1 min-h-[44px] min-w-[44px] p-2"
          >
            {rightAction.icon}
            <span className="text-xs font-medium text-white">
              {rightAction.label}
            </span>
          </button>
        </motion.div>
      )}

      {/* Draggable Content */}
      <motion.div
        drag="x"
        dragElastic={0.3}
        dragConstraints={{ left: rightAction ? -threshold * 1.5 : 0, right: leftAction ? threshold * 1.5 : 0 }}
        onDragStart={handleDragStart}
        onDrag={handleDrag}
        onDragEnd={handleDragEnd}
        animate={controls}
        style={{ x }}
        className={cn(
          'relative bg-background',
          isDragging && 'cursor-grabbing select-none',
          isActive && 'scale-[0.98] transition-transform'
        )}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      >
        {children}
      </motion.div>
    </div>
  );
}