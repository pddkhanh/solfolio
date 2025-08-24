'use client';

import React, { useEffect, useState } from 'react';
import { X, TrendingUp, TrendingDown, AlertCircle, CheckCircle } from 'lucide-react';
import { useWebSocketContext } from '@/contexts/WebSocketProvider';

export interface PositionChangeNotification {
  id: string;
  type: 'position_change' | 'monitoring_started' | 'monitoring_stopped' | 'account_change' | 'position_change_detected';
  title: string;
  message: string;
  timestamp: Date;
  variant: 'success' | 'warning' | 'info' | 'error';
  data?: any;
}

interface NotificationItemProps {
  notification: PositionChangeNotification;
  onDismiss: (id: string) => void;
}

const NotificationItem: React.FC<NotificationItemProps> = ({ notification, onDismiss }) => {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      handleDismiss();
    }, 5000); // Auto-dismiss after 5 seconds

    return () => clearTimeout(timer);
  }, []);

  const handleDismiss = () => {
    setIsExiting(true);
    setTimeout(() => {
      onDismiss(notification.id);
    }, 300); // Wait for animation to complete
  };

  const getIcon = () => {
    switch (notification.variant) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'warning':
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      default:
        if (notification.type === 'position_change_detected') {
          const change = notification.data?.changeType;
          if (change === 'deposit' || change === 'added') {
            return <TrendingUp className="h-5 w-5 text-green-500" />;
          } else if (change === 'withdraw' || change === 'removed') {
            return <TrendingDown className="h-5 w-5 text-red-500" />;
          }
        }
        return <AlertCircle className="h-5 w-5 text-blue-500" />;
    }
  };

  const getBackgroundColor = () => {
    switch (notification.variant) {
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      default:
        return 'bg-blue-50 border-blue-200';
    }
  };

  return (
    <div
      className={`
        flex items-start gap-3 p-4 border rounded-lg shadow-md
        ${getBackgroundColor()}
        ${isExiting ? 'animate-slide-out' : 'animate-slide-in'}
        transition-all duration-300
      `}
    >
      {getIcon()}
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-semibold text-gray-900">{notification.title}</h4>
        <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
        <p className="text-xs text-gray-400 mt-1">
          {notification.timestamp.toLocaleTimeString()}
        </p>
      </div>
      <button
        onClick={handleDismiss}
        className="p-1 hover:bg-gray-100 rounded-full transition-colors"
        aria-label="Dismiss notification"
      >
        <X className="h-4 w-4 text-gray-500" />
      </button>
    </div>
  );
};

export const PositionChangeNotifications: React.FC = () => {
  const [notifications, setNotifications] = useState<PositionChangeNotification[]>([]);
  const { socket } = useWebSocketContext();

  useEffect(() => {
    if (!socket) return;

    // Listen for monitoring events
    const handleMonitoringStarted = (data: any) => {
      addNotification({
        type: 'monitoring_started',
        title: 'Monitoring Started',
        message: 'Now tracking position changes for your wallet',
        variant: 'success',
        data,
      });
    };

    const handleMonitoringStopped = (data: any) => {
      addNotification({
        type: 'monitoring_stopped',
        title: 'Monitoring Stopped',
        message: 'Position tracking has been stopped',
        variant: 'info',
        data,
      });
    };

    const handleAccountChange = (data: any) => {
      addNotification({
        type: 'account_change',
        title: 'Account Activity Detected',
        message: `Balance changed to ${(data.lamports / 1e9).toFixed(4)} SOL`,
        variant: 'info',
        data,
      });
    };

    const handlePositionChange = (data: any) => {
      const { protocol, changeType, currentValue, previousValue } = data;
      let message = `${protocol} position ${changeType}`;
      
      if (currentValue && previousValue) {
        const diff = currentValue - previousValue;
        const percent = ((diff / previousValue) * 100).toFixed(2);
        message += ` (${diff > 0 ? '+' : ''}${percent}%)`;
      }

      addNotification({
        type: 'position_change_detected',
        title: 'Position Change Detected',
        message,
        variant: changeType === 'deposit' || changeType === 'added' ? 'success' : 'warning',
        data,
      });
    };

    // Subscribe to wallet notifications
    socket.on('wallet:notification', (notification: any) => {
      switch (notification.type) {
        case 'monitoring_started':
          handleMonitoringStarted(notification.data);
          break;
        case 'monitoring_stopped':
          handleMonitoringStopped(notification.data);
          break;
        case 'account_change':
          handleAccountChange(notification.data);
          break;
        case 'position_change':
        case 'position_change_detected':
          handlePositionChange(notification.data);
          break;
      }
    });

    // Cleanup
    return () => {
      socket.off('wallet:notification');
    };
  }, [socket]);

  const addNotification = (notification: Omit<PositionChangeNotification, 'id' | 'timestamp'>) => {
    const newNotification: PositionChangeNotification = {
      ...notification,
      id: `${Date.now()}-${Math.random()}`,
      timestamp: new Date(),
    };

    setNotifications((prev) => [...prev, newNotification]);
  };

  const dismissNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  if (notifications.length === 0) {
    return null;
  }

  return (
    <div className="fixed top-20 right-4 z-50 space-y-2 max-w-md w-full pointer-events-none">
      <div className="pointer-events-auto">
        {notifications.map((notification) => (
          <NotificationItem
            key={notification.id}
            notification={notification}
            onDismiss={dismissNotification}
          />
        ))}
      </div>
    </div>
  );
};

export default PositionChangeNotifications;