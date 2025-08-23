'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowUpRight, TrendingUp, Coins, ExternalLink } from 'lucide-react';

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
}

export function PositionCard({ position }: PositionCardProps) {
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

  const getPositionTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      STAKING: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      LENDING: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
      BORROWING: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
      LP_POSITION: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
      VAULT: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
      FARMING: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
      OTHER: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300',
    };
    return colors[position.positionType] || colors.OTHER;
  };

  return (
    <Card className="hover:shadow-lg transition-shadow duration-200">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            {position.logoUri && (
              <img
                src={position.logoUri}
                alt={position.tokenSymbol}
                className="w-10 h-10 rounded-full"
              />
            )}
            <div>
              <CardTitle className="text-lg font-semibold">
                {position.protocolName}
              </CardTitle>
              <div className="flex items-center gap-2 mt-1">
                <span
                  className={`text-xs px-2 py-1 rounded-full font-medium ${getPositionTypeColor(
                    position.positionType
                  )}`}
                >
                  {getPositionTypeLabel(position.positionType)}
                </span>
                {position.tokenSymbol && (
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {position.tokenSymbol}
                  </span>
                )}
              </div>
            </div>
          </div>
          <a
            href={getProtocolUrl(position.protocol)}
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600 dark:text-gray-400">Amount</span>
            <div className="text-right">
              <div className="font-medium">
                {formatAmount(position.amount)} {position.tokenSymbol}
              </div>
              {position.underlyingAmount && (
                <div className="text-xs text-gray-500 dark:text-gray-500">
                  ≈ {formatAmount(position.underlyingAmount)} SOL
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600 dark:text-gray-400">Value</span>
            <div className="font-semibold text-lg">{formatUSD(position.usdValue)}</div>
          </div>

          {position.apy !== undefined && position.apy > 0 && (
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                APY
              </span>
              <div className="text-green-600 dark:text-green-400 font-medium">
                {formatAPY(position.apy)}
              </div>
            </div>
          )}

          {position.rewards !== undefined && position.rewards > 0 && (
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1">
                <Coins className="w-3 h-3" />
                Daily Rewards
              </span>
              <div className="text-blue-600 dark:text-blue-400">
                {formatAmount(position.rewards)} {position.tokenSymbol}
              </div>
            </div>
          )}

          {position.metadata?.exchangeRate && (
            <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-500 dark:text-gray-500">Exchange Rate</span>
                <span className="text-gray-600 dark:text-gray-400">
                  1 {position.tokenSymbol} = {position.metadata.exchangeRate.toFixed(4)} SOL
                </span>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}