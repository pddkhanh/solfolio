'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { PullToRefresh } from '@/components/ui/pull-to-refresh';
import { SwipeableRow } from '@/components/ui/swipeable-row';
import { LongPressMenu, QuickActionsMenu } from '@/components/ui/long-press-menu';
import { TouchChart } from '@/components/ui/touch-chart';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Send, 
  Repeat, 
  Star, 
  Share2, 
  Copy, 
  Trash2,
  Edit2,
  ChevronRight,
  Smartphone,
  Hand,
  Move,
  Maximize2,
  RefreshCw
} from 'lucide-react';
import { formatUSD } from '@/lib/utils';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';

// Sample data for chart
const chartData = Array.from({ length: 24 }, (_, i) => ({
  time: `${i}:00`,
  value: 10000 + Math.random() * 5000 + (i * 100)
}));

// Sample token data
const sampleTokens = [
  { symbol: 'SOL', name: 'Solana', value: 5234.56, change: 5.2 },
  { symbol: 'USDC', name: 'USD Coin', value: 2500.00, change: 0.1 },
  { symbol: 'RAY', name: 'Raydium', value: 1234.78, change: -2.3 },
  { symbol: 'ORCA', name: 'Orca', value: 876.54, change: 12.5 },
];

export default function TouchDemoPage() {
  const [refreshing, setRefreshing] = useState(false);
  const [lastAction, setLastAction] = useState<string>('');
  const [favoriteTokens, setFavoriteTokens] = useState<Set<string>>(new Set());

  const handleRefresh = async () => {
    setRefreshing(true);
    setLastAction('Refreshing data...');
    await new Promise(resolve => setTimeout(resolve, 2000));
    setRefreshing(false);
    setLastAction('Data refreshed!');
  };

  const handleAction = (action: string, symbol?: string) => {
    setLastAction(`${action}${symbol ? ` ${symbol}` : ''}`);
  };

  const toggleFavorite = (symbol: string) => {
    setFavoriteTokens(prev => {
      const newSet = new Set(prev);
      if (newSet.has(symbol)) {
        newSet.delete(symbol);
        handleAction('Removed from favorites:', symbol);
      } else {
        newSet.add(symbol);
        handleAction('Added to favorites:', symbol);
      }
      return newSet;
    });
  };

  return (
    <div className="min-h-screen bg-background p-4 pb-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl mx-auto space-y-6"
      >
        {/* Header */}
        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Smartphone className="w-6 h-6 text-primary" />
              Touch Interactions Demo
            </CardTitle>
            <CardDescription>
              Test touch-optimized components on mobile devices
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Hand className="w-4 h-4 text-muted-foreground" />
                <span>Swipe left/right on tokens</span>
              </div>
              <div className="flex items-center gap-2">
                <RefreshCw className="w-4 h-4 text-muted-foreground" />
                <span>Pull down to refresh</span>
              </div>
              <div className="flex items-center gap-2">
                <Move className="w-4 h-4 text-muted-foreground" />
                <span>Long press for menu</span>
              </div>
              <div className="flex items-center gap-2">
                <Maximize2 className="w-4 h-4 text-muted-foreground" />
                <span>Pinch to zoom charts</span>
              </div>
            </div>
            
            {lastAction && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mt-4 p-3 bg-primary/10 rounded-lg border border-primary/20"
              >
                <p className="text-sm font-medium">Last Action:</p>
                <p className="text-xs text-muted-foreground">{lastAction}</p>
              </motion.div>
            )}
          </CardContent>
        </Card>

        {/* Pull to Refresh Demo */}
        <PullToRefresh
          onRefresh={handleRefresh}
          disabled={refreshing}
        >
          <Card className="border-secondary/20">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Token List</CardTitle>
                <Badge variant="outline">
                  Pull to refresh
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-2 p-0">
              {sampleTokens.map((token) => (
                <QuickActionsMenu
                  key={token.symbol}
                  onCopy={() => handleAction('Copied address:', token.symbol)}
                  onShare={() => handleAction('Shared:', token.symbol)}
                  onFavorite={() => toggleFavorite(token.symbol)}
                  isFavorite={favoriteTokens.has(token.symbol)}
                  onEdit={() => handleAction('Edit:', token.symbol)}
                  onDelete={() => handleAction('Delete:', token.symbol)}
                >
                  <SwipeableRow
                    leftAction={{
                      icon: <Send className="w-5 h-5" />,
                      label: 'Send',
                      color: '#9945FF',
                      onAction: () => handleAction('Send:', token.symbol)
                    }}
                    rightAction={{
                      icon: <Repeat className="w-5 h-5" />,
                      label: 'Swap',
                      color: '#14F195',
                      onAction: () => handleAction('Swap:', token.symbol)
                    }}
                    hapticFeedback={true}
                  >
                    <div className="flex items-center justify-between p-4 bg-background">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                          <span className="text-xs font-bold text-white">
                            {token.symbol.slice(0, 2)}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium">{token.symbol}</p>
                          <p className="text-xs text-muted-foreground">{token.name}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{formatUSD(token.value)}</p>
                        <p className={`text-xs ${token.change > 0 ? 'text-green-500' : 'text-red-500'}`}>
                          {token.change > 0 ? '+' : ''}{token.change}%
                        </p>
                      </div>
                      {favoriteTokens.has(token.symbol) && (
                        <Star className="w-4 h-4 text-yellow-500 fill-current absolute top-2 right-2" />
                      )}
                    </div>
                  </SwipeableRow>
                </QuickActionsMenu>
              ))}
            </CardContent>
          </Card>
        </PullToRefresh>

        {/* Touch Chart Demo */}
        <Card className="border-accent/20">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Interactive Chart</CardTitle>
              <Badge variant="outline">
                Pinch to zoom
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <TouchChart
              enablePinchZoom={true}
              enableDoubleTapZoom={true}
              showZoomControls={true}
            >
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#9945FF" stopOpacity={0.4} />
                      <stop offset="100%" stopColor="#14F195" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis dataKey="time" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="#9945FF"
                    fill="url(#gradient)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </TouchChart>
          </CardContent>
        </Card>

        {/* Touch Targets Demo */}
        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle className="text-lg">Touch-Friendly Buttons</CardTitle>
            <CardDescription>
              All interactive elements have minimum 44px touch targets
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              <Button 
                variant="outline" 
                className="min-h-[44px]"
                onClick={() => handleAction('Button clicked')}
              >
                Action
              </Button>
              <Button 
                variant="secondary" 
                className="min-h-[44px]"
                onClick={() => handleAction('Button clicked')}
              >
                Secondary
              </Button>
              <Button 
                variant="ghost" 
                className="min-h-[44px]"
                onClick={() => handleAction('Button clicked')}
              >
                Ghost
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Instructions */}
        <Card className="border-muted">
          <CardHeader>
            <CardTitle className="text-lg">Instructions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex gap-3">
              <ChevronRight className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
              <p>
                <strong>Swipe tokens:</strong> Swipe left to swap, right to send
              </p>
            </div>
            <div className="flex gap-3">
              <ChevronRight className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
              <p>
                <strong>Long press tokens:</strong> Opens context menu with more actions
              </p>
            </div>
            <div className="flex gap-3">
              <ChevronRight className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
              <p>
                <strong>Pull to refresh:</strong> Pull down from the top of the token list
              </p>
            </div>
            <div className="flex gap-3">
              <ChevronRight className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
              <p>
                <strong>Pinch chart:</strong> Pinch to zoom in/out, double tap to reset
              </p>
            </div>
            <div className="flex gap-3">
              <ChevronRight className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
              <p>
                <strong>Haptic feedback:</strong> Feel vibrations on supported devices
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}