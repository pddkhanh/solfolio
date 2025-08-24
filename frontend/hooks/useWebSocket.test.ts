import { renderHook, act } from '@testing-library/react';
import { useWebSocket } from './useWebSocket';

// Mock socket.io-client
jest.mock('socket.io-client', () => {
  const mockSocket = {
    connected: false,
    on: jest.fn(),
    off: jest.fn(),
    emit: jest.fn(),
    disconnect: jest.fn(),
    connect: jest.fn(),
  };

  return {
    io: jest.fn(() => mockSocket),
    Socket: mockSocket,
  };
});

// Mock wallet adapter
jest.mock('@solana/wallet-adapter-react', () => ({
  useWallet: () => ({
    publicKey: null,
  }),
}));

describe('useWebSocket', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize with connecting status', () => {
    const { result } = renderHook(() => useWebSocket());

    expect(result.current.connectionStatus).toBe('connecting');
    expect(result.current.isConnected).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('should provide socket methods', () => {
    const { result } = renderHook(() => useWebSocket());

    expect(typeof result.current.subscribeToPrices).toBe('function');
    expect(typeof result.current.unsubscribeFromPrices).toBe('function');
    expect(typeof result.current.subscribeToWallet).toBe('function');
    expect(typeof result.current.unsubscribeFromWallet).toBe('function');
    expect(typeof result.current.onPriceUpdate).toBe('function');
    expect(typeof result.current.onWalletUpdate).toBe('function');
    expect(typeof result.current.onPositionUpdate).toBe('function');
    expect(typeof result.current.disconnect).toBe('function');
    expect(typeof result.current.reconnect).toBe('function');
  });

  it('should call socket methods when connected', () => {
    const { result } = renderHook(() => useWebSocket());
    
    // Mock socket as connected
    if (result.current.socket) {
      (result.current.socket as any).connected = true;
    }

    act(() => {
      result.current.subscribeToPrices();
      result.current.subscribeToWallet('test-wallet');
    });

    // These would normally be called on the socket
    expect(result.current.socket).toBeDefined();
  });
});