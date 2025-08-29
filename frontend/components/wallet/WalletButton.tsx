'use client'

import { useWallet } from '@solana/wallet-adapter-react'
import { useWalletModal } from '@solana/wallet-adapter-react-ui'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Wallet, Copy, LogOut, ChevronDown, Check } from 'lucide-react'
import { useEffect, useState } from 'react'

export default function WalletButton() {
  const { publicKey, disconnect, connecting, connected, wallet, connect } = useWallet()
  const { setVisible } = useWalletModal()
  const [mounted, setMounted] = useState(false)
  const [copied, setCopied] = useState(false)

  // Debug logging for E2E tests
  useEffect(() => {
    if (typeof window !== 'undefined' && (window as any).__E2E_TEST_MODE__) {
      console.log('[WalletButton] State:', {
        connected,
        connecting,
        publicKey: publicKey?.toString(),
        wallet: wallet?.adapter.name
      })
    }
  }, [connected, connecting, publicKey, wallet])

  // Auto-connect when wallet is selected but not connected (for E2E tests)
  // This helps E2E tests by automatically connecting after wallet selection
  useEffect(() => {
    if (wallet && !connected && !connecting && typeof window !== 'undefined' && (window as any).__E2E_TEST_MODE__) {
      console.log('[WalletButton] E2E mode: Auto-connecting selected wallet...')
      connect().catch(err => {
        console.error('[WalletButton] E2E auto-connect failed:', err)
      })
    }
  }, [wallet, connected, connecting, connect])

  useEffect(() => {
    setMounted(true)
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
    setVisible(true)
  }

  const handleDisconnect = async () => {
    await disconnect()
  }

  const handleSwitchWallet = async () => {
    await disconnect()
    setVisible(true)
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
      <Button
        onClick={handleConnect}
        disabled={connecting}
        variant="default"
      >
        <Wallet className="mr-2 h-4 w-4" />
        {connecting ? 'Connecting...' : 'Connect Wallet'}
      </Button>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Wallet className="h-4 w-4" />
          <span className="hidden sm:inline">
            {publicKey && formatAddress(publicKey.toBase58())}
          </span>
          <ChevronDown className="h-3 w-3" />
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
  )
}