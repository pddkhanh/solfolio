'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  FilterPanel, 
  FilterDrawer,
  MobileFilterButton,
  useFilterDrawer,
  AnimatedFilterResults,
  useAdvancedFilters,
} from './index';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Smartphone, Monitor, Tablet, Eye, EyeOff } from 'lucide-react';

// Mock data for demonstration
const mockTokens = [
  {
    id: '1',
    name: 'Solana',
    symbol: 'SOL',
    value: 15000,
    amount: 150,
    price: 100,
    change24h: 5.2,
    type: 'native',
    protocol: 'solana',
    chain: 'solana',
    logo: '/logos/solana.svg',
  },
  {
    id: '2',
    name: 'Marinade Staked SOL',
    symbol: 'mSOL',
    value: 8000,
    amount: 78,
    price: 102.5,
    change24h: 5.8,
    type: 'spl',
    protocol: 'marinade',
    chain: 'solana',
    logo: '/logos/marinade.svg',
  },
  {
    id: '3',
    name: 'USD Coin',
    symbol: 'USDC',
    value: 5000,
    amount: 5000,
    price: 1.0,
    change24h: 0.1,
    type: 'stable',
    protocol: 'circle',
    chain: 'solana',
    logo: '/logos/usdc.svg',
  },
  {
    id: '4',
    name: 'Raydium LP Token',
    symbol: 'RAY-SOL LP',
    value: 2500,
    amount: 125,
    price: 20,
    change24h: -2.1,
    type: 'lp',
    protocol: 'raydium',
    chain: 'solana',
    logo: '/logos/raydium.svg',
  },
  {
    id: '5',
    name: 'Kamino Vault Token',
    symbol: 'KSOLUSDC',
    value: 1200,
    amount: 60,
    price: 20,
    change24h: 3.4,
    type: 'spl',
    protocol: 'kamino',
    chain: 'solana',
    logo: '/logos/kamino.svg',
  },
];

interface DemoTokenProps {
  token: typeof mockTokens[0];
  index: number;
}

function TokenCard({ token, index }: DemoTokenProps) {
  const changeColor = token.change24h >= 0 ? 'text-green-500' : 'text-red-500';
  
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-xs font-bold">{token.symbol.slice(0, 2)}</span>
            </div>
            <div>
              <div className="font-medium">{token.name}</div>
              <div className="text-sm text-muted-foreground">{token.symbol}</div>
            </div>
          </div>
          <Badge variant="outline" className="text-xs">
            {token.protocol}
          </Badge>
        </div>
        
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <div className="text-muted-foreground">Value</div>
            <div className="font-medium">${token.value.toLocaleString()}</div>
          </div>
          <div>
            <div className="text-muted-foreground">Amount</div>
            <div className="font-medium">{token.amount}</div>
          </div>
          <div>
            <div className="text-muted-foreground">Price</div>
            <div className="font-medium">${token.price}</div>
          </div>
          <div>
            <div className="text-muted-foreground">24h Change</div>
            <div className={`font-medium ${changeColor}`}>
              {token.change24h > 0 ? '+' : ''}{token.change24h}%
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function AdvancedFilteringDemo() {
  const [viewMode, setViewMode] = React.useState<'desktop' | 'mobile'>('desktop');
  const [showFilters, setShowFilters] = React.useState(true);
  const { isOpen, open, close } = useFilterDrawer();
  const { filters } = useAdvancedFilters();

  // Simple filtering logic for demo
  const filteredTokens = React.useMemo(() => {
    return mockTokens.filter(token => {
      // Search filter
      if (filters.searchQuery) {
        const query = filters.searchQuery.toLowerCase();
        if (!token.name.toLowerCase().includes(query) && 
            !token.symbol.toLowerCase().includes(query)) {
          return false;
        }
      }
      
      // Token type filter
      if (filters.tokenTypes.length > 0 && !filters.tokenTypes.includes(token.type as any)) {
        return false;
      }
      
      // Protocol filter
      if (filters.protocols.length > 0 && !filters.protocols.includes(token.protocol as any)) {
        return false;
      }
      
      // Value range filter
      if (filters.valueRange) {
        if (token.value < filters.valueRange.min || token.value > filters.valueRange.max) {
          return false;
        }
      }
      
      // Hide small balances
      if (filters.hideSmallBalances && token.value < 10) {
        return false;
      }
      
      return true;
    });
  }, [filters]);

  const EmptyState = () => (
    <div className="text-center py-12">
      <div className="text-muted-foreground mb-2">No tokens match your filters</div>
      <Button variant="outline" size="sm">
        Clear Filters
      </Button>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Demo Controls */}
      <div className="border-b bg-card p-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Advanced Filtering System Demo</h1>
              <p className="text-muted-foreground">TASK-UI-021 Implementation</p>
            </div>
            
            <div className="flex items-center gap-4">
              {/* View Mode Toggle */}
              <div className="flex items-center gap-2 p-1 bg-secondary rounded-lg">
                <Button
                  variant={viewMode === 'desktop' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('desktop')}
                  className="h-8 px-3"
                >
                  <Monitor className="w-4 h-4 mr-1" />
                  Desktop
                </Button>
                <Button
                  variant={viewMode === 'mobile' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('mobile')}
                  className="h-8 px-3"
                >
                  <Smartphone className="w-4 h-4 mr-1" />
                  Mobile
                </Button>
              </div>

              {/* Show/Hide Filters (Desktop only) */}
              {viewMode === 'desktop' && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowFilters(!showFilters)}
                >
                  {showFilters ? <EyeOff className="w-4 h-4 mr-1" /> : <Eye className="w-4 h-4 mr-1" />}
                  {showFilters ? 'Hide' : 'Show'} Filters
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4">
        {/* Desktop View */}
        {viewMode === 'desktop' && (
          <div className="grid grid-cols-12 gap-6">
            {/* Filter Panel */}
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="col-span-3"
              >
                <Card>
                  <CardContent className="p-0">
                    <FilterPanel
                      showQuickFilters={true}
                      collapsible={true}
                      defaultExpanded={true}
                    />
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Main Content */}
            <div className={showFilters ? 'col-span-9' : 'col-span-12'}>
              <div className="mb-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold">
                    Portfolio Assets ({filteredTokens.length})
                  </h2>
                  <Badge variant="outline">
                    Desktop View
                  </Badge>
                </div>
              </div>

              <AnimatedFilterResults
                items={filteredTokens}
                renderItem={(token, index) => (
                  <TokenCard key={token.id} token={token} index={index} />
                )}
                keyExtractor={(token) => token.id}
                filters={filters}
                className="grid gap-4 md:grid-cols-2"
                emptyState={<EmptyState />}
              />
            </div>
          </div>
        )}

        {/* Mobile View */}
        {viewMode === 'mobile' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold">
                  Portfolio Assets ({filteredTokens.length})
                </h2>
                <Badge variant="outline" className="mt-1">
                  Mobile View
                </Badge>
              </div>
              
              <MobileFilterButton
                onOpen={open}
                hasActiveFilters={filters.searchQuery !== '' || filters.tokenTypes.length > 0}
                activeFilterCount={2}
              />
            </div>

            <AnimatedFilterResults
              items={filteredTokens}
              renderItem={(token, index) => (
                <TokenCard key={token.id} token={token} index={index} />
              )}
              keyExtractor={(token) => token.id}
              filters={filters}
              className="space-y-4"
              emptyState={<EmptyState />}
            />

            {/* Mobile Filter Drawer */}
            <FilterDrawer
              isOpen={isOpen}
              onClose={close}
            />
          </div>
        )}

        {/* Feature Showcase */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Implemented Features (TASK-UI-021)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full" />
                Multi-select filters for token types, protocols, chains
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full" />
                Value range sliders for balance/value filtering
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full" />
                Chain filtering (Solana/multi-chain support)
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full" />
                Save filter presets functionality
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full" />
                Quick filter chips for common filters
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full" />
                Smooth animations with 60 FPS performance
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full" />
                Instant filter application with transitions
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full" />
                Clear filter indicators showing active filters
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full" />
                Mobile-friendly with touch-optimized controls
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full" />
                Collapsible sections with accessibility support
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full" />
                Responsive design (mobile/tablet/desktop)
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full" />
                TypeScript types with comprehensive testing
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}