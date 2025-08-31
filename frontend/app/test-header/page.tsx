'use client'

import { motion } from 'framer-motion'
import { staggerContainer, staggerItem, fadeInUp } from '@/lib/animations'

export default function TestHeaderPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        variants={staggerContainer}
        initial="initial"
        animate="animate"
        className="space-y-8"
      >
        <motion.div variants={fadeInUp}>
          <h1 className="text-h1 gradient-text mb-4">Header Test Page</h1>
          <p className="text-body-lg text-text-secondary">
            This page is for testing the new glassmorphism header with animations.
          </p>
        </motion.div>

        <motion.div variants={staggerItem} className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Test cards to create scroll content */}
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <motion.div
              key={i}
              variants={staggerItem}
              whileHover={{ y: -4, scale: 1.02 }}
              className="p-6 bg-bg-secondary rounded-lg border border-border-default hover:border-solana-purple/50 transition-all"
            >
              <h3 className="text-h5 mb-2">Feature Card {i}</h3>
              <p className="text-text-secondary">
                Test content to demonstrate the glassmorphism header effect when scrolling.
              </p>
              <div className="mt-4 h-32 bg-solana-gradient-primary rounded-md opacity-20" />
            </motion.div>
          ))}
        </motion.div>

        {/* More content for scrolling */}
        <motion.div variants={fadeInUp} className="space-y-4">
          <h2 className="text-h2">Scroll to See Header Effects</h2>
          <div className="space-y-2">
            {Array.from({ length: 20 }, (_, i) => (
              <p key={i} className="text-text-secondary">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor 
                incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud 
                exercitation ullamco laboris.
              </p>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}