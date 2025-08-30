import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PortfolioFilters } from '../PortfolioFilters';

describe('PortfolioFilters', () => {
  const defaultProps = {
    searchQuery: '',
    onSearchChange: jest.fn(),
    sortBy: 'value' as const,
    onSortChange: jest.fn(),
    filterType: 'all' as const,
    onFilterTypeChange: jest.fn(),
    hideSmallBalances: false,
    onHideSmallBalancesChange: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Search Functionality', () => {
    it('renders search input', () => {
      render(<PortfolioFilters {...defaultProps} />);
      const searchInput = screen.getByPlaceholderText(/search tokens, protocols, or positions/i);
      expect(searchInput).toBeInTheDocument();
    });

    it('calls onSearchChange when typing in search', async () => {
      render(<PortfolioFilters {...defaultProps} />);
      const searchInput = screen.getByPlaceholderText(/search tokens, protocols, or positions/i);
      
      await userEvent.type(searchInput, 'SOL');
      
      expect(defaultProps.onSearchChange).toHaveBeenCalledWith('S');
      expect(defaultProps.onSearchChange).toHaveBeenCalledWith('SO');
      expect(defaultProps.onSearchChange).toHaveBeenCalledWith('SOL');
    });

    it('shows clear button when search has value', () => {
      render(<PortfolioFilters {...defaultProps} searchQuery="test" />);
      const clearButton = screen.getByRole('button', { hidden: true });
      expect(clearButton).toBeInTheDocument();
    });

    it('clears search when clear button is clicked', () => {
      render(<PortfolioFilters {...defaultProps} searchQuery="test" />);
      const clearButton = screen.getByRole('button', { hidden: true });
      
      fireEvent.click(clearButton);
      
      expect(defaultProps.onSearchChange).toHaveBeenCalledWith('');
    });
  });

  describe('Sort Functionality', () => {
    it('renders sort dropdown with default options', () => {
      render(<PortfolioFilters {...defaultProps} />);
      
      expect(screen.getByText('Sort by')).toBeInTheDocument();
      expect(screen.getByText('Value')).toBeInTheDocument();
    });

    it('shows APY sort option when showApySort is true', () => {
      render(<PortfolioFilters {...defaultProps} showApySort={true} />);
      
      const sortTrigger = screen.getByRole('combobox', { name: /sort by/i });
      fireEvent.click(sortTrigger);
      
      expect(screen.getByText('APY')).toBeInTheDocument();
    });

    it('shows Protocol sort option when showProtocolFilter is true', () => {
      render(<PortfolioFilters {...defaultProps} showProtocolFilter={true} />);
      
      const sortTrigger = screen.getByRole('combobox', { name: /sort by/i });
      fireEvent.click(sortTrigger);
      
      expect(screen.getByText('Protocol')).toBeInTheDocument();
    });
  });

  describe('Filter Type Functionality', () => {
    it('renders filter type dropdown', () => {
      render(<PortfolioFilters {...defaultProps} />);
      
      expect(screen.getByText('Filter by Type')).toBeInTheDocument();
      expect(screen.getByText('All Items')).toBeInTheDocument();
    });

    it('shows all filter type options when clicked', () => {
      render(<PortfolioFilters {...defaultProps} />);
      
      const filterTrigger = screen.getByRole('combobox', { name: /filter by type/i });
      fireEvent.click(filterTrigger);
      
      expect(screen.getByText('Tokens Only')).toBeInTheDocument();
      expect(screen.getByText('Staking Positions')).toBeInTheDocument();
      expect(screen.getByText('Lending Positions')).toBeInTheDocument();
      expect(screen.getByText('Liquidity Pools')).toBeInTheDocument();
    });
  });

  describe('Protocol Filter', () => {
    const protocols = ['Marinade', 'Kamino', 'Orca'];

    it('shows protocol filter when showProtocolFilter is true', () => {
      render(
        <PortfolioFilters
          {...defaultProps}
          showProtocolFilter={true}
          protocols={protocols}
          selectedProtocol="all"
          onProtocolChange={jest.fn()}
        />
      );
      
      expect(screen.getByText('Protocol')).toBeInTheDocument();
    });

    it('shows protocol options when clicked', () => {
      const onProtocolChange = jest.fn();
      render(
        <PortfolioFilters
          {...defaultProps}
          showProtocolFilter={true}
          protocols={protocols}
          selectedProtocol="all"
          onProtocolChange={onProtocolChange}
        />
      );
      
      const protocolTrigger = screen.getByRole('combobox', { name: /protocol/i });
      fireEvent.click(protocolTrigger);
      
      expect(screen.getByText('All Protocols')).toBeInTheDocument();
      protocols.forEach(protocol => {
        expect(screen.getByText(protocol)).toBeInTheDocument();
      });
    });
  });

  describe('Hide Small Balances Toggle', () => {
    it('renders hide small balances toggle', () => {
      render(<PortfolioFilters {...defaultProps} />);
      
      const toggle = screen.getByRole('switch', { name: /hide small/i });
      expect(toggle).toBeInTheDocument();
      expect(screen.getByText(/Hide small \(< \$1\)/)).toBeInTheDocument();
    });

    it('shows custom threshold when provided', () => {
      render(<PortfolioFilters {...defaultProps} minValueThreshold={10} />);
      
      expect(screen.getByText(/Hide small \(< \$10\)/)).toBeInTheDocument();
    });

    it('calls onHideSmallBalancesChange when toggled', () => {
      render(<PortfolioFilters {...defaultProps} />);
      
      const toggle = screen.getByRole('switch', { name: /hide small/i });
      fireEvent.click(toggle);
      
      expect(defaultProps.onHideSmallBalancesChange).toHaveBeenCalledWith(true);
    });
  });

  describe('Active Filters Summary', () => {
    it('shows active filters when filters are applied', () => {
      render(
        <PortfolioFilters
          {...defaultProps}
          searchQuery="SOL"
          filterType="staking"
          hideSmallBalances={true}
        />
      );
      
      expect(screen.getByText('Active filters:')).toBeInTheDocument();
      expect(screen.getByText('Search: SOL')).toBeInTheDocument();
      expect(screen.getByText('Type: staking')).toBeInTheDocument();
      expect(screen.getByText('Hiding small values')).toBeInTheDocument();
    });

    it('does not show active filters section when no filters applied', () => {
      render(<PortfolioFilters {...defaultProps} />);
      
      expect(screen.queryByText('Active filters:')).not.toBeInTheDocument();
    });

    it('clears all filters when Clear all button is clicked', () => {
      const props = {
        ...defaultProps,
        searchQuery: 'SOL',
        filterType: 'staking' as const,
        hideSmallBalances: true,
        selectedProtocol: 'Marinade',
        onProtocolChange: jest.fn(),
      };
      
      render(<PortfolioFilters {...props} />);
      
      const clearAllButton = screen.getByText('Clear all');
      fireEvent.click(clearAllButton);
      
      expect(props.onSearchChange).toHaveBeenCalledWith('');
      expect(props.onFilterTypeChange).toHaveBeenCalledWith('all');
      expect(props.onHideSmallBalancesChange).toHaveBeenCalledWith(false);
      expect(props.onProtocolChange).toHaveBeenCalledWith('all');
    });

    it('removes individual filter when X is clicked', () => {
      render(
        <PortfolioFilters
          {...defaultProps}
          searchQuery="SOL"
          filterType="staking"
        />
      );
      
      // Find the X button next to "Search: SOL"
      const searchFilterChip = screen.getByText('Search: SOL').parentElement;
      const clearSearchButton = searchFilterChip?.querySelector('button');
      
      if (clearSearchButton) {
        fireEvent.click(clearSearchButton);
        expect(defaultProps.onSearchChange).toHaveBeenCalledWith('');
      }
      
      // Find the X button next to "Type: staking"
      const typeFilterChip = screen.getByText('Type: staking').parentElement;
      const clearTypeButton = typeFilterChip?.querySelector('button');
      
      if (clearTypeButton) {
        fireEvent.click(clearTypeButton);
        expect(defaultProps.onFilterTypeChange).toHaveBeenCalledWith('all');
      }
    });
  });

  describe('Accessibility', () => {
    it('has proper labels for form controls', () => {
      render(<PortfolioFilters {...defaultProps} />);
      
      expect(screen.getByLabelText(/filter by type/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/sort by/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/hide small/i)).toBeInTheDocument();
    });

    it('supports keyboard navigation', async () => {
      render(<PortfolioFilters {...defaultProps} />);
      
      const searchInput = screen.getByPlaceholderText(/search tokens, protocols, or positions/i);
      searchInput.focus();
      
      // Tab to next control
      await userEvent.tab();
      
      // Should focus on filter type dropdown
      const filterDropdown = screen.getByRole('combobox', { name: /filter by type/i });
      expect(filterDropdown).toHaveFocus();
    });
  });
});