'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw, Activity, Bell, Zap } from 'lucide-react';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface UpdateIndicatorProps {
  isUpdating: boolean;
  lastUpdateTime?: Date;
  type?: 'pulse' | 'glow' | 'spin' | 'badge';
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  color?: 'green' | 'blue' | 'purple' | 'orange';
  size?: 'sm' | 'md' | 'lg';
  showTime?: boolean;
  className?: string;
}

const colorClasses = {
  green: {
    bg: 'bg-green-500',
    glow: 'shadow-green-500/50',
    text: 'text-green-500',
  },
  blue: {
    bg: 'bg-blue-500',
    glow: 'shadow-blue-500/50',
    text: 'text-blue-500',
  },
  purple: {
    bg: 'bg-purple-500',
    glow: 'shadow-purple-500/50',
    text: 'text-purple-500',
  },
  orange: {
    bg: 'bg-orange-500',
    glow: 'shadow-orange-500/50',
    text: 'text-orange-500',
  },
};

const sizeClasses = {
  sm: 'w-2 h-2',
  md: 'w-3 h-3',
  lg: 'w-4 h-4',
};

const positionClasses = {
  'top-right': 'top-0 right-0',
  'top-left': 'top-0 left-0',
  'bottom-right': 'bottom-0 right-0',
  'bottom-left': 'bottom-0 left-0',
};

export function UpdateIndicator({
  isUpdating,
  lastUpdateTime,
  type = 'pulse',
  position = 'top-right',
  color = 'green',
  size = 'md',
  showTime = false,
  className,
}: UpdateIndicatorProps) {
  const [timeAgo, setTimeAgo] = useState('');

  useEffect(() => {
    if (!lastUpdateTime || !showTime) return;

    const updateTimeAgo = () => {
      const now = new Date();
      const diff = now.getTime() - lastUpdateTime.getTime();
      const seconds = Math.floor(diff / 1000);
      const minutes = Math.floor(seconds / 60);
      const hours = Math.floor(minutes / 60);

      if (hours > 0) {
        setTimeAgo(`${hours}h ago`);
      } else if (minutes > 0) {
        setTimeAgo(`${minutes}m ago`);
      } else if (seconds > 5) {
        setTimeAgo(`${seconds}s ago`);
      } else {
        setTimeAgo('Just now');
      }
    };

    updateTimeAgo();
    const interval = setInterval(updateTimeAgo, 1000);
    return () => clearInterval(interval);
  }, [lastUpdateTime, showTime]);

  const renderIndicator = () => {
    switch (type) {
      case 'pulse':
        return (
          <div className="relative">
            <motion.div
              className={cn('rounded-full', sizeClasses[size], colorClasses[color].bg)}
              animate={
                isUpdating
                  ? {
                      scale: [1, 1.2, 1],
                      opacity: [1, 0.8, 1],
                    }
                  : {}
              }
              transition={{
                duration: 1,
                repeat: isUpdating ? Infinity : 0,
                ease: 'easeInOut',
              }}
            />
            <AnimatePresence>
              {isUpdating && (
                <motion.div
                  className={cn('absolute inset-0 rounded-full', colorClasses[color].bg)}
                  initial={{ scale: 1, opacity: 0.5 }}
                  animate={{
                    scale: [1, 2, 2],
                    opacity: [0.5, 0, 0],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: 'easeOut',
                  }}
                />
              )}
            </AnimatePresence>
          </div>
        );

      case 'glow':
        return (
          <motion.div
            className={cn(
              'rounded-full',
              sizeClasses[size],
              colorClasses[color].bg,
              'shadow-lg'
            )}
            animate={
              isUpdating
                ? {
                    boxShadow: [
                      '0 0 0 0 rgba(0,0,0,0)',
                      `0 0 20px 10px ${colorClasses[color].glow}`,
                      '0 0 0 0 rgba(0,0,0,0)',
                    ],
                  }
                : {}
            }
            transition={{
              duration: 1.5,
              repeat: isUpdating ? Infinity : 0,
              ease: 'easeInOut',
            }}
          />
        );

      case 'spin':
        return (
          <motion.div
            animate={isUpdating ? { rotate: 360 } : {}}
            transition={{
              duration: 1,
              repeat: isUpdating ? Infinity : 0,
              ease: 'linear',
            }}
          >
            <RefreshCw className={cn(sizeClasses[size], colorClasses[color].text)} />
          </motion.div>
        );

      case 'badge':
        return (
          <AnimatePresence>
            {isUpdating && (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                className={cn(
                  'flex items-center justify-center rounded-full text-white text-xs font-bold',
                  sizeClasses[size],
                  colorClasses[color].bg
                )}
              >
                <Activity className="w-2 h-2" />
              </motion.div>
            )}
          </AnimatePresence>
        );

      default:
        return null;
    }
  };

  return (
    <div className={cn('absolute', positionClasses[position], className)}>
      {renderIndicator()}
      {showTime && timeAgo && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute top-full mt-1 text-xs text-gray-500 whitespace-nowrap"
        >
          {timeAgo}
        </motion.div>
      )}
    </div>
  );
}

// Live data indicator for cards/sections
export function LiveDataBadge({ isLive = true }: { isLive?: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className="inline-flex items-center gap-1.5 px-2 py-1 bg-green-500/10 rounded-full"
    >
      <motion.div
        className="w-2 h-2 bg-green-500 rounded-full"
        animate={
          isLive
            ? {
                scale: [1, 1.2, 1],
                opacity: [1, 0.7, 1],
              }
            : {}
        }
        transition={{
          duration: 2,
          repeat: isLive ? Infinity : 0,
          ease: 'easeInOut',
        }}
      />
      <span className="text-xs font-medium text-green-500">
        {isLive ? 'Live' : 'Offline'}
      </span>
    </motion.div>
  );
}

// Activity indicator for real-time streams
export function ActivityStream({ activities }: { activities: Array<{ id: string; text: string; timestamp: Date }> }) {
  return (
    <div className="space-y-2">
      <AnimatePresence mode="popLayout">
        {activities.slice(0, 5).map((activity, index) => (
          <motion.div
            key={activity.id}
            layout
            initial={{ opacity: 0, x: -20, y: -10 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            exit={{ opacity: 0, x: 20, scale: 0.8 }}
            transition={{ delay: index * 0.05 }}
            className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-800 rounded-lg"
          >
            <Zap className="w-3 h-3 text-yellow-500" />
            <span className="text-sm text-gray-700 dark:text-gray-300 flex-1">
              {activity.text}
            </span>
            <span className="text-xs text-gray-500">
              {new Date(activity.timestamp).toLocaleTimeString()}
            </span>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}