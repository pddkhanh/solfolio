'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import {
  hamburgerTopLineVariants,
  hamburgerMiddleLineVariants,
  hamburgerBottomLineVariants,
  animationConfig,
} from '@/lib/animations'

interface HamburgerButtonProps {
  isOpen: boolean
  onClick: () => void
  className?: string
}

export default function HamburgerButton({ isOpen, onClick, className }: HamburgerButtonProps) {
  return (
    <motion.button
      onClick={onClick}
      className={cn(
        "relative inline-flex items-center justify-center p-2 w-10 h-10 rounded-lg",
        "hover:bg-accent/10 transition-colors focus-visible:outline-none",
        "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        "md:hidden",
        className
      )}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      aria-label={isOpen ? "Close navigation menu" : "Open navigation menu"}
      aria-expanded={isOpen}
      aria-controls="mobile-menu"
    >
      <svg
        width="20"
        height="20"
        viewBox="0 0 20 20"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="overflow-visible"
      >
        {/* Top line */}
        <motion.line
          x1="3"
          y1="5"
          x2="17"
          y2="5"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          variants={hamburgerTopLineVariants}
          initial="closed"
          animate={isOpen ? "open" : "closed"}
          transition={{
            duration: animationConfig.duration.normal,
            ease: animationConfig.ease.default,
          }}
          style={{ originX: '10px', originY: '10px' }}
        />
        
        {/* Middle line */}
        <motion.line
          x1="3"
          y1="10"
          x2="17"
          y2="10"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          variants={hamburgerMiddleLineVariants}
          initial="closed"
          animate={isOpen ? "open" : "closed"}
          transition={{
            duration: animationConfig.duration.normal,
            ease: animationConfig.ease.default,
          }}
        />
        
        {/* Bottom line */}
        <motion.line
          x1="3"
          y1="15"
          x2="17"
          y2="15"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          variants={hamburgerBottomLineVariants}
          initial="closed"
          animate={isOpen ? "open" : "closed"}
          transition={{
            duration: animationConfig.duration.normal,
            ease: animationConfig.ease.default,
          }}
          style={{ originX: '10px', originY: '10px' }}
        />
      </svg>
      
      {/* Ripple effect on tap */}
      <motion.span
        className="absolute inset-0 rounded-lg bg-accent/20"
        initial={{ scale: 0, opacity: 1 }}
        animate={{ scale: 0, opacity: 1 }}
        whileTap={{ scale: 1.5, opacity: 0 }}
        transition={{ duration: 0.5 }}
        style={{ originX: '50%', originY: '50%' }}
      />
    </motion.button>
  )
}