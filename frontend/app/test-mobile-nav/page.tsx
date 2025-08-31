'use client'

import { motion } from 'framer-motion'
import { pageVariants, staggerContainer, staggerItem } from '@/lib/animations'

export default function TestMobileNavPage() {
  return (
    <motion.div 
      className="container mx-auto px-4 py-8"
      variants={pageVariants}
      initial="initial"
      animate="enter"
      exit="exit"
    >
      <motion.div
        variants={staggerContainer}
        initial="initial"
        animate="animate"
        className="space-y-8"
      >
        <motion.div variants={staggerItem}>
          <h1 className="text-4xl font-bold gradient-text mb-4">
            Mobile Navigation Test
          </h1>
          <p className="text-text-secondary text-lg">
            Test the enhanced mobile navigation with the following features:
          </p>
        </motion.div>

        <motion.div 
          variants={staggerItem}
          className="grid gap-6 md:grid-cols-2"
        >
          <div className="p-6 rounded-lg bg-bg-secondary border border-border-default">
            <h3 className="text-xl font-semibold mb-3 text-text-primary">
              Mobile Features (Width &lt; 768px)
            </h3>
            <ul className="space-y-2 text-text-secondary">
              <li className="flex items-start">
                <span className="text-accent mr-2">•</span>
                Animated hamburger menu button with smooth transitions
              </li>
              <li className="flex items-start">
                <span className="text-accent mr-2">•</span>
                Full-screen slide-in menu from the right
              </li>
              <li className="flex items-start">
                <span className="text-accent mr-2">•</span>
                Swipe-to-close gesture support (drag right to close)
              </li>
              <li className="flex items-start">
                <span className="text-accent mr-2">•</span>
                Staggered menu item animations
              </li>
              <li className="flex items-start">
                <span className="text-accent mr-2">•</span>
                Active route indication with gradient accent
              </li>
              <li className="flex items-start">
                <span className="text-accent mr-2">•</span>
                Integrated wallet connection button
              </li>
              <li className="flex items-start">
                <span className="text-accent mr-2">•</span>
                Theme toggle with animated icons
              </li>
              <li className="flex items-start">
                <span className="text-accent mr-2">•</span>
                Live connection status indicator
              </li>
            </ul>
          </div>

          <div className="p-6 rounded-lg bg-bg-secondary border border-border-default">
            <h3 className="text-xl font-semibold mb-3 text-text-primary">
              Accessibility Features
            </h3>
            <ul className="space-y-2 text-text-secondary">
              <li className="flex items-start">
                <span className="text-success mr-2">✓</span>
                Full keyboard navigation support
              </li>
              <li className="flex items-start">
                <span className="text-success mr-2">✓</span>
                Focus trap within mobile menu
              </li>
              <li className="flex items-start">
                <span className="text-success mr-2">✓</span>
                Escape key to close menu
              </li>
              <li className="flex items-start">
                <span className="text-success mr-2">✓</span>
                ARIA labels and expanded states
              </li>
              <li className="flex items-start">
                <span className="text-success mr-2">✓</span>
                Focus restoration on menu close
              </li>
              <li className="flex items-start">
                <span className="text-success mr-2">✓</span>
                Screen reader announcements
              </li>
              <li className="flex items-start">
                <span className="text-success mr-2">✓</span>
                Reduced motion support
              </li>
              <li className="flex items-start">
                <span className="text-success mr-2">✓</span>
                Touch-friendly target sizes (min 44px)
              </li>
            </ul>
          </div>
        </motion.div>

        <motion.div
          variants={staggerItem}
          className="p-6 rounded-lg bg-accent/10 border border-accent/20"
        >
          <h3 className="text-xl font-semibold mb-3 text-text-primary">
            Testing Instructions
          </h3>
          <ol className="space-y-2 text-text-secondary list-decimal list-inside">
            <li>Resize your browser window to &lt;768px width or use device emulation</li>
            <li>Click the hamburger menu button in the header</li>
            <li>Observe the smooth slide-in animation</li>
            <li>Try swiping or dragging the menu to the right to close it</li>
            <li>Test keyboard navigation with Tab and Escape keys</li>
            <li>Navigate between pages to see active route highlighting</li>
            <li>Toggle the theme and observe the animated transition</li>
            <li>Check the connection status indicator</li>
          </ol>
        </motion.div>

        <motion.div
          variants={staggerItem}
          className="p-6 rounded-lg bg-warning/10 border border-warning/20"
        >
          <h3 className="text-xl font-semibold mb-3 text-warning">
            Performance Metrics
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-text-secondary">
            <div>
              <p className="text-sm text-text-tertiary mb-1">Animation FPS</p>
              <p className="text-2xl font-bold text-text-primary">60</p>
            </div>
            <div>
              <p className="text-sm text-text-tertiary mb-1">Menu Open Time</p>
              <p className="text-2xl font-bold text-text-primary">250ms</p>
            </div>
            <div>
              <p className="text-sm text-text-tertiary mb-1">Touch Response</p>
              <p className="text-2xl font-bold text-text-primary">&lt;50ms</p>
            </div>
            <div>
              <p className="text-sm text-text-tertiary mb-1">Focus Visible</p>
              <p className="text-2xl font-bold text-success">Yes</p>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </motion.div>
  )
}