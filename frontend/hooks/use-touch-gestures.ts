'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useSpring, config } from '@react-spring/web';

export interface SwipeHandlers {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
}

export interface PinchHandlers {
  onPinchStart?: (scale: number) => void;
  onPinch?: (scale: number) => void;
  onPinchEnd?: (scale: number) => void;
}

export interface LongPressHandlers {
  onLongPress?: (event: TouchEvent | MouseEvent) => void;
  delay?: number;
}

export interface TouchGestureOptions {
  swipe?: SwipeHandlers;
  pinch?: PinchHandlers;
  longPress?: LongPressHandlers;
  threshold?: number;
  swipeVelocityThreshold?: number;
  preventScroll?: boolean;
  hapticFeedback?: boolean;
}

// Haptic feedback utility
export function triggerHapticFeedback(type: 'light' | 'medium' | 'heavy' = 'light') {
  if ('vibrate' in navigator) {
    const patterns = {
      light: 10,
      medium: 20,
      heavy: 30
    };
    navigator.vibrate(patterns[type]);
  }
}

export function useTouchGestures(
  ref: React.RefObject<HTMLElement | null>,
  options: TouchGestureOptions = {}
) {
  const {
    swipe,
    pinch,
    longPress,
    threshold = 50,
    swipeVelocityThreshold = 0.3,
    preventScroll = false,
    hapticFeedback = false
  } = options;

  const touchStartX = useRef(0);
  const touchStartY = useRef(0);
  const touchStartTime = useRef(0);
  const longPressTimer = useRef<NodeJS.Timeout | undefined>(undefined);
  const isPinching = useRef(false);
  const initialPinchDistance = useRef(0);
  const currentScale = useRef(1);

  // Calculate distance between two touch points
  const getDistance = (touches: TouchList) => {
    if (touches.length < 2) return 0;
    const dx = touches[0].clientX - touches[1].clientX;
    const dy = touches[0].clientY - touches[1].clientY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const handleTouchStart = useCallback((e: TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    touchStartTime.current = Date.now();

    // Handle pinch start
    if (e.touches.length === 2 && pinch) {
      isPinching.current = true;
      initialPinchDistance.current = getDistance(e.touches);
      if (pinch.onPinchStart) {
        pinch.onPinchStart(currentScale.current);
      }
      if (hapticFeedback) triggerHapticFeedback('light');
    }

    // Handle long press start
    if (longPress?.onLongPress) {
      longPressTimer.current = setTimeout(() => {
        if (hapticFeedback) triggerHapticFeedback('medium');
        longPress.onLongPress!(e);
      }, longPress.delay || 500);
    }

    if (preventScroll) {
      e.preventDefault();
    }
  }, [pinch, longPress, preventScroll, hapticFeedback]);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    // Cancel long press on move
    if (longPressTimer.current) {
      const dx = Math.abs(e.touches[0].clientX - touchStartX.current);
      const dy = Math.abs(e.touches[0].clientY - touchStartY.current);
      if (dx > 10 || dy > 10) {
        clearTimeout(longPressTimer.current);
      }
    }

    // Handle pinch
    if (isPinching.current && e.touches.length === 2 && pinch) {
      const currentDistance = getDistance(e.touches);
      const scale = currentDistance / initialPinchDistance.current;
      currentScale.current = scale;
      
      if (pinch.onPinch) {
        pinch.onPinch(scale);
      }
      
      if (preventScroll) {
        e.preventDefault();
      }
    }
  }, [pinch, preventScroll]);

  const handleTouchEnd = useCallback((e: TouchEvent) => {
    // Clear long press timer
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
    }

    // Handle pinch end
    if (isPinching.current && pinch?.onPinchEnd) {
      pinch.onPinchEnd(currentScale.current);
      isPinching.current = false;
      currentScale.current = 1;
      return;
    }

    // Handle swipe
    if (swipe && e.changedTouches.length > 0) {
      const touchEndX = e.changedTouches[0].clientX;
      const touchEndY = e.changedTouches[0].clientY;
      const touchEndTime = Date.now();
      
      const dx = touchEndX - touchStartX.current;
      const dy = touchEndY - touchStartY.current;
      const dt = touchEndTime - touchStartTime.current;
      
      const velocityX = Math.abs(dx / dt);
      const velocityY = Math.abs(dy / dt);
      
      const absX = Math.abs(dx);
      const absY = Math.abs(dy);

      // Check if swipe meets threshold and velocity requirements
      if (absX > threshold && absX > absY && velocityX > swipeVelocityThreshold) {
        if (hapticFeedback) triggerHapticFeedback('light');
        if (dx > 0 && swipe.onSwipeRight) {
          swipe.onSwipeRight();
        } else if (dx < 0 && swipe.onSwipeLeft) {
          swipe.onSwipeLeft();
        }
      } else if (absY > threshold && absY > absX && velocityY > swipeVelocityThreshold) {
        if (hapticFeedback) triggerHapticFeedback('light');
        if (dy > 0 && swipe.onSwipeDown) {
          swipe.onSwipeDown();
        } else if (dy < 0 && swipe.onSwipeUp) {
          swipe.onSwipeUp();
        }
      }
    }
  }, [swipe, pinch, threshold, swipeVelocityThreshold, hapticFeedback]);

  const handleTouchCancel = useCallback(() => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
    }
    isPinching.current = false;
    currentScale.current = 1;
  }, []);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    element.addEventListener('touchstart', handleTouchStart, { passive: !preventScroll });
    element.addEventListener('touchmove', handleTouchMove, { passive: !preventScroll });
    element.addEventListener('touchend', handleTouchEnd);
    element.addEventListener('touchcancel', handleTouchCancel);

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handleTouchEnd);
      element.removeEventListener('touchcancel', handleTouchCancel);
      if (longPressTimer.current) {
        clearTimeout(longPressTimer.current);
      }
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd, handleTouchCancel, preventScroll]);
}

// Pull to refresh hook
export function usePullToRefresh(
  onRefresh: () => Promise<void>,
  options: {
    threshold?: number;
    maxPull?: number;
    disabled?: boolean;
  } = {}
) {
  const { threshold = 80, maxPull = 150, disabled = false } = options;
  const [isPulling, setIsPulling] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const touchStartY = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const [springProps, springApi] = useSpring(() => ({
    y: 0,
    config: config.stiff
  }));

  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (disabled || isRefreshing) return;
    
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    if (scrollTop === 0) {
      touchStartY.current = e.touches[0].clientY;
      setIsPulling(true);
    }
  }, [disabled, isRefreshing]);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!isPulling || disabled || isRefreshing) return;
    
    const currentY = e.touches[0].clientY;
    const distance = Math.min(currentY - touchStartY.current, maxPull);
    
    if (distance > 0) {
      e.preventDefault();
      setPullDistance(distance);
      springApi.start({ y: distance, immediate: true });
      
      if (distance > threshold * 0.5) {
        triggerHapticFeedback('light');
      }
    }
  }, [isPulling, disabled, isRefreshing, maxPull, threshold, springApi]);

  const handleTouchEnd = useCallback(async () => {
    if (!isPulling || disabled) return;
    
    setIsPulling(false);
    
    if (pullDistance > threshold) {
      setIsRefreshing(true);
      triggerHapticFeedback('medium');
      
      springApi.start({ 
        y: 60,
        config: config.stiff
      });
      
      try {
        await onRefresh();
      } finally {
        setIsRefreshing(false);
        springApi.start({ 
          y: 0,
          config: config.stiff
        });
      }
    } else {
      springApi.start({ 
        y: 0,
        config: config.stiff
      });
    }
    
    setPullDistance(0);
  }, [isPulling, disabled, pullDistance, threshold, onRefresh, springApi]);

  useEffect(() => {
    if (disabled) return;
    
    document.addEventListener('touchstart', handleTouchStart, { passive: false });
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd);
    
    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd, disabled]);

  return {
    containerRef,
    isPulling,
    pullDistance,
    isRefreshing,
    springProps,
    pullProgress: Math.min(pullDistance / threshold, 1)
  };
}