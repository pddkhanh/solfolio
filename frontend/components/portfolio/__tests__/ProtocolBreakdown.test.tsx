import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { ProtocolBreakdown } from '../ProtocolBreakdown';
import { useWallet } from '@solana/wallet-adapter-react';
import '@testing-library/jest-dom';

// Mock the wallet adapter
jest.mock('@solana/wallet-adapter-react', () => ({
  useWallet: jest.fn(),
}));

// Mock the utils
jest.mock('@/lib/utils', () => ({
  formatUSD: (value: number) => `$${value.toFixed(2)}`,
  formatNumber: (value: number) => value.toFixed(2),
}));

// Mock recharts components
jest.mock('recharts', () => {
  const originalModule = jest.requireActual('recharts');
  return {
    ...originalModule,
    ResponsiveContainer: ({ children }: any) => <div>{children}</div>,
    BarChart: ({ children }: any) => <div data-testid="bar-chart">{children}</div>,
    PieChart: ({ children }: any) => <div data-testid="pie-chart">{children}</div>,
    Bar: ({ children }: any) => <div>{children}</div>,
    Pie: ({ children }: any) => <div>{children}</div>,
    Cell: () => <div />,
    XAxis: () => <div />,
    YAxis: () => <div />,
    CartesianGrid: () => <div />,
    Tooltip: () => <div />,
    Legend: () => <div />,
  };
});

// Mock fetch
global.fetch = jest.fn();

describe('ProtocolBreakdown', () => {
  const mockPublicKey = {
    toString: () => 'test-wallet-address',
  };

  const mockProtocolData = {
    success: true,
    data: {
      walletAddress: 'test-wallet-address',
      protocols: [
        {
          protocol: 'Marinade',
          type: 'STAKING',
          totalValue: 10000,
          positions: 2,
          apy: 6.5,
          rewards: 50,
          percentage: 40,
        },
        {
          protocol: 'Kamino',
          type: 'LENDING',
          totalValue: 8000,
          positions: 3,
          apy: 8.2,
          rewards: 65,
          percentage: 32,
        },
        {
          protocol: 'Wallet Tokens',
          type: 'TOKENS',
          totalValue: 7000,
          positions: 5,
          apy: 0,
          rewards: 0,
          percentage: 28,
        },
      ],
      totalValue: 25000,
      totalProtocols: 2, // Excluding wallet tokens
      lastUpdated: '2024-01-01T00:00:00Z',
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => mockProtocolData,
    });
  });

  it('should render wallet connection message when not connected', () => {
    (useWallet as jest.Mock).mockReturnValue({
      connected: false,
      publicKey: null,
    });

    render(<ProtocolBreakdown />);

    expect(screen.getByText('Connect your wallet to view protocol breakdown')).toBeInTheDocument();
  });

  it('should fetch and display protocol breakdown when wallet is connected', async () => {
    (useWallet as jest.Mock).mockReturnValue({
      connected: true,
      publicKey: mockPublicKey,
    });

    render(<ProtocolBreakdown />);

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:3001/positions/test-wallet-address/protocol-breakdown'
      );
    });

    await waitFor(() => {
      // Check summary stats
      expect(screen.getByText('$25000.00')).toBeInTheDocument(); // Total value
      expect(screen.getByText('2')).toBeInTheDocument(); // Total protocols
      expect(screen.getByText('Marinade')).toBeInTheDocument(); // Largest protocol
      
      // Check protocol list
      expect(screen.getByText('Kamino')).toBeInTheDocument();
      expect(screen.getByText('Wallet Tokens')).toBeInTheDocument();
    });
  });

  it('should display loading state while fetching data', async () => {
    (useWallet as jest.Mock).mockReturnValue({
      connected: true,
      publicKey: mockPublicKey,
    });

    // Mock a slow fetch
    (fetch as jest.Mock).mockImplementation(() => 
      new Promise(resolve => setTimeout(() => resolve({
        ok: true,
        json: async () => mockProtocolData,
      }), 100))
    );

    render(<ProtocolBreakdown />);

    // Should show loading skeleton
    expect(screen.getAllByTestId(/skeleton/i).length).toBeGreaterThan(0);
  });

  it('should handle fetch errors gracefully', async () => {
    (useWallet as jest.Mock).mockReturnValue({
      connected: true,
      publicKey: mockPublicKey,
    });

    (fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

    render(<ProtocolBreakdown />);

    await waitFor(() => {
      expect(screen.getByText('Failed to load protocol breakdown')).toBeInTheDocument();
    });
  });

  it('should switch between bar and pie chart views', async () => {
    (useWallet as jest.Mock).mockReturnValue({
      connected: true,
      publicKey: mockPublicKey,
    });

    render(<ProtocolBreakdown />);

    await waitFor(() => {
      expect(screen.getByText('Marinade')).toBeInTheDocument();
    });

    // Default should show bar chart
    expect(screen.getByTestId('bar-chart')).toBeInTheDocument();

    // Click on pie chart tab
    const pieChartTab = screen.getByText('Pie Chart');
    fireEvent.click(pieChartTab);

    // Should now show pie chart
    await waitFor(() => {
      expect(screen.getByTestId('pie-chart')).toBeInTheDocument();
    });
  });

  it('should display protocol details with correct formatting', async () => {
    (useWallet as jest.Mock).mockReturnValue({
      connected: true,
      publicKey: mockPublicKey,
    });

    render(<ProtocolBreakdown />);

    await waitFor(() => {
      // Check for Marinade details
      const marinadeSection = screen.getByText('Marinade').closest('div')?.parentElement;
      expect(marinadeSection).toHaveTextContent('2 positions');
      expect(marinadeSection).toHaveTextContent('$10000.00');
      expect(marinadeSection).toHaveTextContent('40.00%');
      expect(marinadeSection).toHaveTextContent('6.50% APY');
    });
  });

  it('should calculate and display average APY correctly', async () => {
    (useWallet as jest.Mock).mockReturnValue({
      connected: true,
      publicKey: mockPublicKey,
    });

    render(<ProtocolBreakdown />);

    await waitFor(() => {
      // Weighted APY calculation: (10000 * 6.5 + 8000 * 8.2) / 18000 ≈ 7.26%
      const avgApyElement = screen.getByText('Avg APY').parentElement;
      expect(avgApyElement).toHaveTextContent('7.26%');
    });
  });

  it('should handle empty protocol data', async () => {
    (useWallet as jest.Mock).mockReturnValue({
      connected: true,
      publicKey: mockPublicKey,
    });

    (fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        data: {
          walletAddress: 'test-wallet-address',
          protocols: [],
          totalValue: 0,
          totalProtocols: 0,
          lastUpdated: '2024-01-01T00:00:00Z',
        },
      }),
    });

    render(<ProtocolBreakdown />);

    await waitFor(() => {
      expect(screen.getByText('No protocol positions found')).toBeInTheDocument();
    });
  });

  it('should use correct colors for known protocols', async () => {
    (useWallet as jest.Mock).mockReturnValue({
      connected: true,
      publicKey: mockPublicKey,
    });

    render(<ProtocolBreakdown />);

    await waitFor(() => {
      const marinadeElement = screen.getByText('Marinade').closest('div');
      const colorIndicator = marinadeElement?.querySelector('[style*="backgroundColor"]');
      expect(colorIndicator).toHaveStyle({ backgroundColor: '#3b82f6' }); // Blue for Marinade
    });
  });

  it('should not fetch data when wallet disconnects', () => {
    const { rerender } = render(<ProtocolBreakdown />);

    // Start with connected wallet
    (useWallet as jest.Mock).mockReturnValue({
      connected: true,
      publicKey: mockPublicKey,
    });

    rerender(<ProtocolBreakdown />);
    expect(fetch).toHaveBeenCalledTimes(1);

    // Disconnect wallet
    (useWallet as jest.Mock).mockReturnValue({
      connected: false,
      publicKey: null,
    });

    rerender(<ProtocolBreakdown />);
    
    // Should not make additional fetch calls
    expect(fetch).toHaveBeenCalledTimes(1);
  });
});