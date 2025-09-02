'use client'

import { useState } from 'react'
import { Wallet, ChevronDown, LogOut, Copy, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { shortenAddress } from '@/lib/utils'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface WalletButtonProps {
  onConnect?: () => void
  onDisconnect?: () => void
}

export function WalletButton({ onConnect, onDisconnect }: WalletButtonProps) {
  const [isConnected, setIsConnected] = useState(false)
  const [address] = useState('7xKXtfg2qQRnVhAJKnGkPxWqMYZLLqMefEVPPpGfSA3L')

  const handleConnect = () => {
    setIsConnected(true)
    onConnect?.()
  }

  const handleDisconnect = () => {
    setIsConnected(false)
    onDisconnect?.()
  }

  const copyAddress = () => {
    navigator.clipboard.writeText(address)
  }

  if (!isConnected) {
    return (
      <Button
        onClick={handleConnect}
        variant="gradient"
        className="group"
      >
        <Wallet className="w-4 h-4" />
        Connect Wallet
      </Button>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="gap-2">
          <div className="w-2 h-2 bg-success rounded-full animate-pulse" />
          {shortenAddress(address)}
          <ChevronDown className="w-4 h-4 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuItem onClick={copyAddress} className="cursor-pointer">
          <Copy className="w-4 h-4 mr-2" />
          Copy Address
        </DropdownMenuItem>
        <DropdownMenuItem className="cursor-pointer">
          <ExternalLink className="w-4 h-4 mr-2" />
          View on Explorer
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleDisconnect} className="cursor-pointer text-destructive">
          <LogOut className="w-4 h-4 mr-2" />
          Disconnect
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}