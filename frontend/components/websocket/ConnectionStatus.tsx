'use client';

import React from 'react';
import { Wifi, WifiOff, RefreshCw, AlertCircle } from 'lucide-react';
import { ConnectionStatus as Status } from '../../hooks/useWebSocket';
import { Button } from '../ui/button';
import { cn } from '../../lib/utils';

interface ConnectionStatusProps {
  status: Status;
  error?: string | null;
  onReconnect?: () => void;
  className?: string;
  showText?: boolean;
}

const statusConfig = {
  connected: {
    icon: Wifi,
    text: 'Connected',
    color: 'text-green-500',
    bgColor: 'bg-green-500/10',
    borderColor: 'border-green-500/20',
  },
  connecting: {
    icon: RefreshCw,
    text: 'Connecting...',
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/20',
    animate: 'animate-spin',
  },
  reconnecting: {
    icon: RefreshCw,
    text: 'Reconnecting...',
    color: 'text-yellow-500',
    bgColor: 'bg-yellow-500/10',
    borderColor: 'border-yellow-500/20',
    animate: 'animate-spin',
  },
  disconnected: {
    icon: WifiOff,
    text: 'Disconnected',
    color: 'text-gray-500',
    bgColor: 'bg-gray-500/10',
    borderColor: 'border-gray-500/20',
  },
  error: {
    icon: AlertCircle,
    text: 'Connection Error',
    color: 'text-red-500',
    bgColor: 'bg-red-500/10',
    borderColor: 'border-red-500/20',
  },
};

export const ConnectionStatus: React.FC<ConnectionStatusProps> = ({
  status,
  error,
  onReconnect,
  className,
  showText = true,
}) => {
  const config = statusConfig[status];
  const IconComponent = config.icon;

  const handleReconnect = () => {
    if (onReconnect && (status === 'disconnected' || status === 'error')) {
      onReconnect();
    }
  };

  return (
    <div
      className={cn(
        'flex items-center gap-2 rounded-lg border px-3 py-2 transition-colors',
        config.bgColor,
        config.borderColor,
        className
      )}
    >
      <div className="relative">
        <IconComponent
          className={cn(
            'h-4 w-4',
            config.color,
            config.animate
          )}
        />
        {status === 'connected' && (
          <div className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-green-500 animate-pulse" />
        )}
      </div>

      {showText && (
        <div className="flex flex-col">
          <span className={cn('text-sm font-medium', config.color)}>
            {config.text}
          </span>
          {error && status === 'error' && (
            <span className="text-xs text-gray-500 truncate max-w-40">
              {error}
            </span>
          )}
        </div>
      )}

      {(status === 'disconnected' || status === 'error') && onReconnect && (
        <Button
          size="sm"
          variant="ghost"
          onClick={handleReconnect}
          className={cn('h-6 px-2 text-xs', config.color)}
        >
          Retry
        </Button>
      )}
    </div>
  );
};

export default ConnectionStatus;