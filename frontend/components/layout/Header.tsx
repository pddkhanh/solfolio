'use client'

import Link from 'next/link'
import { useState, useEffect, useCallback, useRef } from 'react'
import { usePathname } from 'next/navigation'
import dynamic from 'next/dynamic'
import { motion, useScroll, useTransform } from 'framer-motion'
import { useWebSocketContext } from '@/contexts/WebSocketProvider'
import ConnectionStatus from '@/components/websocket/ConnectionStatus'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import HamburgerButton from './HamburgerButton'
import MobileMenu from './MobileMenu'
import { cn } from '@/lib/utils'
import { 
  staggerContainer, 
  staggerItem,
  animationConfig 
} from '@/lib/animations'
import { 
  KEYS, 
  ARIA_ROLES, 
  useFocusVisible,
  useArrowNavigation,
  getFocusRingClass
} from '@/lib/accessibility'

// Dynamically import WalletButton to prevent SSR issues
const WalletButton = dynamic(
  () => import('@/components/wallet/WalletButton'),
  { 
    ssr: false,
    loading: () => (
      <button 
        className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-4"
        disabled
      >
        Connect Wallet
      </button>
    )
  }
)

// Dynamic import for wallet connection state
const WalletConnectionHandler = dynamic(
  () => import('@/components/wallet/WalletButton').then(mod => ({ 
    default: mod.default,
    useWalletConnection: () => {
      // This will be replaced with actual wallet state when available
      return { isConnected: false, connect: () => {} }
    }
  })),
  { ssr: false }
)

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const { connectionStatus, error, reconnect } = useWebSocketContext()
  const pathname = usePathname()
  const { scrollY } = useScroll()
  const navRef = useRef<HTMLElement>(null)
  const [focusedNavIndex, setFocusedNavIndex] = useState(-1)
  
  // Enable focus visible styles
  useFocusVisible()
  
  // Transform scroll position for header effects
  const headerBackdropBlur = useTransform(scrollY, [0, 50], [8, 12])
  const headerOpacity = useTransform(scrollY, [0, 50], [0.8, 0.95])
  
  // Handle menu toggle
  const toggleMenu = useCallback(() => {
    setIsMenuOpen(prev => !prev)
  }, [])
  
  const closeMenu = useCallback(() => {
    setIsMenuOpen(false)
  }, [])
  
  // Mock wallet connection handler (will be replaced with actual implementation)
  const handleWalletConnect = useCallback(() => {
    console.log('Wallet connection triggered')
  }, [])

  const navItems = [
    { href: '/', label: 'Dashboard', ariaLabel: 'Go to dashboard' },
    { href: '/portfolio', label: 'Portfolio', ariaLabel: 'View your portfolio' },
    { href: '/protocols', label: 'Protocols', ariaLabel: 'Browse DeFi protocols' },
    { href: '/analytics', label: 'Analytics', ariaLabel: 'View analytics and insights' },
  ]
  
  // Keyboard navigation for nav items
  const { handleKeyDown } = useArrowNavigation(navItems.length, 'horizontal')
  
  const handleNavKeyDown = useCallback((e: React.KeyboardEvent, index: number) => {
    handleKeyDown(e.nativeEvent, (newIndex) => {
      setFocusedNavIndex(newIndex)
      const navLinks = navRef.current?.querySelectorAll('a')
      if (navLinks && navLinks[newIndex]) {
        (navLinks[newIndex] as HTMLElement).focus()
      }
    })
  }, [handleKeyDown])

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Close mobile menu on route change
  useEffect(() => {
    setIsMenuOpen(false)
  }, [pathname])

  // Check if nav item is active
  const isActiveRoute = (href: string) => {
    if (href === '/') {
      return pathname === href
    }
    return pathname.startsWith(href)
  }

  return (
    <motion.header 
      className={cn(
        "sticky top-0 z-50 w-full transition-all duration-300",
        isScrolled 
          ? "border-b border-border-default/50 shadow-lg shadow-black/5" 
          : "border-b border-transparent"
      )}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: animationConfig.ease.default }}
      role={ARIA_ROLES.BANNER}
      aria-label="Main navigation"
    >
      {/* Glassmorphism background */}
      <motion.div 
        className="absolute inset-0 bg-bg-primary/80 backdrop-blur-xl"
        style={{
          opacity: headerOpacity,
        }}
      />
      
      {/* Gradient border effect */}
      <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-border-default to-transparent opacity-50" />
      
      <div className="container relative mx-auto px-4">
        <div className="flex h-[72px] items-center justify-between">
          {/* Logo with animation */}
          <motion.div 
            className="flex items-center"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, ease: animationConfig.ease.default }}
          >
            <Link 
              href="/" 
              className={cn(
                "flex items-center space-x-2 group rounded-lg",
                getFocusRingClass()
              )}
              aria-label="SolFolio - Go to homepage"
            >
              <motion.div 
                className="relative h-10 w-10 rounded-lg bg-solana-gradient-primary shadow-glow-purple"
                whileHover={{ 
                  scale: 1.1,
                  rotate: [0, -5, 5, 0],
                  transition: { duration: 0.3 }
                }}
                whileTap={{ scale: 0.95 }}
                aria-hidden="true"
              >
                {/* Animated glow effect */}
                <motion.div
                  className="absolute inset-0 rounded-lg bg-solana-gradient-primary opacity-50 blur-xl"
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.5, 0.3, 0.5],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />
              </motion.div>
              <motion.span 
                className="text-xl font-bold gradient-text"
                whileHover={{ scale: 1.05 }}
              >
                SolFolio
              </motion.span>
            </Link>
          </motion.div>

          {/* Desktop Navigation with animations */}
          <motion.nav 
            ref={navRef}
            className="hidden md:flex items-center space-x-1"
            variants={staggerContainer}
            initial="initial"
            animate="animate"
            role={ARIA_ROLES.NAVIGATION}
            aria-label="Main navigation"
          >
            {navItems.map((item, index) => (
              <motion.div
                key={item.href}
                variants={staggerItem}
                custom={index}
              >
                <Link
                  href={item.href}
                  className={cn(
                    "group relative px-4 py-2 rounded-lg",
                    getFocusRingClass()
                  )}
                  aria-label={item.ariaLabel}
                  aria-current={isActiveRoute(item.href) ? 'page' : undefined}
                  onKeyDown={(e) => handleNavKeyDown(e, index)}
                  tabIndex={focusedNavIndex === index ? 0 : -1}
                >
                  <motion.span
                    className={cn(
                      "relative z-10 text-sm font-medium transition-colors duration-200",
                      isActiveRoute(item.href) 
                        ? "text-text-primary" 
                        : "text-text-secondary hover:text-text-primary"
                    )}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {item.label}
                  </motion.span>
                  
                  {/* Active indicator with gradient */}
                  {isActiveRoute(item.href) && (
                    <motion.div
                      className="absolute bottom-0 left-0 right-0 h-[2px] bg-solana-gradient-primary"
                      layoutId="activeNavIndicator"
                      transition={{
                        type: "spring",
                        stiffness: 380,
                        damping: 30,
                      }}
                      aria-hidden="true"
                    />
                  )}
                  
                  {/* Hover effect */}
                  <motion.div
                    className="absolute inset-0 rounded-lg bg-accent/5"
                    initial={{ opacity: 0 }}
                    whileHover={{ opacity: 1 }}
                    transition={{ duration: 0.2 }}
                    aria-hidden="true"
                  />
                </Link>
              </motion.div>
            ))}
          </motion.nav>

          {/* Right side actions with stagger animation */}
          <motion.div 
            className="flex items-center space-x-4"
            variants={staggerContainer}
            initial="initial"
            animate="animate"
          >
            {/* Connection Status with animation */}
            <motion.div variants={staggerItem}>
              <div className="hidden lg:block">
                <ConnectionStatus
                  status={connectionStatus}
                  error={error}
                  onReconnect={reconnect}
                  showText={true}
                />
              </div>
              
              <div className="lg:hidden">
                <ConnectionStatus
                  status={connectionStatus}
                  error={error}
                  onReconnect={reconnect}
                  showText={false}
                />
              </div>
            </motion.div>

            {/* Theme Toggle with animation */}
            <motion.div variants={staggerItem}>
              <ThemeToggle />
            </motion.div>

            {/* Wallet button with animation */}
            <motion.div 
              className="hidden md:block"
              variants={staggerItem}
            >
              <WalletButton />
            </motion.div>

            {/* Mobile menu button with animated hamburger */}
            <HamburgerButton 
              isOpen={isMenuOpen}
              onClick={toggleMenu}
            />
          </motion.div>
        </div>

        {/* Enhanced Mobile Navigation Menu */}
        <MobileMenu 
          isOpen={isMenuOpen}
          onClose={closeMenu}
          onWalletConnect={handleWalletConnect}
          isWalletConnected={false} // Will be replaced with actual wallet state
        />
      </div>
    </motion.header>
  )
}