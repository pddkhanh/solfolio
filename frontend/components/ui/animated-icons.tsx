'use client';

import * as React from 'react';
import { motion, AnimatePresence, HTMLMotionProps } from 'framer-motion';
import { cn } from '@/lib/utils';
import { animationConfig } from '@/lib/animations';
import {
  Loader2,
  Check,
  X,
  AlertCircle,
  ChevronDown,
  Heart,
  Star,
  Bell,
  Copy,
  ExternalLink,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';

interface AnimatedIconProps extends HTMLMotionProps<"div"> {
  size?: number;
  className?: string;
}

/**
 * Spinning loader icon
 */
export const SpinnerIcon = ({ size = 24, className, ...props }: AnimatedIconProps) => {
  return (
    <motion.div
      animate={{ rotate: 360 }}
      transition={{
        duration: 1,
        repeat: Infinity,
        ease: "linear",
      }}
      className={className}
      {...props}
    >
      <Loader2 size={size} />
    </motion.div>
  );
};

/**
 * Success checkmark with draw animation
 */
export const SuccessIcon = ({ size = 24, className, ...props }: AnimatedIconProps) => {
  return (
    <motion.div className={className} {...props}>
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <motion.circle
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="2"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.5, ease: animationConfig.ease.default }}
        />
        <motion.path
          d="M8 12l3 3 5-6"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ 
            duration: 0.3, 
            delay: 0.5,
            ease: animationConfig.ease.default 
          }}
        />
      </svg>
    </motion.div>
  );
};

/**
 * Error X icon with shake animation
 */
export const ErrorIcon = ({ size = 24, className, ...props }: AnimatedIconProps) => {
  return (
    <motion.div
      className={className}
      animate={{
        x: [0, -10, 10, -10, 10, 0],
      }}
      transition={{
        duration: 0.5,
        ease: animationConfig.ease.default,
      }}
      {...props}
    >
      <X size={size} className="text-red-500" />
    </motion.div>
  );
};

/**
 * Warning icon with pulse animation
 */
export const WarningIcon = ({ size = 24, className, ...props }: AnimatedIconProps) => {
  return (
    <motion.div
      className={className}
      animate={{
        scale: [1, 1.1, 1],
      }}
      transition={{
        duration: 1,
        repeat: Infinity,
        ease: "easeInOut",
      }}
      {...props}
    >
      <AlertCircle size={size} className="text-yellow-500" />
    </motion.div>
  );
};

/**
 * Chevron icon that rotates on state change
 */
export const ChevronIcon = ({ 
  size = 24, 
  isOpen = false, 
  className, 
  ...props 
}: AnimatedIconProps & { isOpen?: boolean }) => {
  return (
    <motion.div
      className={className}
      animate={{ rotate: isOpen ? 180 : 0 }}
      transition={{ duration: 0.2 }}
      {...props}
    >
      <ChevronDown size={size} />
    </motion.div>
  );
};

/**
 * Heart icon with beat animation
 */
export const HeartIcon = ({ 
  size = 24, 
  isLiked = false, 
  className, 
  onClick,
  ...props 
}: AnimatedIconProps & { isLiked?: boolean; onClick?: () => void }) => {
  return (
    <motion.div
      className={cn("cursor-pointer", className)}
      onClick={onClick}
      whileHover={{ scale: 1.2 }}
      whileTap={{ scale: 0.9 }}
      animate={isLiked ? {
        scale: [1, 1.3, 1],
      } : {}}
      transition={{
        duration: 0.3,
        ease: animationConfig.ease.bounce,
      }}
      {...props}
    >
      <Heart 
        size={size} 
        className={cn(
          "transition-colors",
          isLiked ? "fill-red-500 text-red-500" : "text-gray-400"
        )} 
      />
    </motion.div>
  );
};

/**
 * Star rating icon with fill animation
 */
export const StarIcon = ({ 
  size = 24, 
  isFilled = false, 
  className, 
  onClick,
  ...props 
}: AnimatedIconProps & { isFilled?: boolean; onClick?: () => void }) => {
  return (
    <motion.div
      className={cn("cursor-pointer", className)}
      onClick={onClick}
      whileHover={{ scale: 1.2, rotate: 15 }}
      whileTap={{ scale: 0.9 }}
      animate={isFilled ? {
        scale: [1, 1.3, 1],
        rotate: [0, 360],
      } : {}}
      transition={{
        duration: 0.5,
        ease: animationConfig.ease.default,
      }}
      {...props}
    >
      <Star 
        size={size} 
        className={cn(
          "transition-colors",
          isFilled ? "fill-yellow-500 text-yellow-500" : "text-gray-400"
        )} 
      />
    </motion.div>
  );
};

/**
 * Bell icon with ring animation
 */
export const BellIcon = ({ 
  size = 24, 
  hasNotification = false, 
  className, 
  ...props 
}: AnimatedIconProps & { hasNotification?: boolean }) => {
  return (
    <motion.div
      className={cn("relative", className)}
      animate={hasNotification ? {
        rotate: [0, -10, 10, -10, 10, 0],
      } : {}}
      transition={{
        duration: 0.5,
        repeat: hasNotification ? Infinity : 0,
        repeatDelay: 3,
      }}
      {...props}
    >
      <Bell size={size} />
      {hasNotification && (
        <motion.div
          className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-red-500"
          animate={{
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 0.5,
            repeat: Infinity,
            repeatDelay: 2,
          }}
        />
      )}
    </motion.div>
  );
};

/**
 * Copy icon with feedback animation
 */
export const CopyIcon = ({ 
  size = 24, 
  onCopy,
  className, 
  ...props 
}: AnimatedIconProps & { onCopy?: () => void }) => {
  const [copied, setCopied] = React.useState(false);
  
  const handleCopy = () => {
    if (onCopy) onCopy();
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  return (
    <motion.div
      className={cn("cursor-pointer", className)}
      onClick={handleCopy}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      {...props}
    >
      <AnimatePresence mode="wait">
        {!copied ? (
          <motion.div
            key="copy"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
          >
            <Copy size={size} />
          </motion.div>
        ) : (
          <motion.div
            key="check"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
          >
            <Check size={size} className="text-green-500" />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

/**
 * External link icon with diagonal movement
 */
export const ExternalLinkIcon = ({ size = 24, className, ...props }: AnimatedIconProps) => {
  return (
    <motion.div
      className={className}
      whileHover={{
        x: 2,
        y: -2,
      }}
      transition={{ duration: 0.2 }}
      {...props}
    >
      <ExternalLink size={size} />
    </motion.div>
  );
};

/**
 * Refresh icon with rotation
 */
export const RefreshIcon = ({ 
  size = 24, 
  isRefreshing = false,
  onClick,
  className, 
  ...props 
}: AnimatedIconProps & { isRefreshing?: boolean; onClick?: () => void }) => {
  return (
    <motion.div
      className={cn("cursor-pointer", className)}
      onClick={onClick}
      animate={isRefreshing ? { rotate: 360 } : {}}
      transition={{
        duration: 1,
        repeat: isRefreshing ? Infinity : 0,
        ease: "linear",
      }}
      whileHover={!isRefreshing ? { rotate: 180 } : {}}
      {...props}
    >
      <RefreshCw size={size} />
    </motion.div>
  );
};

/**
 * Trend indicator with animated arrow
 */
export const TrendIcon = ({ 
  size = 24, 
  trend = 'up',
  value,
  className, 
  ...props 
}: AnimatedIconProps & { trend?: 'up' | 'down'; value?: number }) => {
  const isUp = trend === 'up';
  const Icon = isUp ? TrendingUp : TrendingDown;
  const color = isUp ? 'text-green-500' : 'text-red-500';
  
  return (
    <motion.div
      className={cn("flex items-center gap-1", color, className)}
      initial={{ opacity: 0, y: isUp ? 10 : -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      {...props}
    >
      <motion.div
        animate={{ y: isUp ? [-2, 0] : [2, 0] }}
        transition={{
          duration: 0.5,
          repeat: Infinity,
          repeatType: "reverse",
        }}
      >
        <Icon size={size} />
      </motion.div>
      {value !== undefined && (
        <motion.span
          className="text-sm font-medium"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          {value > 0 && '+'}{value}%
        </motion.span>
      )}
    </motion.div>
  );
};

/**
 * Wallet connection icon with pulse
 */
export const WalletIcon = ({ 
  size = 24, 
  isConnected = false,
  className, 
  ...props 
}: AnimatedIconProps & { isConnected?: boolean }) => {
  return (
    <motion.div
      className={cn("relative", className)}
      animate={isConnected ? {
        scale: [1, 1.05, 1],
      } : {}}
      transition={{
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut",
      }}
      {...props}
    >
      <Wallet size={size} className={isConnected ? 'text-green-500' : 'text-gray-400'} />
      {isConnected && (
        <motion.div
          className="absolute -bottom-1 -right-1 h-2 w-2 rounded-full bg-green-500"
          animate={{
            scale: [1, 1.5, 1],
            opacity: [1, 0.5, 1],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      )}
    </motion.div>
  );
};

/**
 * Arrow indicator for price changes
 */
export const PriceChangeIcon = ({ 
  size = 16, 
  change = 0,
  className, 
  ...props 
}: AnimatedIconProps & { change?: number }) => {
  const isPositive = change > 0;
  const Icon = isPositive ? ArrowUpRight : ArrowDownRight;
  const color = isPositive ? 'text-green-500' : 'text-red-500';
  
  return (
    <motion.div
      className={cn(color, className)}
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{
        type: "spring",
        stiffness: 500,
        damping: 25,
      }}
      {...props}
    >
      <Icon size={size} />
    </motion.div>
  );
};

const AnimatedIcons = {
  SpinnerIcon,
  SuccessIcon,
  ErrorIcon,
  WarningIcon,
  ChevronIcon,
  HeartIcon,
  StarIcon,
  BellIcon,
  CopyIcon,
  ExternalLinkIcon,
  RefreshIcon,
  TrendIcon,
  WalletIcon,
  PriceChangeIcon,
};

export default AnimatedIcons;