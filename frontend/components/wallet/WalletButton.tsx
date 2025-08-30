'use client'

import { useWallet } from '@solana/wallet-adapter-react'
import { useWalletModal } from '@/contexts/WalletContextProvider'
import { Button } from '@/components/ui/button'
import WalletConnectModal from './WalletConnectModal'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Wallet, Copy, LogOut, ChevronDown, Check, Loader2, AlertCircle } from 'lucide-react'
import { useEffect, useState } from 'react'

export default function WalletButton() {
  const { publicKey, disconnect, connecting, connected, wallet, connect } = useWallet()
  const { visible, setVisible } = useWalletModal()
  const [mounted, setMounted] = useState(false)
  const [copied, setCopied] = useState(false)
  const [connectionError, setConnectionError] = useState<string | null>(null)

  // Debug logging for wallet state changes
  useEffect(() => {
    console.log('[WalletButton] State changed:', {
      connected,
      connecting,
      publicKey: publicKey?.toString(),
      wallet: wallet?.adapter.name,
      connectionError
    })
    
    if (typeof window !== 'undefined' && (window as any).__E2E_TEST_MODE__) {
      console.log('[WalletButton] E2E Test Mode Active')
    }
  }, [connected, connecting, publicKey, wallet, connectionError])

  // Auto-connect when wallet is selected but not connected (for E2E tests)
  // This helps E2E tests by automatically connecting after wallet selection
  useEffect(() => {
    if (wallet && !connected && !connecting && typeof window !== 'undefined' && (window as any).__E2E_TEST_MODE__) {
      console.log('[WalletButton] E2E mode: Auto-connecting selected wallet...')
      connect().catch(err => {
        console.error('[WalletButton] E2E auto-connect failed:', err)
        setConnectionError(err.message)
      })
    }
  }, [wallet, connected, connecting, connect])
  
  // Clear error when connection succeeds
  useEffect(() => {
    if (connected && connectionError) {
      setConnectionError(null)
    }
  }, [connected, connectionError])

  useEffect(() => {
    setMounted(true)
    
    // Listen for wallet errors from the context
    const handleWalletError = () => {
      const error = window.sessionStorage.getItem('wallet_error')
      if (error) {
        setConnectionError(error)
        window.sessionStorage.removeItem('wallet_error')
      }
    }
    
    window.addEventListener('wallet_error', handleWalletError)
    return () => window.removeEventListener('wallet_error', handleWalletError)
  }, [])

  if (!mounted) {
    return (
      <Button disabled>
        <Wallet className="mr-2 h-4 w-4" />
        Connect Wallet
      </Button>
    )
  }

  const handleConnect = () => {
    console.log('[WalletButton] Opening wallet modal...')
    console.log('[WalletButton] Available wallets:', wallet?.adapter.name)
    console.log('[WalletButton] Wallet state:', { connected, connecting, publicKey: publicKey?.toString() })
    setConnectionError(null)
    setVisible(true)
  }

  const handleDisconnect = async () => {
    try {
      console.log('[WalletButton] Disconnecting wallet...')
      await disconnect()
    } catch (error: any) {
      console.error('[WalletButton] Disconnect error:', error)
    }
  }

  const handleSwitchWallet = async () => {
    try {
      console.log('[WalletButton] Switching wallet...')
      await disconnect()
      setConnectionError(null)
      setVisible(true)
    } catch (error: any) {
      console.error('[WalletButton] Switch wallet error:', error)
    }
  }

  const formatAddress = (address: string) => {
    return `${address.slice(0, 4)}...${address.slice(-4)}`
  }

  const copyAddress = async () => {
    if (publicKey) {
      try {
        await navigator.clipboard.writeText(publicKey.toBase58())
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      } catch (error) {
        if (process.env.NODE_ENV !== 'test') {
          console.error('Failed to copy address:', error)
        }
      }
    }
  }

  if (!connected) {
    return (
      <>
        <div className="flex flex-col items-end gap-2">
          <Button
            onClick={handleConnect}
            disabled={connecting}
            variant={connectionError ? "destructive" : "default"}
            data-testid="connect-wallet-button"
            className="shadow-sm hover:shadow-md transition-all"
          >
            {connecting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Connecting...
              </>
            ) : connectionError ? (
              <>
                <AlertCircle className="mr-2 h-4 w-4" />
                Retry Connection
              </>
            ) : (
              <>
                <Wallet className="mr-2 h-4 w-4" />
                Connect Wallet
              </>
            )}
          </Button>
          {connectionError && (
            <div className="text-xs text-destructive max-w-xs text-right animate-in slide-in-from-top-1">
              {connectionError}
            </div>
          )}
        </div>
        <WalletConnectModal />
      </>
    )
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="outline" 
            className="gap-2 shadow-sm hover:shadow-md transition-all"
            data-testid="wallet-dropdown-button"
          >
            <Wallet className="h-4 w-4" />
            <span className="hidden sm:inline font-mono">
              {publicKey && formatAddress(publicKey.toBase58())}
            </span>
            <ChevronDown className="h-3 w-3 opacity-50" />
          </Button>
        </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <div className="px-2 py-1.5">
          <p className="text-sm font-medium">Connected Wallet</p>
          <p className="text-xs text-muted-foreground mt-1">
            {wallet?.adapter.name}
          </p>
          <p className="text-xs text-muted-foreground mt-1 font-mono">
            {publicKey && formatAddress(publicKey.toBase58())}
          </p>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={copyAddress}>
          {copied ? (
            <Check className="mr-2 h-4 w-4" />
          ) : (
            <Copy className="mr-2 h-4 w-4" />
          )}
          {copied ? 'Copied!' : 'Copy Address'}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleSwitchWallet}>
          <Wallet className="mr-2 h-4 w-4" />
          Switch Wallet
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleDisconnect} className="text-destructive">
          <LogOut className="mr-2 h-4 w-4" />
          Disconnect
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
    <WalletConnectModal />
    </>
  )
}