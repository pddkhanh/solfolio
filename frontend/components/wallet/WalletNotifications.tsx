'use client'

import { useEffect, useRef } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { toast } from 'sonner'

export default function WalletNotifications() {
  const { publicKey, connected, connecting, disconnecting, wallet } = useWallet()
  const lastPublicKeyRef = useRef<string | null>(null)
  const hasShownConnectedRef = useRef(false)
  
  // Handle connection status changes
  useEffect(() => {
    const currentKey = publicKey?.toBase58() || null
    const lastKey = lastPublicKeyRef.current
    
    // Wallet just connected
    if (connected && currentKey && currentKey !== lastKey) {
      const walletName = wallet?.adapter.name || 'Unknown Wallet'
      const shortAddress = `${currentKey.slice(0, 4)}...${currentKey.slice(-4)}`
      
      toast.success('Wallet Connected!', {
        description: `Connected to ${walletName} (${shortAddress})`,
        duration: 4000,
      })
      hasShownConnectedRef.current = true
    }
    
    // Wallet disconnected (but not on initial load)
    if (!connected && lastKey && hasShownConnectedRef.current) {
      toast.info('Wallet Disconnected', {
        description: 'You have been disconnected from your wallet',
        duration: 3000,
      })
      hasShownConnectedRef.current = false
    }
    
    lastPublicKeyRef.current = currentKey
  }, [publicKey, connected, wallet])
  
  // Show connecting status for long connections
  useEffect(() => {
    let timeoutId: NodeJS.Timeout
    
    if (connecting) {
      // Show loading toast after 2 seconds if still connecting
      timeoutId = setTimeout(() => {
        toast.loading('Connecting to wallet...', {
          id: 'wallet-connecting',
          description: 'Please approve the connection in your wallet'
        })
      }, 2000)
    } else {
      // Dismiss the loading toast
      toast.dismiss('wallet-connecting')
    }
    
    return () => {
      clearTimeout(timeoutId)
      toast.dismiss('wallet-connecting')
    }
  }, [connecting])
  
  // Show disconnecting status
  useEffect(() => {
    if (disconnecting) {
      toast.loading('Disconnecting wallet...', {
        id: 'wallet-disconnecting'
      })
    } else {
      toast.dismiss('wallet-disconnecting')
    }
    
    return () => {
      toast.dismiss('wallet-disconnecting')
    }
  }, [disconnecting])
  
  return null
}