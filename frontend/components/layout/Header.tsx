'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { Menu, X } from 'lucide-react'
import { usePathname } from 'next/navigation'
import dynamic from 'next/dynamic'
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion'
import { useWebSocketContext } from '@/contexts/WebSocketProvider'
import ConnectionStatus from '@/components/websocket/ConnectionStatus'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { cn } from '@/lib/utils'
import { 
  fadeInUp, 
  staggerContainer, 
  staggerItem,
  buttonHoverVariants,
  animationConfig 
} from '@/lib/animations'

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
  const [isScrolled, setIsScrolled] = useState(false)
  const { connectionStatus, error, reconnect } = useWebSocketContext()
  const pathname = usePathname()
  const { scrollY } = useScroll()
  
  // Transform scroll position for header effects
  const headerBackdropBlur = useTransform(scrollY, [0, 50], [8, 12])
  const headerOpacity = useTransform(scrollY, [0, 50], [0.8, 0.95])

  const navItems = [
    { href: '/', label: 'Dashboard' },
    { href: '/portfolio', label: 'Portfolio' },
    { href: '/protocols', label: 'Protocols' },
    { href: '/analytics', label: 'Analytics' },
  ]

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
            <Link href="/" className="flex items-center space-x-2 group">
              <motion.div 
                className="relative h-10 w-10 rounded-lg bg-solana-gradient-primary shadow-glow-purple"
                whileHover={{ 
                  scale: 1.1,
                  rotate: [0, -5, 5, 0],
                  transition: { duration: 0.3 }
                }}
                whileTap={{ scale: 0.95 }}
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
            className="hidden md:flex items-center space-x-1"
            variants={staggerContainer}
            initial="initial"
            animate="animate"
          >
            {navItems.map((item, index) => (
              <motion.div
                key={item.href}
                variants={staggerItem}
                custom={index}
              >
                <Link
                  href={item.href}
                  className="group relative px-4 py-2"
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
                    />
                  )}
                  
                  {/* Hover effect */}
                  <motion.div
                    className="absolute inset-0 rounded-lg bg-accent/5"
                    initial={{ opacity: 0 }}
                    whileHover={{ opacity: 1 }}
                    transition={{ duration: 0.2 }}
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

            {/* Mobile menu button with animation */}
            <motion.button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-9 w-9"
              variants={buttonHoverVariants}
              initial="rest"
              whileHover="hover"
              whileTap="tap"
              animate={isMenuOpen ? { rotate: 180 } : { rotate: 0 }}
              transition={{ duration: 0.3 }}
            >
              <AnimatePresence mode="wait">
                {isMenuOpen ? (
                  <motion.div
                    key="close"
                    initial={{ opacity: 0, rotate: -180 }}
                    animate={{ opacity: 1, rotate: 0 }}
                    exit={{ opacity: 0, rotate: 180 }}
                    transition={{ duration: 0.2 }}
                  >
                    <X className="h-5 w-5" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="menu"
                    initial={{ opacity: 0, rotate: 180 }}
                    animate={{ opacity: 1, rotate: 0 }}
                    exit={{ opacity: 0, rotate: -180 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Menu className="h-5 w-5" />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          </motion.div>
        </div>

        {/* Mobile Navigation with animations */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              className="md:hidden absolute left-0 right-0 top-[72px] bg-bg-primary/95 backdrop-blur-xl border-b border-border-default/50 shadow-xl"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: animationConfig.ease.default }}
            >
              <motion.nav 
                className="flex flex-col p-4"
                variants={staggerContainer}
                initial="initial"
                animate="animate"
              >
                {navItems.map((item, index) => (
                  <motion.div
                    key={item.href}
                    variants={fadeInUp}
                    custom={index}
                  >
                    <Link
                      href={item.href}
                      className={cn(
                        "flex items-center py-3 px-4 rounded-lg text-sm font-medium transition-all duration-200",
                        isActiveRoute(item.href)
                          ? "bg-accent/10 text-text-primary"
                          : "text-text-secondary hover:text-text-primary hover:bg-accent/5"
                      )}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <span className="relative">
                        {item.label}
                        {isActiveRoute(item.href) && (
                          <motion.div
                            className="absolute -left-4 top-0 bottom-0 w-1 bg-solana-gradient-primary rounded-full"
                            layoutId="activeMobileIndicator"
                            transition={{
                              type: "spring",
                              stiffness: 380,
                              damping: 30,
                            }}
                          />
                        )}
                      </span>
                    </Link>
                  </motion.div>
                ))}
                <motion.div 
                  variants={fadeInUp}
                  className="pt-4 mt-4 border-t border-border-default/50"
                >
                  <WalletButton />
                </motion.div>
              </motion.nav>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.header>
  )
}