import { render, screen, waitFor, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useWallet, useConnection } from '@solana/wallet-adapter-react'
import { PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js'
import WalletInfo from './WalletInfo'

// Mock the wallet adapter hooks
jest.mock('@solana/wallet-adapter-react')

const mockUseWallet = useWallet as jest.MockedFunction<typeof useWallet>
const mockUseConnection = useConnection as jest.MockedFunction<typeof useConnection>

describe('WalletInfo', () => {
  const mockGetBalance = jest.fn()
  const mockOnAccountChange = jest.fn()
  const mockRemoveAccountChangeListener = jest.fn()
  
  beforeEach(() => {
    jest.clearAllMocks()
    
    // Mock connection
    mockUseConnection.mockReturnValue({
      connection: {
        getBalance: mockGetBalance,
        onAccountChange: mockOnAccountChange,
        removeAccountChangeListener: mockRemoveAccountChangeListener,
        rpcEndpoint: 'https://api.devnet.solana.com',
        commitment: 'confirmed',
      } as any,
    })
    
    // Mock onAccountChange to return a subscription ID
    mockOnAccountChange.mockReturnValue(1)
  })

  describe('when wallet is not connected', () => {
    beforeEach(() => {
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
    })

    it('returns null when no wallet is connected', () => {
      const { container } = render(<WalletInfo />)
      expect(container.firstChild).toBeNull()
    })
  })

  describe('when wallet is connected', () => {
    const mockPublicKey = new PublicKey('11111111111111111111111111111111')
    const mockBalance = 1.5 * LAMPORTS_PER_SOL // 1.5 SOL
    
    beforeEach(() => {
      mockUseWallet.mockReturnValue({
        publicKey: mockPublicKey,
        connected: true,
        wallet: {
          adapter: {
            name: 'Phantom',
            url: 'https://phantom.app',
            icon: 'phantom-icon',
            readyState: 'Installed' as any,
            publicKey: mockPublicKey,
            connecting: false,
            connected: true,
            supportedTransactionVersions: new Set(['legacy']),
            connect: jest.fn(),
            disconnect: jest.fn(),
            sendTransaction: jest.fn(),
            signTransaction: jest.fn(),
            signAllTransactions: jest.fn(),
            signMessage: jest.fn(),
            signIn: jest.fn(),
          },
          readyState: 'Installed' as any,
        },
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
      
      mockGetBalance.mockResolvedValue(mockBalance)
    })

    it('displays wallet information card', () => {
      render(<WalletInfo />)
      
      expect(screen.getByText('Wallet Information')).toBeInTheDocument()
      expect(screen.getByText('Connected with Phantom')).toBeInTheDocument()
    })

    it('displays full wallet address', () => {
      render(<WalletInfo />)
      
      expect(screen.getByText(mockPublicKey.toBase58())).toBeInTheDocument()
    })

    it('fetches and displays SOL balance', async () => {
      render(<WalletInfo />)
      
      await waitFor(() => {
        expect(screen.getByText('1.5000 SOL')).toBeInTheDocument()
      })
      
      expect(mockGetBalance).toHaveBeenCalledWith(mockPublicKey)
    })

    it('shows loading state while fetching balance', () => {
      // Make getBalance return a never-resolving promise
      mockGetBalance.mockReturnValue(new Promise(() => {}))
      
      render(<WalletInfo />)
      
      // Should show skeleton loader
      expect(screen.getByText('SOL Balance')).toBeInTheDocument()
      const skeletons = document.querySelectorAll('[class*="skeleton"]')
      expect(skeletons.length).toBeGreaterThan(0)
    })

    it('copies address to clipboard when copy button is clicked', async () => {
      render(<WalletInfo />)
      
      const copyButton = screen.getByRole('button', { name: /copy/i })
      await userEvent.click(copyButton)
      
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(mockPublicKey.toBase58())
    })

    it('shows confirmation when address is copied', async () => {
      render(<WalletInfo />)
      
      const copyButton = screen.getByRole('button', { name: /copy/i })
      await userEvent.click(copyButton)
      
      // Should show check icon (confirmation)
      await waitFor(() => {
        const checkIcons = document.querySelectorAll('[class*="lucide-check"]')
        expect(checkIcons.length).toBeGreaterThan(0)
      })
    })

    it('opens Solana Explorer when external link is clicked', async () => {
      const mockOpen = jest.fn()
      window.open = mockOpen
      
      render(<WalletInfo />)
      
      const explorerButton = screen.getAllByRole('button')[1] // Second button is explorer
      await userEvent.click(explorerButton)
      
      expect(mockOpen).toHaveBeenCalledWith(
        `https://explorer.solana.com/address/${mockPublicKey.toBase58()}`,
        '_blank'
      )
    })

    it('sets up balance subscription on mount', () => {
      render(<WalletInfo />)
      
      expect(mockOnAccountChange).toHaveBeenCalledWith(
        mockPublicKey,
        expect.any(Function)
      )
    })

    it('updates balance when account changes', async () => {
      render(<WalletInfo />)
      
      // Get the callback that was passed to onAccountChange
      const callback = mockOnAccountChange.mock.calls[0][1]
      
      // Simulate account change with new balance
      const newBalance = 2.5 * LAMPORTS_PER_SOL
      
      await act(async () => {
        callback({ lamports: newBalance })
      })
      
      await waitFor(() => {
        expect(screen.getByText('2.5000 SOL')).toBeInTheDocument()
      })
    })

    it('cleans up subscription on unmount', () => {
      const { unmount } = render(<WalletInfo />)
      
      unmount()
      
      expect(mockRemoveAccountChangeListener).toHaveBeenCalledWith(1)
    })

    it('handles balance fetch error gracefully', async () => {
      mockGetBalance.mockRejectedValue(new Error('Network error'))
      
      // Spy on console.error to suppress it in test output
      const consoleError = jest.spyOn(console, 'error').mockImplementation()
      
      render(<WalletInfo />)
      
      await waitFor(() => {
        // Should show em dash when balance is null
        expect(screen.getByText('—')).toBeInTheDocument()
      })
      
      expect(consoleError).toHaveBeenCalledWith(
        'Error fetching balance:',
        expect.any(Error)
      )
      
      consoleError.mockRestore()
    })
  })

  describe('wallet switching', () => {
    it('refetches balance when wallet changes', async () => {
      const publicKey1 = new PublicKey('11111111111111111111111111111112')
      const publicKey2 = new PublicKey('11111111111111111111111111111113')
      
      const { rerender } = render(<WalletInfo />)
      
      // Initial wallet
      mockUseWallet.mockReturnValue({
        publicKey: publicKey1,
        connected: true,
        wallet: {
          adapter: {
            name: 'Phantom',
            url: 'https://phantom.app',
            icon: 'phantom-icon',
            readyState: 'Installed' as any,
            publicKey: publicKey1,
            connecting: false,
            connected: true,
            supportedTransactionVersions: new Set(['legacy']),
            connect: jest.fn(),
            disconnect: jest.fn(),
            sendTransaction: jest.fn(),
            signTransaction: jest.fn(),
            signAllTransactions: jest.fn(),
            signMessage: jest.fn(),
            signIn: jest.fn(),
          },
          readyState: 'Installed' as any,
        },
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
      
      mockGetBalance.mockResolvedValue(1 * LAMPORTS_PER_SOL)
      
      rerender(<WalletInfo />)
      
      await waitFor(() => {
        expect(screen.getByText('1.0000 SOL')).toBeInTheDocument()
      })
      
      // Switch wallet
      mockUseWallet.mockReturnValue({
        publicKey: publicKey2,
        connected: true,
        wallet: {
          adapter: {
            name: 'Solflare',
            url: 'https://solflare.com',
            icon: 'solflare-icon',
            readyState: 'Installed' as any,
            publicKey: publicKey2,
            connecting: false,
            connected: true,
            supportedTransactionVersions: new Set(['legacy']),
            connect: jest.fn(),
            disconnect: jest.fn(),
            sendTransaction: jest.fn(),
            signTransaction: jest.fn(),
            signAllTransactions: jest.fn(),
            signMessage: jest.fn(),
            signIn: jest.fn(),
          },
          readyState: 'Installed' as any,
        },
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
      
      mockGetBalance.mockResolvedValue(2 * LAMPORTS_PER_SOL)
      
      rerender(<WalletInfo />)
      
      await waitFor(() => {
        expect(screen.getByText('Connected with Solflare')).toBeInTheDocument()
        expect(screen.getByText('2.0000 SOL')).toBeInTheDocument()
      })
    })
  })
})