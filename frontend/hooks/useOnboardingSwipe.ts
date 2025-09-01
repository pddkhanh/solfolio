'use client';

import { useEffect, useRef } from 'react';

interface SwipeHandlers {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
}

export function useOnboardingSwipe(handlers: SwipeHandlers) {
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);
  const touchEndY = useRef<number | null>(null);

  const minSwipeDistance = 50; // Minimum distance for a swipe

  useEffect(() => {
    const handleTouchStart = (e: TouchEvent) => {
      touchStartX.current = e.touches[0].clientX;
      touchStartY.current = e.touches[0].clientY;
    };

    const handleTouchMove = (e: TouchEvent) => {
      touchEndX.current = e.touches[0].clientX;
      touchEndY.current = e.touches[0].clientY;
    };

    const handleTouchEnd = () => {
      if (!touchStartX.current || !touchStartY.current || !touchEndX.current || !touchEndY.current) {
        return;
      }

      const distanceX = touchStartX.current - touchEndX.current;
      const distanceY = touchStartY.current - touchEndY.current;
      const isHorizontalSwipe = Math.abs(distanceX) > Math.abs(distanceY);

      if (isHorizontalSwipe && Math.abs(distanceX) > minSwipeDistance) {
        if (distanceX > 0 && handlers.onSwipeLeft) {
          handlers.onSwipeLeft();
        } else if (distanceX < 0 && handlers.onSwipeRight) {
          handlers.onSwipeRight();
        }
      } else if (!isHorizontalSwipe && Math.abs(distanceY) > minSwipeDistance) {
        if (distanceY > 0 && handlers.onSwipeUp) {
          handlers.onSwipeUp();
        } else if (distanceY < 0 && handlers.onSwipeDown) {
          handlers.onSwipeDown();
        }
      }

      // Reset values
      touchStartX.current = null;
      touchStartY.current = null;
      touchEndX.current = null;
      touchEndY.current = null;
    };

    // Add event listeners
    document.addEventListener('touchstart', handleTouchStart);
    document.addEventListener('touchmove', handleTouchMove);
    document.addEventListener('touchend', handleTouchEnd);

    // Cleanup
    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [handlers]);
}