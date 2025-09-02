'use client'

import { useState, useEffect } from 'react'
import { LandingPage } from '@/components/landing-page'
import { WalletModal } from '@/components/wallet-modal'
import { DashboardPage } from '@/components/dashboard-page'

export default function HomePage() {
  const [mounted, setMounted] = useState(false)
  const [walletConnected, setWalletConnected] = useState(false)
  const [showWalletModal, setShowWalletModal] = useState(false)
  const [connectedWallet, setConnectedWallet] = useState<string | null>(null)

  useEffect(() => {
    setMounted(true)
    // Check if wallet was previously connected (from localStorage)
    const savedWallet = localStorage.getItem('connectedWallet')
    if (savedWallet) {
      setWalletConnected(true)
      setConnectedWallet(savedWallet)
    }
  }, [])

  if (!mounted) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4" />
          <p className="text-muted-foreground">Loading SolFolio...</p>
        </div>
      </div>
    )
  }

  const handleConnectWallet = () => {
    setShowWalletModal(true)
  }

  const handleWalletConnect = (wallet: string) => {
    setConnectedWallet(wallet)
    setWalletConnected(true)
    setShowWalletModal(false)
    localStorage.setItem('connectedWallet', wallet)
  }

  const handleDisconnect = () => {
    setWalletConnected(false)
    setConnectedWallet(null)
    localStorage.removeItem('connectedWallet')
  }

  // If wallet is not connected, show landing page
  if (!walletConnected) {
    return (
      <>
        <LandingPage onConnectWallet={handleConnectWallet} />
        <WalletModal 
          isOpen={showWalletModal}
          onClose={() => setShowWalletModal(false)}
          onConnect={handleWalletConnect}
        />
      </>
    )
  }

  // If wallet is connected, show dashboard
  return (
    <DashboardPage 
      walletAddress={connectedWallet || 'Connected'} 
      onDisconnect={handleDisconnect}
    />
  )
}