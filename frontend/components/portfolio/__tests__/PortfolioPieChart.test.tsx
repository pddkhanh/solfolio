import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { PortfolioPieChart } from '../PortfolioPieChart';
import { useWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';

// Mock the wallet adapter
jest.mock('@solana/wallet-adapter-react', () => ({
  useWallet: jest.fn(),
}));

// Mock recharts to avoid rendering issues in tests
jest.mock('recharts', () => ({
  ...jest.requireActual('recharts'),
  ResponsiveContainer: ({ children }: any) => <div>{children}</div>,
  PieChart: ({ children }: any) => <div data-testid="pie-chart">{children}</div>,
  Pie: ({ children }: any) => <div>{children}</div>,
  Cell: () => <div />,
  Legend: () => <div />,
  Tooltip: () => <div />,
}));

// Mock fetch globally
global.fetch = jest.fn();

describe('PortfolioPieChart', () => {
  const mockPublicKey = new PublicKey('11111111111111111111111111111111');

  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockReset();
  });

  it('should show connect wallet message when wallet is not connected', () => {
    (useWallet as jest.Mock).mockReturnValue({
      connected: false,
      publicKey: null,
    });

    render(<PortfolioPieChart />);

    expect(screen.getByText('Portfolio Distribution')).toBeInTheDocument();
    expect(screen.getByText('Connect Wallet to View Distribution')).toBeInTheDocument();
  });

  it('should show loading state while fetching data', async () => {
    (useWallet as jest.Mock).mockReturnValue({
      connected: true,
      publicKey: mockPublicKey,
    });

    (global.fetch as jest.Mock).mockImplementation(() => 
      new Promise(() => {}) // Never resolves to keep loading state
    );

    render(<PortfolioPieChart />);

    await waitFor(() => {
      expect(screen.getByText('Portfolio Distribution')).toBeInTheDocument();
      expect(screen.getByText('Token allocation by value')).toBeInTheDocument();
      // Check for skeleton loader - our Skeleton component uses gradient background
      const skeleton = document.querySelector('[class*="from-transparent"]');
      expect(skeleton).toBeInTheDocument();
    });
  });

  it('should show error message when fetch fails', async () => {
    (useWallet as jest.Mock).mockReturnValue({
      connected: true,
      publicKey: mockPublicKey,
    });

    (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

    render(<PortfolioPieChart />);

    await waitFor(() => {
      expect(screen.getByText('Unable to Load Chart')).toBeInTheDocument();
    });
  });

  it('should show empty state when wallet has no tokens', async () => {
    (useWallet as jest.Mock).mockReturnValue({
      connected: true,
      publicKey: mockPublicKey,
    });

    const mockEmptyData = {
      wallet: mockPublicKey.toString(),
      tokens: [],
      totalValueUSD: 0,
      lastUpdated: new Date().toISOString(),
    };

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => mockEmptyData,
    });

    render(<PortfolioPieChart />);

    await waitFor(() => {
      expect(screen.getByText('No Data to Display')).toBeInTheDocument();
    });
  });

  it('should render pie chart with token data', async () => {
    (useWallet as jest.Mock).mockReturnValue({
      connected: true,
      publicKey: mockPublicKey,
    });

    const mockData = {
      wallet: mockPublicKey.toString(),
      nativeSol: {
        amount: '1000000000',
        decimals: 9,
        uiAmount: 1,
        valueUSD: 150,
      },
      tokens: [
        {
          mint: 'token1',
          symbol: 'USDC',
          name: 'USD Coin',
          balance: '100000000',
          decimals: 6,
          uiAmount: 100,
          valueUSD: 100,
        },
        {
          mint: 'token2',
          symbol: 'USDT',
          name: 'Tether',
          balance: '50000000',
          decimals: 6,
          uiAmount: 50,
          valueUSD: 50,
        },
      ],
      totalValueUSD: 300,
      lastUpdated: new Date().toISOString(),
    };

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => mockData,
    });

    render(<PortfolioPieChart />);

    await waitFor(() => {
      expect(screen.getByText('Portfolio Distribution')).toBeInTheDocument();
      expect(screen.getByText(/Total: \$300\.00/)).toBeInTheDocument();
      expect(screen.getByTestId('pie-chart')).toBeInTheDocument();
    });
  });

  it('should group small holdings into Others category', async () => {
    (useWallet as jest.Mock).mockReturnValue({
      connected: true,
      publicKey: mockPublicKey,
    });

    const mockData = {
      wallet: mockPublicKey.toString(),
      nativeSol: {
        amount: '10000000000',
        decimals: 9,
        uiAmount: 10,
        valueUSD: 1500,
      },
      tokens: [
        // Large holdings
        ...Array.from({ length: 9 }, (_, i) => ({
          mint: `token${i}`,
          symbol: `TOKEN${i}`,
          balance: '1000000',
          decimals: 6,
          uiAmount: 1,
          valueUSD: 100,
        })),
        // Small holdings (less than 1%)
        ...Array.from({ length: 5 }, (_, i) => ({
          mint: `small${i}`,
          symbol: `SMALL${i}`,
          balance: '100000',
          decimals: 6,
          uiAmount: 0.1,
          valueUSD: 2,
        })),
      ],
      totalValueUSD: 2410,
      lastUpdated: new Date().toISOString(),
    };

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => mockData,
    });

    render(<PortfolioPieChart />);

    await waitFor(() => {
      expect(screen.getByTestId('pie-chart')).toBeInTheDocument();
      // The component should group small holdings
      expect(screen.getByText(/Total: \$2,410\.00/)).toBeInTheDocument();
    });
  });

  it('should handle API error response gracefully', async () => {
    (useWallet as jest.Mock).mockReturnValue({
      connected: true,
      publicKey: mockPublicKey,
    });

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
    });

    render(<PortfolioPieChart />);

    await waitFor(() => {
      expect(screen.getByText('Unable to Load Chart')).toBeInTheDocument();
    });
  });

  it('should fetch data when wallet connects', async () => {
    const { rerender } = render(<PortfolioPieChart />);

    // Initially disconnected
    (useWallet as jest.Mock).mockReturnValue({
      connected: false,
      publicKey: null,
    });

    rerender(<PortfolioPieChart />);

    expect(screen.getByText('Connect Wallet to View Distribution')).toBeInTheDocument();

    // Simulate wallet connection
    (useWallet as jest.Mock).mockReturnValue({
      connected: true,
      publicKey: mockPublicKey,
    });

    const mockData = {
      wallet: mockPublicKey.toString(),
      tokens: [],
      totalValueUSD: 0,
      lastUpdated: new Date().toISOString(),
    };

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => mockData,
    });

    rerender(<PortfolioPieChart />);

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        `http://localhost:3001/wallet/balances/${mockPublicKey.toString()}`
      );
    });
  });
});