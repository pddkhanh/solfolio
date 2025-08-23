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
  const { publicKey, disconnect, connecting, connected, wallet } = useWallet()
  const { setVisible } = useWalletModal()
  const [mounted, setMounted] = useState(false)
  const [copied, setCopied] = useState(false)

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
      await navigator.clipboard.writeText(publicKey.toBase58())
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
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