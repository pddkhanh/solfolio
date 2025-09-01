'use client';

import { useState, useCallback, useEffect, useMemo } from 'react';
import { 
  FilterState, 
  FilterPreset, 
  DEFAULT_FILTER_STATE,
  TokenType,
  ProtocolType,
  ChainType,
  PositionType,
  ValueRange,
} from '@/types/filters';

const STORAGE_KEY = 'solfolio_filter_state';
const PRESETS_STORAGE_KEY = 'solfolio_filter_presets';

export interface UseAdvancedFiltersReturn {
  filters: FilterState;
  presets: FilterPreset[];
  activePresetId: string | null;
  
  // Filter setters
  setSearchQuery: (query: string) => void;
  setTokenTypes: (types: TokenType[]) => void;
  setProtocols: (protocols: ProtocolType[]) => void;
  setChains: (chains: ChainType[]) => void;
  setPositionTypes: (types: PositionType[]) => void;
  setValueRange: (range: ValueRange | null) => void;
  setApyRange: (range: ValueRange | null) => void;
  toggleHideSmallBalances: () => void;
  toggleHideZeroBalances: () => void;
  toggleShowOnlyStaked: () => void;
  toggleShowOnlyActive: () => void;
  setSortBy: (sortBy: FilterState['sortBy']) => void;
  setSortOrder: (order: 'asc' | 'desc') => void;
  setViewMode: (mode: FilterState['viewMode']) => void;
  setGroupBy: (groupBy: FilterState['groupBy']) => void;
  
  // Preset management
  savePreset: (name: string, description?: string) => void;
  loadPreset: (presetId: string) => void;
  deletePreset: (presetId: string) => void;
  updatePreset: (presetId: string, updates: Partial<FilterPreset>) => void;
  
  // Utility functions
  resetFilters: () => void;
  clearAllFilters: () => void;
  applyFilters: (filters: Partial<FilterState>) => void;
  hasActiveFilters: boolean;
  activeFilterCount: number;
  
  // Filter application
  filterItems: <T>(items: T[], filterFn: (item: T) => boolean) => T[];
  sortItems: <T>(items: T[], sortFn: (a: T, b: T) => number) => T[];
}

export function useAdvancedFilters(): UseAdvancedFiltersReturn {
  // Load initial state from localStorage
  const loadStoredState = (): FilterState => {
    if (typeof window === 'undefined') return DEFAULT_FILTER_STATE;
    
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return { ...DEFAULT_FILTER_STATE, ...JSON.parse(stored) };
      }
    } catch (error) {
      console.error('Failed to load filter state:', error);
    }
    
    return DEFAULT_FILTER_STATE;
  };

  const loadStoredPresets = (): FilterPreset[] => {
    if (typeof window === 'undefined') return [];
    
    try {
      const stored = localStorage.getItem(PRESETS_STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error('Failed to load filter presets:', error);
    }
    
    return [];
  };

  const [filters, setFilters] = useState<FilterState>(loadStoredState);
  const [presets, setPresets] = useState<FilterPreset[]>(loadStoredPresets);
  const [activePresetId, setActivePresetId] = useState<string | null>(null);

  // Persist state to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(filters));
    }
  }, [filters]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(PRESETS_STORAGE_KEY, JSON.stringify(presets));
    }
  }, [presets]);

  // Filter update functions
  const setSearchQuery = useCallback((query: string) => {
    setFilters(prev => ({ ...prev, searchQuery: query }));
  }, []);

  const setTokenTypes = useCallback((types: TokenType[]) => {
    setFilters(prev => ({ ...prev, tokenTypes: types }));
  }, []);

  const setProtocols = useCallback((protocols: ProtocolType[]) => {
    setFilters(prev => ({ ...prev, protocols }));
  }, []);

  const setChains = useCallback((chains: ChainType[]) => {
    setFilters(prev => ({ ...prev, chains }));
  }, []);

  const setPositionTypes = useCallback((types: PositionType[]) => {
    setFilters(prev => ({ ...prev, positionTypes: types }));
  }, []);

  const setValueRange = useCallback((range: ValueRange | null) => {
    setFilters(prev => ({ ...prev, valueRange: range }));
  }, []);

  const setApyRange = useCallback((range: ValueRange | null) => {
    setFilters(prev => ({ ...prev, apyRange: range }));
  }, []);

  const toggleHideSmallBalances = useCallback(() => {
    setFilters(prev => ({ ...prev, hideSmallBalances: !prev.hideSmallBalances }));
  }, []);

  const toggleHideZeroBalances = useCallback(() => {
    setFilters(prev => ({ ...prev, hideZeroBalances: !prev.hideZeroBalances }));
  }, []);

  const toggleShowOnlyStaked = useCallback(() => {
    setFilters(prev => ({ ...prev, showOnlyStaked: !prev.showOnlyStaked }));
  }, []);

  const toggleShowOnlyActive = useCallback(() => {
    setFilters(prev => ({ ...prev, showOnlyActive: !prev.showOnlyActive }));
  }, []);

  const setSortBy = useCallback((sortBy: FilterState['sortBy']) => {
    setFilters(prev => ({ ...prev, sortBy }));
  }, []);

  const setSortOrder = useCallback((order: 'asc' | 'desc') => {
    setFilters(prev => ({ ...prev, sortOrder: order }));
  }, []);

  const setViewMode = useCallback((mode: FilterState['viewMode']) => {
    setFilters(prev => ({ ...prev, viewMode: mode }));
  }, []);

  const setGroupBy = useCallback((groupBy: FilterState['groupBy']) => {
    setFilters(prev => ({ ...prev, groupBy }));
  }, []);

  // Preset management
  const savePreset = useCallback((name: string, description?: string) => {
    const newPreset: FilterPreset = {
      id: `preset_${Date.now()}`,
      name,
      description,
      filters: { ...filters },
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    setPresets(prev => [...prev, newPreset]);
    setActivePresetId(newPreset.id);
  }, [filters]);

  const loadPreset = useCallback((presetId: string) => {
    const preset = presets.find(p => p.id === presetId);
    if (preset) {
      setFilters(prev => ({ ...prev, ...preset.filters }));
      setActivePresetId(presetId);
    }
  }, [presets]);

  const deletePreset = useCallback((presetId: string) => {
    setPresets(prev => prev.filter(p => p.id !== presetId));
    if (activePresetId === presetId) {
      setActivePresetId(null);
    }
  }, [activePresetId]);

  const updatePreset = useCallback((presetId: string, updates: Partial<FilterPreset>) => {
    setPresets(prev => prev.map(p => 
      p.id === presetId 
        ? { ...p, ...updates, updatedAt: new Date() }
        : p
    ));
  }, []);

  // Utility functions
  const resetFilters = useCallback(() => {
    setFilters(DEFAULT_FILTER_STATE);
    setActivePresetId(null);
  }, []);

  const clearAllFilters = useCallback(() => {
    setFilters({
      ...DEFAULT_FILTER_STATE,
      sortBy: filters.sortBy,
      sortOrder: filters.sortOrder,
      viewMode: filters.viewMode,
      groupBy: filters.groupBy,
    });
    setActivePresetId(null);
  }, [filters.sortBy, filters.sortOrder, filters.viewMode, filters.groupBy]);

  const applyFilters = useCallback((newFilters: Partial<FilterState>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setActivePresetId(null);
  }, []);

  // Calculate active filter count
  const { hasActiveFilters, activeFilterCount } = useMemo(() => {
    let count = 0;
    
    if (filters.searchQuery) count++;
    if (filters.tokenTypes.length > 0) count++;
    if (filters.protocols.length > 0) count++;
    if (filters.chains.length > 0) count++;
    if (filters.positionTypes.length > 0) count++;
    if (filters.valueRange) count++;
    if (filters.apyRange) count++;
    if (filters.hideSmallBalances) count++;
    // Only count hideZeroBalances if it's different from default
    if (filters.hideZeroBalances !== DEFAULT_FILTER_STATE.hideZeroBalances) count++;
    if (filters.showOnlyStaked) count++;
    if (filters.showOnlyActive) count++;
    
    return {
      hasActiveFilters: count > 0,
      activeFilterCount: count,
    };
  }, [filters]);

  // Filter and sort utility functions
  const filterItems = useCallback(<T,>(items: T[], filterFn: (item: T) => boolean): T[] => {
    return items.filter(filterFn);
  }, []);

  const sortItems = useCallback(<T,>(items: T[], sortFn: (a: T, b: T) => number): T[] => {
    const sorted = [...items].sort(sortFn);
    return filters.sortOrder === 'desc' ? sorted.reverse() : sorted;
  }, [filters.sortOrder]);

  return {
    filters,
    presets,
    activePresetId,
    
    // Filter setters
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
    
    // Preset management
    savePreset,
    loadPreset,
    deletePreset,
    updatePreset,
    
    // Utility functions
    resetFilters,
    clearAllFilters,
    applyFilters,
    hasActiveFilters,
    activeFilterCount,
    
    // Filter application
    filterItems,
    sortItems,
  };
}