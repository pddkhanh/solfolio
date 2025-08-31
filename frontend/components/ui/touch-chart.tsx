'use client';

import { useRef, useState, useCallback, ReactNode } from 'react';
import { motion, useMotionValue, useTransform, AnimatePresence } from 'framer-motion';
import { useTouchGestures, triggerHapticFeedback } from '@/hooks/use-touch-gestures';
import { cn } from '@/lib/utils';
import { ZoomIn, ZoomOut, Maximize2, X } from 'lucide-react';

interface TouchChartProps {
  children: ReactNode;
  className?: string;
  enablePinchZoom?: boolean;
  enableDoubleTapZoom?: boolean;
  minZoom?: number;
  maxZoom?: number;
  showZoomControls?: boolean;
  onZoomChange?: (zoom: number) => void;
}

export function TouchChart({
  children,
  className,
  enablePinchZoom = true,
  enableDoubleTapZoom = true,
  minZoom = 1,
  maxZoom = 3,
  showZoomControls = true,
  onZoomChange
}: TouchChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [panX, setPanX] = useState(0);
  const [panY, setPanY] = useState(0);
  
  const scale = useMotionValue(1);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Track last tap for double-tap detection
  const lastTapRef = useRef<number>(0);

  const handleZoomIn = useCallback(() => {
    const newZoom = Math.min(zoom * 1.2, maxZoom);
    setZoom(newZoom);
    scale.set(newZoom);
    triggerHapticFeedback('light');
    onZoomChange?.(newZoom);
  }, [zoom, maxZoom, scale, onZoomChange]);

  const handleZoomOut = useCallback(() => {
    const newZoom = Math.max(zoom * 0.8, minZoom);
    setZoom(newZoom);
    scale.set(newZoom);
    if (newZoom === minZoom) {
      x.set(0);
      y.set(0);
      setPanX(0);
      setPanY(0);
    }
    triggerHapticFeedback('light');
    onZoomChange?.(newZoom);
  }, [zoom, minZoom, scale, x, y, onZoomChange]);

  const handleReset = useCallback(() => {
    setZoom(1);
    scale.set(1);
    x.set(0);
    y.set(0);
    setPanX(0);
    setPanY(0);
    triggerHapticFeedback('light');
    onZoomChange?.(1);
  }, [scale, x, y, onZoomChange]);

  const toggleFullscreen = useCallback(() => {
    setIsFullscreen(!isFullscreen);
    triggerHapticFeedback('medium');
  }, [isFullscreen]);

  // Handle double-tap zoom
  const handleDoubleTap = useCallback((event: React.TouchEvent) => {
    if (!enableDoubleTapZoom) return;

    const now = Date.now();
    const timeSinceLastTap = now - lastTapRef.current;

    if (timeSinceLastTap < 300) {
      // Double tap detected
      if (zoom > 1) {
        handleReset();
      } else {
        const newZoom = 2;
        setZoom(newZoom);
        scale.set(newZoom);
        
        // Calculate pan to zoom into tap position
        const rect = containerRef.current?.getBoundingClientRect();
        if (rect) {
          const tapX = event.touches[0].clientX - rect.left;
          const tapY = event.touches[0].clientY - rect.top;
          const centerX = rect.width / 2;
          const centerY = rect.height / 2;
          
          x.set((centerX - tapX) * (newZoom - 1));
          y.set((centerY - tapY) * (newZoom - 1));
        }
        
        triggerHapticFeedback('medium');
        onZoomChange?.(newZoom);
      }
    }
    
    lastTapRef.current = now;
  }, [enableDoubleTapZoom, zoom, scale, x, y, handleReset, onZoomChange]);

  // Use touch gestures hook for pinch zoom
  useTouchGestures(containerRef, {
    pinch: enablePinchZoom ? {
      onPinchStart: (currentScale) => {
        triggerHapticFeedback('light');
      },
      onPinch: (pinchScale) => {
        const newZoom = Math.max(minZoom, Math.min(zoom * pinchScale, maxZoom));
        scale.set(newZoom);
      },
      onPinchEnd: (finalScale) => {
        const newZoom = Math.max(minZoom, Math.min(zoom * finalScale, maxZoom));
        setZoom(newZoom);
        scale.set(newZoom);
        triggerHapticFeedback('light');
        onZoomChange?.(newZoom);
        
        // Reset pan if zoomed out completely
        if (newZoom === minZoom) {
          x.set(0);
          y.set(0);
          setPanX(0);
          setPanY(0);
        }
      }
    } : undefined,
    hapticFeedback: true
  });

  const chartContent = (
    <div 
      ref={containerRef}
      className={cn(
        'relative overflow-hidden touch-none',
        className
      )}
      onTouchStart={handleDoubleTap}
    >
      {/* Zoom controls */}
      {showZoomControls && zoom !== 1 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="absolute top-2 right-2 flex gap-1 z-10"
        >
          <button
            onClick={handleZoomOut}
            className="p-2 bg-bg-secondary/90 backdrop-blur rounded-lg shadow-lg min-h-[44px] min-w-[44px]"
            aria-label="Zoom out"
          >
            <ZoomOut className="w-5 h-5" />
          </button>
          <button
            onClick={handleZoomIn}
            className="p-2 bg-bg-secondary/90 backdrop-blur rounded-lg shadow-lg min-h-[44px] min-w-[44px]"
            aria-label="Zoom in"
          >
            <ZoomIn className="w-5 h-5" />
          </button>
          <button
            onClick={handleReset}
            className="p-2 bg-bg-secondary/90 backdrop-blur rounded-lg shadow-lg min-h-[44px] min-w-[44px]"
            aria-label="Reset zoom"
          >
            <Maximize2 className="w-5 h-5" />
          </button>
        </motion.div>
      )}

      {/* Zoom indicator */}
      <AnimatePresence>
        {zoom !== 1 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute bottom-2 left-2 px-2 py-1 bg-bg-secondary/90 backdrop-blur rounded text-xs font-medium z-10"
          >
            {Math.round(zoom * 100)}%
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chart content with zoom and pan */}
      <motion.div
        drag={zoom > 1}
        dragElastic={0.1}
        dragMomentum={false}
        onDragEnd={() => {
          setPanX(x.get());
          setPanY(y.get());
        }}
        style={{
          scale,
          x,
          y,
        }}
        className="origin-center"
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      >
        {children}
      </motion.div>

      {/* Fullscreen button */}
      {!isFullscreen && (
        <button
          onClick={toggleFullscreen}
          className="absolute top-2 left-2 p-2 bg-bg-secondary/90 backdrop-blur rounded-lg shadow-lg min-h-[44px] min-w-[44px] z-10"
          aria-label="Enter fullscreen"
        >
          <Maximize2 className="w-5 h-5" />
        </button>
      )}
    </div>
  );

  return (
    <>
      {chartContent}
      
      {/* Fullscreen modal */}
      <AnimatePresence>
        {isFullscreen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-bg-primary z-50 flex items-center justify-center p-4"
          >
            <button
              onClick={toggleFullscreen}
              className="absolute top-4 right-4 p-2 bg-bg-secondary/90 backdrop-blur rounded-lg shadow-lg min-h-[44px] min-w-[44px]"
              aria-label="Exit fullscreen"
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="w-full h-full max-w-6xl max-h-[80vh]">
              {chartContent}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// Touch-friendly chart tooltip
interface TouchTooltipProps {
  children: ReactNode;
  content: ReactNode;
  className?: string;
}

export function TouchTooltip({ children, content, className }: TouchTooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  const handleTouch = useCallback(() => {
    setIsVisible(true);
    triggerHapticFeedback('light');
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = setTimeout(() => {
      setIsVisible(false);
    }, 3000);
  }, []);

  return (
    <div className="relative">
      <div onTouchStart={handleTouch}>
        {children}
      </div>
      
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className={cn(
              'absolute bottom-full left-1/2 -translate-x-1/2 mb-2',
              'px-3 py-2 bg-bg-secondary rounded-lg shadow-lg',
              'min-w-[120px] text-sm whitespace-nowrap z-20',
              className
            )}
          >
            {content}
            <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1">
              <div className="w-2 h-2 bg-bg-secondary rotate-45" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}