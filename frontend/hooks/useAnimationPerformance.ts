import { useEffect, useRef, useState, useCallback } from 'react';

interface PerformanceMetrics {
  fps: number;
  frameTime: number;
  isSmooth: boolean; // true if >= 55 FPS
  droppedFrames: number;
}

/**
 * Hook to monitor animation performance and ensure 60 FPS
 * Provides metrics and warnings when performance degrades
 */
export function useAnimationPerformance(enabled = true): PerformanceMetrics {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    fps: 60,
    frameTime: 16.67,
    isSmooth: true,
    droppedFrames: 0,
  });

  const frameCount = useRef(0);
  const lastTime = useRef(performance.now());
  const fpsHistory = useRef<number[]>([]);
  const droppedFrames = useRef(0);
  const rafId = useRef<number>(0);

  const measureFPS = useCallback(() => {
    const currentTime = performance.now();
    const deltaTime = currentTime - lastTime.current;
    
    frameCount.current++;
    
    // Calculate FPS every second
    if (deltaTime >= 1000) {
      const fps = Math.round((frameCount.current * 1000) / deltaTime);
      const frameTime = deltaTime / frameCount.current;
      
      // Track FPS history (keep last 10 samples)
      fpsHistory.current.push(fps);
      if (fpsHistory.current.length > 10) {
        fpsHistory.current.shift();
      }
      
      // Calculate average FPS
      const avgFps = Math.round(
        fpsHistory.current.reduce((a, b) => a + b, 0) / fpsHistory.current.length
      );
      
      // Count dropped frames (when FPS < 55)
      if (fps < 55) {
        droppedFrames.current++;
      }
      
      // Update metrics
      setMetrics({
        fps: avgFps,
        frameTime: Number(frameTime.toFixed(2)),
        isSmooth: avgFps >= 55,
        droppedFrames: droppedFrames.current,
      });
      
      // Warn if performance is poor
      if (avgFps < 30) {
        console.warn('⚠️ Poor animation performance detected:', {
          fps: avgFps,
          frameTime: `${frameTime.toFixed(2)}ms`,
          recommendation: 'Consider reducing animation complexity or disabling animations for this device',
        });
      } else if (avgFps < 55) {
        console.warn('⚠️ Animation performance below optimal:', {
          fps: avgFps,
          frameTime: `${frameTime.toFixed(2)}ms`,
        });
      }
      
      // Reset counters
      frameCount.current = 0;
      lastTime.current = currentTime;
    }
    
    if (enabled) {
      rafId.current = requestAnimationFrame(measureFPS);
    }
  }, [enabled]);

  useEffect(() => {
    if (!enabled) return;
    
    // Start measuring
    rafId.current = requestAnimationFrame(measureFPS);
    
    return () => {
      if (rafId.current) {
        cancelAnimationFrame(rafId.current);
      }
    };
  }, [enabled, measureFPS]);

  return metrics;
}

/**
 * Hook to detect if user prefers reduced motion
 */
export function useReducedMotion(): boolean {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return prefersReducedMotion;
}

/**
 * Hook to optimize animations based on device capabilities
 */
export function useOptimizedAnimations() {
  const reducedMotion = useReducedMotion();
  const { fps, isSmooth } = useAnimationPerformance();
  const [animationQuality, setAnimationQuality] = useState<'high' | 'medium' | 'low'>('high');

  useEffect(() => {
    if (reducedMotion) {
      setAnimationQuality('low');
    } else if (!isSmooth || fps < 45) {
      setAnimationQuality('medium');
    } else {
      setAnimationQuality('high');
    }
  }, [reducedMotion, isSmooth, fps]);

  return {
    animationQuality,
    shouldAnimate: !reducedMotion && fps > 30,
    animationDuration: animationQuality === 'high' ? 0.3 : animationQuality === 'medium' ? 0.2 : 0,
    animationConfig: {
      high: {
        duration: 0.3,
        ease: [0.4, 0, 0.2, 1],
        staggerChildren: 0.05,
      },
      medium: {
        duration: 0.2,
        ease: 'easeOut',
        staggerChildren: 0.03,
      },
      low: {
        duration: 0,
        ease: 'linear',
        staggerChildren: 0,
      },
    }[animationQuality],
  };
}

