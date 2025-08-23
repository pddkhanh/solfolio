'use client'

import { useWallet } from '@solana/wallet-adapter-react'
import { useWalletModal } from '@solana/wallet-adapter-react-ui'
import { Button } from '@/components/ui/button'
import { Wallet } from 'lucide-react'
import { useEffect, useState } from 'react'

export default function WalletButton() {
  const { publicKey, disconnect, connecting, connected } = useWallet()
  const { setVisible } = useWalletModal()
  const [mounted, setMounted] = useState(false)

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

  const handleClick = () => {
    if (connected) {
      disconnect()
    } else {
      setVisible(true)
    }
  }

  const formatAddress = (address: string) => {
    return `${address.slice(0, 4)}...${address.slice(-4)}`
  }

  return (
    <Button
      onClick={handleClick}
      disabled={connecting}
      variant={connected ? 'outline' : 'default'}
    >
      <Wallet className="mr-2 h-4 w-4" />
      {connecting && 'Connecting...'}
      {connected && publicKey && formatAddress(publicKey.toBase58())}
      {!connecting && !connected && 'Connect Wallet'}
    </Button>
  )
}