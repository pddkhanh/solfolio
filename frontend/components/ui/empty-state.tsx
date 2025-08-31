"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import React from "react";
import { Button } from "./button";
import { 
  Wallet,
  Coins,
  TrendingUp,
  Search,
  RefreshCw,
  Plus,
  ArrowRight,
  Sparkles,
  FileText,
  AlertCircle,
  Loader2,
  History,
  Wifi,
  WifiOff,
  Settings,
  Clock,
  Zap
} from "lucide-react";

export interface EmptyStateProps {
  variant?: "no-wallet" | "no-tokens" | "no-positions" | "no-results" | "no-history" | "error" | "loading" | "network-error" | "maintenance" | "custom";
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  action?: {
    label: string;
    onClick: () => void;
    variant?: "default" | "outline" | "ghost";
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
  animated?: boolean;
  showRetryAfter?: number; // For maintenance/error states - seconds until retry is suggested
}

const defaultContent = {
  "no-wallet": {
    icon: <Wallet className="w-16 h-16" />,
    title: "Connect Your Wallet",
    description: "Connect your Solana wallet to view your DeFi portfolio and start tracking your positions across multiple protocols.",
    actionLabel: "Connect Wallet",
  },
  "no-tokens": {
    icon: <Coins className="w-16 h-16" />,
    title: "No Tokens Found",
    description: "Your wallet doesn't have any tokens yet. Start by acquiring some SOL or other Solana tokens to get started.",
    actionLabel: "Buy Tokens",
  },
  "no-positions": {
    icon: <TrendingUp className="w-16 h-16" />,
    title: "No DeFi Positions",
    description: "You don't have any active positions in DeFi protocols. Explore opportunities to start earning yield on your tokens.",
    actionLabel: "Explore Protocols",
  },
  "no-results": {
    icon: <Search className="w-16 h-16" />,
    title: "No Results Found",
    description: "We couldn't find any results matching your search. Try adjusting your filters or search terms.",
    actionLabel: "Clear Filters",
  },
  "no-history": {
    icon: <History className="w-16 h-16" />,
    title: "No Transaction History",
    description: "Your transaction history is empty. Once you start interacting with DeFi protocols, your transactions will appear here.",
    actionLabel: "Explore Protocols",
  },
  "network-error": {
    icon: <WifiOff className="w-16 h-16" />,
    title: "Network Connection Error",
    description: "Unable to connect to the Solana network. Please check your internet connection and RPC endpoint.",
    actionLabel: "Retry Connection",
  },
  "maintenance": {
    icon: <Settings className="w-16 h-16" />,
    title: "Maintenance in Progress",
    description: "We're temporarily down for maintenance. The service will be back online shortly.",
    actionLabel: "Check Status",
  },
  "error": {
    icon: <AlertCircle className="w-16 h-16" />,
    title: "Something Went Wrong",
    description: "We encountered an error while loading your data. Please try again or contact support if the problem persists.",
    actionLabel: "Try Again",
  },
  "loading": {
    icon: <Loader2 className="w-16 h-16 animate-spin" />,
    title: "Loading Your Portfolio",
    description: "We're fetching your positions across multiple DeFi protocols. This may take a moment.",
    actionLabel: "",
  },
  "custom": {
    icon: <FileText className="w-16 h-16" />,
    title: "Empty State",
    description: "No data to display at the moment.",
    actionLabel: "",
  },
};

/**
 * Beautiful empty state component with Solana-inspired gradients
 */
export function EmptyState({
  variant = "custom",
  title,
  description,
  icon,
  action,
  secondaryAction,
  className,
  animated = true,
  showRetryAfter,
}: EmptyStateProps) {
  const content = defaultContent[variant];
  
  const finalTitle = title || content.title;
  const finalDescription = description || content.description;
  const finalIcon = icon || content.icon;

  // Countdown timer for maintenance/retry states
  const [retryCountdown, setRetryCountdown] = React.useState(showRetryAfter || 0);

  React.useEffect(() => {
    if (showRetryAfter && retryCountdown > 0) {
      const timer = setInterval(() => {
        setRetryCountdown(prev => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [showRetryAfter, retryCountdown]);

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.5,
        ease: [0.4, 0, 0.2, 1] as [number, number, number, number],
      }
    },
  };

  const iconVariants = {
    hidden: { scale: 0.8, opacity: 0 },
    visible: { 
      scale: 1, 
      opacity: 1,
      transition: {
        delay: 0.2,
        duration: 0.5,
        ease: [0.4, 0, 0.2, 1] as [number, number, number, number],
      }
    },
  };

  const floatingAnimation = {
    y: [0, -10, 0],
    transition: {
      duration: 3,
      ease: "easeInOut" as const,
      repeat: Infinity,
    },
  };

  return (
    <motion.div
      className={cn(
        "flex flex-col items-center justify-center px-6 py-16",
        "text-center",
        className
      )}
      variants={animated ? containerVariants : undefined}
      initial={animated ? "hidden" : undefined}
      animate={animated ? "visible" : undefined}
    >
      {/* Gradient background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-purple-500/10 via-green-500/10 to-cyan-500/10 blur-3xl rounded-full" />
      </div>

      {/* Icon container with gradient border */}
      <motion.div
        className="relative mb-6"
        variants={animated ? iconVariants : undefined}
        animate={animated ? floatingAnimation : undefined}
      >
        <div className="relative p-6 rounded-2xl bg-gradient-to-br from-purple-500/10 via-transparent to-green-500/10 backdrop-blur-sm">
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-purple-500/20 via-transparent to-green-500/20 blur-xl" />
          <div className="relative text-gray-400">
            {finalIcon}
          </div>
        </div>
        
        {/* Decorative elements for different variants */}
        {variant === "no-wallet" && (
          <motion.div
            className="absolute -top-2 -right-2 text-purple-500"
            animate={{
              rotate: [0, 360],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 3,
              ease: "linear",
              repeat: Infinity,
            }}
          >
            <Sparkles className="w-6 h-6" />
          </motion.div>
        )}
        
        {variant === "network-error" && (
          <motion.div
            className="absolute -top-1 -right-1 text-red-500"
            animate={{
              opacity: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 2,
              ease: "easeInOut",
              repeat: Infinity,
            }}
          >
            <div className="w-3 h-3 rounded-full bg-red-500" />
          </motion.div>
        )}

        {variant === "maintenance" && (
          <motion.div
            className="absolute -top-2 -right-2 text-orange-500"
            animate={{
              rotate: [0, 180, 360],
            }}
            transition={{
              duration: 4,
              ease: "linear",
              repeat: Infinity,
            }}
          >
            <Settings className="w-5 h-5" />
          </motion.div>
        )}

        {variant === "no-history" && (
          <motion.div
            className="absolute -top-1 -right-1 text-blue-500"
            animate={{
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 2,
              ease: "easeInOut",
              repeat: Infinity,
            }}
          >
            <Clock className="w-5 h-5" />
          </motion.div>
        )}
      </motion.div>

      {/* Title */}
      <motion.h3
        className="text-2xl font-semibold text-white mb-3"
        initial={animated ? { opacity: 0 } : undefined}
        animate={animated ? { opacity: 1 } : undefined}
        transition={{ delay: 0.3 }}
      >
        {finalTitle}
      </motion.h3>

      {/* Description */}
      <motion.p
        className="text-gray-400 max-w-md mb-8 leading-relaxed"
        initial={animated ? { opacity: 0 } : undefined}
        animate={animated ? { opacity: 1 } : undefined}
        transition={{ delay: 0.4 }}
      >
        {finalDescription}
      </motion.p>

      {/* Actions */}
      {(action || secondaryAction) && (
        <motion.div
          className="flex flex-col sm:flex-row gap-3"
          initial={animated ? { opacity: 0 } : undefined}
          animate={animated ? { opacity: 1 } : undefined}
          transition={{ delay: 0.5 }}
        >
          {action && action.label && (
            <Button
              onClick={action.onClick}
              variant={action.variant || "default"}
              className="min-w-[140px] group"
            >
              {action.label}
              {variant === "no-wallet" && (
                <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              )}
              {(variant === "error" || variant === "network-error") && (
                <RefreshCw className="ml-2 w-4 h-4 group-hover:rotate-180 transition-transform duration-500" />
              )}
              {variant === "maintenance" && (
                <Clock className="ml-2 w-4 h-4" />
              )}
              {variant === "no-history" && (
                <Zap className="ml-2 w-4 h-4 group-hover:scale-110 transition-transform" />
              )}
              {variant === "no-positions" && (
                <TrendingUp className="ml-2 w-4 h-4 group-hover:translate-y-[-2px] transition-transform" />
              )}
            </Button>
          )}
          
          {secondaryAction && (
            <Button
              onClick={secondaryAction.onClick}
              variant="outline"
              className="min-w-[140px]"
            >
              {secondaryAction.label}
            </Button>
          )}
        </motion.div>
      )}

      {/* Countdown timer for maintenance/retry states */}
      {showRetryAfter && retryCountdown > 0 && (variant === "maintenance" || variant === "network-error") && (
        <motion.div
          className="mt-6 p-4 rounded-lg bg-gray-800/50 backdrop-blur-sm border border-gray-700/50"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6 }}
        >
          <div className="flex items-center justify-center gap-2 text-orange-400">
            <Clock className="w-4 h-4" />
            <span className="text-sm font-medium">
              Retrying in {Math.floor(retryCountdown / 60)}:{(retryCountdown % 60).toString().padStart(2, '0')}
            </span>
          </div>
          <div className="mt-2 w-full bg-gray-700 rounded-full h-1 overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-orange-500 to-yellow-500"
              initial={{ width: "100%" }}
              animate={{ width: `${(retryCountdown / (showRetryAfter || 1)) * 100}%` }}
              transition={{ duration: 1, ease: "linear" }}
            />
          </div>
        </motion.div>
      )}

      {/* Additional helper text for specific variants */}
      {variant === "no-positions" && (
        <motion.div
          className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl"
          initial={animated ? { opacity: 0 } : undefined}
          animate={animated ? { opacity: 1 } : undefined}
          transition={{ delay: 0.6 }}
        >
          {[
            { label: "Stake SOL", value: "~6% APY", color: "from-purple-500 to-pink-500" },
            { label: "Provide Liquidity", value: "~15% APY", color: "from-green-500 to-teal-500" },
            { label: "Lend Assets", value: "~8% APY", color: "from-blue-500 to-cyan-500" },
          ].map((item, index) => (
            <motion.div
              key={index}
              className="relative p-4 rounded-lg bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 hover:border-gray-600/50 transition-colors cursor-pointer group"
              whileHover={{ y: -2 }}
              transition={{ duration: 0.2 }}
            >
              <div className={`absolute inset-0 rounded-lg bg-gradient-to-br ${item.color} opacity-0 group-hover:opacity-10 transition-opacity`} />
              <div className="relative">
                <div className="text-sm text-gray-400 mb-1">{item.label}</div>
                <div className="text-lg font-semibold text-white">{item.value}</div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Network troubleshooting for network errors */}
      {variant === "network-error" && (
        <motion.div
          className="mt-8 p-4 rounded-lg bg-red-900/10 border border-red-500/20 max-w-md"
          initial={animated ? { opacity: 0 } : undefined}
          animate={animated ? { opacity: 1 } : undefined}
          transition={{ delay: 0.6 }}
        >
          <h4 className="text-sm font-semibold text-red-400 mb-2">Troubleshooting Tips</h4>
          <ul className="text-xs text-red-300/80 space-y-1">
            <li>• Check your internet connection</li>
            <li>• Try switching to a different RPC endpoint</li>
            <li>• Disable VPN if active</li>
            <li>• Clear browser cache and cookies</li>
          </ul>
        </motion.div>
      )}

      {/* Getting started tips for no history */}
      {variant === "no-history" && (
        <motion.div
          className="mt-8 grid grid-cols-2 gap-3 max-w-lg text-center"
          initial={animated ? { opacity: 0 } : undefined}
          animate={animated ? { opacity: 1 } : undefined}
          transition={{ delay: 0.6 }}
        >
          {[
            { label: "Stake", desc: "Earn rewards", icon: "🏦" },
            { label: "Swap", desc: "Trade tokens", icon: "🔄" },
            { label: "Lend", desc: "Earn interest", icon: "💰" },
            { label: "Farm", desc: "Provide liquidity", icon: "🌾" },
          ].map((item, index) => (
            <motion.div
              key={index}
              className="p-3 rounded-lg bg-gray-800/30 hover:bg-gray-800/50 transition-colors cursor-pointer"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
            >
              <div className="text-lg mb-1">{item.icon}</div>
              <div className="text-sm font-medium text-white">{item.label}</div>
              <div className="text-xs text-gray-400">{item.desc}</div>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Loading progress indicator */}
      {variant === "loading" && (
        <motion.div
          className="mt-8 w-full max-w-xs"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <div className="h-1 bg-gray-800 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-purple-500 via-green-500 to-cyan-500"
              initial={{ x: "-100%" }}
              animate={{ x: "100%" }}
              transition={{
                duration: 1.5,
                ease: "linear",
                repeat: Infinity,
              }}
              style={{ width: "50%" }}
            />
          </div>
          <div className="mt-2 text-xs text-gray-500">Fetching data from multiple protocols...</div>
        </motion.div>
      )}
    </motion.div>
  );
}

/**
 * Minimal empty state for inline use
 */
export function EmptyStateInline({
  message = "No data available",
  icon,
  className,
}: {
  message?: string;
  icon?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center justify-center gap-2 py-8 text-gray-400", className)}>
      {icon || <AlertCircle className="w-4 h-4" />}
      <span className="text-sm">{message}</span>
    </div>
  );
}

export default EmptyState;