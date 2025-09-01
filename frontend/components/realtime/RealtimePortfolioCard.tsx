'use client';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { ConnectionStatus, ConnectionIndicator } from './ConnectionStatus';
import { PriceTicker, PriceTickerStrip } from './PriceTicker';
import { UpdateIndicator, LiveDataBadge, ActivityStream } from './UpdateIndicator';
import { ValueUpdateAnimation, AnimatedCounter, AnimatedSparkline } from './ValueUpdateAnimation';
import { useWebSocketContext } from '@/contexts/WebSocketContext';
import { useTransactionAlerts } from './TransactionAlert';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

// Example component showing integration of all real-time features
export function RealtimePortfolioCard() {
  const { connectionStatus, isConnected, reconnectAttempt, maxReconnectAttempts, prices, lastUpdate, reconnect } = useWebSocketContext();
  const { showTransaction } = useTransactionAlerts();
  
  // Mock portfolio data - in real app, this would come from your data source
  const [portfolioValue, setPortfolioValue] = useState(10000);
  const [previousValue, setPreviousValue] = useState(9500);
  const [tokens] = useState([
    { symbol: 'SOL', amount: 50, mint: 'So11111111111111111111111111111111111111112' },
    { symbol: 'USDC', amount: 5000, mint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v' },
    { symbol: 'RAY', amount: 100, mint: '4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R' },
  ]);

  // Mock sparkline data
  const sparklineData = [9500, 9600, 9550, 9700, 9800, 9750, 9900, 10000];

  // Mock activities
  const [activities] = useState([
    { id: '1', text: 'SOL price updated', timestamp: new Date() },
    { id: '2', text: 'Position value recalculated', timestamp: new Date(Date.now() - 5000) },
    { id: '3', text: 'New transaction detected', timestamp: new Date(Date.now() - 10000) },
  ]);

  // Simulate portfolio value updates
  useEffect(() => {
    const interval = setInterval(() => {
      setPreviousValue(portfolioValue);
      setPortfolioValue((prev) => {
        const change = (Math.random() - 0.5) * 200;
        return Math.max(0, prev + change);
      });
    }, 5000);

    return () => clearInterval(interval);
  }, [portfolioValue]);

  // Demo transaction
  const handleDemoTransaction = () => {
    showTransaction({
      id: `demo-${Date.now()}`,
      type: 'swap',
      status: 'pending',
      amount: 10,
      token: 'SOL',
      timestamp: new Date(),
      message: 'Swapping 10 SOL for USDC',
    });
  };

  return (
    <div className="space-y-6">
      {/* Connection Status Bar */}
      <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
        <div className="flex items-center gap-4">
          <ConnectionStatus
            status={connectionStatus}
            reconnectAttempt={reconnectAttempt}
            maxReconnectAttempts={maxReconnectAttempts}
            onReconnect={reconnect}
            showDetails
          />
          <LiveDataBadge isLive={isConnected} />
        </div>
        <ConnectionIndicator status={connectionStatus} />
      </div>

      {/* Main Portfolio Card */}
      <Card className="relative p-6 overflow-hidden">
        {/* Update indicator */}
        <UpdateIndicator
          isUpdating={isConnected}
          lastUpdateTime={lastUpdate || undefined}
          type="pulse"
          position="top-right"
          color="green"
          showTime
        />

        <div className="space-y-6">
          {/* Portfolio Value with animations */}
          <div>
            <h2 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
              Total Portfolio Value
            </h2>
            <ValueUpdateAnimation
              value={portfolioValue}
              previousValue={previousValue}
              format="currency"
              showChange
              size="xl"
              className="mb-4"
            />
            
            {/* Mini sparkline */}
            <AnimatedSparkline
              data={sparklineData}
              width={150}
              height={40}
              color="#9945FF"
              animate
            />
          </div>

          {/* Price Ticker Strip */}
          <div>
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-3">
              Live Prices
            </h3>
            <PriceTickerStrip
              prices={[
                { symbol: 'SOL', price: 98.45, change24h: 5.2 },
                { symbol: 'BTC', price: 45230.50, change24h: -2.1 },
                { symbol: 'ETH', price: 2345.67, change24h: 3.5 },
              ]}
            />
          </div>

          {/* Token Holdings with live prices */}
          <div>
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-3">
              Your Tokens
            </h3>
            <div className="space-y-3">
              {tokens.map((token) => {
                const priceData = prices.get(token.mint);
                return (
                  <motion.div
                    key={token.mint}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                    whileHover={{ scale: 1.01 }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full" />
                      <div>
                        <p className="font-medium">{token.symbol}</p>
                        <p className="text-sm text-gray-500">{token.amount} tokens</p>
                      </div>
                    </div>
                    {priceData ? (
                      <PriceTicker
                        symbol=""
                        price={priceData.price * token.amount}
                        changePercent24h={priceData.change24h}
                        size="sm"
                        showTrend
                      />
                    ) : (
                      <AnimatedCounter
                        to={token.amount * 100}
                        format="currency"
                        duration={1000}
                      />
                    )}
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Activity Stream */}
          <div>
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-3">
              Recent Activity
            </h3>
            <ActivityStream activities={activities} />
          </div>

          {/* Demo Transaction Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleDemoTransaction}
            className="w-full py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg font-medium"
          >
            Trigger Demo Transaction
          </motion.button>
        </div>
      </Card>

      {/* Stats Grid with animated counters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: 'Total Assets', value: 15234.56, format: 'currency' as const },
          { label: 'Daily Change', value: 5.23, format: 'percent' as const },
          { label: 'Total Transactions', value: 342, format: 'number' as const },
        ].map((stat, index) => (
          <Card key={stat.label} className="p-4">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              {stat.label}
            </p>
            <AnimatedCounter
              to={stat.value}
              format={stat.format}
              decimals={stat.format === 'percent' ? 2 : 0}
              duration={1500}
              delay={index * 200}
              className="text-2xl font-bold"
            />
          </Card>
        ))}
      </div>
    </div>
  );
}