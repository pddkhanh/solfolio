'use client'

import { useWallet } from '@solana/wallet-adapter-react'
import { useConnection } from '@solana/wallet-adapter-react'
import { LAMPORTS_PER_SOL } from '@solana/web3.js'
import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Copy, ExternalLink, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function WalletInfo() {
  const { publicKey, wallet } = useWallet()
  const { connection } = useConnection()
  const [balance, setBalance] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const fetchBalance = async () => {
      if (!publicKey) {
        setBalance(null)
        return
      }

      setLoading(true)
      try {
        const bal = await connection.getBalance(publicKey)
        setBalance(bal / LAMPORTS_PER_SOL)
      } catch (error) {
        console.error('Error fetching balance:', error)
        setBalance(null)
      } finally {
        setLoading(false)
      }
    }

    fetchBalance()
    
    // Set up subscription for balance changes
    if (publicKey) {
      const subscriptionId = connection.onAccountChange(
        publicKey,
        (accountInfo) => {
          setBalance(accountInfo.lamports / LAMPORTS_PER_SOL)
        }
      )
      
      return () => {
        connection.removeAccountChangeListener(subscriptionId)
      }
    }
  }, [publicKey, connection])

  const copyAddress = async () => {
    if (publicKey) {
      await navigator.clipboard.writeText(publicKey.toBase58())
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const openExplorer = () => {
    if (publicKey) {
      window.open(`https://explorer.solana.com/address/${publicKey.toBase58()}`, '_blank')
    }
  }

  if (!publicKey) {
    return null
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Wallet Information</CardTitle>
        <CardDescription>
          Connected with {wallet?.adapter.name}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-sm font-medium text-muted-foreground mb-1">Address</p>
          <div className="flex items-center gap-2">
            <code className="flex-1 text-sm bg-muted px-2 py-1 rounded font-mono">
              {publicKey.toBase58()}
            </code>
            <Button
              size="icon"
              variant="ghost"
              onClick={copyAddress}
              className="h-8 w-8"
              aria-label="Copy address"
            >
              {copied ? (
                <Check className="h-4 w-4" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
            <Button
              size="icon"
              variant="ghost"
              onClick={openExplorer}
              className="h-8 w-8"
              aria-label="View in explorer"
            >
              <ExternalLink className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <div>
          <p className="text-sm font-medium text-muted-foreground mb-1">SOL Balance</p>
          {loading ? (
            <Skeleton className="h-8 w-32" />
          ) : (
            <p className="text-2xl font-bold">
              {balance !== null ? `${balance.toFixed(4)} SOL` : '—'}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}