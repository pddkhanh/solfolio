'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence, useDragControls, PanInfo } from 'framer-motion'
import { usePathname } from 'next/navigation'
import { 
  Home, 
  Briefcase, 
  Layers, 
  BarChart3,
  Wallet,
  Moon,
  Sun,
  Wifi,
  WifiOff,
  X
} from 'lucide-react'
import { useTheme } from '@/contexts/ThemeProvider'
import { useWebSocketContext } from '@/contexts/WebSocketProvider'
import { cn } from '@/lib/utils'
import {
  mobileMenuOverlayVariants,
  mobileMenuVariants,
  mobileMenuItemVariants,
  animationConfig,
} from '@/lib/animations'

interface MobileMenuProps {
  isOpen: boolean
  onClose: () => void
  onWalletConnect: () => void
  isWalletConnected: boolean
}

interface NavItem {
  href: string
  label: string
  icon: React.ElementType
}

const navItems: NavItem[] = [
  { href: '/', label: 'Dashboard', icon: Home },
  { href: '/portfolio', label: 'Portfolio', icon: Briefcase },
  { href: '/protocols', label: 'Protocols', icon: Layers },
  { href: '/analytics', label: 'Analytics', icon: BarChart3 },
]

export default function MobileMenu({ 
  isOpen, 
  onClose, 
  onWalletConnect,
  isWalletConnected 
}: MobileMenuProps) {
  const pathname = usePathname()
  const { theme, setTheme } = useTheme()
  const { connectionStatus, error, reconnect } = useWebSocketContext()
  const menuRef = useRef<HTMLDivElement>(null)
  const dragControls = useDragControls()
  
  // Focus management
  useEffect(() => {
    if (isOpen && menuRef.current) {
      // Save current focus
      const previousFocus = document.activeElement as HTMLElement
      
      // Focus first interactive element
      const firstButton = menuRef.current.querySelector('button, a') as HTMLElement
      firstButton?.focus()
      
      // Trap focus within menu
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          onClose()
        }
        
        if (e.key === 'Tab') {
          const focusableElements = menuRef.current?.querySelectorAll(
            'a, button, [tabindex]:not([tabindex="-1"])'
          ) as NodeListOf<HTMLElement>
          
          if (!focusableElements.length) return
          
          const firstElement = focusableElements[0]
          const lastElement = focusableElements[focusableElements.length - 1]
          
          if (e.shiftKey && document.activeElement === firstElement) {
            e.preventDefault()
            lastElement.focus()
          } else if (!e.shiftKey && document.activeElement === lastElement) {
            e.preventDefault()
            firstElement.focus()
          }
        }
      }
      
      document.addEventListener('keydown', handleKeyDown)
      
      return () => {
        document.removeEventListener('keydown', handleKeyDown)
        // Restore focus
        previousFocus?.focus()
      }
    }
  }, [isOpen, onClose])
  
  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])
  
  // Close menu on route change
  useEffect(() => {
    onClose()
  }, [pathname, onClose])
  
  const isActiveRoute = (href: string) => {
    if (href === '/') {
      return pathname === href
    }
    return pathname.startsWith(href)
  }
  
  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    // Close menu if dragged more than 100px to the right
    if (info.offset.x > 100) {
      onClose()
    }
  }
  
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm md:hidden"
            variants={mobileMenuOverlayVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            onClick={onClose}
            aria-hidden="true"
          />
          
          {/* Menu Panel */}
          <motion.div
            ref={menuRef}
            className="fixed right-0 top-0 bottom-0 z-50 w-[280px] bg-bg-secondary border-l border-border-default md:hidden"
            variants={mobileMenuVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            drag="x"
            dragControls={dragControls}
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.2}
            onDragEnd={handleDragEnd}
            role="dialog"
            aria-modal="true"
            aria-label="Mobile navigation menu"
          >
            {/* Drag handle */}
            <div 
              className="absolute left-0 top-0 bottom-0 w-4 cursor-grab active:cursor-grabbing"
              onPointerDown={(e) => dragControls.start(e)}
              aria-hidden="true"
            >
              <div className="absolute left-1 top-1/2 -translate-y-1/2 h-12 w-1 rounded-full bg-border-default/50" />
            </div>
            
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-border-default">
              <motion.div 
                className="flex items-center space-x-3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
              >
                <div className="h-10 w-10 rounded-lg bg-solana-gradient-primary shadow-glow-purple" />
                <span className="text-xl font-bold gradient-text">SolFolio</span>
              </motion.div>
              
              <motion.button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-bg-tertiary transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                aria-label="Close menu"
              >
                <X className="h-5 w-5 text-text-secondary" />
              </motion.button>
            </div>
            
            {/* Navigation Items */}
            <nav className="p-6 space-y-2" aria-label="Mobile navigation">
              {navItems.map((item, index) => {
                const Icon = item.icon
                const isActive = isActiveRoute(item.href)
                
                return (
                  <motion.div
                    key={item.href}
                    variants={mobileMenuItemVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    custom={index}
                  >
                    <Link
                      href={item.href}
                      className={cn(
                        "flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200",
                        "hover:bg-bg-tertiary/50",
                        isActive 
                          ? "bg-accent/10 text-text-primary" 
                          : "text-text-secondary hover:text-text-primary"
                      )}
                      onClick={onClose}
                    >
                      <div className="relative">
                        <Icon className={cn(
                          "h-5 w-5 transition-colors",
                          isActive && "text-accent"
                        )} />
                        {isActive && (
                          <motion.div
                            className="absolute -left-2 top-0 bottom-0 w-1 bg-solana-gradient-primary rounded-full"
                            layoutId="activeMobileNavIndicator"
                            transition={{
                              type: "spring",
                              stiffness: 380,
                              damping: 30,
                            }}
                          />
                        )}
                      </div>
                      <span className="font-medium">{item.label}</span>
                    </Link>
                  </motion.div>
                )
              })}
            </nav>
            
            {/* Divider */}
            <div className="mx-6 border-t border-border-default" />
            
            {/* Actions */}
            <div className="p-6 space-y-4">
              {/* Wallet Connection */}
              <motion.button
                onClick={() => {
                  onWalletConnect()
                  onClose()
                }}
                className={cn(
                  "w-full flex items-center justify-center space-x-2 px-4 py-3 rounded-lg font-medium transition-all duration-200",
                  isWalletConnected
                    ? "bg-accent/10 text-accent hover:bg-accent/20"
                    : "bg-solana-gradient-primary text-white hover:opacity-90 shadow-glow-purple"
                )}
                variants={mobileMenuItemVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                custom={navItems.length}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Wallet className="h-5 w-5" />
                <span>{isWalletConnected ? 'Wallet Connected' : 'Connect Wallet'}</span>
              </motion.button>
              
              {/* Theme Toggle */}
              <motion.div
                className="flex items-center justify-between px-4 py-3 rounded-lg bg-bg-tertiary/50"
                variants={mobileMenuItemVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                custom={navItems.length + 1}
              >
                <span className="text-sm font-medium text-text-secondary">Theme</span>
                <button
                  onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                  className="p-2 rounded-lg hover:bg-bg-tertiary transition-colors"
                  aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
                >
                  <motion.div
                    initial={false}
                    animate={{ rotate: theme === 'dark' ? 0 : 180 }}
                    transition={{ duration: 0.3 }}
                  >
                    {theme === 'dark' ? (
                      <Moon className="h-5 w-5 text-text-secondary" />
                    ) : (
                      <Sun className="h-5 w-5 text-text-secondary" />
                    )}
                  </motion.div>
                </button>
              </motion.div>
              
              {/* Connection Status */}
              <motion.div
                className="flex items-center justify-between px-4 py-3 rounded-lg bg-bg-tertiary/50"
                variants={mobileMenuItemVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                custom={navItems.length + 2}
              >
                <span className="text-sm font-medium text-text-secondary">Connection</span>
                <div className="flex items-center space-x-2">
                  {connectionStatus === 'connected' ? (
                    <>
                      <Wifi className="h-4 w-4 text-success" />
                      <span className="text-xs text-success">Live</span>
                    </>
                  ) : connectionStatus === 'connecting' ? (
                    <>
                      <motion.div
                        animate={{ opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      >
                        <Wifi className="h-4 w-4 text-warning" />
                      </motion.div>
                      <span className="text-xs text-warning">Connecting...</span>
                    </>
                  ) : (
                    <>
                      <WifiOff className="h-4 w-4 text-error" />
                      <button
                        onClick={reconnect}
                        className="text-xs text-error underline"
                      >
                        Reconnect
                      </button>
                    </>
                  )}
                </div>
              </motion.div>
            </div>
            
            {/* Footer */}
            <motion.div
              className="absolute bottom-0 left-0 right-0 p-6 border-t border-border-default"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <p className="text-xs text-text-tertiary text-center">
                Built on Solana
              </p>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}