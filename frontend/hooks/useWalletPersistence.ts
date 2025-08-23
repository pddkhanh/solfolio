'use client'

import { useWallet } from '@solana/wallet-adapter-react'
import { useEffect } from 'react'

export function useWalletPersistence() {
  const { connected, publicKey } = useWallet()

  useEffect(() => {
    // Only run in browser environment
    if (typeof window === 'undefined') return

    try {
      if (connected && publicKey) {
        // Save connection state when wallet connects
        localStorage.setItem('walletConnected', 'true')
        localStorage.setItem('lastConnectedWallet', publicKey.toBase58())
      } else if (!connected) {
        // Clear connection state when wallet disconnects
        localStorage.setItem('walletConnected', 'false')
      }
    } catch (error) {
      // Handle cases where localStorage is not available
      console.warn('LocalStorage not available:', error)
    }
  }, [connected, publicKey])

  return { connected }
}