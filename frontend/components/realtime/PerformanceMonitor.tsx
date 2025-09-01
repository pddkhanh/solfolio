'use client';

import { useAnimationPerformance } from '@/hooks/useAnimationPerformance';

/**
 * Performance monitor component for development
 */
export function PerformanceMonitor({ show = false }: { show?: boolean }) {
  const metrics = useAnimationPerformance(show);

  if (!show) return null;

  return (
    <div className="fixed bottom-4 left-4 z-50 bg-black/80 text-white p-3 rounded-lg font-mono text-xs">
      <div className={metrics.isSmooth ? 'text-green-400' : 'text-red-400'}>
        FPS: {metrics.fps}
      </div>
      <div>Frame Time: {metrics.frameTime}ms</div>
      <div>Dropped: {metrics.droppedFrames}</div>
      <div className={`mt-1 h-1 w-20 bg-gray-700 rounded overflow-hidden`}>
        <div
          className={`h-full transition-all ${
            metrics.isSmooth ? 'bg-green-500' : 'bg-red-500'
          }`}
          style={{ width: `${(metrics.fps / 60) * 100}%` }}
        />
      </div>
    </div>
  );
}