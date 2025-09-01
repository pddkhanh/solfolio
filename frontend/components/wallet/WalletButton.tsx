'use client'

import { useWallet } from '@solana/wallet-adapter-react'
import { useWalletModal } from '@/contexts/WalletContextProvider'
import { Button } from '@/components/ui/button'
import WalletConnectModal from './WalletConnectModal'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Wallet, Copy, LogOut, ChevronDown, Check, Loader2, AlertCircle, User } from 'lucide-react'
import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { 
  buttonHoverVariants, 
  fadeVariants,
  pulseVariants,
  animationConfig 
} from '@/lib/animations'
import { 
  getFocusRingClass,
  useAnnounce,
  KEYS
} from '@/lib/accessibility'

export default function WalletButton() {
  const { publicKey, disconnect, connecting, connected, wallet, connect } = useWallet()
  const { visible, setVisible } = useWalletModal()
  const [mounted, setMounted] = useState(false)
  const [copied, setCopied] = useState(false)
  const [connectionError, setConnectionError] = useState<string | null>(null)
  const announce = useAnnounce()

  // Debug logging for wallet state changes
  useEffect(() => {
    console.log('[WalletButton] State changed:', {
      connected,
      connecting,
      publicKey: publicKey?.toString(),
      wallet: wallet?.adapter.name,
      connectionError
    })
    
    if (typeof window !== 'undefined' && (window as any).__E2E_TEST_MODE__) {
      console.log('[WalletButton] E2E Test Mode Active')
    }
  }, [connected, connecting, publicKey, wallet, connectionError])

  // Auto-connect when wallet is selected but not connected (for E2E tests)
  // This helps E2E tests by automatically connecting after wallet selection
  useEffect(() => {
    if (wallet && !connected && !connecting && typeof window !== 'undefined' && (window as any).__E2E_TEST_MODE__) {
      console.log('[WalletButton] E2E mode: Auto-connecting selected wallet...')
      connect().catch(err => {
        console.error('[WalletButton] E2E auto-connect failed:', err)
        setConnectionError(err.message)
      })
    }
  }, [wallet, connected, connecting, connect])
  
  const formatAddress = (address: string) => {
    return `${address.slice(0, 4)}...${address.slice(-4)}`
  }

  // Clear error when connection succeeds and announce to screen readers
  useEffect(() => {
    if (connected && connectionError) {
      setConnectionError(null)
    }
    if (connected && publicKey) {
      announce(`Wallet connected. Address: ${formatAddress(publicKey.toBase58())}`, 'polite')
    }
  }, [connected, connectionError, publicKey, announce])

  useEffect(() => {
    setMounted(true)
    
    // Listen for wallet errors from the context
    const handleWalletError = () => {
      const error = window.sessionStorage.getItem('wallet_error')
      if (error) {
        setConnectionError(error)
        window.sessionStorage.removeItem('wallet_error')
      }
    }
    
    window.addEventListener('wallet_error', handleWalletError)
    return () => window.removeEventListener('wallet_error', handleWalletError)
  }, [])

  if (!mounted) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <Button disabled className="relative overflow-hidden">
          <Wallet className="mr-2 h-4 w-4" />
          Connect Wallet
        </Button>
      </motion.div>
    )
  }

  const handleConnect = () => {
    console.log('[WalletButton] Connect button clicked')
    console.log('[WalletButton] Current modal visibility:', visible)
    console.log('[WalletButton] Setting modal visibility to true')
    setConnectionError(null)
    setVisible(true)
    console.log('[WalletButton] Modal visibility set, should be visible now')
  }

  const handleDisconnect = async () => {
    try {
      console.log('[WalletButton] Disconnecting wallet...')
      await disconnect()
    } catch (error: any) {
      console.error('[WalletButton] Disconnect error:', error)
    }
  }

  const handleSwitchWallet = async () => {
    try {
      console.log('[WalletButton] Switching wallet...')
      await disconnect()
      setConnectionError(null)
      setVisible(true)
    } catch (error: any) {
      console.error('[WalletButton] Switch wallet error:', error)
    }
  }

  // Generate a gradient avatar based on wallet address
  const getAvatarGradient = (address: string) => {
    if (!address) return 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    const hash = address.slice(0, 6)
    const hue1 = parseInt(hash.slice(0, 3), 16) % 360
    const hue2 = (hue1 + 40) % 360
    return `linear-gradient(135deg, hsl(${hue1}, 70%, 60%) 0%, hsl(${hue2}, 70%, 50%) 100%)`
  }

  const copyAddress = async () => {
    if (publicKey) {
      try {
        await navigator.clipboard.writeText(publicKey.toBase58())
        setCopied(true)
        announce('Wallet address copied to clipboard', 'assertive')
        setTimeout(() => setCopied(false), 2000)
      } catch (error) {
        if (process.env.NODE_ENV !== 'test') {
          console.error('Failed to copy address:', error)
          announce('Failed to copy address', 'assertive')
        }
      }
    }
  }

  return (
    <>
      {!connected ? (
        <div className="flex flex-col items-end gap-2">
          <motion.div
            variants={buttonHoverVariants}
            initial="rest"
            whileHover="hover"
            whileTap="tap"
          >
            <Button
              onClick={handleConnect}
              disabled={connecting}
              variant={connectionError ? "destructive" : "default"}
              data-testid="connect-wallet-button"
              aria-label={connecting ? 'Connecting to wallet' : connectionError ? 'Retry wallet connection' : 'Connect your Solana wallet'}
              aria-busy={connecting}
              aria-describedby={connectionError ? 'wallet-error-message' : undefined}
              className={cn(
                "relative overflow-hidden shadow-sm transition-all",
                "bg-gradient-to-r from-solana-purple to-solana-green",
                "hover:shadow-lg hover:shadow-solana-purple/20",
                "border border-white/10",
                connectionError && "from-red-500 to-red-600",
                getFocusRingClass()
              )}
            >
              <AnimatePresence mode="wait">
                {connecting ? (
                  <motion.div
                    key="connecting"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="flex items-center"
                  >
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    >
                      <Loader2 className="mr-2 h-4 w-4" />
                    </motion.div>
                    Connecting...
                  </motion.div>
                ) : connectionError ? (
                  <motion.div
                    key="error"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="flex items-center"
                  >
                    <motion.div
                      variants={pulseVariants}
                      animate="animate"
                    >
                      <AlertCircle className="mr-2 h-4 w-4" />
                    </motion.div>
                    Retry Connection
                  </motion.div>
                ) : (
                  <motion.div
                    key="connect"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="flex items-center"
                  >
                    <Wallet className="mr-2 h-4 w-4" />
                    Connect Wallet
                  </motion.div>
                )}
              </AnimatePresence>
              
              {/* Animated gradient background */}
              <motion.div
                className="absolute inset-0 opacity-30"
                animate={{
                  backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "linear",
                }}
                style={{
                  background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)",
                  backgroundSize: "200% 100%",
                }}
              />
            </Button>
          </motion.div>
          
          <AnimatePresence>
            {connectionError && (
              <motion.div
                id="wallet-error-message"
                role="alert"
                aria-live="assertive"
                initial={{ opacity: 0, y: -5, height: 0 }}
                animate={{ opacity: 1, y: 0, height: "auto" }}
                exit={{ opacity: 0, y: -5, height: 0 }}
                transition={{ duration: 0.2 }}
                className="text-xs text-destructive max-w-xs text-right"
              >
                {connectionError}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ) : (
        <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <motion.div
            variants={buttonHoverVariants}
            initial="rest"
            whileHover="hover"
            whileTap="tap"
          >
            <Button 
              variant="outline" 
              aria-label={`Wallet menu. Connected as ${publicKey ? formatAddress(publicKey.toBase58()) : 'unknown'}`}
              aria-haspopup="menu"
              aria-expanded={false}
              className={cn(
                "group relative overflow-hidden",
                "bg-bg-secondary/50 backdrop-blur-sm",
                "border border-border-default hover:border-solana-purple/50",
                "shadow-sm hover:shadow-md hover:shadow-solana-purple/10",
                "transition-all duration-200",
                getFocusRingClass()
              )}
              data-testid="wallet-dropdown-button"
            >
              {/* Wallet Avatar */}
              <motion.div 
                className="relative h-6 w-6 rounded-full overflow-hidden mr-2"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ 
                  type: "spring",
                  stiffness: 500,
                  damping: 20,
                  delay: 0.1
                }}
              >
                <div 
                  className="h-full w-full"
                  style={{ 
                    background: getAvatarGradient(publicKey?.toBase58() || '')
                  }}
                />
                <div className="absolute inset-0 flex items-center justify-center" aria-hidden="true">
                  <User className="h-3 w-3 text-white/80" />
                </div>
                
                {/* Connected status dot */}
                <motion.div
                  className="absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full bg-success border border-bg-primary"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.3 }}
                  aria-label="Wallet connected"
                  role="status"
                >
                  <motion.div
                    className="absolute inset-0 rounded-full bg-success"
                    animate={{ scale: [1, 1.5, 1], opacity: [1, 0, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                </motion.div>
              </motion.div>
              
              <span className="hidden sm:inline font-mono text-sm">
                {publicKey && formatAddress(publicKey.toBase58())}
              </span>
              
              <motion.div
                animate={{ rotate: 0 }}
                whileHover={{ rotate: 180 }}
                transition={{ duration: 0.3 }}
              >
                <ChevronDown className="ml-1 h-3 w-3 opacity-50" />
              </motion.div>
              
              {/* Hover gradient effect */}
              <motion.div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
                style={{
                  background: "linear-gradient(90deg, transparent, rgba(153, 69, 255, 0.1), transparent)",
                }}
                animate={{
                  x: ["-100%", "100%"],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "linear",
                }}
              />
            </Button>
          </motion.div>
        </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end" 
        className={cn(
          "w-56 p-1",
          "bg-bg-secondary/95 backdrop-blur-xl",
          "border border-border-default/50",
          "shadow-xl shadow-black/20"
        )}
      >
        <motion.div 
          className="px-3 py-2"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          <div className="flex items-center gap-3">
            {/* Wallet Avatar in dropdown */}
            <div 
              className="h-10 w-10 rounded-full overflow-hidden ring-2 ring-border-default/50"
              style={{ 
                background: getAvatarGradient(publicKey?.toBase58() || '')
              }}
            >
              <div className="h-full w-full flex items-center justify-center">
                <User className="h-5 w-5 text-white/80" />
              </div>
            </div>
            
            <div className="flex-1">
              <p className="text-sm font-medium text-text-primary">Connected</p>
              <p className="text-xs text-text-secondary">
                {wallet?.adapter.name}
              </p>
            </div>
            
            {/* Connection status */}
            <div className="flex items-center">
              <div className="h-2 w-2 rounded-full bg-success animate-pulse" />
            </div>
          </div>
          
          {/* Address display */}
          <div className="mt-3 p-2 bg-bg-tertiary/50 rounded-md">
            <p className="text-xs text-text-secondary font-mono">
              {publicKey && publicKey.toBase58()}
            </p>
          </div>
        </motion.div>
        <DropdownMenuSeparator className="bg-border-default/30" />
        <DropdownMenuItem 
          onClick={copyAddress}
          onKeyDown={(e) => {
            if (e.key === KEYS.ENTER || e.key === KEYS.SPACE) {
              e.preventDefault()
              copyAddress()
            }
          }}
          className="group cursor-pointer transition-colors hover:bg-accent/10 focus:bg-accent/10 focus:outline-none"
          role="menuitem"
          aria-label="Copy wallet address to clipboard"
        >
          <AnimatePresence mode="wait">
            {copied ? (
              <motion.div
                key="check"
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                exit={{ scale: 0, rotate: 180 }}
                transition={{ duration: 0.2 }}
                className="mr-2"
              >
                <Check className="h-4 w-4 text-success" />
              </motion.div>
            ) : (
              <motion.div
                key="copy"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                transition={{ duration: 0.2 }}
                className="mr-2"
              >
                <Copy className="h-4 w-4" />
              </motion.div>
            )}
          </AnimatePresence>
          <span className="text-sm">
            {copied ? 'Copied!' : 'Copy Address'}
          </span>
        </DropdownMenuItem>
        
        <DropdownMenuItem 
          onClick={handleSwitchWallet}
          onKeyDown={(e) => {
            if (e.key === KEYS.ENTER || e.key === KEYS.SPACE) {
              e.preventDefault()
              handleSwitchWallet()
            }
          }}
          className="group cursor-pointer transition-colors hover:bg-accent/10 focus:bg-accent/10 focus:outline-none"
          role="menuitem"
          aria-label="Switch to a different wallet"
        >
          <Wallet className="mr-2 h-4 w-4 transition-transform group-hover:scale-110" />
          <span className="text-sm">Switch Wallet</span>
        </DropdownMenuItem>
        
        <DropdownMenuSeparator className="bg-border-default/30" />
        
        <DropdownMenuItem 
          onClick={handleDisconnect}
          onKeyDown={(e) => {
            if (e.key === KEYS.ENTER || e.key === KEYS.SPACE) {
              e.preventDefault()
              handleDisconnect()
            }
          }}
          className="group cursor-pointer text-destructive hover:bg-destructive/10 focus:bg-destructive/10 transition-colors focus:outline-none"
          role="menuitem"
          aria-label="Disconnect wallet"
        >
          <LogOut className="mr-2 h-4 w-4 transition-transform group-hover:scale-110 group-hover:-translate-x-0.5" />
          <span className="text-sm">Disconnect</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
      )}
      <WalletConnectModal />
    </>
  )
}