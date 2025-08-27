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
    let isMounted = true
    
    const fetchBalance = async () => {
      if (!publicKey) {
        setBalance(null)
        return
      }

      setLoading(true)
      try {
        const bal = await connection.getBalance(publicKey)
        if (isMounted) {
          setBalance(bal / LAMPORTS_PER_SOL)
        }
      } catch (error) {
        if (process.env.NODE_ENV !== 'test') {
          console.error('Error fetching balance:', error)
        }
        if (isMounted) {
          setBalance(null)
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    fetchBalance()
    
    // Set up subscription for balance changes
    if (publicKey) {
      const subscriptionId = connection.onAccountChange(
        publicKey,
        (accountInfo) => {
          if (isMounted) {
            setBalance(accountInfo.lamports / LAMPORTS_PER_SOL)
          }
        }
      )
      
      return () => {
        isMounted = false
        connection.removeAccountChangeListener(subscriptionId)
      }
    }
    
    return () => {
      isMounted = false
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
    <Card className="w-full" data-testid="wallet-info">
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