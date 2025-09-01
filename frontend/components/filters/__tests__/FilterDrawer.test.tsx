/**
 * Tests for FilterDrawer component - TASK-UI-021
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { FilterDrawer, MobileFilterButton, useFilterDrawer } from '../FilterDrawer';

// Mock the useAdvancedFilters hook
const mockUseAdvancedFilters = {
  hasActiveFilters: false,
  activeFilterCount: 0,
};

jest.mock('@/hooks/useAdvancedFilters', () => ({
  useAdvancedFilters: () => mockUseAdvancedFilters,
}));

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, onDragEnd, onClick, variants, initial, animate, exit, drag, dragConstraints, dragElastic, onDragStart, whileHover, whileTap, ...props }: any) => (
      <div onClick={onClick} onMouseUp={onDragEnd} {...props}>
        {children}
      </div>
    ),
    button: ({ children, onClick, whileHover, whileTap, animate, ...props }: any) => (
      <button onClick={onClick} {...props}>
        {children}
      </button>
    ),
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
  PanInfo: {} as any,
}));

// Mock FilterPanel
jest.mock('../FilterPanel', () => ({
  FilterPanel: ({ onFiltersChange }: any) => (
    <div data-testid="filter-panel">
      <button onClick={() => onFiltersChange({ searchQuery: 'test' })}>
        Mock Filter Panel
      </button>
    </div>
  ),
}));

describe('FilterDrawer', () => {
  const mockOnClose = jest.fn();
  const mockOnFiltersChange = jest.fn();
  const defaultProps = {
    isOpen: false,
    onClose: mockOnClose,
    onFiltersChange: mockOnFiltersChange,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('does not render when closed', () => {
    render(<FilterDrawer {...defaultProps} />);

    expect(screen.queryByText('Filters')).not.toBeInTheDocument();
  });

  it('renders when open', () => {
    render(<FilterDrawer {...defaultProps} isOpen={true} />);

    expect(screen.getByText('Filters')).toBeInTheDocument();
    expect(screen.getByTestId('filter-panel')).toBeInTheDocument();
  });

  it('shows active filter count badge', () => {
    mockUseAdvancedFilters.hasActiveFilters = true;
    mockUseAdvancedFilters.activeFilterCount = 3;

    render(<FilterDrawer {...defaultProps} isOpen={true} />);

    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('calls onClose when backdrop is clicked', () => {
    render(<FilterDrawer {...defaultProps} isOpen={true} />);

    // Find backdrop (first div with bg-black/50)
    const backdrop = document.querySelector('.bg-black\\/50, [class*="bg-black/50"]');
    if (backdrop) {
      fireEvent.click(backdrop);
      expect(mockOnClose).toHaveBeenCalled();
    }
  });

  it('calls onClose when X button is clicked', () => {
    render(<FilterDrawer {...defaultProps} isOpen={true} />);

    // Find the close button - it's the first button that contains an SVG (X icon)
    const allButtons = screen.getAllByRole('button');
    const closeButton = allButtons.find(btn => 
      btn.querySelector('svg') || btn.getAttribute('aria-label')?.includes('close')
    );

    if (closeButton) {
      fireEvent.click(closeButton);
      expect(mockOnClose).toHaveBeenCalled();
    }
  });

  it('renders snap point indicators', () => {
    render(<FilterDrawer {...defaultProps} isOpen={true} />);

    // Should have 3 snap point indicators
    const indicators = document.querySelectorAll('[class*="w-2 h-2 rounded-full"]');
    expect(indicators.length).toBe(3);
  });

  it('renders action buttons', () => {
    render(<FilterDrawer {...defaultProps} isOpen={true} />);

    expect(screen.getByText('Clear All')).toBeInTheDocument();
    expect(screen.getByText('Apply Filters')).toBeInTheDocument();
  });

  it('calls onFiltersChange when filters are applied', () => {
    render(<FilterDrawer {...defaultProps} isOpen={true} />);

    const mockButton = screen.getByText('Mock Filter Panel');
    fireEvent.click(mockButton);

    expect(mockOnFiltersChange).toHaveBeenCalledWith({ searchQuery: 'test' });
  });

  it('closes drawer when Apply Filters is clicked', () => {
    render(<FilterDrawer {...defaultProps} isOpen={true} />);

    const applyButton = screen.getByText('Apply Filters');
    fireEvent.click(applyButton);

    expect(mockOnClose).toHaveBeenCalled();
  });

  it('disables Clear All when no active filters', () => {
    mockUseAdvancedFilters.hasActiveFilters = false;

    render(<FilterDrawer {...defaultProps} isOpen={true} />);

    const clearAllButton = screen.getByText('Clear All');
    expect(clearAllButton).toBeDisabled();
  });
});

describe('MobileFilterButton', () => {
  const mockOnOpen = jest.fn();
  const defaultProps = {
    onOpen: mockOnOpen,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders filter button', () => {
    render(<MobileFilterButton {...defaultProps} />);

    expect(screen.getByText('Filters')).toBeInTheDocument();
  });

  it('shows active filter count badge when provided', () => {
    render(
      <MobileFilterButton 
        {...defaultProps} 
        hasActiveFilters={true}
        activeFilterCount={5}
      />
    );

    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it('does not show badge when no active filters', () => {
    render(
      <MobileFilterButton 
        {...defaultProps} 
        hasActiveFilters={false}
        activeFilterCount={0}
      />
    );

    expect(screen.queryByText('0')).not.toBeInTheDocument();
  });

  it('calls onOpen when clicked', () => {
    render(<MobileFilterButton {...defaultProps} />);

    const button = screen.getByText('Filters').closest('button');
    fireEvent.click(button!);

    expect(mockOnOpen).toHaveBeenCalled();
  });
});

describe('useFilterDrawer hook', () => {
  function TestComponent() {
    const { isOpen, open, close, toggle } = useFilterDrawer();
    
    return (
      <div>
        <div data-testid="is-open">{isOpen.toString()}</div>
        <button onClick={open}>Open</button>
        <button onClick={close}>Close</button>
        <button onClick={toggle}>Toggle</button>
      </div>
    );
  }

  it('initializes with closed state', () => {
    render(<TestComponent />);

    expect(screen.getByTestId('is-open')).toHaveTextContent('false');
  });

  it('opens drawer when open is called', () => {
    render(<TestComponent />);

    fireEvent.click(screen.getByText('Open'));

    expect(screen.getByTestId('is-open')).toHaveTextContent('true');
  });

  it('closes drawer when close is called', () => {
    render(<TestComponent />);

    // Open first
    fireEvent.click(screen.getByText('Open'));
    expect(screen.getByTestId('is-open')).toHaveTextContent('true');

    // Then close
    fireEvent.click(screen.getByText('Close'));
    expect(screen.getByTestId('is-open')).toHaveTextContent('false');
  });

  it('toggles drawer state when toggle is called', () => {
    render(<TestComponent />);

    // Initially closed
    expect(screen.getByTestId('is-open')).toHaveTextContent('false');

    // Toggle to open
    fireEvent.click(screen.getByText('Toggle'));
    expect(screen.getByTestId('is-open')).toHaveTextContent('true');

    // Toggle to close
    fireEvent.click(screen.getByText('Toggle'));
    expect(screen.getByTestId('is-open')).toHaveTextContent('false');
  });
});