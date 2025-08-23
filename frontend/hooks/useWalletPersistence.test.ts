import { renderHook } from '@testing-library/react'
import { useWallet } from '@solana/wallet-adapter-react'
import { PublicKey } from '@solana/web3.js'
import { useWalletPersistence } from './useWalletPersistence'

// Mock the wallet adapter hook
jest.mock('@solana/wallet-adapter-react')

const mockUseWallet = useWallet as jest.MockedFunction<typeof useWallet>

describe('useWalletPersistence', () => {
  const mockLocalStorage = {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
    length: 0,
    key: jest.fn(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
    
    // Mock localStorage
    Object.defineProperty(window, 'localStorage', {
      value: mockLocalStorage,
      writable: true,
    })
  })

  describe('when wallet connects', () => {
    it('saves connection state to localStorage', () => {
      const mockPublicKey = new PublicKey('11111111111111111111111111111111')
      
      mockUseWallet.mockReturnValue({
        publicKey: mockPublicKey,
        connected: true,
        wallet: null,
        connecting: false,
        disconnect: jest.fn(),
        wallets: [],
        select: jest.fn(),
        connect: jest.fn(),
        sendTransaction: jest.fn(),
        signTransaction: jest.fn(),
        signAllTransactions: jest.fn(),
        signMessage: jest.fn(),
        signIn: jest.fn(),
        autoConnect: false,
        disconnecting: false,
      })

      renderHook(() => useWalletPersistence())

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('walletConnected', 'true')
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'lastConnectedWallet',
        mockPublicKey.toBase58()
      )
    })
  })

  describe('when wallet disconnects', () => {
    it('updates connection state in localStorage', () => {
      mockUseWallet.mockReturnValue({
        publicKey: null,
        connected: false,
        wallet: null,
        connecting: false,
        disconnect: jest.fn(),
        wallets: [],
        select: jest.fn(),
        connect: jest.fn(),
        sendTransaction: jest.fn(),
        signTransaction: jest.fn(),
        signAllTransactions: jest.fn(),
        signMessage: jest.fn(),
        signIn: jest.fn(),
        autoConnect: false,
        disconnecting: false,
      })

      renderHook(() => useWalletPersistence())

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('walletConnected', 'false')
    })
  })

  describe('when wallet changes', () => {
    it('updates stored wallet address', () => {
      const publicKey1 = new PublicKey('11111111111111111111111111111111')
      const publicKey2 = new PublicKey('22222222222222222222222222222222')

      // Initial render with first wallet
      const { rerender } = renderHook(
        () => useWalletPersistence(),
        {
          initialProps: {},
        }
      )

      mockUseWallet.mockReturnValue({
        publicKey: publicKey1,
        connected: true,
        wallet: null,
        connecting: false,
        disconnect: jest.fn(),
        wallets: [],
        select: jest.fn(),
        connect: jest.fn(),
        sendTransaction: jest.fn(),
        signTransaction: jest.fn(),
        signAllTransactions: jest.fn(),
        signMessage: jest.fn(),
        signIn: jest.fn(),
        autoConnect: false,
        disconnecting: false,
      })

      rerender()

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'lastConnectedWallet',
        publicKey1.toBase58()
      )

      // Clear previous calls
      mockLocalStorage.setItem.mockClear()

      // Update to second wallet
      mockUseWallet.mockReturnValue({
        publicKey: publicKey2,
        connected: true,
        wallet: null,
        connecting: false,
        disconnect: jest.fn(),
        wallets: [],
        select: jest.fn(),
        connect: jest.fn(),
        sendTransaction: jest.fn(),
        signTransaction: jest.fn(),
        signAllTransactions: jest.fn(),
        signMessage: jest.fn(),
        signIn: jest.fn(),
        autoConnect: false,
        disconnecting: false,
      })

      rerender()

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'lastConnectedWallet',
        publicKey2.toBase58()
      )
    })
  })

  describe('edge cases', () => {
    it('does not crash when localStorage is unavailable', () => {
      // Make localStorage throw an error
      Object.defineProperty(window, 'localStorage', {
        get() {
          throw new Error('localStorage not available')
        },
      })

      mockUseWallet.mockReturnValue({
        publicKey: new PublicKey('11111111111111111111111111111111'),
        connected: true,
        wallet: null,
        connecting: false,
        disconnect: jest.fn(),
        wallets: [],
        select: jest.fn(),
        connect: jest.fn(),
        sendTransaction: jest.fn(),
        signTransaction: jest.fn(),
        signAllTransactions: jest.fn(),
        signMessage: jest.fn(),
        signIn: jest.fn(),
        autoConnect: false,
        disconnecting: false,
      })

      // Should not throw
      expect(() => {
        renderHook(() => useWalletPersistence())
      }).not.toThrow()
    })

    it('returns connected state', () => {
      mockUseWallet.mockReturnValue({
        publicKey: new PublicKey('11111111111111111111111111111111'),
        connected: true,
        wallet: null,
        connecting: false,
        disconnect: jest.fn(),
        wallets: [],
        select: jest.fn(),
        connect: jest.fn(),
        sendTransaction: jest.fn(),
        signTransaction: jest.fn(),
        signAllTransactions: jest.fn(),
        signMessage: jest.fn(),
        signIn: jest.fn(),
        autoConnect: false,
        disconnecting: false,
      })

      const { result } = renderHook(() => useWalletPersistence())

      expect(result.current.connected).toBe(true)
    })

    it('handles connecting state without saving', () => {
      mockUseWallet.mockReturnValue({
        publicKey: null,
        connected: false,
        wallet: null,
        connecting: true, // Currently connecting
        disconnect: jest.fn(),
        wallets: [],
        select: jest.fn(),
        connect: jest.fn(),
        sendTransaction: jest.fn(),
        signTransaction: jest.fn(),
        signAllTransactions: jest.fn(),
        signMessage: jest.fn(),
        signIn: jest.fn(),
        autoConnect: false,
        disconnecting: false,
      })

      renderHook(() => useWalletPersistence())

      // Should not save anything during connecting state
      expect(mockLocalStorage.setItem).not.toHaveBeenCalled()
    })
  })
})