'use client';

import * as React from 'react';
import { motion, AnimatePresence, HTMLMotionProps } from 'framer-motion';
import { cn } from '@/lib/utils';
import { animationConfig, successCheckVariants, errorShakeVariants } from '@/lib/animations';
import { Check, X, AlertTriangle, Info, CheckCircle, XCircle } from 'lucide-react';

interface FeedbackAnimationProps {
  type: 'success' | 'error' | 'warning' | 'info';
  title?: string;
  message?: string;
  duration?: number;
  onComplete?: () => void;
  className?: string;
}

/**
 * Success animation component with checkmark draw effect
 */
export const SuccessAnimation = ({ 
  title = "Success!",
  message,
  duration = 3000,
  onComplete,
  className 
}: Omit<FeedbackAnimationProps, 'type'>) => {
  React.useEffect(() => {
    if (duration > 0 && onComplete) {
      const timer = setTimeout(onComplete, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onComplete]);
  
  return (
    <motion.div
      className={cn(
        "flex items-center gap-3 p-4 rounded-lg",
        "bg-green-50 border border-green-200",
        "dark:bg-green-900/20 dark:border-green-800/50",
        className
      )}
      initial={{ opacity: 0, scale: 0.8, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.8, y: -20 }}
      transition={{
        type: "spring",
        stiffness: 500,
        damping: 30,
      }}
    >
      {/* Animated checkmark */}
      <motion.div
        className="flex-shrink-0"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{
          type: "spring",
          stiffness: 600,
          damping: 25,
          delay: 0.1,
        }}
      >
        <div className="relative">
          <motion.div
            className="absolute inset-0 bg-green-500 rounded-full"
            initial={{ scale: 0 }}
            animate={{ scale: [0, 1.2, 1] }}
            transition={{ duration: 0.5 }}
          />
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            className="relative z-10"
          >
            <motion.circle
              cx="12"
              cy="12"
              r="10"
              stroke="white"
              strokeWidth="2"
              fill="transparent"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
            />
            <motion.path
              d="M8 12l3 3 5-6"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ 
                duration: 0.3, 
                delay: 0.5,
                ease: "easeInOut" 
              }}
            />
          </svg>
        </div>
      </motion.div>
      
      <div className="flex-1">
        <motion.h4
          className="font-medium text-green-800 dark:text-green-300"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          {title}
        </motion.h4>
        {message && (
          <motion.p
            className="text-sm text-green-600 dark:text-green-400 mt-1"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            {message}
          </motion.p>
        )}
      </div>
    </motion.div>
  );
};

/**
 * Error animation component with shake effect
 */
export const ErrorAnimation = ({ 
  title = "Error!",
  message,
  duration = 5000,
  onComplete,
  className 
}: Omit<FeedbackAnimationProps, 'type'>) => {
  React.useEffect(() => {
    if (duration > 0 && onComplete) {
      const timer = setTimeout(onComplete, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onComplete]);
  
  return (
    <motion.div
      className={cn(
        "flex items-center gap-3 p-4 rounded-lg",
        "bg-red-50 border border-red-200",
        "dark:bg-red-900/20 dark:border-red-800/50",
        className
      )}
      initial={{ opacity: 0, scale: 0.8, x: -20 }}
      animate={{ opacity: 1, scale: 1, x: 0 }}
      exit={{ opacity: 0, scale: 0.8, x: 20 }}
      transition={{
        type: "spring",
        stiffness: 500,
        damping: 30,
      }}
    >
      {/* Animated error icon */}
      <motion.div
        className="flex-shrink-0"
        animate={{
          x: [0, -2, 2, -2, 2, 0],
        }}
        transition={{
          duration: 0.4,
          ease: "easeInOut",
        }}
      >
        <div className="relative">
          <motion.div
            className="absolute inset-0 bg-red-500 rounded-full"
            initial={{ scale: 0 }}
            animate={{ scale: [0, 1.2, 1] }}
            transition={{ duration: 0.5 }}
          />
          <XCircle className="relative z-10 text-white w-6 h-6" />
        </div>
      </motion.div>
      
      <div className="flex-1">
        <motion.h4
          className="font-medium text-red-800 dark:text-red-300"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          {title}
        </motion.h4>
        {message && (
          <motion.p
            className="text-sm text-red-600 dark:text-red-400 mt-1"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            {message}
          </motion.p>
        )}
      </div>
    </motion.div>
  );
};

/**
 * Warning animation component with pulse effect
 */
export const WarningAnimation = ({ 
  title = "Warning!",
  message,
  duration = 4000,
  onComplete,
  className 
}: Omit<FeedbackAnimationProps, 'type'>) => {
  React.useEffect(() => {
    if (duration > 0 && onComplete) {
      const timer = setTimeout(onComplete, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onComplete]);
  
  return (
    <motion.div
      className={cn(
        "flex items-center gap-3 p-4 rounded-lg",
        "bg-yellow-50 border border-yellow-200",
        "dark:bg-yellow-900/20 dark:border-yellow-800/50",
        className
      )}
      initial={{ opacity: 0, scale: 0.8, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.8, y: -20 }}
      transition={{
        type: "spring",
        stiffness: 500,
        damping: 30,
      }}
    >
      {/* Animated warning icon */}
      <motion.div
        className="flex-shrink-0"
        animate={{
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 1,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        <div className="relative">
          <motion.div
            className="absolute inset-0 bg-yellow-500 rounded-full"
            initial={{ scale: 0 }}
            animate={{ scale: [0, 1.2, 1] }}
            transition={{ duration: 0.5 }}
          />
          <AlertTriangle className="relative z-10 text-white w-6 h-6" />
        </div>
      </motion.div>
      
      <div className="flex-1">
        <motion.h4
          className="font-medium text-yellow-800 dark:text-yellow-300"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          {title}
        </motion.h4>
        {message && (
          <motion.p
            className="text-sm text-yellow-600 dark:text-yellow-400 mt-1"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            {message}
          </motion.p>
        )}
      </div>
    </motion.div>
  );
};

/**
 * Info animation component with bounce effect
 */
export const InfoAnimation = ({ 
  title = "Info",
  message,
  duration = 3000,
  onComplete,
  className 
}: Omit<FeedbackAnimationProps, 'type'>) => {
  React.useEffect(() => {
    if (duration > 0 && onComplete) {
      const timer = setTimeout(onComplete, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onComplete]);
  
  return (
    <motion.div
      className={cn(
        "flex items-center gap-3 p-4 rounded-lg",
        "bg-blue-50 border border-blue-200",
        "dark:bg-blue-900/20 dark:border-blue-800/50",
        className
      )}
      initial={{ opacity: 0, scale: 0.8, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.8, y: -20 }}
      transition={{
        type: "spring",
        stiffness: 500,
        damping: 30,
      }}
    >
      {/* Animated info icon */}
      <motion.div
        className="flex-shrink-0"
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{
          type: "spring",
          stiffness: 600,
          damping: 25,
          delay: 0.1,
        }}
      >
        <div className="relative">
          <motion.div
            className="absolute inset-0 bg-blue-500 rounded-full"
            initial={{ scale: 0 }}
            animate={{ scale: [0, 1.2, 1] }}
            transition={{ duration: 0.5 }}
          />
          <Info className="relative z-10 text-white w-6 h-6" />
        </div>
      </motion.div>
      
      <div className="flex-1">
        <motion.h4
          className="font-medium text-blue-800 dark:text-blue-300"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          {title}
        </motion.h4>
        {message && (
          <motion.p
            className="text-sm text-blue-600 dark:text-blue-400 mt-1"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            {message}
          </motion.p>
        )}
      </div>
    </motion.div>
  );
};

/**
 * Generic feedback animation component
 */
export const FeedbackAnimation = (props: FeedbackAnimationProps) => {
  const { type, ...restProps } = props;
  
  switch (type) {
    case 'success':
      return <SuccessAnimation {...restProps} />;
    case 'error':
      return <ErrorAnimation {...restProps} />;
    case 'warning':
      return <WarningAnimation {...restProps} />;
    case 'info':
      return <InfoAnimation {...restProps} />;
    default:
      return null;
  }
};

/**
 * Floating feedback notification
 */
export const FloatingFeedback = ({ 
  type,
  title,
  message,
  isVisible,
  onClose,
  position = 'top-right'
}: FeedbackAnimationProps & { 
  isVisible: boolean;
  onClose: () => void;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
}) => {
  const positionClasses = {
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4',
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
  };
  
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className={cn("fixed z-50", positionClasses[position])}
          initial={{ opacity: 0, scale: 0.8, x: position.includes('right') ? 20 : -20 }}
          animate={{ opacity: 1, scale: 1, x: 0 }}
          exit={{ opacity: 0, scale: 0.8, x: position.includes('right') ? 20 : -20 }}
          transition={{
            type: "spring",
            stiffness: 500,
            damping: 30,
          }}
        >
          <div className="relative">
            <FeedbackAnimation
              type={type}
              title={title}
              message={message}
              onComplete={onClose}
            />
            
            {/* Close button */}
            <motion.button
              className="absolute -top-1 -right-1 bg-white dark:bg-gray-800 rounded-full p-1 shadow-sm border border-gray-200 dark:border-gray-700"
              onClick={onClose}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <X className="w-3 h-3" />
            </motion.button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

/**
 * Inline feedback for form fields
 */
export const InlineFeedback = ({ 
  type,
  message,
  className 
}: {
  type: 'success' | 'error';
  message: string;
  className?: string;
}) => {
  const Icon = type === 'success' ? Check : X;
  const colorClass = type === 'success' ? 'text-green-500' : 'text-red-500';
  
  return (
    <motion.div
      className={cn("flex items-center gap-2 mt-1", className)}
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.2 }}
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{
          type: "spring",
          stiffness: 600,
          damping: 25,
        }}
      >
        <Icon className={cn("w-4 h-4", colorClass)} />
      </motion.div>
      <motion.span
        className={cn("text-sm", colorClass)}
        initial={{ opacity: 0, x: -5 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.1 }}
      >
        {message}
      </motion.span>
    </motion.div>
  );
};

/**
 * Progress success animation
 */
export const ProgressSuccess = ({
  steps,
  currentStep,
  className
}: {
  steps: string[];
  currentStep: number;
  className?: string;
}) => {
  return (
    <div className={cn("space-y-4", className)}>
      {steps.map((step, index) => {
        const isCompleted = index < currentStep;
        const isCurrent = index === currentStep;
        
        return (
          <motion.div
            key={index}
            className="flex items-center gap-3"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <motion.div
              className={cn(
                "w-6 h-6 rounded-full flex items-center justify-center",
                isCompleted && "bg-green-500",
                isCurrent && "bg-blue-500",
                !isCompleted && !isCurrent && "bg-gray-300"
              )}
              animate={isCompleted ? { scale: [1, 1.2, 1] } : {}}
              transition={{ duration: 0.3 }}
            >
              {isCompleted ? (
                <Check className="w-4 h-4 text-white" />
              ) : (
                <span className="text-xs text-white font-bold">
                  {index + 1}
                </span>
              )}
            </motion.div>
            
            <motion.span
              className={cn(
                "text-sm",
                isCompleted && "text-green-600",
                isCurrent && "text-blue-600 font-medium",
                !isCompleted && !isCurrent && "text-gray-500"
              )}
              animate={isCurrent ? { opacity: [0.7, 1, 0.7] } : {}}
              transition={{ duration: 1, repeat: Infinity }}
            >
              {step}
            </motion.span>
          </motion.div>
        );
      })}
    </div>
  );
};

export default FeedbackAnimation;