'use client'

import React, { useCallback, useEffect, useState } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { useWalletModal } from '@/contexts/WalletContextProvider'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, AlertCircle, CheckCircle2, Wallet, X } from 'lucide-react'

export default function WalletConnectModal() {
  const { wallets, select, wallet, connect, connecting, connected } = useWallet()
  const { visible, setVisible } = useWalletModal()
  const [selectedWallet, setSelectedWallet] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isConnecting, setIsConnecting] = useState(false)

  // Debug logging
  useEffect(() => {
    console.log('[WalletConnectModal] Modal visibility changed:', visible)
  }, [visible])

  // Reset state when modal opens
  useEffect(() => {
    if (visible) {
      console.log('[WalletConnectModal] Modal opened, resetting state')
      setSelectedWallet(null)
      setError(null)
      setIsConnecting(false)
    }
  }, [visible])

  // Auto-connect when wallet is selected
  useEffect(() => {
    if (selectedWallet && wallet?.adapter.name === selectedWallet && !connected && !isConnecting) {
      handleConnect()
    }
  }, [selectedWallet, wallet, connected])

  // Close modal on successful connection
  useEffect(() => {
    if (connected && selectedWallet) {
      setTimeout(() => {
        setVisible(false)
        setSelectedWallet(null)
      }, 500) // Brief delay to show success
    }
  }, [connected, selectedWallet, setVisible])

  const handleConnect = async () => {
    if (!wallet) return
    
    setIsConnecting(true)
    setError(null)
    
    try {
      await connect()
      console.log('[WalletConnectModal] Successfully connected to', wallet.adapter.name)
    } catch (err: any) {
      console.error('[WalletConnectModal] Connection failed:', err)
      const errorMessage = err.message || 'Failed to connect wallet'
      
      if (errorMessage.includes('User rejected')) {
        setError('Connection cancelled by user')
      } else if (errorMessage.includes('not found') || errorMessage.includes('not installed')) {
        setError(`${wallet.adapter.name} wallet not found. Please ensure the extension is installed and enabled.`)
      } else if (errorMessage.includes('timeout')) {
        setError('Connection timed out. Please try again.')
      } else {
        setError(errorMessage)
      }
    } finally {
      setIsConnecting(false)
    }
  }

  const handleWalletSelect = (walletName: string) => {
    console.log('[WalletConnectModal] Selecting wallet:', walletName)
    setSelectedWallet(walletName)
    setError(null)
    select(walletName as any)
  }

  const handleClose = () => {
    setVisible(false)
    setSelectedWallet(null)
    setError(null)
  }

  // Always render the dialog component, control visibility with the open prop
  return (
    <Dialog open={visible} onOpenChange={setVisible}>
      <DialogContent 
        className="sm:max-w-md w-[95vw] max-w-[450px] p-0 gap-0"
        data-testid="wallet-connect-modal" 
        onPointerDownOutside={(e) => {
          // Prevent closing while connecting
          if (isConnecting || connecting) {
            e.preventDefault()
          }
        }}
        onEscapeKeyDown={(e) => {
          // Prevent closing while connecting
          if (isConnecting || connecting) {
            e.preventDefault()
          }
        }}
      >
        <DialogHeader className="px-6 pt-6 pb-4">
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Wallet className="h-5 w-5 text-primary" />
            {selectedWallet ? 'Connecting Wallet' : 'Connect Your Wallet'}
          </DialogTitle>
          <DialogDescription className="text-sm mt-2">
            {selectedWallet 
              ? `Please approve the connection request in your ${selectedWallet} wallet` 
              : 'Choose a wallet to connect to SolFolio'}
          </DialogDescription>
        </DialogHeader>
        
        <div className="px-6 pb-6">
          {/* Show wallet list or connection status */}
          {!selectedWallet ? (
            <div className="space-y-3">
              {wallets.length > 0 ? (
                <div className="grid gap-2">
                  {wallets.map((wallet) => (
                    <Button
                      key={wallet.adapter.name}
                      variant="outline"
                      className="justify-start h-14 px-4 hover:bg-accent hover:border-primary/50 transition-all duration-200 group"
                      onClick={() => handleWalletSelect(wallet.adapter.name)}
                      data-testid={`wallet-option-${wallet.adapter.name.toLowerCase()}`}
                    >
                      <img
                        src={wallet.adapter.icon}
                        alt={wallet.adapter.name}
                        className="mr-3 h-7 w-7 rounded-md"
                        onError={(e) => {
                          // Fallback icon if wallet icon fails to load
                          e.currentTarget.style.display = 'none'
                        }}
                      />
                      <span className="font-medium text-base">{wallet.adapter.name}</span>
                      {wallet.readyState === 'Installed' && (
                        <span className="ml-auto text-xs text-green-600 dark:text-green-400 font-medium">Installed</span>
                      )}
                    </Button>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
                    <Wallet className="h-8 w-8 opacity-60" />
                  </div>
                  <p className="text-base font-medium mb-2">No wallets detected</p>
                  <p className="text-sm">Please install a Solana wallet extension</p>
                </div>
              )}
              
              {/* Help text */}
              {wallets.length > 0 && (
                <div className="text-center text-xs text-muted-foreground pt-4 border-t">
                  <p>New to Solana wallets?</p>
                  <a 
                    href="https://solana.com/ecosystem/explore?categories=wallet" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary hover:underline inline-flex items-center gap-1 mt-1"
                  >
                    Learn more about wallets
                    <span aria-hidden="true">→</span>
                  </a>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {/* Connection Status */}
              <div className="flex items-center justify-center py-12">
                {isConnecting || connecting ? (
                  <div className="text-center">
                    <Loader2 className="h-14 w-14 animate-spin mx-auto mb-4 text-primary" />
                    <p className="text-base font-medium mb-2">
                      Connecting to {selectedWallet}...
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Please approve the connection in your wallet
                    </p>
                  </div>
                ) : connected ? (
                  <div className="text-center">
                    <div className="relative inline-block">
                      <CheckCircle2 className="h-16 w-16 mx-auto mb-4 text-green-500 animate-in zoom-in duration-300" />
                      <div className="absolute inset-0 h-16 w-16 bg-green-500/20 rounded-full animate-ping" />
                    </div>
                    <p className="text-lg font-semibold text-green-600 dark:text-green-400 mb-1">
                      Successfully connected!
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {selectedWallet} is now connected
                    </p>
                  </div>
                ) : error ? (
                  <div className="w-full">
                    <Alert variant="destructive" className="mb-4">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                    <div className="flex gap-3">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setSelectedWallet(null)
                          setError(null)
                        }}
                        className="flex-1"
                        data-testid="choose-another-wallet"
                      >
                        Choose Another
                      </Button>
                      <Button
                        onClick={handleConnect}
                        className="flex-1"
                        data-testid="retry-connection"
                      >
                        Try Again
                      </Button>
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}