# SolFolio Animation Library

This directory contains the Framer Motion-based animation components and utilities for SolFolio.

## Overview

The animation library provides:
- Pre-configured animation variants
- Reusable motion components
- Page transition wrappers
- Performance-optimized animations
- Accessibility support (respects reduced motion preferences)

## Quick Start

### Basic Usage

```tsx
import { FadeIn, AnimatedCard, AnimatedButton } from '@/components/motion';

// Simple fade-in animation
<FadeIn>
  <h1>Welcome to SolFolio</h1>
</FadeIn>

// Card with hover effect
<AnimatedCard>
  <p>Your portfolio content</p>
</AnimatedCard>

// Button with scale animation
<AnimatedButton onClick={handleClick}>
  Connect Wallet
</AnimatedButton>
```

### Page Transitions

Wrap your page components with `PageTransition`:

```tsx
import { PageTransition } from '@/components/motion/PageTransition';

export default function MyPage() {
  return (
    <PageTransition>
      {/* Page content */}
    </PageTransition>
  );
}
```

### Stagger Animations

For lists and grids:

```tsx
import { StaggerContainer, StaggerItem } from '@/components/motion';

<StaggerContainer>
  {items.map(item => (
    <StaggerItem key={item.id}>
      <Card>{item.content}</Card>
    </StaggerItem>
  ))}
</StaggerContainer>
```

## Available Components

### Motion Wrappers
- `MotionDiv`, `MotionSection`, `MotionArticle` - Basic HTML elements with motion capabilities
- `FadeIn` - Simple fade-in animation
- `FadeInUp` - Fade with upward motion
- `ScrollReveal` - Reveals content on scroll

### Interactive Components
- `AnimatedCard` - Card with hover elevation
- `AnimatedButton` - Button with scale animations
- `AnimatedLayout` - Automatic layout animations

### Container Components
- `StaggerContainer` - Staggers child animations
- `StaggerItem` - Individual stagger item
- `AnimatePresenceWrapper` - Manages enter/exit animations

### Loading States
- `Skeleton` - Skeleton loader with shimmer
- `Spinner` - Animated loading spinner

### Page Transitions
- `PageTransition` - Page-level transitions
- `SectionTransition` - Section-level transitions
- `LayoutTransition` - Layout shift animations

## Animation Variants

The library includes pre-configured variants in `/lib/animations.ts`:

```tsx
import { 
  pageVariants,
  fadeVariants,
  staggerContainer,
  cardHoverVariants,
  notificationVariants 
} from '@/lib/animations';
```

## Custom Hooks

### useAnimationConfig
Manages animation settings with reduced motion support:

```tsx
import { useAnimationConfig } from '@/hooks/useAnimationConfig';

const config = useAnimationConfig({ 
  duration: 'slow',
  ease: 'smooth' 
});
```

### useGestureAnimation
Handles gesture-based animations:

```tsx
const gestureProps = useGestureAnimation();

<motion.div {...gestureProps}>
  Draggable content
</motion.div>
```

## Performance Tips

1. **Use transform and opacity only** - These properties are GPU-accelerated
2. **Respect reduced motion** - All components check user preferences
3. **Lazy load heavy animations** - Use dynamic imports for complex animations
4. **Batch animations** - Use stagger containers for lists
5. **Test on real devices** - Ensure 60 FPS on mobile

## Accessibility

All components:
- Check for `prefers-reduced-motion`
- Maintain focus management
- Provide keyboard navigation support
- Include proper ARIA attributes

## Demo

View the animation demo at `/demo/animation` to see all components in action.

## Configuration

Customize animation settings in `/lib/animations.ts`:

```tsx
export const animationConfig = {
  duration: {
    fast: 0.15,
    normal: 0.25,
    slow: 0.35,
  },
  ease: {
    default: [0.4, 0, 0.2, 1],
    bounce: [0.68, -0.55, 0.265, 1.55],
  },
};
```

## TypeScript Support

All components are fully typed with TypeScript interfaces and proper prop definitions.

## Testing

Run the animation demo to verify performance:

```bash
pnpm dev
# Navigate to http://localhost:3000/demo/animation
```

Use browser DevTools Performance tab to ensure 60 FPS.