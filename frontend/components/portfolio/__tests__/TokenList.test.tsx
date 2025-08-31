import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TokenList } from '../TokenList';
import { useWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';

// Mock the wallet adapter
jest.mock('@solana/wallet-adapter-react', () => ({
  useWallet: jest.fn(),
}));

// Mock fetch
global.fetch = jest.fn();

// Mock the PortfolioFilters component
jest.mock('@/components/filters/PortfolioFilters', () => ({
  PortfolioFilters: ({ 
    onSearchChange, 
    onSortChange, 
    onFilterTypeChange,
    onHideSmallBalancesChange,
    searchQuery,
    sortBy,
    filterType,
    hideSmallBalances
  }: any) => (
    <div data-testid="portfolio-filters">
      <input
        data-testid="search-input"
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder="Search"
      />
      <select
        data-testid="sort-select"
        value={sortBy}
        onChange={(e) => onSortChange(e.target.value)}
      >
        <option value="value">Value</option>
        <option value="amount">Amount</option>
        <option value="name">Name</option>
      </select>
      <select
        data-testid="filter-select"
        value={filterType}
        onChange={(e) => onFilterTypeChange(e.target.value)}
      >
        <option value="all">All</option>
        <option value="tokens">Tokens</option>
      </select>
      <input
        data-testid="hide-small-checkbox"
        type="checkbox"
        checked={hideSmallBalances}
        onChange={(e) => onHideSmallBalancesChange(e.target.checked)}
      />
    </div>
  ),
}));

const mockWalletBalances = {
  wallet: '7nYabs9dUhvxYBvNrEcVGS8CQ8YmQEWxBr9wJkkzhGdH',
  nativeSol: {
    amount: '1000000000',
    decimals: 9,
    uiAmount: 1,
  },
  tokens: [
    {
      mint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
      symbol: 'USDC',
      name: 'USD Coin',
      logoUri: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v/logo.png',
      balance: '100000000',
      decimals: 6,
      uiAmount: 100,
      valueUSD: 100,
      metadata: {
        symbol: 'USDC',
        name: 'USD Coin',
        logoUri: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v/logo.png',
      },
    },
    {
      mint: 'mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So',
      symbol: 'mSOL',
      name: 'Marinade Staked SOL',
      logoUri: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So/logo.png',
      balance: '500000000',
      decimals: 9,
      uiAmount: 0.5,
      valueUSD: 50,
      metadata: {
        symbol: 'mSOL',
        name: 'Marinade Staked SOL',
        logoUri: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So/logo.png',
      },
    },
    {
      mint: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA',
      symbol: 'DUST',
      name: 'Dust Token',
      balance: '1000',
      decimals: 3,
      uiAmount: 0.001,
      valueUSD: 0.5,
      metadata: {
        symbol: 'DUST',
        name: 'Dust Token',
      },
    },
  ],
  totalValueUSD: 250.5,
  lastUpdated: new Date().toISOString(),
};

describe('TokenList', () => {
  const mockPublicKey = new PublicKey('7nYabs9dUhvxYBvNrEcVGS8CQ8YmQEWxBr9wJkkzhGdH');

  beforeEach(() => {
    jest.clearAllMocks();
    (fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => mockWalletBalances,
    });
  });

  describe('Wallet Connection States', () => {
    it('shows connect wallet message when not connected', () => {
      (useWallet as jest.Mock).mockReturnValue({
        connected: false,
        publicKey: null,
      });

      render(<TokenList />);
      
      expect(screen.getByText(/Connect Your Wallet/i)).toBeInTheDocument();
      expect(screen.getByText(/Connect your Solana wallet to view your DeFi portfolio/i)).toBeInTheDocument();
    });

    it('fetches and displays tokens when wallet is connected', async () => {
      (useWallet as jest.Mock).mockReturnValue({
        connected: true,
        publicKey: mockPublicKey,
      });

      render(<TokenList />);

      await waitFor(() => {
        expect(screen.getByText('USDC')).toBeInTheDocument();
        expect(screen.getByText('mSOL')).toBeInTheDocument();
      });
    });
  });

  describe('Filtering Functionality', () => {
    beforeEach(() => {
      (useWallet as jest.Mock).mockReturnValue({
        connected: true,
        publicKey: mockPublicKey,
      });
    });

    it('filters tokens by search query', async () => {
      render(<TokenList />);

      await waitFor(() => {
        expect(screen.getByText('USDC')).toBeInTheDocument();
      });

      const searchInput = screen.getByTestId('search-input');
      await userEvent.type(searchInput, 'USDC');

      expect(screen.getByText('USDC')).toBeInTheDocument();
      expect(screen.queryByText('mSOL')).not.toBeInTheDocument();
      expect(screen.queryByText('DUST')).not.toBeInTheDocument();
    });

    it('filters out small balances when hide small is enabled', async () => {
      render(<TokenList />);

      await waitFor(() => {
        expect(screen.getByText('DUST')).toBeInTheDocument();
      });

      const hideSmallCheckbox = screen.getByTestId('hide-small-checkbox');
      fireEvent.click(hideSmallCheckbox);

      await waitFor(() => {
        expect(screen.queryByText('DUST')).not.toBeInTheDocument();
        expect(screen.getByText('USDC')).toBeInTheDocument();
        expect(screen.getByText('mSOL')).toBeInTheDocument();
      });
    });

    it('shows no tokens message when filter returns empty results', async () => {
      render(<TokenList />);

      await waitFor(() => {
        expect(screen.getByText('USDC')).toBeInTheDocument();
      });

      const searchInput = screen.getByTestId('search-input');
      await userEvent.type(searchInput, 'NONEXISTENT');

      expect(screen.getByText('No Results Found')).toBeInTheDocument();
      expect(screen.getByText(/No tokens match your current filters/i)).toBeInTheDocument();
    });

    it('includes SOL in the token list', async () => {
      render(<TokenList />);

      await waitFor(() => {
        expect(screen.getByText('SOL')).toBeInTheDocument();
        expect(screen.getByText('Solana')).toBeInTheDocument();
      });
    });
  });

  describe('Sorting Functionality', () => {
    beforeEach(() => {
      (useWallet as jest.Mock).mockReturnValue({
        connected: true,
        publicKey: mockPublicKey,
      });
    });

    it('sorts tokens by value by default', async () => {
      render(<TokenList />);

      await waitFor(() => {
        const tokens = screen.getAllByText(/USD Coin|Marinade Staked SOL|Solana|Dust Token/);
        expect(tokens).toHaveLength(4);
      });

      // Check that USDC (highest value) appears before DUST (lowest value)
      const allText = document.body.textContent || '';
      const usdcIndex = allText.indexOf('USD Coin');
      const dustIndex = allText.indexOf('Dust Token');
      expect(usdcIndex).toBeLessThan(dustIndex);
    });

    it('sorts tokens by name when selected', async () => {
      render(<TokenList />);

      await waitFor(() => {
        expect(screen.getByText('USDC')).toBeInTheDocument();
      });

      const sortSelect = screen.getByTestId('sort-select');
      fireEvent.change(sortSelect, { target: { value: 'name' } });

      await waitFor(() => {
        const allText = document.body.textContent || '';
        const dustIndex = allText.indexOf('DUST');
        const usdcIndex = allText.indexOf('USDC');
        // Alphabetically DUST comes before USDC
        expect(dustIndex).toBeLessThan(usdcIndex);
      });
    });
  });

  describe('Refresh Functionality', () => {
    beforeEach(() => {
      (useWallet as jest.Mock).mockReturnValue({
        connected: true,
        publicKey: mockPublicKey,
      });
    });

    it('refreshes token balances when refresh button is clicked', async () => {
      render(<TokenList />);

      await waitFor(() => {
        expect(screen.getByText('USDC')).toBeInTheDocument();
      });

      // Find the refresh button by looking for the button with RefreshCw icon
      const buttons = screen.getAllByRole('button');
      const refreshButton = buttons.find(button => 
        button.querySelector('svg.h-4.w-4') // RefreshCw icon has these classes
      );
      expect(refreshButton).toBeInTheDocument();
      
      fireEvent.click(refreshButton!);

      await waitFor(() => {
        expect(fetch).toHaveBeenCalledTimes(2); // Initial fetch + refresh
      });
    });

    it('shows loading spinner while refreshing', async () => {
      render(<TokenList />);

      await waitFor(() => {
        expect(screen.getByText('USDC')).toBeInTheDocument();
      });

      // Find the refresh button by looking for the button with RefreshCw icon
      const buttons = screen.getAllByRole('button');
      const refreshButton = buttons.find(button => 
        button.querySelector('svg.h-4.w-4') // RefreshCw icon has these classes
      );
      expect(refreshButton).toBeInTheDocument();
      
      // Mock a slow response for the refresh
      (fetch as jest.Mock).mockImplementationOnce(
        () => new Promise(resolve => setTimeout(() => resolve({
          ok: true,
          json: async () => mockWalletBalances,
        }), 100))
      );

      fireEvent.click(refreshButton!);

      // Check for spinning animation class
      expect(refreshButton!.querySelector('.animate-spin')).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    beforeEach(() => {
      (useWallet as jest.Mock).mockReturnValue({
        connected: true,
        publicKey: mockPublicKey,
      });
    });

    it('displays error message when fetch fails', async () => {
      (fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      render(<TokenList />);

      await waitFor(() => {
        // Check for the error title from EmptyState
        expect(screen.getByText('Something Went Wrong')).toBeInTheDocument();
        // The actual error message is passed as description
        expect(screen.getByText('Failed to load token balances')).toBeInTheDocument();
      });
    });

    it('shows retry button on error', async () => {
      (fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      render(<TokenList />);

      await waitFor(() => {
        expect(screen.getByText('Try Again')).toBeInTheDocument();
      });

      // Mock successful response for retry
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockWalletBalances,
      });

      const retryButton = screen.getByText('Try Again');
      fireEvent.click(retryButton);

      await waitFor(() => {
        expect(screen.getByText('USDC')).toBeInTheDocument();
      });
    });
  });

  describe('Token Display', () => {
    beforeEach(() => {
      (useWallet as jest.Mock).mockReturnValue({
        connected: true,
        publicKey: mockPublicKey,
      });
    });

    it('displays token information correctly', async () => {
      render(<TokenList />);

      await waitFor(() => {
        expect(screen.getByText('USDC')).toBeInTheDocument();
        expect(screen.getByText('USD Coin')).toBeInTheDocument();
        // Use getAllByText since there might be multiple values with $100.00
        const priceElements = screen.getAllByText('$100.00');
        expect(priceElements.length).toBeGreaterThan(0);
        expect(screen.getByText('100.00 USDC')).toBeInTheDocument();
      });
    });

    it('shows last updated time', async () => {
      render(<TokenList />);

      await waitFor(() => {
        expect(screen.getByText(/last updated:/i)).toBeInTheDocument();
      });
    });
  });
});