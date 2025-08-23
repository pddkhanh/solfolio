'use client'

import React, { FC, ReactNode, useMemo, useCallback } from 'react'
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react'
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui'
import { 
  PhantomWalletAdapter, 
  SolflareWalletAdapter,
  LedgerWalletAdapter,
  TorusWalletAdapter
} from '@solana/wallet-adapter-wallets'
import { clusterApiUrl } from '@solana/web3.js'
import { WalletError } from '@solana/wallet-adapter-base'

// Import wallet adapter CSS
require('@solana/wallet-adapter-react-ui/styles.css')

interface WalletContextProviderProps {
  children: ReactNode
}

export const WalletContextProvider: FC<WalletContextProviderProps> = ({ children }) => {
  // Configure RPC endpoint - use Helius in production, devnet for development
  const endpoint = useMemo(() => {
    if (process.env.NEXT_PUBLIC_HELIUS_RPC_URL) {
      return process.env.NEXT_PUBLIC_HELIUS_RPC_URL
    }
    // Fallback to devnet for development
    return clusterApiUrl('devnet')
  }, [])

  // Configure wallets
  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
      new SolflareWalletAdapter(),
      new LedgerWalletAdapter(),
      new TorusWalletAdapter()
    ],
    []
  )

  // Handle wallet errors
  const onError = useCallback((error: WalletError) => {
    console.error('Wallet error:', error)
  }, [])

  // Persist wallet selection
  const autoConnect = useMemo(() => {
    // Check if we're in browser environment
    if (typeof window !== 'undefined') {
      const hasConnectedBefore = localStorage.getItem('walletConnected')
      return hasConnectedBefore === 'true'
    }
    return false
  }, [])

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider 
        wallets={wallets} 
        autoConnect={autoConnect}
        onError={onError}
        localStorageKey="solfolio-wallet"
      >
        <WalletModalProvider>
          {children}
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  )
}