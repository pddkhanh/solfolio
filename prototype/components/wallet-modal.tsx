'use client'

import { useState } from 'react'
import { X, Wallet, ChevronRight, Shield, Info } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

interface WalletModalProps {
  isOpen: boolean
  onClose: () => void
  onConnect: (wallet: string) => void
}

export function WalletModal({ isOpen, onClose, onConnect }: WalletModalProps) {
  const [isConnecting, setIsConnecting] = useState(false)
  const [selectedWallet, setSelectedWallet] = useState<string | null>(null)

  const wallets = [
    {
      name: 'Phantom',
      icon: '👻',
      description: 'Most popular Solana wallet',
      installed: true,
    },
    {
      name: 'Backpack',
      icon: '🎒',
      description: 'Multi-chain wallet & xNFT platform',
      installed: true,
    },
    {
      name: 'Solflare',
      icon: '☀️',
      description: 'Solana wallet with staking',
      installed: false,
    },
    {
      name: 'Ledger',
      icon: '🔒',
      description: 'Hardware wallet for security',
      installed: false,
    },
  ]

  const handleConnect = async (walletName: string) => {
    setIsConnecting(true)
    setSelectedWallet(walletName)
    
    // Simulate connection delay
    setTimeout(() => {
      onConnect(walletName)
      setIsConnecting(false)
      setSelectedWallet(null)
    }, 1500)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            Connect Your Wallet
          </DialogTitle>
          <DialogDescription>
            Choose your preferred Solana wallet to connect to SolFolio
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-4">
          {wallets.map((wallet) => (
            <button
              key={wallet.name}
              onClick={() => handleConnect(wallet.name)}
              disabled={!wallet.installed || isConnecting}
              className={`
                w-full rounded-lg border p-4 text-left transition-all
                ${wallet.installed 
                  ? 'border-border hover:border-primary hover:bg-muted/50' 
                  : 'border-border/50 opacity-50 cursor-not-allowed'
                }
                ${selectedWallet === wallet.name ? 'border-primary bg-primary/10' : ''}
              `}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{wallet.icon}</span>
                  <div>
                    <div className="font-semibold flex items-center gap-2">
                      {wallet.name}
                      {!wallet.installed && (
                        <span className="text-xs bg-muted px-2 py-1 rounded">
                          Not Installed
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {wallet.description}
                    </div>
                  </div>
                </div>
                {wallet.installed && (
                  <ChevronRight className={`
                    h-5 w-5 text-muted-foreground transition-transform
                    ${selectedWallet === wallet.name ? 'translate-x-1' : ''}
                  `} />
                )}
              </div>
              {selectedWallet === wallet.name && isConnecting && (
                <div className="mt-3 flex items-center gap-2 text-sm text-primary">
                  <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                  Connecting to {wallet.name}...
                </div>
              )}
            </button>
          ))}
        </div>

        <div className="border-t pt-4">
          <div className="flex items-start gap-2 text-sm text-muted-foreground">
            <Shield className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <p>
              SolFolio only requires <strong>read-only</strong> access to your wallet. 
              We never request signatures or transactions.
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2">
          <a 
            href="#" 
            className="text-sm text-primary hover:underline flex items-center gap-1"
          >
            <Info className="h-3 w-3" />
            Learn about wallet safety
          </a>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}