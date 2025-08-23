import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useWallet } from '@solana/wallet-adapter-react'
import { useWalletModal } from '@solana/wallet-adapter-react-ui'
import { PublicKey } from '@solana/web3.js'
import WalletButton from './WalletButton'

// Mock the wallet adapter hooks
jest.mock('@solana/wallet-adapter-react')
jest.mock('@solana/wallet-adapter-react-ui')

const mockUseWallet = useWallet as jest.MockedFunction<typeof useWallet>
const mockUseWalletModal = useWalletModal as jest.MockedFunction<typeof useWalletModal>

describe('WalletButton', () => {
  const mockSetVisible = jest.fn()
  const mockDisconnect = jest.fn()
  
  beforeEach(() => {
    jest.clearAllMocks()
    mockUseWalletModal.mockReturnValue({
      setVisible: mockSetVisible,
      visible: false,
    })
  })

  describe('when wallet is not connected', () => {
    beforeEach(() => {
      mockUseWallet.mockReturnValue({
        publicKey: null,
        connected: false,
        connecting: false,
        disconnect: mockDisconnect,
        wallet: null,
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

    it('renders connect wallet button', () => {
      render(<WalletButton />)
      expect(screen.getByText('Connect Wallet')).toBeInTheDocument()
    })

    it('shows connecting state when connecting', () => {
      mockUseWallet.mockReturnValue({
        ...mockUseWallet(),
        connecting: true,
      })
      
      render(<WalletButton />)
      expect(screen.getByText('Connecting...')).toBeInTheDocument()
    })

    it('opens wallet modal when clicked', async () => {
      render(<WalletButton />)
      
      const button = screen.getByRole('button')
      await userEvent.click(button)
      
      expect(mockSetVisible).toHaveBeenCalledWith(true)
    })

    it('disables button when connecting', () => {
      mockUseWallet.mockReturnValue({
        ...mockUseWallet(),
        connecting: true,
      })
      
      render(<WalletButton />)
      const button = screen.getByRole('button')
      expect(button).toBeDisabled()
    })
  })

  describe('when wallet is connected', () => {
    const mockPublicKey = new PublicKey('11111111111111111111111111111111')
    
    beforeEach(() => {
      mockUseWallet.mockReturnValue({
        publicKey: mockPublicKey,
        connected: true,
        connecting: false,
        disconnect: mockDisconnect,
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

    it('renders dropdown with wallet address', () => {
      render(<WalletButton />)
      
      // Should show formatted address
      expect(screen.getByText('1111...1111')).toBeInTheDocument()
    })

    it('shows wallet name in dropdown menu', async () => {
      render(<WalletButton />)
      
      // Click the dropdown trigger
      const trigger = screen.getByRole('button')
      await userEvent.click(trigger)
      
      // Wait for dropdown to open and check wallet name
      await waitFor(() => {
        expect(screen.getByText('Phantom')).toBeInTheDocument()
      })
    })

    it('copies address to clipboard when copy button is clicked', async () => {
      render(<WalletButton />)
      
      // Open dropdown
      const trigger = screen.getByRole('button')
      await userEvent.click(trigger)
      
      // Click copy button
      const copyButton = await screen.findByText('Copy Address')
      await userEvent.click(copyButton)
      
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(mockPublicKey.toBase58())
      
      // The button text should change to "Copied!" immediately
      // Note: In our implementation, this happens synchronously
      expect(screen.getByText('Copied!')).toBeInTheDocument()
    })

    it('disconnects wallet when disconnect is clicked', async () => {
      render(<WalletButton />)
      
      // Open dropdown
      const trigger = screen.getByRole('button')
      await userEvent.click(trigger)
      
      // Click disconnect
      const disconnectButton = await screen.findByText('Disconnect')
      await userEvent.click(disconnectButton)
      
      expect(mockDisconnect).toHaveBeenCalled()
    })

    it('switches wallet when switch wallet is clicked', async () => {
      render(<WalletButton />)
      
      // Open dropdown
      const trigger = screen.getByRole('button')
      await userEvent.click(trigger)
      
      // Click switch wallet
      const switchButton = await screen.findByText('Switch Wallet')
      await userEvent.click(switchButton)
      
      // Should disconnect first, then open modal
      expect(mockDisconnect).toHaveBeenCalled()
      expect(mockSetVisible).toHaveBeenCalledWith(true)
    })
  })

  describe('edge cases', () => {
    it('handles missing wallet adapter gracefully', () => {
      mockUseWallet.mockReturnValue({
        publicKey: new PublicKey('11111111111111111111111111111111'),
        connected: true,
        connecting: false,
        disconnect: mockDisconnect,
        wallet: null, // No wallet adapter
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
      
      render(<WalletButton />)
      
      // Should still render without crashing
      expect(screen.getByRole('button')).toBeInTheDocument()
    })

    it('handles clipboard API failure gracefully', async () => {
      // Mock clipboard failure
      const originalClipboard = navigator.clipboard.writeText
      navigator.clipboard.writeText = jest.fn().mockRejectedValue(new Error('Clipboard failed'))
      
      mockUseWallet.mockReturnValue({
        publicKey: new PublicKey('11111111111111111111111111111111'),
        connected: true,
        connecting: false,
        disconnect: mockDisconnect,
        wallet: {
          adapter: {
            name: 'Phantom',
            url: 'https://phantom.app',
            icon: 'phantom-icon',
            readyState: 'Installed' as any,
            publicKey: new PublicKey('11111111111111111111111111111111'),
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
      
      render(<WalletButton />)
      
      // Open dropdown
      const trigger = screen.getByRole('button')
      await userEvent.click(trigger)
      
      // Try to copy
      const copyButton = await screen.findByText('Copy Address')
      await userEvent.click(copyButton)
      
      // Should not show "Copied!" since it failed
      await waitFor(() => {
        expect(screen.queryByText('Copied!')).not.toBeInTheDocument()
      })
      
      // Restore original clipboard
      navigator.clipboard.writeText = originalClipboard
    })
  })
})