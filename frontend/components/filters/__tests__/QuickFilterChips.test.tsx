/**
 * Tests for QuickFilterChips component - TASK-UI-021
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QuickFilterChips, QuickFilterChipsCompact } from '../QuickFilterChips';
import { DEFAULT_FILTER_STATE, QUICK_FILTERS, TokenType } from '@/types/filters';

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    button: ({ children, onClick, variants, initial, animate, exit, transition, whileHover, whileTap, ...props }: any) => (
      <button onClick={onClick} {...props}>
        {children}
      </button>
    ),
    div: ({ children, initial, animate, exit, transition, ...props }: any) => <div {...props}>{children}</div>,
    span: ({ children, initial, animate, ...props }: any) => <span {...props}>{children}</span>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

describe('QuickFilterChips', () => {
  const mockOnApplyFilter = jest.fn();
  const defaultProps = {
    onApplyFilter: mockOnApplyFilter,
    activeFilters: DEFAULT_FILTER_STATE,
  };

  beforeEach(() => {
    mockOnApplyFilter.mockClear();
  });

  it('renders all quick filter chips', () => {
    render(<QuickFilterChips {...defaultProps} />);

    // Initially shows first 4 filters
    const visibleFilters = QUICK_FILTERS.slice(0, 4);
    visibleFilters.forEach(filter => {
      expect(screen.getByText(filter.label)).toBeInTheDocument();
    });

    // Click show more to see all filters
    const showMoreButton = screen.getByText(/\+\d+ more/);
    fireEvent.click(showMoreButton);

    // Now all filters should be visible
    QUICK_FILTERS.forEach(filter => {
      expect(screen.getByText(filter.label)).toBeInTheDocument();
    });
  });

  it('applies filter when chip is clicked', () => {
    render(<QuickFilterChips {...defaultProps} />);

    const highValueFilter = screen.getByText('High Value');
    fireEvent.click(highValueFilter);

    expect(mockOnApplyFilter).toHaveBeenCalledWith(
      expect.objectContaining({
        valueRange: { min: 1000, max: Number.MAX_SAFE_INTEGER },
        sortBy: 'value',
        sortOrder: 'desc',
      })
    );
  });

  it('removes filter when active chip is clicked again', () => {
    render(<QuickFilterChips {...defaultProps} />);

    const stakingFilter = screen.getByText('Staking');
    
    // Apply filter
    fireEvent.click(stakingFilter);
    expect(mockOnApplyFilter).toHaveBeenCalledWith(
      expect.objectContaining({
        positionTypes: ['staking'],
        showOnlyStaked: true,
      })
    );

    // Remove filter
    fireEvent.click(stakingFilter);
    expect(mockOnApplyFilter).toHaveBeenCalledWith(
      expect.objectContaining({
        positionTypes: [],
        showOnlyStaked: false,
      })
    );
  });

  it('shows clear all button when filters are selected', () => {
    render(<QuickFilterChips {...defaultProps} />);

    const stakingFilter = screen.getByText('Staking');
    fireEvent.click(stakingFilter);

    expect(screen.getByText('Clear all')).toBeInTheDocument();
  });

  it('clears all quick filters when clear all is clicked', () => {
    render(<QuickFilterChips {...defaultProps} />);

    // Select multiple filters
    fireEvent.click(screen.getByText('Staking'));
    fireEvent.click(screen.getByText('High Value'));

    // Clear all
    fireEvent.click(screen.getByText('Clear all'));

    expect(mockOnApplyFilter).toHaveBeenCalledWith({
      valueRange: null,
      apyRange: null,
      positionTypes: [],
      chains: [],
      showOnlyStaked: false,
    });
  });

  it('shows expanded filters when show more is clicked', () => {
    render(<QuickFilterChips {...defaultProps} />);

    // Initially should show only first 4 filters
    const showMoreButton = screen.getByText(/\+\d+ more/);
    expect(showMoreButton).toBeInTheDocument();

    fireEvent.click(showMoreButton);

    // Should now show all filters
    expect(screen.getByText('Show less')).toBeInTheDocument();
  });

  it('handles custom filters', () => {
    const customFilters = [
      {
        id: 'custom-test',
        label: 'Custom Test',
        filters: { searchQuery: 'custom' },
        color: 'primary' as const,
      },
    ];

    render(
      <QuickFilterChips 
        {...defaultProps} 
        showCustom={true}
        customFilters={customFilters}
      />
    );

    // Custom filter is added after the default filters, so expand to see it
    const showMoreButton = screen.getByText(/\+\d+ more/);
    fireEvent.click(showMoreButton);

    expect(screen.getByText('Custom Test')).toBeInTheDocument();
  });
});

describe('QuickFilterChipsCompact', () => {
  const mockOnApplyFilter = jest.fn();
  const defaultProps = {
    onApplyFilter: mockOnApplyFilter,
    activeFilters: DEFAULT_FILTER_STATE,
  };

  beforeEach(() => {
    mockOnApplyFilter.mockClear();
  });

  it('renders trigger button', () => {
    render(<QuickFilterChipsCompact {...defaultProps} />);

    expect(screen.getByText('Quick Filters')).toBeInTheDocument();
  });

  it('shows active filter count badge', () => {
    const activeFilters = {
      ...DEFAULT_FILTER_STATE,
      searchQuery: 'test',
      tokenTypes: ['native' as TokenType],
    };

    render(
      <QuickFilterChipsCompact 
        {...defaultProps} 
        activeFilters={activeFilters}
      />
    );

    // Should show badge with count (mocked as 2 in component)
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('opens menu when button is clicked', () => {
    render(<QuickFilterChipsCompact {...defaultProps} />);

    const triggerButton = screen.getByText('Quick Filters').closest('button');
    fireEvent.click(triggerButton!);

    // Should show the full QuickFilterChips component
    QUICK_FILTERS.slice(0, 4).forEach(filter => {
      expect(screen.getByText(filter.label)).toBeInTheDocument();
    });
  });
});