/**
 * Animation Library for SolFolio
 * Comprehensive animation variants and configurations using Framer Motion
 */

import { Variants, Transition, Target, TargetAndTransition } from 'framer-motion';

// ============================
// Animation Configuration
// ============================

export const animationConfig = {
  // Timing functions - cubic bezier curves
  ease: {
    default: [0.4, 0, 0.2, 1] as const,      // Smooth ease (Material Design standard)
    easeIn: [0.4, 0, 1, 1] as const,         // Accelerate
    easeOut: [0, 0, 0.2, 1] as const,        // Decelerate
    easeInOut: [0.4, 0, 0.2, 1] as const,    // Smooth both
    bounce: [0.68, -0.55, 0.265, 1.55] as const, // Playful bounce
    smooth: [0.25, 0.1, 0.25, 1] as const,   // Very smooth
  },
  
  // Duration scale (in seconds)
  duration: {
    instant: 0,
    fast: 0.15,
    normal: 0.25,
    slow: 0.35,
    slower: 0.5,
    slowest: 0.75,
  },
  
  // Spring configurations for physics-based animations
  spring: {
    default: { type: "spring" as const, stiffness: 500, damping: 30 },
    gentle: { type: "spring" as const, stiffness: 100, damping: 20 },
    wobbly: { type: "spring" as const, stiffness: 180, damping: 12 },
    stiff: { type: "spring" as const, stiffness: 700, damping: 35 },
    quick: { type: "spring" as const, stiffness: 400, damping: 25 },
  },
} as const;

// ============================
// Page Transition Variants
// ============================

export const pageVariants: Variants = {
  initial: {
    opacity: 0,
    y: 20,
  },
  enter: {
    opacity: 1,
    y: 0,
    transition: {
      duration: animationConfig.duration.slow,
      ease: animationConfig.ease.default,
    },
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: {
      duration: animationConfig.duration.normal,
      ease: animationConfig.ease.easeIn,
    },
  },
};

// Slide page variants for horizontal transitions
export const slidePageVariants: Variants = {
  initial: (direction: number) => ({
    opacity: 0,
    x: direction > 0 ? 100 : -100,
  }),
  enter: {
    opacity: 1,
    x: 0,
    transition: {
      duration: animationConfig.duration.slow,
      ease: animationConfig.ease.default,
    },
  },
  exit: (direction: number) => ({
    opacity: 0,
    x: direction > 0 ? -100 : 100,
    transition: {
      duration: animationConfig.duration.normal,
      ease: animationConfig.ease.easeIn,
    },
  }),
};

// ============================
// Stagger Animation Variants
// ============================

export const staggerContainer: Variants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1,
    },
  },
  exit: {
    transition: {
      staggerChildren: 0.03,
      staggerDirection: -1,
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
      duration: animationConfig.duration.normal,
      ease: animationConfig.ease.default,
    },
  },
  exit: {
    opacity: 0,
    y: -10,
    transition: {
      duration: animationConfig.duration.fast,
      ease: animationConfig.ease.easeIn,
    },
  },
};

// Stagger with scale effect
export const staggerScaleItem: Variants = {
  initial: {
    opacity: 0,
    scale: 0.8,
  },
  animate: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: animationConfig.duration.normal,
      ease: animationConfig.ease.default,
    },
  },
};

// ============================
// Fade Variants
// ============================

export const fadeVariants: Variants = {
  initial: {
    opacity: 0,
  },
  animate: {
    opacity: 1,
    transition: {
      duration: animationConfig.duration.normal,
      ease: animationConfig.ease.default,
    },
  },
  exit: {
    opacity: 0,
    transition: {
      duration: animationConfig.duration.fast,
      ease: animationConfig.ease.easeIn,
    },
  },
};

export const fadeInUp: Variants = {
  initial: {
    opacity: 0,
    y: 30,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: animationConfig.duration.slow,
      ease: animationConfig.ease.default,
    },
  },
};

// ============================
// Hover Effects
// ============================

export const hoverScale: TargetAndTransition = {
  scale: 1.02,
  transition: {
    duration: animationConfig.duration.fast,
    ease: animationConfig.ease.default,
  },
};

export const tapScale: TargetAndTransition = {
  scale: 0.98,
  transition: {
    duration: animationConfig.duration.fast,
    ease: animationConfig.ease.default,
  },
};

export const hoverGlow: TargetAndTransition = {
  boxShadow: '0 0 20px rgba(153, 69, 255, 0.3)',
  transition: {
    duration: animationConfig.duration.fast,
  },
};

// Card hover with elevation
export const cardHoverVariants: Variants = {
  rest: {
    y: 0,
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    transition: {
      duration: animationConfig.duration.fast,
      ease: animationConfig.ease.default,
    },
  },
  hover: {
    y: -4,
    boxShadow: '0 12px 24px rgba(0, 0, 0, 0.15)',
    transition: {
      duration: animationConfig.duration.normal,
      ease: animationConfig.ease.default,
    },
  },
};

// Button hover effect
export const buttonHoverVariants: Variants = {
  rest: {
    scale: 1,
    transition: {
      duration: animationConfig.duration.fast,
      ease: animationConfig.ease.default,
    },
  },
  hover: {
    scale: 1.05,
    transition: {
      duration: animationConfig.duration.fast,
      ease: animationConfig.ease.default,
    },
  },
  tap: {
    scale: 0.95,
    transition: {
      duration: animationConfig.duration.instant,
    },
  },
};

// ============================
// Loading & Skeleton Variants
// ============================

export const shimmerVariants: Variants = {
  initial: {
    backgroundPosition: '-200% 0',
  },
  animate: {
    backgroundPosition: '200% 0',
    transition: {
      duration: 1.5,
      ease: 'linear',
      repeat: Infinity,
    },
  },
};

export const pulseVariants: Variants = {
  initial: {
    opacity: 0.5,
  },
  animate: {
    opacity: [0.5, 1, 0.5],
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
};

export const spinnerVariants: Variants = {
  animate: {
    rotate: 360,
    transition: {
      duration: 1,
      repeat: Infinity,
      ease: 'linear',
    },
  },
};

// ============================
// Notification & Toast Variants
// ============================

export const notificationVariants: Variants = {
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
      duration: animationConfig.duration.slow,
      ease: [0, 0.71, 0.2, 1.01],
    },
  },
  exit: {
    opacity: 0,
    scale: 0.5,
    transition: {
      duration: animationConfig.duration.fast,
      ease: animationConfig.ease.easeIn,
    },
  },
};

// ============================
// Modal & Overlay Variants
// ============================

export const overlayVariants: Variants = {
  initial: {
    opacity: 0,
  },
  animate: {
    opacity: 1,
    transition: {
      duration: animationConfig.duration.normal,
      ease: animationConfig.ease.default,
    },
  },
  exit: {
    opacity: 0,
    transition: {
      duration: animationConfig.duration.fast,
      ease: animationConfig.ease.easeIn,
    },
  },
};

export const modalVariants: Variants = {
  initial: {
    opacity: 0,
    scale: 0.95,
    y: 20,
  },
  animate: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      duration: animationConfig.duration.normal,
      ease: animationConfig.ease.default,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: 20,
    transition: {
      duration: animationConfig.duration.fast,
      ease: animationConfig.ease.easeIn,
    },
  },
};

// ============================
// Scroll-based Animations
// ============================

export const scrollRevealVariants: Variants = {
  initial: {
    opacity: 0,
    y: 60,
  },
  whileInView: {
    opacity: 1,
    y: 0,
    transition: {
      duration: animationConfig.duration.slower,
      ease: animationConfig.ease.default,
    },
  },
};

// ============================
// Chart & Data Visualization Variants
// ============================

export const barChartVariants: Variants = {
  initial: {
    scaleY: 0,
    originY: 1,
  },
  animate: (custom: number) => ({
    scaleY: 1,
    transition: {
      delay: custom * 0.05,
      duration: animationConfig.duration.slow,
      ease: animationConfig.ease.default,
    },
  }),
};

export const pieSliceVariants: Variants = {
  initial: {
    scale: 0,
    opacity: 0,
  },
  animate: (custom: number) => ({
    scale: 1,
    opacity: 1,
    transition: {
      delay: custom * 0.1,
      duration: animationConfig.duration.slow,
      ease: animationConfig.ease.default,
    },
  }),
  hover: {
    scale: 1.05,
    transition: {
      duration: animationConfig.duration.fast,
    },
  },
};

// ============================
// Success & Error Animations
// ============================

export const successCheckVariants: Variants = {
  initial: {
    pathLength: 0,
    opacity: 0,
  },
  animate: {
    pathLength: 1,
    opacity: 1,
    transition: {
      pathLength: {
        duration: animationConfig.duration.slow,
        ease: animationConfig.ease.default,
      },
      opacity: {
        duration: animationConfig.duration.fast,
      },
    },
  },
};

export const errorShakeVariants: Variants = {
  initial: {
    x: 0,
  },
  animate: {
    x: [-10, 10, -10, 10, 0],
    transition: {
      duration: animationConfig.duration.slow,
      ease: animationConfig.ease.default,
    },
  },
};

// ============================
// Gesture-based Animations
// ============================

export const swipeVariants: Variants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 1000 : -1000,
    opacity: 0,
  }),
  center: {
    zIndex: 1,
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    zIndex: 0,
    x: direction < 0 ? 1000 : -1000,
    opacity: 0,
  }),
};

// ============================
// Mobile Navigation Variants
// ============================

// Full-screen mobile menu overlay
export const mobileMenuOverlayVariants: Variants = {
  initial: {
    opacity: 0,
  },
  animate: {
    opacity: 1,
    transition: {
      duration: animationConfig.duration.normal,
      ease: animationConfig.ease.default,
    },
  },
  exit: {
    opacity: 0,
    transition: {
      duration: animationConfig.duration.fast,
      ease: animationConfig.ease.easeIn,
      delay: 0.1, // Slight delay to let menu slide out first
    },
  },
};

// Slide-in mobile menu
export const mobileMenuVariants: Variants = {
  initial: {
    x: '100%',
  },
  animate: {
    x: 0,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 30,
      mass: 0.8,
    },
  },
  exit: {
    x: '100%',
    transition: {
      duration: animationConfig.duration.normal,
      ease: animationConfig.ease.easeIn,
    },
  },
};

// Mobile menu items with stagger
export const mobileMenuItemVariants: Variants = {
  initial: {
    opacity: 0,
    x: 50,
  },
  animate: (custom: number) => ({
    opacity: 1,
    x: 0,
    transition: {
      delay: custom * 0.05 + 0.1, // Stagger with base delay
      duration: animationConfig.duration.slow,
      ease: animationConfig.ease.default,
    },
  }),
  exit: {
    opacity: 0,
    x: 50,
    transition: {
      duration: animationConfig.duration.fast,
      ease: animationConfig.ease.easeIn,
    },
  },
};

// Hamburger menu icon animation
export const hamburgerLineVariants = {
  closed: {
    rotate: 0,
    y: 0,
  },
  open: {
    rotate: 45,
    y: 0,
  },
};

export const hamburgerTopLineVariants: Variants = {
  closed: {
    rotate: 0,
    y: 0,
  },
  open: {
    rotate: 45,
    y: 6,
  },
};

export const hamburgerMiddleLineVariants: Variants = {
  closed: {
    opacity: 1,
    x: 0,
  },
  open: {
    opacity: 0,
    x: -20,
  },
};

export const hamburgerBottomLineVariants: Variants = {
  closed: {
    rotate: 0,
    y: 0,
  },
  open: {
    rotate: -45,
    y: -6,
  },
};

// ============================
// Utility Functions
// ============================

/**
 * Creates a custom spring animation
 */
export const createSpring = (
  stiffness: number = 500,
  damping: number = 30
): Transition => ({
  type: "spring",
  stiffness,
  damping,
});

/**
 * Creates a custom tween animation
 */
export const createTween = (
  duration: number = 0.3,
  ease: number[] | string = [...animationConfig.ease.default]
): Transition => ({
  type: "tween",
  duration,
  ease: ease as any,
});

/**
 * Helper to create delayed animations
 */
export const withDelay = (
  delay: number,
  transition: Transition
): Transition => ({
  ...transition,
  delay,
});

/**
 * Helper for reduced motion preference
 */
export const getReducedMotionVariants = (variants: Variants): Variants => {
  const reduced: Variants = {};
  
  for (const key in variants) {
    if (key === 'initial' || key === 'animate') {
      reduced[key] = {};
    } else {
      reduced[key] = variants[key];
    }
  }
  
  return reduced;
};

// ============================
// Layout Animation Configurations
// ============================

export const layoutTransition: Transition = {
  type: "spring",
  stiffness: 500,
  damping: 30,
};

export const sharedLayoutTransition: Transition = {
  type: "spring",
  stiffness: 400,
  damping: 25,
};

// ============================
// Additional Animation Exports
// ============================

// Card hover animation
export const cardHover = {
  whileHover: { 
    y: -4,
    transition: { duration: 0.2 }
  },
  whileTap: { 
    scale: 0.98,
    transition: { duration: 0.1 }
  }
};

// Shimmer animation for loading states
export const shimmerAnimation = {
  animate: {
    x: ['0%', '100%'],
    transition: {
      duration: 2,
      ease: "linear",
      repeat: Infinity
    }
  }
};

// Count up animation for numbers
export const countUpAnimation = {
  initial: { opacity: 0, y: 10 },
  animate: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.5,
      ease: animationConfig.ease.default
    }
  }
};

// Gradient border pulse
export const gradientPulse = {
  animate: {
    backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
    transition: {
      duration: 5,
      ease: "linear",
      repeat: Infinity
    }
  }
};

// Scale Variants
export const scaleVariants: Variants = {
  initial: {
    opacity: 0,
    scale: 0.95,
  },
  animate: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: animationConfig.duration.normal,
      ease: animationConfig.ease.default,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    transition: {
      duration: animationConfig.duration.fast,
      ease: animationConfig.ease.easeIn,
    },
  },
};

// ============================
// Export Types for TypeScript
// ============================

export type AnimationVariant = keyof typeof pageVariants;
export type AnimationEasing = keyof typeof animationConfig.ease;
export type AnimationDuration = keyof typeof animationConfig.duration;
export type AnimationSpring = keyof typeof animationConfig.spring;