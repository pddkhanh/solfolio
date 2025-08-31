'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Menu, X } from 'lucide-react'
import dynamic from 'next/dynamic'
import { useWebSocketContext } from '@/contexts/WebSocketProvider'
import ConnectionStatus from '@/components/websocket/ConnectionStatus'
import { ThemeToggle } from '@/components/ui/theme-toggle'

// Dynamically import WalletButton to prevent SSR issues
const WalletButton = dynamic(
  () => import('@/components/wallet/WalletButton'),
  { 
    ssr: false,
    loading: () => (
      <button className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-4">
        Connect Wallet
      </button>
    )
  }
)

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { connectionStatus, error, reconnect } = useWebSocketContext()

  const navItems = [
    { href: '/', label: 'Dashboard' },
    { href: '/portfolio', label: 'Portfolio' },
    { href: '/protocols', label: 'Protocols' },
    { href: '/analytics', label: 'Analytics' },
  ]

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border-default glass">
      <div className="container mx-auto px-4">
        <div className="flex h-[72px] items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2 group">
              <div className="h-10 w-10 rounded-lg bg-solana-gradient-primary shadow-glow-purple transition-transform group-hover:scale-105" />
              <span className="text-xl font-bold gradient-text">SolFolio</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="transition-colors hover:text-text-primary text-text-secondary"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Right side actions */}
          <div className="flex items-center space-x-4">
            {/* Connection Status - Desktop */}
            <div className="hidden lg:block">
              <ConnectionStatus
                status={connectionStatus}
                error={error}
                onReconnect={reconnect}
                showText={true}
              />
            </div>
            
            {/* Connection Status - Mobile (icon only) */}
            <div className="lg:hidden">
              <ConnectionStatus
                status={connectionStatus}
                error={error}
                onReconnect={reconnect}
                showText={false}
              />
            </div>

            {/* Theme Toggle */}
            <ThemeToggle />

            {/* Wallet button */}
            <div className="hidden md:block">
              <WalletButton />
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-9 w-9"
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t">
            <nav className="flex flex-col space-y-4">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-sm font-medium transition-colors hover:text-foreground/80 text-foreground/60"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
              <WalletButton />
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}