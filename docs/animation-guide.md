# SolFolio Animation Guide

## Overview
This guide provides comprehensive animation patterns and implementations for SolFolio using Framer Motion. All animations are designed to be performant, accessible, and delightful.

## Core Animation Principles

### 1. **Purpose Over Polish**
Every animation should serve a purpose:
- Guide attention
- Provide feedback
- Show relationships
- Smooth transitions

### 2. **Performance First**
- Use transform and opacity only
- Enable GPU acceleration
- Respect reduced motion preferences
- Optimize for 60 FPS

### 3. **Consistency**
- Unified timing functions
- Consistent duration scales
- Predictable patterns
- Cohesive feel

## Animation Library Setup

### Install Framer Motion
```bash
pnpm add framer-motion
```

### Base Configuration
```typescript
// lib/animations/config.ts
export const animationConfig = {
  // Timing functions
  ease: {
    default: [0.4, 0, 0.2, 1],      // Smooth ease
    easeIn: [0.4, 0, 1, 1],         // Accelerate
    easeOut: [0, 0, 0.2, 1],        // Decelerate
    easeInOut: [0.4, 0, 0.2, 1],    // Smooth both
    bounce: [0.68, -0.55, 0.265, 1.55], // Playful bounce
  },
  
  // Duration scale
  duration: {
    instant: 0,
    fast: 0.15,
    normal: 0.25,
    slow: 0.35,
    slower: 0.5,
    slowest: 0.75,
  },
  
  // Spring configurations
  spring: {
    default: { type: "spring", stiffness: 500, damping: 30 },
    gentle: { type: "spring", stiffness: 100, damping: 20 },
    wobbly: { type: "spring", stiffness: 180, damping: 12 },
    stiff: { type: "spring", stiffness: 700, damping: 35 },
  },
};
```

## Animation Patterns

### 1. Page Transitions

```typescript
// lib/animations/page.ts
import { Variants } from 'framer-motion';

export const pageVariants: Variants = {
  initial: {
    opacity: 0,
    y: 20,
  },
  enter: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: [0.4, 0, 0.2, 1],
    },
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: {
      duration: 0.3,
      ease: [0.4, 0, 1, 1],
    },
  },
};

// Usage in page component
import { motion } from 'framer-motion';

export default function PortfolioPage() {
  return (
    <motion.div
      initial="initial"
      animate="enter"
      exit="exit"
      variants={pageVariants}
    >
      {/* Page content */}
    </motion.div>
  );
}
```

### 2. Stagger Children

```typescript
// lib/animations/stagger.ts
export const staggerContainer: Variants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1,
    },
  },
};

export const staggerItem: Variants = {
  initial: {
    opacity: 0,
    y: 20,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
      ease: [0.4, 0, 0.2, 1],
    },
  },
};

// Usage
<motion.div variants={staggerContainer} initial="initial" animate="animate">
  {items.map((item) => (
    <motion.div key={item.id} variants={staggerItem}>
      {/* Item content */}
    </motion.div>
  ))}
</motion.div>
```

### 3. Value Count-Up

```typescript
// components/animations/CountUp.tsx
import { useSpring, animated } from '@react-spring/web';

export function CountUp({ value, duration = 1000, format }: CountUpProps) {
  const { number } = useSpring({
    from: { number: 0 },
    to: { number: value },
    config: { duration },
  });

  return (
    <animated.span>
      {number.to(n => format ? format(n) : n.toFixed(0))}
    </animated.span>
  );
}

// With Framer Motion
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import { useEffect } from 'react';

export function MotionCountUp({ value }: { value: number }) {
  const count = useMotionValue(0);
  const rounded = useTransform(count, Math.round);

  useEffect(() => {
    const animation = animate(count, value, {
      duration: 1,
      ease: [0.4, 0, 0.2, 1],
    });

    return animation.stop;
  }, [value]);

  return <motion.span>{rounded}</motion.span>;
}
```

### 4. Hover Effects

```typescript
// lib/animations/hover.ts
export const hoverScale = {
  whileHover: {
    scale: 1.02,
    transition: {
      duration: 0.2,
      ease: [0.4, 0, 0.2, 1],
    },
  },
  whileTap: {
    scale: 0.98,
  },
};

export const hoverGlow = {
  whileHover: {
    boxShadow: '0 0 20px rgba(153, 69, 255, 0.3)',
    transition: {
      duration: 0.2,
    },
  },
};

// Card hover with elevation
export const cardHover = {
  rest: {
    y: 0,
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
  },
  hover: {
    y: -4,
    boxShadow: '0 12px 24px rgba(0, 0, 0, 0.15)',
    transition: {
      duration: 0.3,
      ease: [0.4, 0, 0.2, 1],
    },
  },
};
```

### 5. Loading States

```typescript
// components/animations/Skeleton.tsx
import { motion } from 'framer-motion';

export function Skeleton({ width, height }: SkeletonProps) {
  return (
    <motion.div
      className="bg-gray-200 dark:bg-gray-800 rounded"
      style={{ width, height }}
      animate={{
        opacity: [0.5, 1, 0.5],
      }}
      transition={{
        duration: 1.5,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    />
  );
}

// Shimmer effect
export function Shimmer({ width, height }: ShimmerProps) {
  return (
    <div className="relative overflow-hidden" style={{ width, height }}>
      <div className="absolute inset-0 bg-gray-200 dark:bg-gray-800" />
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
        animate={{
          x: ['-100%', '100%'],
        }}
        transition={{
          duration: 1,
          repeat: Infinity,
          ease: "linear",
        }}
      />
    </div>
  );
}
```

### 6. Chart Animations

```typescript
// components/animations/ChartAnimations.tsx
import { motion } from 'framer-motion';

// Animated bar chart
export function AnimatedBar({ value, maxValue, delay = 0 }) {
  return (
    <motion.div
      className="bg-gradient-to-r from-purple-500 to-green-500"
      initial={{ width: 0 }}
      animate={{ 
        width: `${(value / maxValue) * 100}%` 
      }}
      transition={{
        duration: 0.8,
        delay,
        ease: [0.4, 0, 0.2, 1],
      }}
    />
  );
}

// Pie chart slice animation
export const pieSliceVariants = {
  initial: {
    scale: 0,
    opacity: 0,
  },
  animate: (custom: number) => ({
    scale: 1,
    opacity: 1,
    transition: {
      delay: custom * 0.1,
      duration: 0.5,
      ease: [0.4, 0, 0.2, 1],
    },
  }),
  hover: {
    scale: 1.05,
    transition: {
      duration: 0.2,
    },
  },
};
```

### 7. Gesture Animations

```typescript
// lib/animations/gestures.ts
import { motion, useAnimation } from 'framer-motion';

// Swipe to delete
export function SwipeableItem({ children, onDelete }) {
  const controls = useAnimation();

  return (
    <motion.div
      drag="x"
      dragConstraints={{ left: -100, right: 0 }}
      onDragEnd={(e, { offset }) => {
        if (offset.x < -50) {
          controls.start({ x: -100, opacity: 0 });
          setTimeout(onDelete, 300);
        } else {
          controls.start({ x: 0 });
        }
      }}
      animate={controls}
    >
      {children}
    </motion.div>
  );
}

// Pull to refresh
export function PullToRefresh({ onRefresh, children }) {
  const [isRefreshing, setIsRefreshing] = useState(false);

  return (
    <motion.div
      drag="y"
      dragConstraints={{ top: 0, bottom: 100 }}
      onDragEnd={(e, { offset }) => {
        if (offset.y > 50 && !isRefreshing) {
          setIsRefreshing(true);
          onRefresh().finally(() => setIsRefreshing(false));
        }
      }}
    >
      {isRefreshing && <Spinner />}
      {children}
    </motion.div>
  );
}
```

### 8. Notification Animations

```typescript
// lib/animations/notifications.ts
export const notificationVariants = {
  initial: {
    opacity: 0,
    y: 50,
    scale: 0.3,
  },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.4,
      ease: [0, 0.71, 0.2, 1.01],
    },
  },
  exit: {
    opacity: 0,
    scale: 0.5,
    transition: {
      duration: 0.2,
      ease: [0.4, 0, 1, 1],
    },
  },
};

// Success animation
export const successAnimation = {
  initial: { pathLength: 0 },
  animate: {
    pathLength: 1,
    transition: {
      duration: 0.4,
      ease: "easeInOut",
    },
  },
};
```

### 9. Layout Animations

```typescript
// lib/animations/layout.ts
import { motion, AnimatePresence } from 'framer-motion';

// Smooth layout changes
export function AnimatedLayout({ children, layoutId }) {
  return (
    <motion.div
      layout
      layoutId={layoutId}
      transition={{
        layout: {
          duration: 0.3,
          ease: [0.4, 0, 0.2, 1],
        },
      }}
    >
      {children}
    </motion.div>
  );
}

// Shared element transition
export function SharedElement({ id, children }) {
  return (
    <motion.div
      layoutId={id}
      transition={{
        type: "spring",
        stiffness: 500,
        damping: 30,
      }}
    >
      {children}
    </motion.div>
  );
}
```

### 10. Scroll Animations

```typescript
// lib/animations/scroll.ts
import { motion, useScroll, useTransform } from 'framer-motion';

// Parallax effect
export function Parallax({ children, offset = 50 }) {
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 1000], [0, offset]);

  return (
    <motion.div style={{ y }}>
      {children}
    </motion.div>
  );
}

// Reveal on scroll
export const scrollReveal = {
  initial: {
    opacity: 0,
    y: 60,
  },
  whileInView: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.4, 0, 0.2, 1],
    },
  },
  viewport: {
    once: true,
    amount: 0.3,
  },
};
```

## Performance Optimizations

### 1. Use CSS Transforms
```typescript
// Good - uses GPU acceleration
animate={{ x: 100, scale: 1.2 }}

// Bad - triggers layout recalculation
animate={{ left: 100, width: 200 }}
```

### 2. Reduce Motion Preference
```typescript
// lib/animations/useReducedMotion.ts
import { useReducedMotion as useFramerReducedMotion } from 'framer-motion';

export function useReducedMotion() {
  return useFramerReducedMotion();
}

// Usage
const shouldReduceMotion = useReducedMotion();
const animation = shouldReduceMotion ? {} : {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
};
```

### 3. Lazy Animation Components
```typescript
// Lazy load heavy animation components
const AnimatedChart = lazy(() => import('./AnimatedChart'));

// Use suspense boundary
<Suspense fallback={<Skeleton />}>
  <AnimatedChart />
</Suspense>
```

### 4. Animation Throttling
```typescript
// Throttle scroll animations
import { throttle } from 'lodash';

const handleScroll = throttle(() => {
  // Animation logic
}, 16); // ~60fps
```

## Accessibility Considerations

### 1. Respect User Preferences
```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

### 2. Focus Management
```typescript
// Maintain focus during animations
export function AnimatedModal({ isOpen, children }) {
  const previousFocus = useRef<HTMLElement>();

  useEffect(() => {
    if (isOpen) {
      previousFocus.current = document.activeElement as HTMLElement;
      // Focus first interactive element
    } else {
      previousFocus.current?.focus();
    }
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
```

## Testing Animations

### 1. Visual Regression Testing
```typescript
// Use Playwright for visual testing
test('portfolio animation renders correctly', async ({ page }) => {
  await page.goto('/portfolio');
  await page.waitForTimeout(1000); // Wait for animations
  await expect(page).toHaveScreenshot('portfolio-animated.png');
});
```

### 2. Performance Testing
```typescript
// Monitor animation performance
const observer = new PerformanceObserver((list) => {
  const entries = list.getEntries();
  entries.forEach((entry) => {
    if (entry.duration > 16.67) { // Slower than 60fps
      console.warn('Slow animation detected:', entry);
    }
  });
});
observer.observe({ entryTypes: ['measure'] });
```

## Common Patterns

### Loading → Content Transition
```typescript
<AnimatePresence mode="wait">
  {loading ? (
    <motion.div key="loader" {...fadeAnimation}>
      <Skeleton />
    </motion.div>
  ) : (
    <motion.div key="content" {...fadeAnimation}>
      <Content />
    </motion.div>
  )}
</AnimatePresence>
```

### Error State Animation
```typescript
<motion.div
  animate={error ? "error" : "normal"}
  variants={{
    normal: { x: 0 },
    error: {
      x: [-10, 10, -10, 10, 0],
      transition: { duration: 0.4 },
    },
  }}
>
  {/* Form field */}
</motion.div>
```

### Success Feedback
```typescript
<AnimatePresence>
  {success && (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0, opacity: 0 }}
      transition={{ type: "spring", stiffness: 500, damping: 25 }}
    >
      <CheckCircle className="text-green-500" />
    </motion.div>
  )}
</AnimatePresence>
```

## Implementation Checklist

- [ ] Install Framer Motion
- [ ] Set up animation configuration
- [ ] Create reusable animation variants
- [ ] Implement page transitions
- [ ] Add loading animations
- [ ] Create hover effects
- [ ] Add scroll animations
- [ ] Implement gesture controls
- [ ] Test performance
- [ ] Ensure accessibility
- [ ] Document usage patterns

## Conclusion

This animation guide provides a comprehensive foundation for implementing smooth, performant, and accessible animations in SolFolio. Remember to always prioritize user experience and performance over visual flair.