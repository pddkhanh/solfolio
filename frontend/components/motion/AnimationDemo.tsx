/**
 * Animation Demo Component
 * Demonstrates usage of animation library components
 */

'use client';

import React, { useState } from 'react';
import {
  FadeIn,
  FadeInUp,
  StaggerContainer,
  StaggerItem,
  AnimatedCard,
  AnimatedButton,
  Skeleton,
  Spinner,
  ScrollReveal,
  AnimatedLayout,
  AnimatePresenceWrapper,
  MotionDiv,
} from './index';
import { SectionTransition } from './PageTransition';
import { 
  notificationVariants,
  successCheckVariants,
  errorShakeVariants,
  pieSliceVariants,
} from '@/lib/animations';
import { motion } from 'framer-motion';

/**
 * Demo component showing various animation patterns
 * This component is for development/testing purposes
 */
export const AnimationDemo: React.FC = () => {
  const [showNotification, setShowNotification] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [cards, setCards] = useState([1, 2, 3]);

  const mockData = [
    { id: 1, title: 'SOL', value: '$145.23', change: '+5.2%' },
    { id: 2, title: 'USDC', value: '$1.00', change: '0.0%' },
    { id: 3, title: 'mSOL', value: '$152.10', change: '+5.5%' },
  ];

  return (
    <div className="container mx-auto p-8 space-y-12">
      {/* Page Title with Fade In */}
      <FadeIn>
        <h1 className="text-4xl font-bold">Animation Library Demo</h1>
        <p className="text-muted-foreground mt-2">
          Demonstrating Framer Motion animations for SolFolio
        </p>
      </FadeIn>

      {/* Section 1: Basic Animations */}
      <SectionTransition delay={0.1}>
        <h2 className="text-2xl font-semibold mb-4">Basic Animations</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FadeInUp delay={0.1}>
            <div className="p-4 border rounded-lg">
              <h3 className="font-medium">Fade In Up</h3>
              <p className="text-sm text-muted-foreground">
                Content fades in with upward motion
              </p>
            </div>
          </FadeInUp>

          <FadeInUp delay={0.2}>
            <div className="p-4 border rounded-lg">
              <h3 className="font-medium">Delayed Animation</h3>
              <p className="text-sm text-muted-foreground">
                Sequential appearance with delay
              </p>
            </div>
          </FadeInUp>

          <FadeInUp delay={0.3}>
            <div className="p-4 border rounded-lg">
              <h3 className="font-medium">Smooth Timing</h3>
              <p className="text-sm text-muted-foreground">
                Uses custom easing functions
              </p>
            </div>
          </FadeInUp>
        </div>
      </SectionTransition>

      {/* Section 2: Stagger Animations */}
      <SectionTransition delay={0.2}>
        <h2 className="text-2xl font-semibold mb-4">Stagger Animations</h2>
        
        <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {mockData.map((item) => (
            <StaggerItem key={item.id}>
              <AnimatedCard className="p-4">
                <h3 className="font-medium">{item.title}</h3>
                <p className="text-2xl font-bold mt-2">{item.value}</p>
                <p className={`text-sm mt-1 ${
                  item.change.startsWith('+') ? 'text-green-500' : 'text-red-500'
                }`}>
                  {item.change}
                </p>
              </AnimatedCard>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </SectionTransition>

      {/* Section 3: Interactive Components */}
      <SectionTransition delay={0.3}>
        <h2 className="text-2xl font-semibold mb-4">Interactive Components</h2>
        
        <div className="flex flex-wrap gap-4">
          <AnimatedButton onClick={() => setShowNotification(!showNotification)}>
            Show Notification
          </AnimatedButton>
          
          <AnimatedButton 
            variant="outline"
            onClick={() => setIsLoading(!isLoading)}
          >
            Toggle Loading
          </AnimatedButton>
          
          <AnimatedButton 
            variant="ghost"
            onClick={() => setCards([...cards, cards.length + 1])}
          >
            Add Card
          </AnimatedButton>
        </div>

        {/* Notification Demo */}
        <AnimatePresenceWrapper>
          {showNotification && (
            <MotionDiv
              initial="initial"
              animate="animate"
              exit="exit"
              variants={notificationVariants}
              className="mt-4 p-4 bg-primary/10 border border-primary rounded-lg"
            >
              <p className="font-medium">Transaction Successful!</p>
              <p className="text-sm text-muted-foreground">
                Your transaction has been confirmed on the blockchain.
              </p>
            </MotionDiv>
          )}
        </AnimatePresenceWrapper>
      </SectionTransition>

      {/* Section 4: Loading States */}
      <SectionTransition delay={0.4}>
        <h2 className="text-2xl font-semibold mb-4">Loading States</h2>
        
        <div className="space-y-4">
          {isLoading ? (
            <>
              <div className="flex items-center gap-4">
                <Spinner size="sm" />
                <Spinner size="md" />
                <Spinner size="lg" />
                <span className="text-muted-foreground">Loading data...</span>
              </div>
              
              <div className="space-y-2">
                <Skeleton height={60} />
                <Skeleton height={60} />
                <Skeleton height={60} />
              </div>
            </>
          ) : (
            <div className="p-4 border rounded-lg">
              <p>Content loaded successfully!</p>
            </div>
          )}
        </div>
      </SectionTransition>

      {/* Section 5: Layout Animations */}
      <SectionTransition delay={0.5}>
        <h2 className="text-2xl font-semibold mb-4">Layout Animations</h2>
        
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <AnimatePresenceWrapper mode="popLayout">
            {cards.map((card) => (
              <AnimatedLayout
                key={card}
                layoutId={`card-${card}`}
                className="p-4 border rounded-lg cursor-pointer hover:border-primary"
                onClick={() => setCards(cards.filter(c => c !== card))}
              >
                <h3 className="font-medium">Card {card}</h3>
                <p className="text-sm text-muted-foreground">
                  Click to remove
                </p>
              </AnimatedLayout>
            ))}
          </AnimatePresenceWrapper>
        </div>
      </SectionTransition>

      {/* Section 6: Scroll Reveal */}
      <ScrollReveal threshold={0.2}>
        <div className="p-8 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg">
          <h2 className="text-2xl font-semibold mb-4">Scroll Reveal Animation</h2>
          <p className="text-muted-foreground">
            This content appears when scrolled into view with a smooth animation.
            The animation only plays once when the element becomes visible.
          </p>
        </div>
      </ScrollReveal>

      {/* Section 7: Success/Error Animations */}
      <SectionTransition delay={0.6}>
        <h2 className="text-2xl font-semibold mb-4">Status Animations</h2>
        
        <div className="flex gap-8">
          {/* Success Check */}
          <div className="flex flex-col items-center gap-2">
            <motion.svg
              width="60"
              height="60"
              viewBox="0 0 60 60"
              initial="initial"
              animate="animate"
            >
              <motion.circle
                cx="30"
                cy="30"
                r="28"
                stroke="currentColor"
                strokeWidth="2"
                fill="none"
                className="text-green-500"
                variants={successCheckVariants}
              />
              <motion.path
                d="M 18 30 L 26 38 L 42 22"
                stroke="currentColor"
                strokeWidth="2"
                fill="none"
                className="text-green-500"
                strokeLinecap="round"
                strokeLinejoin="round"
                variants={successCheckVariants}
              />
            </motion.svg>
            <span className="text-sm">Success</span>
          </div>

          {/* Error Shake */}
          <motion.div
            className="flex flex-col items-center gap-2"
            initial="initial"
            animate="animate"
            variants={errorShakeVariants}
          >
            <div className="w-15 h-15 rounded-full bg-red-500/20 flex items-center justify-center p-4">
              <span className="text-2xl text-red-500">✕</span>
            </div>
            <span className="text-sm">Error</span>
          </motion.div>
        </div>
      </SectionTransition>

      {/* Section 8: Chart Animation Example */}
      <SectionTransition delay={0.7}>
        <h2 className="text-2xl font-semibold mb-4">Chart Animations</h2>
        
        <div className="flex gap-2 items-end h-40">
          {[40, 70, 55, 80, 65, 90, 75].map((height, index) => (
            <MotionDiv
              key={index}
              className="flex-1 bg-gradient-to-t from-primary to-secondary rounded-t"
              initial={{ scaleY: 0, originY: 1 }}
              animate={{ scaleY: 1 }}
              transition={{
                delay: index * 0.1,
                duration: 0.5,
                ease: [0.4, 0, 0.2, 1],
              }}
              style={{ height: `${height}%` }}
              whileHover={{ scaleY: 1.05 }}
            />
          ))}
        </div>
      </SectionTransition>
    </div>
  );
};