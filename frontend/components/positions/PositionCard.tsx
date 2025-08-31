'use client';

import React, { useEffect, useState } from 'react';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import { ArrowUpRight, TrendingUp, Coins, ExternalLink, MoreVertical, Activity } from 'lucide-react';
import { cardHover, shimmerAnimation, countUpAnimation } from '@/lib/animations';
import { colorSystem } from '@/lib/design-tokens';

// Helper function to format USD values
const formatUSD = (value: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value);
};

interface PositionCardProps {
  position: {
    protocol: string;
    protocolName: string;
    positionType: string;
    tokenSymbol?: string;
    tokenName?: string;
    logoUri?: string;
    amount: number;
    underlyingAmount?: number;
    usdValue: number;
    apy?: number;
    rewards?: number;
    metadata?: any;
  };
  index?: number;
}

export function PositionCard({ position, index = 0 }: PositionCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [rewardsCount, setRewardsCount] = useState(0);
  const valueCount = useMotionValue(0);
  const displayValue = useTransform(valueCount, (value) => 
    formatUSD(value)
  );
  const apyCount = useMotionValue(0);
  const displayApy = useTransform(apyCount, (value) => 
    `${value.toFixed(2)}%`
  );

  // Animate values on mount
  useEffect(() => {
    const valueAnimation = animate(valueCount, position.usdValue, {
      duration: 1.5,
      ease: [0.4, 0, 0.2, 1],
    });

    if (position.apy) {
      const apyAnimation = animate(apyCount, position.apy, {
        duration: 1.5,
        ease: [0.4, 0, 0.2, 1],
      });
      return () => {
        valueAnimation.stop();
        apyAnimation.stop();
      };
    }

    return () => valueAnimation.stop();
  }, [position.usdValue, position.apy]);

  // Simulate real-time rewards counter
  useEffect(() => {
    if (!position.rewards) return;
    
    const interval = setInterval(() => {
      setRewardsCount(prev => prev + position.rewards! / 86400); // Daily rewards per second
    }, 1000);

    return () => clearInterval(interval);
  }, [position.rewards]);
  const formatUSD = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const formatAmount = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 4,
    }).format(value);
  };

  const formatAPY = (value: number) => {
    return `${value.toFixed(2)}%`;
  };

  const getProtocolUrl = (protocol: string) => {
    const urls: Record<string, string> = {
      MARINADE: 'https://marinade.finance',
      KAMINO: 'https://app.kamino.finance',
      JITO: 'https://www.jito.network',
      ORCA: 'https://www.orca.so',
      RAYDIUM: 'https://raydium.io',
    };
    return urls[protocol] || '#';
  };

  // Get protocol logo URL or fallback
  const getProtocolLogo = (protocol: string) => {
    const logos: Record<string, string> = {
      MARINADE: '/logos/marinade.svg',
      KAMINO: '/logos/kamino.svg',
      JITO: '/logos/jito.svg',
      ORCA: '/logos/orca.svg',
      RAYDIUM: '/logos/raydium.svg',
    };
    return position.logoUri || logos[protocol] || '/logos/default.svg';
  };

  const getPositionTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      STAKING: 'Staking',
      LENDING: 'Lending',
      BORROWING: 'Borrowing',
      LP_POSITION: 'Liquidity Pool',
      VAULT: 'Vault',
      FARMING: 'Yield Farming',
      OTHER: 'Other',
    };
    return labels[type] || type;
  };

  const getPositionTypeStyle = (type: string) => {
    const styles: Record<string, { bg: string; text: string; gradient: string }> = {
      STAKING: {
        bg: 'bg-green-500/10',
        text: 'text-green-400',
        gradient: 'from-green-500/20 to-emerald-500/20',
      },
      LENDING: {
        bg: 'bg-blue-500/10',
        text: 'text-blue-400',
        gradient: 'from-blue-500/20 to-cyan-500/20',
      },
      BORROWING: {
        bg: 'bg-red-500/10',
        text: 'text-red-400',
        gradient: 'from-red-500/20 to-orange-500/20',
      },
      LP_POSITION: {
        bg: 'bg-purple-500/10',
        text: 'text-purple-400',
        gradient: 'from-purple-500/20 to-pink-500/20',
      },
      VAULT: {
        bg: 'bg-yellow-500/10',
        text: 'text-yellow-400',
        gradient: 'from-yellow-500/20 to-amber-500/20',
      },
      FARMING: {
        bg: 'bg-orange-500/10',
        text: 'text-orange-400',
        gradient: 'from-orange-500/20 to-red-500/20',
      },
      OTHER: {
        bg: 'bg-gray-500/10',
        text: 'text-gray-400',
        gradient: 'from-gray-500/20 to-slate-500/20',
      },
    };
    return styles[type] || styles.OTHER;
  };

  const typeStyle = getPositionTypeStyle(position.positionType);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.5,
        delay: index * 0.05,
        ease: [0.4, 0, 0.2, 1],
      }}
      whileHover={{ y: -4 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="relative group"
    >
      {/* Gradient border effect */}
      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-500/20 via-cyan-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl" />
      
      {/* Card container with gradient border */}
      <div className="relative rounded-xl bg-gradient-to-r from-purple-500/10 via-cyan-500/10 to-purple-500/10 p-[1px]">
        <div className="relative rounded-xl bg-[#16171F] dark:bg-[#16171F] overflow-hidden">
          {/* Background gradient accent */}
          <div className={`absolute inset-0 bg-gradient-to-br ${typeStyle.gradient} opacity-5`} />
          
          {/* Card Header */}
          <div className="relative p-5 pb-0">
            <div className="flex items-start justify-between mb-4">
              {/* Protocol Logo and Info */}
              <div className="flex items-center gap-4">
                <motion.div
                  animate={{ rotate: isHovered ? 360 : 0 }}
                  transition={{ duration: 0.5 }}
                  className="relative"
                >
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500/20 to-cyan-500/20 p-[1px]">
                    <div className="w-full h-full rounded-full bg-[#1C1D26] flex items-center justify-center">
                      {position.logoUri ? (
                        <img
                          src={getProtocolLogo(position.protocol)}
                          alt={position.protocolName}
                          className="w-8 h-8 rounded-full"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-cyan-500" />
                      )}
                    </div>
                  </div>
                  {/* Activity indicator */}
                  {position.apy && position.apy > 0 && (
                    <motion.div
                      className="absolute -top-1 -right-1 w-3 h-3"
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <div className="w-full h-full rounded-full bg-green-500 animate-pulse" />
                    </motion.div>
                  )}
                </motion.div>
                
                <div>
                  <h3 className="text-lg font-semibold text-white">
                    {position.protocolName}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${typeStyle.bg} ${typeStyle.text} backdrop-blur-sm`}>
                      {getPositionTypeLabel(position.positionType)}
                    </span>
                    {position.tokenSymbol && (
                      <span className="text-xs text-gray-400">
                        {position.tokenSymbol}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Action buttons */}
              <div className="flex items-center gap-1">
                <motion.a
                  href={getProtocolUrl(position.protocol)}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  className="p-2 rounded-lg hover:bg-white/5 transition-colors"
                >
                  <ExternalLink className="w-4 h-4 text-gray-400" />
                </motion.a>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  className="p-2 rounded-lg hover:bg-white/5 transition-colors"
                >
                  <MoreVertical className="w-4 h-4 text-gray-400" />
                </motion.button>
              </div>
            </div>
          </div>
          {/* Card Content */}
          <div className="relative p-5 space-y-4">
            {/* Value Section with animated count-up */}
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs text-gray-400 mb-1">Total Value</p>
                <motion.div className="text-2xl font-bold text-white">
                  {displayValue}
                </motion.div>
                {position.amount > 0 && (
                  <p className="text-xs text-gray-500 mt-1">
                    {formatAmount(position.amount)} {position.tokenSymbol}
                  </p>
                )}
              </div>
              
              {/* APY Badge with animation */}
              {position.apy !== undefined && position.apy > 0 && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.3, type: "spring", stiffness: 500 }}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-green-500/10 border border-green-500/20"
                >
                  <TrendingUp className="w-3.5 h-3.5 text-green-400" />
                  <motion.span className="text-sm font-semibold text-green-400">
                    {displayApy}
                  </motion.span>
                </motion.div>
              )}
            </div>
            
            {/* Rewards Section with real-time counter */}
            {position.rewards !== undefined && position.rewards > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="p-3 rounded-lg bg-gradient-to-r from-blue-500/5 to-cyan-500/5 border border-blue-500/10"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-full bg-blue-500/10">
                      <Coins className="w-3.5 h-3.5 text-blue-400" />
                    </div>
                    <span className="text-xs text-gray-400">Daily Rewards</span>
                  </div>
                  <div className="text-right">
                    <motion.div
                      key={rewardsCount}
                      initial={{ scale: 1.1 }}
                      animate={{ scale: 1 }}
                      className="text-sm font-semibold text-blue-400"
                    >
                      +{formatAmount(position.rewards)} {position.tokenSymbol}
                    </motion.div>
                    <p className="text-xs text-gray-500">
                      ≈ ${(position.rewards * (position.usdValue / position.amount)).toFixed(2)}/day
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
            
            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-3">
              {position.underlyingAmount && (
                <div className="p-2.5 rounded-lg bg-white/5">
                  <p className="text-xs text-gray-500 mb-0.5">Underlying</p>
                  <p className="text-sm font-medium text-gray-300">
                    {formatAmount(position.underlyingAmount)} SOL
                  </p>
                </div>
              )}
              {position.metadata?.exchangeRate && (
                <div className="p-2.5 rounded-lg bg-white/5">
                  <p className="text-xs text-gray-500 mb-0.5">Rate</p>
                  <p className="text-sm font-medium text-gray-300">
                    1:{position.metadata.exchangeRate.toFixed(4)}
                  </p>
                </div>
              )}
            </div>
            
            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: isHovered ? 1 : 0 }}
              transition={{ duration: 0.2 }}
              className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-[#16171F] to-transparent"
            >
              <button className="w-full py-2 px-4 rounded-lg bg-gradient-to-r from-purple-500 to-cyan-500 text-white text-sm font-medium hover:opacity-90 transition-opacity">
                Manage Position
              </button>
            </motion.div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}