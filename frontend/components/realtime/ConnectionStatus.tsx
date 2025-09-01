'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Wifi, WifiOff, RefreshCw, AlertCircle } from 'lucide-react';
import { ConnectionStatus as Status } from '@/hooks/useWebSocket';
import { cn } from '@/lib/utils';

interface ConnectionStatusProps {
  status: Status;
  reconnectAttempt?: number;
  maxReconnectAttempts?: number;
  onReconnect?: () => void;
  className?: string;
  showDetails?: boolean;
}

const statusConfig = {
  connecting: {
    icon: RefreshCw,
    text: 'Connecting',
    color: 'text-yellow-500',
    bgColor: 'bg-yellow-500/10',
    borderColor: 'border-yellow-500/20',
    pulse: true,
    spin: true,
  },
  connected: {
    icon: Wifi,
    text: 'Connected',
    color: 'text-green-500',
    bgColor: 'bg-green-500/10',
    borderColor: 'border-green-500/20',
    pulse: false,
    spin: false,
  },
  disconnected: {
    icon: WifiOff,
    text: 'Disconnected',
    color: 'text-gray-500',
    bgColor: 'bg-gray-500/10',
    borderColor: 'border-gray-500/20',
    pulse: false,
    spin: false,
  },
  reconnecting: {
    icon: RefreshCw,
    text: 'Reconnecting',
    color: 'text-orange-500',
    bgColor: 'bg-orange-500/10',
    borderColor: 'border-orange-500/20',
    pulse: true,
    spin: true,
  },
  error: {
    icon: AlertCircle,
    text: 'Connection Error',
    color: 'text-red-500',
    bgColor: 'bg-red-500/10',
    borderColor: 'border-red-500/20',
    pulse: true,
    spin: false,
  },
};

export function ConnectionStatus({
  status,
  reconnectAttempt = 0,
  maxReconnectAttempts = 5,
  onReconnect,
  className,
  showDetails = false,
}: ConnectionStatusProps) {
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2 }}
      className={cn(
        'flex items-center gap-2 px-3 py-1.5 rounded-full border backdrop-blur-sm',
        config.bgColor,
        config.borderColor,
        className
      )}
    >
      <div className="relative">
        <motion.div
          animate={config.spin ? { rotate: 360 } : {}}
          transition={
            config.spin
              ? {
                  duration: 1,
                  repeat: Infinity,
                  ease: 'linear',
                }
              : {}
          }
        >
          <Icon className={cn('w-4 h-4', config.color)} />
        </motion.div>
        
        {/* Pulse animation */}
        <AnimatePresence>
          {config.pulse && (
            <motion.div
              className={cn('absolute inset-0 rounded-full', config.bgColor)}
              initial={{ scale: 1, opacity: 0.5 }}
              animate={{
                scale: [1, 1.5, 1.5],
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

      <AnimatePresence mode="wait">
        <motion.div
          key={status}
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -5 }}
          transition={{ duration: 0.15 }}
          className="flex items-center gap-2"
        >
          <span className={cn('text-xs font-medium', config.color)}>
            {config.text}
          </span>

          {/* Reconnect attempts indicator */}
          {status === 'reconnecting' && reconnectAttempt > 0 && (
            <motion.span
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-xs text-orange-500/70"
            >
              ({reconnectAttempt}/{maxReconnectAttempts})
            </motion.span>
          )}

          {/* Show details for certain statuses */}
          {showDetails && status === 'error' && onReconnect && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onReconnect}
              className="text-xs text-red-500 hover:text-red-400 underline"
            >
              Retry
            </motion.button>
          )}
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
}

// Mini connection indicator for header/navbar
export function ConnectionIndicator({ status }: { status: Status }) {
  const config = statusConfig[status];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="relative"
    >
      <motion.div
        className={cn('w-2 h-2 rounded-full', {
          'bg-green-500': status === 'connected',
          'bg-yellow-500': status === 'connecting',
          'bg-orange-500': status === 'reconnecting',
          'bg-red-500': status === 'error',
          'bg-gray-500': status === 'disconnected',
        })}
        animate={
          config.pulse
            ? {
                scale: [1, 1.2, 1],
                opacity: [1, 0.7, 1],
              }
            : {}
        }
        transition={
          config.pulse
            ? {
                duration: 1.5,
                repeat: Infinity,
                ease: 'easeInOut',
              }
            : {}
        }
      />
      
      {/* Outer ring animation for active states */}
      <AnimatePresence>
        {(status === 'connecting' || status === 'reconnecting') && (
          <motion.div
            className={cn('absolute inset-0 rounded-full border', {
              'border-yellow-500': status === 'connecting',
              'border-orange-500': status === 'reconnecting',
            })}
            initial={{ scale: 1, opacity: 0.5 }}
            animate={{
              scale: [1, 1.8, 1.8],
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
    </motion.div>
  );
}