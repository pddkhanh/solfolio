/**
 * Error Logging Utility
 * Centralized error logging with support for multiple providers
 */

export interface ErrorContext {
  userId?: string;
  walletAddress?: string;
  action?: string;
  metadata?: Record<string, any>;
}

export interface ErrorLog {
  message: string;
  stack?: string;
  timestamp: string;
  level: 'error' | 'warning' | 'info';
  context?: ErrorContext;
  userAgent?: string;
  url?: string;
  componentStack?: string;
}

class ErrorLogger {
  private static instance: ErrorLogger;
  private queue: ErrorLog[] = [];
  private isOnline: boolean = true;
  private maxQueueSize: number = 50;
  
  private constructor() {
    if (typeof window !== 'undefined') {
      // Monitor online/offline status
      window.addEventListener('online', () => {
        this.isOnline = true;
        this.flushQueue();
      });
      
      window.addEventListener('offline', () => {
        this.isOnline = false;
      });
      
      // Listen for unhandled promise rejections
      window.addEventListener('unhandledrejection', (event) => {
        this.logError(new Error(event.reason), {
          action: 'unhandled_promise_rejection',
        });
      });
    }
  }
  
  static getInstance(): ErrorLogger {
    if (!ErrorLogger.instance) {
      ErrorLogger.instance = new ErrorLogger();
    }
    return ErrorLogger.instance;
  }
  
  /**
   * Log an error with context
   */
  logError(error: Error | string, context?: ErrorContext): void {
    const errorLog: ErrorLog = {
      message: typeof error === 'string' ? error : error.message,
      stack: typeof error === 'object' ? error.stack : undefined,
      timestamp: new Date().toISOString(),
      level: 'error',
      context,
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
      url: typeof window !== 'undefined' ? window.location.href : undefined,
    };
    
    this.send(errorLog);
  }
  
  /**
   * Log a warning
   */
  logWarning(message: string, context?: ErrorContext): void {
    const errorLog: ErrorLog = {
      message,
      timestamp: new Date().toISOString(),
      level: 'warning',
      context,
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
      url: typeof window !== 'undefined' ? window.location.href : undefined,
    };
    
    this.send(errorLog);
  }
  
  /**
   * Log info
   */
  logInfo(message: string, context?: ErrorContext): void {
    const errorLog: ErrorLog = {
      message,
      timestamp: new Date().toISOString(),
      level: 'info',
      context,
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
      url: typeof window !== 'undefined' ? window.location.href : undefined,
    };
    
    this.send(errorLog);
  }
  
  /**
   * Log React component errors
   */
  logComponentError(
    error: Error,
    errorInfo: { componentStack: string },
    context?: ErrorContext
  ): void {
    const errorLog: ErrorLog = {
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
      level: 'error',
      context: {
        ...context,
        action: 'component_error',
      },
      componentStack: errorInfo.componentStack,
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
      url: typeof window !== 'undefined' ? window.location.href : undefined,
    };
    
    this.send(errorLog);
  }
  
  /**
   * Send error log to backend or external service
   */
  private async send(errorLog: ErrorLog): Promise<void> {
    // In development, just log to console
    if (process.env.NODE_ENV === 'development') {
      console.group(`🔴 ${errorLog.level.toUpperCase()}: ${errorLog.message}`);
      console.log('Timestamp:', errorLog.timestamp);
      if (errorLog.stack) console.log('Stack:', errorLog.stack);
      if (errorLog.context) console.log('Context:', errorLog.context);
      if (errorLog.componentStack) console.log('Component Stack:', errorLog.componentStack);
      console.groupEnd();
      return;
    }
    
    // Queue if offline
    if (!this.isOnline) {
      this.addToQueue(errorLog);
      return;
    }
    
    try {
      // Send to backend API
      await this.sendToBackend(errorLog);
      
      // Send to external services
      this.sendToSentry(errorLog);
      this.sendToAnalytics(errorLog);
    } catch (error) {
      // If sending fails, add to queue
      this.addToQueue(errorLog);
    }
  }
  
  /**
   * Send error to backend API
   */
  private async sendToBackend(errorLog: ErrorLog): Promise<void> {
    try {
      const response = await fetch('/api/errors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(errorLog),
      });
      
      if (!response.ok) {
        throw new Error('Failed to send error to backend');
      }
    } catch (error) {
      console.error('Failed to send error to backend:', error);
      throw error;
    }
  }
  
  /**
   * Send error to Sentry (if configured)
   */
  private sendToSentry(errorLog: ErrorLog): void {
    if (typeof window !== 'undefined' && (window as any).Sentry) {
      const Sentry = (window as any).Sentry;
      
      Sentry.captureException(new Error(errorLog.message), {
        level: errorLog.level === 'error' ? 'error' : 'warning',
        extra: {
          ...errorLog.context,
          timestamp: errorLog.timestamp,
          url: errorLog.url,
        },
      });
    }
  }
  
  /**
   * Send error to analytics (if configured)
   */
  private sendToAnalytics(errorLog: ErrorLog): void {
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'exception', {
        description: errorLog.message,
        fatal: errorLog.level === 'error',
      });
    }
  }
  
  /**
   * Add error to queue for later sending
   */
  private addToQueue(errorLog: ErrorLog): void {
    this.queue.push(errorLog);
    
    // Limit queue size
    if (this.queue.length > this.maxQueueSize) {
      this.queue.shift();
    }
    
    // Save to localStorage for persistence
    if (typeof localStorage !== 'undefined') {
      try {
        localStorage.setItem('error_queue', JSON.stringify(this.queue));
      } catch (error) {
        console.error('Failed to save error queue to localStorage:', error);
      }
    }
  }
  
  /**
   * Flush queued errors when connection is restored
   */
  private async flushQueue(): Promise<void> {
    if (this.queue.length === 0) return;
    
    const errors = [...this.queue];
    this.queue = [];
    
    for (const errorLog of errors) {
      try {
        await this.sendToBackend(errorLog);
      } catch (error) {
        // Re-add to queue if still failing
        this.addToQueue(errorLog);
      }
    }
    
    // Clear localStorage
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem('error_queue');
    }
  }
  
  /**
   * Load queued errors from localStorage on initialization
   */
  loadQueueFromStorage(): void {
    if (typeof localStorage !== 'undefined') {
      try {
        const stored = localStorage.getItem('error_queue');
        if (stored) {
          this.queue = JSON.parse(stored);
          this.flushQueue();
        }
      } catch (error) {
        console.error('Failed to load error queue from localStorage:', error);
      }
    }
  }
}

// Export singleton instance
export const errorLogger = ErrorLogger.getInstance();

// Convenience functions
export const logError = (error: Error | string, context?: ErrorContext) => 
  errorLogger.logError(error, context);

export const logWarning = (message: string, context?: ErrorContext) => 
  errorLogger.logWarning(message, context);

export const logInfo = (message: string, context?: ErrorContext) => 
  errorLogger.logInfo(message, context);

export const logComponentError = (
  error: Error,
  errorInfo: { componentStack: string },
  context?: ErrorContext
) => errorLogger.logComponentError(error, errorInfo, context);

// Initialize on load
if (typeof window !== 'undefined') {
  errorLogger.loadQueueFromStorage();
}