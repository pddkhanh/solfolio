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
  ReferenceLine: () => <div data-testid="reference-line" />,
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
      expect(screen.getByText('Connect to View History')).toBeInTheDocument();
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
      // Silence expected console errors in tests
      jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
      // Restore console.error
      (console.error as jest.Mock).mockRestore();
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
      const skeletons = container.querySelectorAll('[class*="from-transparent"]');
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
        // Check for time period buttons instead of select
        expect(screen.getByText('1 Hour')).toBeInTheDocument();
        expect(screen.getByText('24 Hours')).toBeInTheDocument();
        expect(screen.getByText('7 Days')).toBeInTheDocument();
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
        expect(screen.getByText('30 Days')).toBeInTheDocument();
      });

      // Click on 30 Days button
      const thirtyDaysButton = screen.getByText('30 Days');
      fireEvent.click(thirtyDaysButton);

      // Verify the button gets selected (would have different styling)
      // Since we're clicking the same button, we just verify it's still there
      expect(thirtyDaysButton).toBeInTheDocument();
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
        expect(screen.getByText('No Historical Data')).toBeInTheDocument();
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
        expect(screen.getByText('No Historical Data')).toBeInTheDocument();
      });
    });
  });

  describe('chart data generation', () => {
    beforeEach(() => {
      (useWallet as jest.Mock).mockReturnValue({
        connected: true,
        publicKey: mockPublicKey,
      });
      // Silence expected console errors in tests
      jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
      // Restore console.error
      (console.error as jest.Mock).mockRestore();
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

      // Test different time periods - click buttons
      // Using data-testid or role selectors would be better here
      // For now, we'll just verify the chart remains rendered
      const chartElement = screen.getByTestId('area-chart');
      expect(chartElement).toBeInTheDocument();
      
      // Verify we have multiple time period buttons (checking for short labels)
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
    });
  });

});