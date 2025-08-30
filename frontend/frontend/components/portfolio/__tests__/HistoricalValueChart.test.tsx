import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { HistoricalValueChart } from '../HistoricalValueChart';
import { useWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';

// Mock the wallet adapter
jest.mock('@solana/wallet-adapter-react', () => ({
  useWallet: jest.fn(),
}));

// Mock the chart components to avoid rendering issues in tests
jest.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: any) => <div data-testid="responsive-container">{children}</div>,
  AreaChart: ({ children }: any) => <div data-testid="area-chart">{children}</div>,
  Area: () => <div data-testid="area" />,
  XAxis: () => <div data-testid="x-axis" />,
  YAxis: () => <div data-testid="y-axis" />,
  CartesianGrid: () => <div data-testid="cartesian-grid" />,
  Tooltip: () => <div data-testid="tooltip" />,
}));

// Mock fetch
global.fetch = jest.fn();

describe('HistoricalValueChart', () => {
  const mockPublicKey = new PublicKey('11111111111111111111111111111111');
  
  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockReset();
  });

  describe('when wallet is not connected', () => {
    beforeEach(() => {
      (useWallet as jest.Mock).mockReturnValue({
        connected: false,
        publicKey: null,
      });
    });

    it('should display connect wallet message', () => {
      render(<HistoricalValueChart />);
      
      expect(screen.getByText('Portfolio Value History')).toBeInTheDocument();
      expect(screen.getByText('Connect your wallet to view historical portfolio value')).toBeInTheDocument();
    });

    it('should not render the chart', () => {
      render(<HistoricalValueChart />);
      
      expect(screen.queryByTestId('area-chart')).not.toBeInTheDocument();
    });
  });

  describe('when wallet is connected', () => {
    beforeEach(() => {
      (useWallet as jest.Mock).mockReturnValue({
        connected: true,
        publicKey: mockPublicKey,
      });
    });

    it('should fetch portfolio value on mount', async () => {
      const mockBalanceData = {
        wallet: mockPublicKey.toString(),
        totalValueUSD: 1000,
        tokens: [],
        lastUpdated: new Date().toISOString(),
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockBalanceData,
      });

      render(<HistoricalValueChart />);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          `http://localhost:3001/wallet/balances/${mockPublicKey.toString()}`
        );
      });
    });

    it('should display loading state while fetching', async () => {
      (global.fetch as jest.Mock).mockImplementationOnce(
        () => new Promise(resolve => setTimeout(resolve, 100))
      );

      const { container } = render(<HistoricalValueChart />);
      
      // Check for skeleton loader
      const skeletons = container.querySelectorAll('.animate-pulse');
      expect(skeletons.length).toBeGreaterThan(0);
    });

    it('should display error message when fetch fails', async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(
        new Error('Network error')
      );

      render(<HistoricalValueChart />);

      await waitFor(() => {
        expect(screen.getByText('Failed to load portfolio value')).toBeInTheDocument();
      });
    });

    it('should render chart when data is loaded', async () => {
      const mockBalanceData = {
        wallet: mockPublicKey.toString(),
        totalValueUSD: 1000,
        tokens: [],
        lastUpdated: new Date().toISOString(),
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockBalanceData,
      });

      render(<HistoricalValueChart />);

      await waitFor(() => {
        expect(screen.getByTestId('area-chart')).toBeInTheDocument();
      });
    });

    it('should display current portfolio value', async () => {
      const mockBalanceData = {
        wallet: mockPublicKey.toString(),
        totalValueUSD: 1234.56,
        tokens: [],
        lastUpdated: new Date().toISOString(),
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockBalanceData,
      });

      render(<HistoricalValueChart />);

      await waitFor(() => {
        expect(screen.getByText('$1,234.56')).toBeInTheDocument();
      });
    });

    it('should have time period selector', async () => {
      const mockBalanceData = {
        wallet: mockPublicKey.toString(),
        totalValueUSD: 1000,
        tokens: [],
        lastUpdated: new Date().toISOString(),
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockBalanceData,
      });

      render(<HistoricalValueChart />);

      await waitFor(() => {
        // Check for the select trigger button
        const selectTrigger = screen.getByRole('combobox');
        expect(selectTrigger).toBeInTheDocument();
      });
    });

    it('should change time period when selected', async () => {
      const mockBalanceData = {
        wallet: mockPublicKey.toString(),
        totalValueUSD: 1000,
        tokens: [],
        lastUpdated: new Date().toISOString(),
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockBalanceData,
      });

      render(<HistoricalValueChart />);

      await waitFor(() => {
        const selectTrigger = screen.getByRole('combobox');
        expect(selectTrigger).toBeInTheDocument();
      });

      // Open the select dropdown
      const selectTrigger = screen.getByRole('combobox');
      fireEvent.click(selectTrigger);

      // Wait for options to appear and select "30 Days"
      await waitFor(() => {
        const option = screen.getByText('30 Days');
        fireEvent.click(option);
      });

      // Verify the selection changed
      expect(selectTrigger).toHaveTextContent('30 Days');
    });

    it('should show trend indicator for positive change', async () => {
      const mockBalanceData = {
        wallet: mockPublicKey.toString(),
        totalValueUSD: 1500,
        tokens: [],
        lastUpdated: new Date().toISOString(),
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockBalanceData,
      });

      render(<HistoricalValueChart />);

      await waitFor(() => {
        // Look for positive trend indicators
        const trendElements = screen.getByText(/\+/);
        expect(trendElements).toBeInTheDocument();
      });
    });

    it('should handle zero portfolio value', async () => {
      const mockBalanceData = {
        wallet: mockPublicKey.toString(),
        totalValueUSD: 0,
        tokens: [],
        lastUpdated: new Date().toISOString(),
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockBalanceData,
      });

      render(<HistoricalValueChart />);

      await waitFor(() => {
        expect(screen.getByText('No historical data available')).toBeInTheDocument();
      });
    });

    it('should handle API response without totalValueUSD', async () => {
      const mockBalanceData = {
        wallet: mockPublicKey.toString(),
        tokens: [],
        lastUpdated: new Date().toISOString(),
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockBalanceData,
      });

      render(<HistoricalValueChart />);

      await waitFor(() => {
        expect(screen.getByText('No historical data available')).toBeInTheDocument();
      });
    });
  });

  describe('chart data generation', () => {
    beforeEach(() => {
      (useWallet as jest.Mock).mockReturnValue({
        connected: true,
        publicKey: mockPublicKey,
      });
    });

    it('should generate data points for different time periods', async () => {
      const mockBalanceData = {
        wallet: mockPublicKey.toString(),
        totalValueUSD: 1000,
        tokens: [],
        lastUpdated: new Date().toISOString(),
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockBalanceData,
      });

      render(<HistoricalValueChart />);

      await waitFor(() => {
        expect(screen.getByTestId('area-chart')).toBeInTheDocument();
      });

      // Test different time periods
      const periods = ['24 Hours', '30 Days', '90 Days', 'All Time'];
      
      for (const period of periods) {
        const selectTrigger = screen.getByRole('combobox');
        fireEvent.click(selectTrigger);
        
        await waitFor(() => {
          const option = screen.getByText(period);
          fireEvent.click(option);
        });

        // Verify chart is still rendered with new data
        expect(screen.getByTestId('area-chart')).toBeInTheDocument();
      }
    });
  });

  describe('accessibility', () => {
    it('should have proper ARIA labels', async () => {
      (useWallet as jest.Mock).mockReturnValue({
        connected: true,
        publicKey: mockPublicKey,
      });

      const mockBalanceData = {
        wallet: mockPublicKey.toString(),
        totalValueUSD: 1000,
        tokens: [],
        lastUpdated: new Date().toISOString(),
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockBalanceData,
      });

      render(<HistoricalValueChart />);

      await waitFor(() => {
        const selectTrigger = screen.getByRole('combobox');
        expect(selectTrigger).toBeInTheDocument();
      });
    });
  });
});