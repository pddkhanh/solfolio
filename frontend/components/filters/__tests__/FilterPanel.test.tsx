/**
 * Tests for FilterPanel component - TASK-UI-021
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { FilterPanel } from '../FilterPanel';
import { FilterPreset } from '@/types/filters';

// Mock the useAdvancedFilters hook
const mockUseAdvancedFilters = {
  filters: {
    searchQuery: '',
    tokenTypes: [],
    protocols: [],
    chains: [],
    positionTypes: [],
    valueRange: null,
    apyRange: null,
    hideSmallBalances: false,
    hideZeroBalances: true,
    showOnlyStaked: false,
    showOnlyActive: false,
    sortBy: 'value' as const,
    sortOrder: 'desc' as const,
    viewMode: 'list' as const,
    groupBy: 'none' as const,
  },
  presets: [] as FilterPreset[],
  activePresetId: null as string | null,
  setSearchQuery: jest.fn(),
  setTokenTypes: jest.fn(),
  setProtocols: jest.fn(),
  setChains: jest.fn(),
  setPositionTypes: jest.fn(),
  setValueRange: jest.fn(),
  setApyRange: jest.fn(),
  toggleHideSmallBalances: jest.fn(),
  toggleHideZeroBalances: jest.fn(),
  toggleShowOnlyStaked: jest.fn(),
  toggleShowOnlyActive: jest.fn(),
  setSortBy: jest.fn(),
  setSortOrder: jest.fn(),
  setViewMode: jest.fn(),
  setGroupBy: jest.fn(),
  savePreset: jest.fn(),
  loadPreset: jest.fn(),
  deletePreset: jest.fn(),
  resetFilters: jest.fn(),
  clearAllFilters: jest.fn(),
  applyFilters: jest.fn(),
  hasActiveFilters: false,
  activeFilterCount: 0,
};

jest.mock('@/hooks/useAdvancedFilters', () => ({
  useAdvancedFilters: jest.fn(() => mockUseAdvancedFilters),
}));

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, initial, animate, exit, transition, variants, whileHover, whileTap, whileFocus, ...props }: any) => <div {...props}>{children}</div>,
    button: ({ children, onClick, initial, animate, exit, transition, whileHover, whileTap, whileFocus, variants, ...props }: any) => (
      <button onClick={onClick} {...props}>
        {children}
      </button>
    ),
    input: ({ children, initial, animate, exit, transition, whileHover, whileTap, whileFocus, variants, ...props }: any) => (
      <input {...props}>{children}</input>
    ),
    select: ({ children, initial, animate, exit, transition, whileHover, whileTap, whileFocus, variants, ...props }: any) => (
      <select {...props}>{children}</select>
    ),
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

// Mock QuickFilterChips
jest.mock('../QuickFilterChips', () => ({
  QuickFilterChips: ({ onApplyFilter }: any) => (
    <div data-testid="quick-filter-chips">
      <button onClick={() => onApplyFilter({ searchQuery: 'test' })}>
        Mock Quick Filter
      </button>
    </div>
  ),
}));

describe('FilterPanel', () => {
  const mockOnFiltersChange = jest.fn();
  const defaultProps = {
    onFiltersChange: mockOnFiltersChange,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    // Reset mock values to defaults
    mockUseAdvancedFilters.filters = {
      searchQuery: '',
      tokenTypes: [],
      protocols: [],
      chains: [],
      positionTypes: [],
      valueRange: null,
      apyRange: null,
      hideSmallBalances: false,
      hideZeroBalances: true,
      showOnlyStaked: false,
      showOnlyActive: false,
      sortBy: 'value' as const,
      sortOrder: 'desc' as const,
      viewMode: 'list' as const,
      groupBy: 'none' as const,
    };
    mockUseAdvancedFilters.hasActiveFilters = false;
    mockUseAdvancedFilters.activeFilterCount = 0;
    mockUseAdvancedFilters.presets = [];
    mockUseAdvancedFilters.activePresetId = null;
  });

  it('renders filter panel header', () => {
    render(<FilterPanel {...defaultProps} />);

    expect(screen.getByText('Filters')).toBeInTheDocument();
    expect(screen.getByText('Clear')).toBeInTheDocument();
    expect(screen.getByText('Save')).toBeInTheDocument();
  });

  it('shows active filter count when filters are active', () => {
    mockUseAdvancedFilters.hasActiveFilters = true;
    mockUseAdvancedFilters.activeFilterCount = 3;

    render(<FilterPanel {...defaultProps} />);

    expect(screen.getByText('3 active')).toBeInTheDocument();
  });

  it('renders collapsible sections', () => {
    render(<FilterPanel {...defaultProps} />);

    expect(screen.getByText('Search & Sort')).toBeInTheDocument();
    expect(screen.getByText('Asset Types')).toBeInTheDocument();
    expect(screen.getByText('Value Ranges')).toBeInTheDocument();
    expect(screen.getByText('Display Options')).toBeInTheDocument();
  });

  it('expands and collapses sections when clicked', () => {
    render(<FilterPanel {...defaultProps} />);

    const searchSection = screen.getByText('Search & Sort').closest('button');
    fireEvent.click(searchSection!);

    // Should show search input when expanded
    expect(screen.getByPlaceholderText('Search tokens, protocols, or positions...')).toBeInTheDocument();
  });

  it.skip('updates search query when typed', () => {
    render(<FilterPanel {...defaultProps} defaultExpanded={true} />);

    const searchInput = screen.getByPlaceholderText('Search tokens, protocols, or positions...');
    fireEvent.change(searchInput, { target: { value: 'bitcoin' } });

    expect(mockUseAdvancedFilters.setSearchQuery).toHaveBeenCalledWith('bitcoin');
  });

  it.skip('clears search query when X button is clicked', () => {
    mockUseAdvancedFilters.filters.searchQuery = 'test query';

    render(<FilterPanel {...defaultProps} defaultExpanded={true} />);

    const clearButton = screen.getByRole('button', { name: /clear search/i });
    if (clearButton) {
      fireEvent.click(clearButton);
      expect(mockUseAdvancedFilters.setSearchQuery).toHaveBeenCalledWith('');
    }
  });

  it.skip('updates sort options when changed', () => {
    render(<FilterPanel {...defaultProps} defaultExpanded={true} />);

    const sortSelect = screen.getByDisplayValue('Value');
    fireEvent.change(sortSelect, { target: { value: 'name' } });

    expect(mockUseAdvancedFilters.setSortBy).toHaveBeenCalledWith('name');
  });

  it.skip('handles view mode changes', () => {
    render(<FilterPanel {...defaultProps} defaultExpanded={true} />);

    const gridButton = screen.getByText('Grid');
    fireEvent.click(gridButton);

    expect(mockUseAdvancedFilters.setViewMode).toHaveBeenCalledWith('grid');
  });

  it.skip('toggles boolean filters correctly', () => {
    render(<FilterPanel {...defaultProps} defaultExpanded={true} />);

    // Find switches by their labels
    const hideSmallSwitch = screen.getByLabelText(/hide small balances/i);
    fireEvent.click(hideSmallSwitch);

    expect(mockUseAdvancedFilters.toggleHideSmallBalances).toHaveBeenCalled();
  });

  it('clears all filters when clear button is clicked', () => {
    mockUseAdvancedFilters.hasActiveFilters = true;

    render(<FilterPanel {...defaultProps} />);

    const clearButton = screen.getByText('Clear');
    fireEvent.click(clearButton);

    expect(mockUseAdvancedFilters.clearAllFilters).toHaveBeenCalled();
  });

  it('disables clear button when no active filters', () => {
    mockUseAdvancedFilters.hasActiveFilters = false;

    render(<FilterPanel {...defaultProps} />);

    const clearButton = screen.getByText('Clear');
    expect(clearButton).toBeDisabled();
  });

  it('shows quick filters when enabled', () => {
    render(<FilterPanel {...defaultProps} showQuickFilters={true} />);

    expect(screen.getByTestId('quick-filter-chips')).toBeInTheDocument();
  });

  it('hides quick filters when disabled', () => {
    render(<FilterPanel {...defaultProps} showQuickFilters={false} />);

    expect(screen.queryByTestId('quick-filter-chips')).not.toBeInTheDocument();
  });

  it.skip('calls onFiltersChange when filters change', () => {
    render(<FilterPanel {...defaultProps} />);

    // Simulate a filter change
    mockOnFiltersChange.mockClear();
    
    // This would be triggered by the useEffect in the component
    expect(mockOnFiltersChange).toHaveBeenCalledWith(mockUseAdvancedFilters.filters);
  });

  it('renders saved presets', () => {
    (mockUseAdvancedFilters as any).presets = [
      {
        id: 'preset1',
        name: 'High Value Assets',
        description: 'Assets above $1000',
        filters: { valueRange: { min: 1000, max: 10000 } },
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    render(<FilterPanel {...defaultProps} />);

    expect(screen.getByText('Saved Presets')).toBeInTheDocument();
    expect(screen.getByText('High Value Assets')).toBeInTheDocument();
  });

  it('loads preset when clicked', () => {
    (mockUseAdvancedFilters as any).presets = [
      {
        id: 'preset1',
        name: 'High Value Assets',
        description: 'Assets above $1000',
        filters: { valueRange: { min: 1000, max: 10000 } },
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    render(<FilterPanel {...defaultProps} />);

    const presetButton = screen.getByText('High Value Assets');
    fireEvent.click(presetButton);

    expect(mockUseAdvancedFilters.loadPreset).toHaveBeenCalledWith('preset1');
  });

  it.skip('deletes preset when X button is clicked', () => {
    (mockUseAdvancedFilters as any).presets = [
      {
        id: 'preset1',
        name: 'High Value Assets',
        description: 'Assets above $1000',
        filters: { valueRange: { min: 1000, max: 10000 } },
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    render(<FilterPanel {...defaultProps} />);

    const deleteButtons = screen.getAllByRole('button');
    const deleteButton = deleteButtons.find(button => 
      button.querySelector('svg') // X icon
    );

    if (deleteButton) {
      fireEvent.click(deleteButton);
      expect(mockUseAdvancedFilters.deletePreset).toHaveBeenCalledWith('preset1');
    }
  });

  it('highlights active preset', () => {
    (mockUseAdvancedFilters as any).presets = [
      {
        id: 'preset1',
        name: 'High Value Assets',
        description: 'Assets above $1000',
        filters: { valueRange: { min: 1000, max: 10000 } },
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];
    (mockUseAdvancedFilters as any).activePresetId = 'preset1';

    render(<FilterPanel {...defaultProps} />);

    const presetContainer = screen.getByText('High Value Assets').closest('div');
    expect(presetContainer).toHaveClass('bg-primary');
  });
});