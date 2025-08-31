/**
 * Tests for useAdvancedFilters hook - TASK-UI-021
 */

import { renderHook, act } from '@testing-library/react';
import { useAdvancedFilters } from '@/hooks/useAdvancedFilters';
import { DEFAULT_FILTER_STATE, FilterState } from '@/types/filters';

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
};
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

describe('useAdvancedFilters', () => {
  beforeEach(() => {
    localStorageMock.getItem.mockReturnValue(null);
    localStorageMock.setItem.mockClear();
  });

  it('initializes with default filter state', () => {
    const { result } = renderHook(() => useAdvancedFilters());

    expect(result.current.filters).toEqual(DEFAULT_FILTER_STATE);
    expect(result.current.hasActiveFilters).toBe(false);
    expect(result.current.activeFilterCount).toBe(0);
  });

  it('updates search query correctly', () => {
    const { result } = renderHook(() => useAdvancedFilters());

    act(() => {
      result.current.setSearchQuery('test query');
    });

    expect(result.current.filters.searchQuery).toBe('test query');
    expect(result.current.hasActiveFilters).toBe(true);
    expect(result.current.activeFilterCount).toBe(1);
  });

  it('updates token types correctly', () => {
    const { result } = renderHook(() => useAdvancedFilters());

    act(() => {
      result.current.setTokenTypes(['native', 'spl']);
    });

    expect(result.current.filters.tokenTypes).toEqual(['native', 'spl']);
    expect(result.current.hasActiveFilters).toBe(true);
    expect(result.current.activeFilterCount).toBe(1);
  });

  it('updates value range correctly', () => {
    const { result } = renderHook(() => useAdvancedFilters());
    const range = { min: 100, max: 1000 };

    act(() => {
      result.current.setValueRange(range);
    });

    expect(result.current.filters.valueRange).toEqual(range);
    expect(result.current.hasActiveFilters).toBe(true);
  });

  it('toggles boolean filters correctly', () => {
    const { result } = renderHook(() => useAdvancedFilters());

    act(() => {
      result.current.toggleHideSmallBalances();
    });

    expect(result.current.filters.hideSmallBalances).toBe(true);
    expect(result.current.hasActiveFilters).toBe(true);

    act(() => {
      result.current.toggleHideSmallBalances();
    });

    expect(result.current.filters.hideSmallBalances).toBe(false);
  });

  it('saves and loads presets correctly', () => {
    const { result } = renderHook(() => useAdvancedFilters());

    // Set some filters
    act(() => {
      result.current.setSearchQuery('test');
      result.current.setTokenTypes(['native']);
    });

    // Save preset
    act(() => {
      result.current.savePreset('Test Preset', 'A test preset');
    });

    expect(result.current.presets).toHaveLength(1);
    expect(result.current.presets[0].name).toBe('Test Preset');
    expect(result.current.presets[0].description).toBe('A test preset');
    expect(result.current.activePresetId).toBe(result.current.presets[0].id);

    // Reset filters
    act(() => {
      result.current.resetFilters();
    });

    expect(result.current.filters).toEqual(DEFAULT_FILTER_STATE);
    expect(result.current.activePresetId).toBe(null);

    // Load preset
    act(() => {
      result.current.loadPreset(result.current.presets[0].id);
    });

    expect(result.current.filters.searchQuery).toBe('test');
    expect(result.current.filters.tokenTypes).toEqual(['native']);
    expect(result.current.activePresetId).toBe(result.current.presets[0].id);
  });

  it('deletes presets correctly', () => {
    const { result } = renderHook(() => useAdvancedFilters());

    // Save a preset
    act(() => {
      result.current.savePreset('Test Preset');
    });

    const presetId = result.current.presets[0].id;
    expect(result.current.presets).toHaveLength(1);
    expect(result.current.activePresetId).toBe(presetId);

    // Delete preset
    act(() => {
      result.current.deletePreset(presetId);
    });

    expect(result.current.presets).toHaveLength(0);
    expect(result.current.activePresetId).toBe(null);
  });

  it('calculates active filter count correctly', () => {
    const { result } = renderHook(() => useAdvancedFilters());

    act(() => {
      result.current.setSearchQuery('test');
      result.current.setTokenTypes(['native']);
      result.current.setValueRange({ min: 0, max: 1000 });
      result.current.toggleHideSmallBalances();
    });

    expect(result.current.activeFilterCount).toBe(4);
    expect(result.current.hasActiveFilters).toBe(true);
  });

  it('clears all filters correctly', () => {
    const { result } = renderHook(() => useAdvancedFilters());

    // Set multiple filters
    act(() => {
      result.current.setSearchQuery('test');
      result.current.setTokenTypes(['native']);
      result.current.setValueRange({ min: 0, max: 1000 });
      result.current.toggleHideSmallBalances();
      result.current.setSortBy('name');
      result.current.setViewMode('grid');
    });

    expect(result.current.hasActiveFilters).toBe(true);

    // Clear all filters (should preserve sort and view settings)
    act(() => {
      result.current.clearAllFilters();
    });

    expect(result.current.filters.searchQuery).toBe('');
    expect(result.current.filters.tokenTypes).toEqual([]);
    expect(result.current.filters.valueRange).toBe(null);
    expect(result.current.filters.hideSmallBalances).toBe(false);
    expect(result.current.filters.sortBy).toBe('name'); // Preserved
    expect(result.current.filters.viewMode).toBe('grid'); // Preserved
    expect(result.current.hasActiveFilters).toBe(false);
  });

  it('applies partial filters correctly', () => {
    const { result } = renderHook(() => useAdvancedFilters());
    
    const partialFilters: Partial<FilterState> = {
      searchQuery: 'applied',
      tokenTypes: ['spl', 'wrapped'],
      hideSmallBalances: true,
    };

    act(() => {
      result.current.applyFilters(partialFilters);
    });

    expect(result.current.filters.searchQuery).toBe('applied');
    expect(result.current.filters.tokenTypes).toEqual(['spl', 'wrapped']);
    expect(result.current.filters.hideSmallBalances).toBe(true);
    expect(result.current.activePresetId).toBe(null);
  });

  it('persists state to localStorage', () => {
    const { result } = renderHook(() => useAdvancedFilters());

    act(() => {
      result.current.setSearchQuery('persist test');
    });

    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      'solfolio_filter_state',
      expect.stringContaining('"searchQuery":"persist test"')
    );
  });

  it('loads state from localStorage', () => {
    const storedState = {
      searchQuery: 'loaded query',
      tokenTypes: ['native'],
      hideSmallBalances: true,
    };

    localStorageMock.getItem.mockReturnValue(JSON.stringify(storedState));

    const { result } = renderHook(() => useAdvancedFilters());

    expect(result.current.filters.searchQuery).toBe('loaded query');
    expect(result.current.filters.tokenTypes).toEqual(['native']);
    expect(result.current.filters.hideSmallBalances).toBe(true);
  });

  it('handles localStorage errors gracefully', () => {
    localStorageMock.getItem.mockImplementation(() => {
      throw new Error('Storage error');
    });

    // Should not throw and should use default state
    const { result } = renderHook(() => useAdvancedFilters());

    expect(result.current.filters).toEqual(DEFAULT_FILTER_STATE);
  });

  it('provides filter and sort utility functions', () => {
    const { result } = renderHook(() => useAdvancedFilters());

    const items = [
      { id: 1, name: 'A', value: 100 },
      { id: 2, name: 'B', value: 200 },
      { id: 3, name: 'C', value: 50 },
    ];

    // Test filterItems
    const filteredItems = result.current.filterItems(items, item => item.value > 75);
    expect(filteredItems).toHaveLength(2);
    expect(filteredItems.map(i => i.id)).toEqual([1, 2]);

    // Test sortItems with ascending order
    act(() => {
      result.current.setSortOrder('asc');
    });

    const sortedItems = result.current.sortItems(items, (a, b) => a.value - b.value);
    expect(sortedItems.map(i => i.id)).toEqual([3, 1, 2]);

    // Test sortItems with descending order
    act(() => {
      result.current.setSortOrder('desc');
    });

    const sortedItemsDesc = result.current.sortItems(items, (a, b) => a.value - b.value);
    expect(sortedItemsDesc.map(i => i.id)).toEqual([2, 1, 3]);
  });
});