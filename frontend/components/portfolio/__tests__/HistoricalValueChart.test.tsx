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

// Time period labels from the component
const TIME_PERIOD_LABELS = {
  '24h': '24 Hours',
  '7d': '7 Days',
  '30d': '30 Days',
  '90d': '90 Days',
  'all': 'All Time',
};

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
      
      // Check for skeleton loader - our Skeleton component uses gradient backgrounds
      const skeletons = container.querySelectorAll('[class*="from-gray-800"]');
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
        // Check for the select element
        const selectElement = document.querySelector('select');
        expect(selectElement).toBeInTheDocument();
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
        const selectElement = document.querySelector('select');
        expect(selectElement).toBeInTheDocument();
      });

      // Change the select value
      const selectElement = document.querySelector('select') as HTMLSelectElement;
      fireEvent.change(selectElement, { target: { value: '30d' } });

      // Verify the selection changed
      expect(selectElement.value).toBe('30d');
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
        // Look for positive trend indicators - there should be at least one
        const trendElements = screen.getAllByText(/\+/);
        expect(trendElements.length).toBeGreaterThan(0);
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
        const selectElement = document.querySelector('select') as HTMLSelectElement;
        const optionValue = Object.entries(TIME_PERIOD_LABELS).find(([_, label]) => label === period)?.[0];
        
        if (optionValue) {
          fireEvent.change(selectElement, { target: { value: optionValue } });
          // Verify chart is still rendered with new data
          expect(screen.getByTestId('area-chart')).toBeInTheDocument();
        }
      }
    });
  });

});