'use client';

import React from 'react';
import { Search, Filter, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

export type SortOption = 'value' | 'amount' | 'name' | 'apy' | 'protocol';
export type FilterType = 'all' | 'tokens' | 'staking' | 'lending' | 'liquidity';

interface PortfolioFiltersProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  sortBy: SortOption;
  onSortChange: (value: SortOption) => void;
  filterType: FilterType;
  onFilterTypeChange: (value: FilterType) => void;
  hideSmallBalances: boolean;
  onHideSmallBalancesChange: (value: boolean) => void;
  minValueThreshold?: number;
  showProtocolFilter?: boolean;
  protocols?: string[];
  selectedProtocol?: string;
  onProtocolChange?: (value: string) => void;
  showApySort?: boolean;
  className?: string;
}

export function PortfolioFilters({
  searchQuery,
  onSearchChange,
  sortBy,
  onSortChange,
  filterType,
  onFilterTypeChange,
  hideSmallBalances,
  onHideSmallBalancesChange,
  minValueThreshold = 1,
  showProtocolFilter = false,
  protocols = [],
  selectedProtocol = 'all',
  onProtocolChange,
  showApySort = false,
  className = '',
}: PortfolioFiltersProps) {
  const handleClearSearch = () => {
    onSearchChange('');
  };

  const sortOptions: { value: SortOption; label: string }[] = [
    { value: 'value', label: 'Value' },
    { value: 'amount', label: 'Amount' },
    { value: 'name', label: 'Name' },
  ];

  if (showApySort) {
    sortOptions.push({ value: 'apy', label: 'APY' });
  }

  if (showProtocolFilter) {
    sortOptions.push({ value: 'protocol', label: 'Protocol' });
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search tokens, protocols, or positions..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10 pr-10"
        />
        {searchQuery && (
          <button
            onClick={handleClearSearch}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Filter Controls */}
      <div className="flex flex-wrap gap-4">
        {/* Type Filter */}
        <div className="flex-1 min-w-[180px]">
          <Label htmlFor="filter-type" className="mb-2 text-sm">
            Filter by Type
          </Label>
          <Select value={filterType} onValueChange={onFilterTypeChange as any}>
            <SelectTrigger id="filter-type">
              <SelectValue placeholder="All items" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Items</SelectItem>
              <SelectItem value="tokens">Tokens Only</SelectItem>
              <SelectItem value="staking">Staking Positions</SelectItem>
              <SelectItem value="lending">Lending Positions</SelectItem>
              <SelectItem value="liquidity">Liquidity Pools</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Sort Options */}
        <div className="flex-1 min-w-[150px]">
          <Label htmlFor="sort-by" className="mb-2 text-sm">
            Sort by
          </Label>
          <Select value={sortBy} onValueChange={onSortChange as any}>
            <SelectTrigger id="sort-by">
              <SelectValue placeholder="Sort by..." />
            </SelectTrigger>
            <SelectContent>
              {sortOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Protocol Filter (Optional) */}
        {showProtocolFilter && protocols.length > 0 && (
          <div className="flex-1 min-w-[150px]">
            <Label htmlFor="protocol-filter" className="mb-2 text-sm">
              Protocol
            </Label>
            <Select value={selectedProtocol} onValueChange={onProtocolChange}>
              <SelectTrigger id="protocol-filter">
                <SelectValue placeholder="All protocols" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Protocols</SelectItem>
                {protocols.map((protocol) => (
                  <SelectItem key={protocol} value={protocol}>
                    {protocol}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Hide Small Balances Toggle */}
        <div className="flex items-end">
          <div className="flex items-center space-x-2">
            <Switch
              id="hide-small"
              checked={hideSmallBalances}
              onCheckedChange={onHideSmallBalancesChange}
            />
            <Label htmlFor="hide-small" className="text-sm cursor-pointer">
              Hide small (&lt; ${minValueThreshold})
            </Label>
          </div>
        </div>
      </div>

      {/* Active Filters Summary */}
      {(searchQuery || filterType !== 'all' || hideSmallBalances || (selectedProtocol && selectedProtocol !== 'all')) && (
        <div className="flex items-center gap-2 text-sm">
          <span className="text-muted-foreground">Active filters:</span>
          <div className="flex flex-wrap gap-2">
            {searchQuery && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-secondary rounded-md">
                Search: {searchQuery}
                <button onClick={handleClearSearch}>
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
            {filterType !== 'all' && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-secondary rounded-md">
                Type: {filterType}
                <button onClick={() => onFilterTypeChange('all')}>
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
            {hideSmallBalances && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-secondary rounded-md">
                Hiding small values
                <button onClick={() => onHideSmallBalancesChange(false)}>
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
            {selectedProtocol && selectedProtocol !== 'all' && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-secondary rounded-md">
                Protocol: {selectedProtocol}
                <button onClick={() => onProtocolChange?.('all')}>
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              onSearchChange('');
              onFilterTypeChange('all');
              onHideSmallBalancesChange(false);
              onProtocolChange?.('all');
            }}
          >
            Clear all
          </Button>
        </div>
      )}
    </div>
  );
}