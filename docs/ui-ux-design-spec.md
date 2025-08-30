# SolFolio UI/UX Design Specification

## Executive Summary
This document outlines the comprehensive UI/UX design specification for SolFolio, a Solana DeFi portfolio tracker. The design aims to create a modern, intuitive, and performant interface that rivals leading platforms like Zerion and Step Finance while maintaining a unique identity focused on the Solana ecosystem.

## Design Principles

### 1. **Clarity First**
- Information hierarchy that prioritizes critical portfolio data
- Clear visual separation between different data types
- Intuitive navigation with predictable interactions

### 2. **Performance Optimized**
- Smooth animations that don't compromise speed
- Progressive loading states for better perceived performance
- Optimistic UI updates for instant feedback

### 3. **Mobile Responsive**
- Mobile-first design approach
- Touch-friendly interactions
- Adaptive layouts that work across all screen sizes

### 4. **Accessibility**
- WCAG 2.1 AA compliance
- Keyboard navigation support
- Screen reader optimized content

### 5. **Delight Through Motion**
- Subtle micro-interactions
- Smooth transitions between states
- Purposeful animations that guide attention

## Color System

### Primary Palette
```scss
// Brand Colors
$primary-gradient: linear-gradient(135deg, #9945FF 0%, #14F195 100%); // Solana gradient
$primary: #9945FF; // Solana purple
$secondary: #14F195; // Solana green
$accent: #00D4FF; // Bright cyan for CTAs

// Semantic Colors
$success: #14F195;
$warning: #FFB800;
$danger: #FF4747;
$info: #00D4FF;

// Background Colors (Dark Theme Default)
$bg-primary: #0A0B0D; // Main background
$bg-secondary: #13141A; // Card background
$bg-tertiary: #1C1D26; // Elevated surfaces
$bg-hover: #242530; // Hover states

// Text Colors
$text-primary: #FFFFFF;
$text-secondary: #B8BCC8;
$text-muted: #6B7280;
$text-inverse: #0A0B0D;

// Border Colors
$border-default: rgba(255, 255, 255, 0.08);
$border-hover: rgba(255, 255, 255, 0.12);
$border-focus: rgba(153, 69, 255, 0.5);
```

### Light Theme Support
```scss
// Light theme overrides
$light-bg-primary: #FFFFFF;
$light-bg-secondary: #F9FAFB;
$light-bg-tertiary: #F3F4F6;
$light-text-primary: #111827;
$light-text-secondary: #6B7280;
$light-border: rgba(0, 0, 0, 0.08);
```

## Typography

### Font Stack
```css
--font-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
--font-mono: 'JetBrains Mono', 'Fira Code', monospace;
```

### Type Scale
```scss
// Headings
$h1: 3rem / 1.2 / 700; // 48px
$h2: 2.25rem / 1.3 / 600; // 36px
$h3: 1.875rem / 1.4 / 600; // 30px
$h4: 1.5rem / 1.4 / 500; // 24px
$h5: 1.25rem / 1.5 / 500; // 20px
$h6: 1.125rem / 1.5 / 500; // 18px

// Body
$body-lg: 1.125rem / 1.6 / 400; // 18px
$body-base: 1rem / 1.6 / 400; // 16px
$body-sm: 0.875rem / 1.5 / 400; // 14px
$body-xs: 0.75rem / 1.4 / 400; // 12px

// Special
$display: 4rem / 1.1 / 700; // 64px - Hero sections
$caption: 0.75rem / 1.3 / 500; // 12px - Labels
$code: 0.875rem / 1.6 / 400; // 14px - Monospace
```

## Component Specifications

### 1. Navigation Header
```yaml
Height: 72px
Background: Glassmorphism effect with backdrop-blur
Position: Sticky top
Z-index: 50

Components:
  - Logo: 
      Size: 40px height
      Animation: Subtle glow on hover
  - Nav Links:
      Font: $body-base / 500
      Spacing: 32px between items
      Active: Underline with gradient
      Hover: Scale 1.05 with transition
  - Wallet Button:
      Style: Gradient border with glass fill
      Connected: Show truncated address + avatar
      Animation: Pulse animation when connecting
```

### 2. Portfolio Overview Card
```yaml
Layout: Grid with responsive columns
Padding: 24px (mobile: 16px)
Background: $bg-secondary with subtle gradient border

Sections:
  Total Value:
    Font: $display for value
    Animation: Count-up animation on load
    Change Indicator: Color-coded with arrow
  
  Performance Metrics:
    Layout: 3-column grid
    Items: 24h, 7d, 30d changes
    Visual: Mini sparkline charts
  
  Quick Stats:
    Items: Total tokens, Active positions, Total protocols
    Icons: Custom animated SVGs
```

### 3. Token List Component
```yaml
Layout: Virtualized list for performance
Row Height: 72px
Hover: Subtle background highlight

Columns:
  Token:
    Content: Logo + Symbol + Name
    Logo: 32px with fallback
  Balance:
    Format: Number with 4 decimals
    Sub: USD value
  Price:
    Format: USD with appropriate decimals
    Change: Percentage with color coding
  Allocation:
    Visual: Horizontal progress bar
    Tooltip: Exact percentage
  Actions:
    Buttons: Send, Swap, More
    Style: Icon buttons with tooltips
```

### 4. Position Cards
```yaml
Layout: Grid (desktop: 2 cols, mobile: 1 col)
Card Style: Elevated with gradient accent border
Padding: 20px

Content:
  Header:
    Protocol Logo: 48px
    Protocol Name: $h5
    Position Type: Badge style
  
  Metrics:
    Value: $h4 with USD format
    APY: Highlighted with success color
    Rewards: Real-time counter animation
  
  Tokens:
    Display: Overlapping token logos
    Tooltip: Full token breakdown
  
  Actions:
    Primary: Manage position
    Secondary: View details
```

### 5. Charts & Visualizations

#### Portfolio Pie Chart
```yaml
Type: Interactive donut chart
Library: Recharts with custom styling
Colors: Gradient fills matching token brands
Interactions:
  - Hover: Expand slice + tooltip
  - Click: Filter portfolio by selection
Animation: Draw-in on mount
```

#### Historical Value Chart
```yaml
Type: Area chart with gradient fill
Time Ranges: 24H, 7D, 30D, 90D, 1Y, ALL
Interactions:
  - Hover: Crosshair with value tooltip
  - Drag: Time range selection
  - Zoom: Pinch or scroll
Animation: Smooth transitions between ranges
```

#### Protocol Breakdown
```yaml
Type: Horizontal bar chart
Sorting: By value (default), alphabetical
Visual: Protocol logos inline
Animation: Stagger animation on load
```

## Animation Specifications

### Using Framer Motion

#### Page Transitions
```typescript
const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.4,
      ease: [0.4, 0, 0.2, 1] // Custom easing
    }
  },
  exit: { opacity: 0, y: -20 }
};
```

#### Card Animations
```typescript
const cardVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.3,
      staggerChildren: 0.05
    }
  }
};
```

#### Value Updates
```typescript
const valueAnimation = {
  initial: { scale: 1 },
  update: { 
    scale: [1, 1.05, 1],
    transition: { duration: 0.3 }
  }
};
```

#### Hover Effects
```typescript
const hoverScale = {
  whileHover: { 
    scale: 1.02,
    transition: { duration: 0.2 }
  },
  whileTap: { scale: 0.98 }
};
```

### Loading States

#### Skeleton Screens
- Use shimmer effect for loading placeholders
- Match exact dimensions of content
- Progressive loading from top to bottom

#### Spinner Types
- Primary: Gradient rotating ring
- Secondary: Pulsing dots
- Inline: Small circular spinner

## Responsive Breakpoints

```scss
$breakpoints: (
  'xs': 375px,   // Small phones
  'sm': 640px,   // Large phones
  'md': 768px,   // Tablets
  'lg': 1024px,  // Small laptops
  'xl': 1280px,  // Desktops
  '2xl': 1536px  // Large screens
);
```

## Interaction Patterns

### Wallet Connection Flow
1. **Disconnected State**
   - Prominent CTA button with gradient
   - Animated icon drawing attention
   - Clear value proposition message

2. **Connecting State**
   - Loading spinner overlay
   - Wallet selection modal with logos
   - Connection status updates

3. **Connected State**
   - Truncated address with copy function
   - Avatar/Identicon display
   - Quick disconnect option

### Data Refresh Pattern
- Pull-to-refresh on mobile
- Manual refresh button with rotation animation
- Auto-refresh indicator (pulsing dot)
- Last updated timestamp

### Error States
- Inline error messages with recovery actions
- Toast notifications for transient errors
- Empty states with helpful illustrations
- Network error banners with retry

## Performance Optimizations

### Code Splitting
```typescript
// Lazy load heavy components
const Charts = lazy(() => import('./components/Charts'));
const ProtocolDetails = lazy(() => import('./components/ProtocolDetails'));
```

### Image Optimization
- Use next/image for automatic optimization
- Lazy load below-fold images
- WebP format with fallbacks
- Responsive srcsets

### Animation Performance
- Use transform and opacity only
- Enable GPU acceleration
- Throttle scroll-based animations
- Reduce motion for accessibility

## Accessibility Requirements

### Keyboard Navigation
- Tab order follows visual hierarchy
- Focus indicators clearly visible
- Escape key closes modals
- Arrow keys navigate lists

### Screen Reader Support
- Semantic HTML structure
- ARIA labels for interactive elements
- Live regions for dynamic updates
- Skip navigation links

### Color Contrast
- Minimum 4.5:1 for normal text
- Minimum 3:1 for large text
- Minimum 3:1 for UI components
- Non-color indicators for status

## Dark/Light Theme Implementation

### Theme Toggle
- Position: Header right section
- Icon: Sun/Moon with smooth morph
- Persistence: localStorage
- System preference detection

### Theme Transitions
```css
* {
  transition: background-color 0.3s ease, 
              border-color 0.3s ease,
              color 0.3s ease;
}
```

## Progressive Enhancement

### Core Functionality
- Works without JavaScript (SSR)
- Readable without CSS
- Functional on slow connections

### Enhanced Features
- Real-time price updates
- Animated transitions
- Interactive charts
- Drag and drop

## Implementation Priority

### Phase 1: Foundation (Week 1)
- [ ] Color system and typography
- [ ] Component library setup
- [ ] Basic layout components
- [ ] Navigation header

### Phase 2: Core Components (Week 2)
- [ ] Portfolio overview card
- [ ] Token list with virtualization
- [ ] Position cards
- [ ] Loading states

### Phase 3: Visualizations (Week 3)
- [ ] Portfolio pie chart
- [ ] Historical value chart
- [ ] Protocol breakdown
- [ ] Sparklines

### Phase 4: Polish (Week 4)
- [ ] Animations and transitions
- [ ] Dark/light theme
- [ ] Mobile optimizations
- [ ] Error states

### Phase 5: Advanced (Week 5)
- [ ] Advanced filtering
- [ ] Export functionality
- [ ] Notification system
- [ ] Performance monitoring

## Design Tokens

```json
{
  "spacing": {
    "xs": "4px",
    "sm": "8px",
    "md": "16px",
    "lg": "24px",
    "xl": "32px",
    "2xl": "48px",
    "3xl": "64px"
  },
  "radius": {
    "sm": "4px",
    "md": "8px",
    "lg": "12px",
    "xl": "16px",
    "full": "9999px"
  },
  "shadow": {
    "sm": "0 1px 2px rgba(0,0,0,0.05)",
    "md": "0 4px 6px rgba(0,0,0,0.1)",
    "lg": "0 10px 15px rgba(0,0,0,0.1)",
    "xl": "0 20px 25px rgba(0,0,0,0.1)",
    "glow": "0 0 20px rgba(153, 69, 255, 0.3)"
  },
  "blur": {
    "sm": "4px",
    "md": "8px",
    "lg": "16px",
    "xl": "24px"
  },
  "transition": {
    "fast": "150ms",
    "base": "250ms",
    "slow": "350ms",
    "slower": "500ms"
  }
}
```

## Conclusion

This design specification provides a comprehensive guide for implementing a modern, performant, and user-friendly interface for SolFolio. The design balances aesthetic appeal with functional requirements, ensuring an exceptional user experience across all devices and user scenarios.

The implementation should prioritize core functionality while progressively enhancing the experience with animations and advanced features. Regular user testing and performance monitoring will guide iterative improvements.