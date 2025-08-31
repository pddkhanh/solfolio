'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronDown, 
  Filter, 
  Search, 
  X, 
  Save, 
  Trash2,
  RotateCcw,
  SlidersHorizontal,
  Eye,
  EyeOff,
  Layers,
  Grid3x3,
  List,
  LayoutGrid,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MultiSelect, MultiSelectChips } from '@/components/ui/multi-select';
import { RangeSlider } from '@/components/ui/range-slider';
import { QuickFilterChips } from './QuickFilterChips';
import { 
  FilterState,
  TOKEN_TYPE_INFO,
  PROTOCOL_INFO,
  TokenType,
  ProtocolType,
  ChainType,
  PositionType,
} from '@/types/filters';
import { useAdvancedFilters } from '@/hooks/useAdvancedFilters';

interface FilterPanelProps {
  className?: string;
  onFiltersChange?: (filters: FilterState) => void;
  showQuickFilters?: boolean;
  collapsible?: boolean;
  defaultExpanded?: boolean;
}

interface FilterSection {
  id: string;
  title: string;
  icon: React.ReactNode;
  content: React.ReactNode;
}

export function FilterPanel({
  className,
  onFiltersChange,
  showQuickFilters = true,
  collapsible = true,
  defaultExpanded = false,
}: FilterPanelProps) {
  const {
    filters,
    presets,
    activePresetId,
    setSearchQuery,
    setTokenTypes,
    setProtocols,
    setChains,
    setPositionTypes,
    setValueRange,
    setApyRange,
    toggleHideSmallBalances,
    toggleHideZeroBalances,
    toggleShowOnlyStaked,
    toggleShowOnlyActive,
    setSortBy,
    setSortOrder,
    setViewMode,
    setGroupBy,
    savePreset,
    loadPreset,
    deletePreset,
    resetFilters,
    clearAllFilters,
    applyFilters,
    hasActiveFilters,
    activeFilterCount,
  } = useAdvancedFilters();

  const [expandedSections, setExpandedSections] = React.useState<Set<string>>(
    new Set(defaultExpanded ? ['search', 'types', 'values', 'display'] : [])
  );
  const [showPresetDialog, setShowPresetDialog] = React.useState(false);
  const [presetName, setPresetName] = React.useState('');

  React.useEffect(() => {
    onFiltersChange?.(filters);
  }, [filters, onFiltersChange]);

  const toggleSection = (sectionId: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId);
    } else {
      newExpanded.add(sectionId);
    }
    setExpandedSections(newExpanded);
  };

  const handleSavePreset = () => {
    if (presetName.trim()) {
      savePreset(presetName.trim());
      setPresetName('');
      setShowPresetDialog(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatPercent = (value: number) => `${value}%`;

  const sections: FilterSection[] = [
    {
      id: 'search',
      title: 'Search & Sort',
      icon: <Search className="h-4 w-4" />,
      content: (
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search tokens, protocols, or positions..."
              value={filters.searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-10"
            />
            {filters.searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-xs">Sort By</Label>
              <select
                value={filters.sortBy}
                onChange={(e) => setSortBy(e.target.value as FilterState['sortBy'])}
                className="w-full mt-1 rounded-md border bg-background px-3 py-2 text-sm"
              >
                <option value="value">Value</option>
                <option value="amount">Amount</option>
                <option value="name">Name</option>
                <option value="apy">APY</option>
                <option value="protocol">Protocol</option>
                <option value="change24h">24h Change</option>
                <option value="allocation">Allocation</option>
              </select>
            </div>

            <div>
              <Label className="text-xs">Order</Label>
              <select
                value={filters.sortOrder}
                onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
                className="w-full mt-1 rounded-md border bg-background px-3 py-2 text-sm"
              >
                <option value="desc">High to Low</option>
                <option value="asc">Low to High</option>
              </select>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'types',
      title: 'Asset Types',
      icon: <Layers className="h-4 w-4" />,
      content: (
        <div className="space-y-4">
          <div>
            <Label className="text-xs mb-2 block">Token Types</Label>
            <MultiSelectChips
              options={Object.entries(TOKEN_TYPE_INFO).map(([value, info]) => ({
                value,
                label: info.label,
              }))}
              selected={filters.tokenTypes}
              onChange={(values: string[]) => setTokenTypes(values as TokenType[])}
            />
          </div>

          <div>
            <Label className="text-xs mb-2 block">Protocols</Label>
            <MultiSelect
              options={Object.entries(PROTOCOL_INFO).map(([value, info]) => ({
                value,
                label: info.name,
                color: info.color,
              }))}
              selected={filters.protocols}
              onChange={(values: string[]) => setProtocols(values as ProtocolType[])}
              placeholder="Select protocols..."
              showBadges={true}
            />
          </div>

          <div>
            <Label className="text-xs mb-2 block">Position Types</Label>
            <MultiSelectChips
              options={[
                { value: 'staking', label: 'Staking' },
                { value: 'lending', label: 'Lending' },
                { value: 'liquidity', label: 'Liquidity' },
                { value: 'farming', label: 'Farming' },
                { value: 'vault', label: 'Vault' },
              ]}
              selected={filters.positionTypes}
              onChange={(values: string[]) => setPositionTypes(values as PositionType[])}
            />
          </div>

          <div>
            <Label className="text-xs mb-2 block">Chains</Label>
            <MultiSelectChips
              options={[
                { value: 'solana', label: 'Solana' },
                { value: 'ethereum', label: 'Ethereum' },
                { value: 'polygon', label: 'Polygon' },
                { value: 'arbitrum', label: 'Arbitrum' },
                { value: 'optimism', label: 'Optimism' },
              ]}
              selected={filters.chains}
              onChange={(values: string[]) => setChains(values as ChainType[])}
            />
          </div>
        </div>
      ),
    },
    {
      id: 'values',
      title: 'Value Ranges',
      icon: <SlidersHorizontal className="h-4 w-4" />,
      content: (
        <div className="space-y-6">
          <RangeSlider
            label="Value Range (USD)"
            min={0}
            max={100000}
            step={100}
            value={filters.valueRange ? [filters.valueRange.min, filters.valueRange.max] : [0, 100000]}
            onValueChange={(range) => setValueRange({ min: range[0], max: range[1] })}
            formatValue={formatCurrency}
            showInput={true}
          />

          <RangeSlider
            label="APY Range (%)"
            min={0}
            max={100}
            step={1}
            value={filters.apyRange ? [filters.apyRange.min, filters.apyRange.max] : [0, 100]}
            onValueChange={(range) => setApyRange({ min: range[0], max: range[1] })}
            formatValue={formatPercent}
            showInput={true}
          />

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="hide-small" className="text-sm cursor-pointer">
                Hide small balances (&lt; $10)
              </Label>
              <Switch
                id="hide-small"
                checked={filters.hideSmallBalances}
                onCheckedChange={toggleHideSmallBalances}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="hide-zero" className="text-sm cursor-pointer">
                Hide zero balances
              </Label>
              <Switch
                id="hide-zero"
                checked={filters.hideZeroBalances}
                onCheckedChange={toggleHideZeroBalances}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="staked-only" className="text-sm cursor-pointer">
                Show only staked
              </Label>
              <Switch
                id="staked-only"
                checked={filters.showOnlyStaked}
                onCheckedChange={toggleShowOnlyStaked}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="active-only" className="text-sm cursor-pointer">
                Show only active
              </Label>
              <Switch
                id="active-only"
                checked={filters.showOnlyActive}
                onCheckedChange={toggleShowOnlyActive}
              />
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'display',
      title: 'Display Options',
      icon: <Eye className="h-4 w-4" />,
      content: (
        <div className="space-y-4">
          <div>
            <Label className="text-xs mb-2 block">View Mode</Label>
            <div className="flex gap-2">
              <Button
                variant={filters.viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
                className="flex-1"
              >
                <List className="h-4 w-4 mr-1" />
                List
              </Button>
              <Button
                variant={filters.viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className="flex-1"
              >
                <Grid3x3 className="h-4 w-4 mr-1" />
                Grid
              </Button>
              <Button
                variant={filters.viewMode === 'compact' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('compact')}
                className="flex-1"
              >
                <LayoutGrid className="h-4 w-4 mr-1" />
                Compact
              </Button>
            </div>
          </div>

          <div>
            <Label className="text-xs mb-2 block">Group By</Label>
            <select
              value={filters.groupBy}
              onChange={(e) => setGroupBy(e.target.value as FilterState['groupBy'])}
              className="w-full rounded-md border bg-background px-3 py-2 text-sm"
            >
              <option value="none">No Grouping</option>
              <option value="protocol">Protocol</option>
              <option value="type">Asset Type</option>
              <option value="chain">Chain</option>
            </select>
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className={cn('space-y-4', className)}>
      {/* Header with actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="h-5 w-5 text-muted-foreground" />
          <h2 className="text-lg font-semibold">Filters</h2>
          {hasActiveFilters && (
            <Badge variant="secondary" className="ml-2">
              {activeFilterCount} active
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAllFilters}
            disabled={!hasActiveFilters}
          >
            <RotateCcw className="h-4 w-4 mr-1" />
            Clear
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowPresetDialog(true)}
          >
            <Save className="h-4 w-4 mr-1" />
            Save
          </Button>
        </div>
      </div>

      {/* Quick Filters */}
      {showQuickFilters && (
        <QuickFilterChips
          onApplyFilter={applyFilters}
          activeFilters={filters}
        />
      )}

      {/* Collapsible Sections */}
      <div className="space-y-2">
        {sections.map((section) => (
          <motion.div
            key={section.id}
            className="border rounded-lg overflow-hidden"
            initial={false}
          >
            <button
              onClick={() => toggleSection(section.id)}
              className="w-full flex items-center justify-between p-3 hover:bg-secondary/50 transition-colors"
            >
              <div className="flex items-center gap-2">
                {section.icon}
                <span className="font-medium text-sm">{section.title}</span>
              </div>
              <motion.div
                animate={{ rotate: expandedSections.has(section.id) ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronDown className="h-4 w-4" />
              </motion.div>
            </button>

            <AnimatePresence initial={false}>
              {expandedSections.has(section.id) && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="border-t"
                >
                  <div className="p-4">
                    {section.content}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>

      {/* Presets */}
      {presets.length > 0 && (
        <div className="border rounded-lg p-3">
          <Label className="text-xs mb-2 block">Saved Presets</Label>
          <div className="flex flex-wrap gap-2">
            {presets.map((preset) => (
              <div
                key={preset.id}
                className={cn(
                  'flex items-center gap-1 rounded-md border px-2 py-1 text-sm',
                  activePresetId === preset.id
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary/50'
                )}
              >
                <button
                  onClick={() => loadPreset(preset.id)}
                  className="hover:underline"
                >
                  {preset.name}
                </button>
                <button
                  onClick={() => deletePreset(preset.id)}
                  className="ml-1 hover:text-destructive"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Import Badge component
import { Badge } from '@/components/ui/badge';