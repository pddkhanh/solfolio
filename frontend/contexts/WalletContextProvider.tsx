'use client'

import React, { FC, ReactNode, useMemo, useCallback, useEffect, createContext, useContext, useState } from 'react'
import { ConnectionProvider, WalletProvider, useWallet } from '@solana/wallet-adapter-react'
import { 
  PhantomWalletAdapter, 
  SolflareWalletAdapter,
  LedgerWalletAdapter,
  TorusWalletAdapter
} from '@solana/wallet-adapter-wallets'
import { clusterApiUrl } from '@solana/web3.js'
import { WalletError } from '@solana/wallet-adapter-base'

// Import wallet adapter CSS
import '@solana/wallet-adapter-react-ui/styles.css'

// Create a custom modal context to replace WalletModalProvider
interface WalletModalContextState {
  visible: boolean
  setVisible: (visible: boolean) => void
}

const WalletModalContext = createContext<WalletModalContextState>({
  visible: false,
  setVisible: () => {}
})

export const useWalletModal = () => {
  return useContext(WalletModalContext)
}

interface WalletContextProviderProps {
  children: ReactNode
}

export const WalletContextProvider: FC<WalletContextProviderProps> = ({ children }) => {
  const [modalVisible, setModalVisible] = useState(false)
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
    () => {
      // Check if we're in E2E test mode
      const isTestMode = process.env.NEXT_PUBLIC_E2E_TEST_MODE === 'true' || 
          (typeof window !== 'undefined' && (window as any).__E2E_TEST_MODE__)
      
      if (isTestMode) {
        console.log('[WalletProvider] E2E Test mode detected, using test wallet adapters')
        // For now, return empty array and handle connection differently
        // The test adapter approach needs proper build configuration
        return [
          new PhantomWalletAdapter(),
          new SolflareWalletAdapter(),
          new LedgerWalletAdapter(),
          new TorusWalletAdapter()
        ]
      }
      
      // Production wallets
      return [
        new PhantomWalletAdapter(),
        new SolflareWalletAdapter(),
        new LedgerWalletAdapter(),
        new TorusWalletAdapter()
      ]
    },
    []
  )

  // Handle wallet errors
  const onError = useCallback((error: WalletError) => {
    console.error('[WalletContextProvider] Wallet error caught:', error)
    console.error('[WalletContextProvider] Error type:', error.name)
    console.error('[WalletContextProvider] Error message:', error.message)
    console.error('[WalletContextProvider] Error stack:', error.stack)
    
    // Parse error message for user-friendly display
    let userMessage = 'Failed to connect wallet'
    
    if (error.message.includes('User rejected')) {
      userMessage = 'Connection cancelled by user'
    } else if (error.message.includes('not found') || error.message.includes('not installed')) {
      userMessage = 'Wallet not found. Please ensure your wallet extension is installed and enabled'
    } else if (error.message.includes('timeout')) {
      userMessage = 'Connection timed out. Please try again'
    } else if (error.message.includes('already processing')) {
      userMessage = 'Connection already in progress...'
    } else {
      // Generic error message with details
      userMessage = `Wallet connection failed: ${error.message}`
    }
    
    console.error(`[Wallet Error] ${userMessage}`)
    
    // Display error to user using alert for now (simple solution without dependencies)
    if (typeof window !== 'undefined') {
      // Store error message in sessionStorage for the WalletButton to display
      window.sessionStorage.setItem('wallet_error', userMessage)
      window.dispatchEvent(new Event('wallet_error'))
    }
    
    if ((window as any).__E2E_TEST_MODE__) {
      console.error('[WalletProvider] Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      })
    }
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
        <WalletModalContext.Provider value={{ visible: modalVisible, setVisible: setModalVisible }}>
          {children}
        </WalletModalContext.Provider>
      </WalletProvider>
    </ConnectionProvider>
  )
}