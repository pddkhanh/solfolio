'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Layers, TrendingUp, Settings, Menu, X, Moon, Sun } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { WalletButton } from '@/components/wallet-button'
import { useState } from 'react'
import { cn } from '@/lib/utils'

const navigation = [
  { name: 'Dashboard', href: '/', icon: Home },
  { name: 'Positions', href: '/positions', icon: Layers },
  { name: 'Yield Compare', href: '/yield', icon: TrendingUp },
  { name: 'Settings', href: '/settings', icon: Settings },
]

export function Navigation() {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [theme, setTheme] = useState<'light' | 'dark'>('dark')

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark')
    document.documentElement.classList.toggle('dark')
  }

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-xl">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-solana-purple via-solana-green to-solana-blue animate-gradient" />
              <span className="text-xl font-bold gradient-text">SolFolio</span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-1">
              {navigation.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      'flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-all',
                      isActive
                        ? 'bg-primary/10 text-primary'
                        : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                    )}
                  >
                    <item.icon className="w-4 h-4" />
                    {item.name}
                  </Link>
                )
              })}
            </div>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="hidden md:inline-flex"
            >
              {theme === 'dark' ? (
                <Sun className="w-5 h-5" />
              ) : (
                <Moon className="w-5 h-5" />
              )}
            </Button>

            <WalletButton />

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t bg-background animate-slideDown">
          <div className="container mx-auto px-4 py-4 space-y-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    'flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-all',
                    isActive
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                  )}
                >
                  <item.icon className="w-5 h-5" />
                  {item.name}
                </Link>
              )
            })}
            <div className="pt-2 border-t">
              <Button
                variant="ghost"
                className="w-full justify-start gap-3"
                onClick={toggleTheme}
              >
                {theme === 'dark' ? (
                  <>
                    <Sun className="w-5 h-5" />
                    Light Mode
                  </>
                ) : (
                  <>
                    <Moon className="w-5 h-5" />
                    Dark Mode
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}