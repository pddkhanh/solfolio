/**
 * Design tokens for SolFolio theming system
 * Based on docs/ui-ux-design-spec.md
 */

export const designTokens = {
  // Spacing scale (in rem)
  spacing: {
    xs: '0.25rem',   // 4px
    sm: '0.5rem',    // 8px
    md: '1rem',      // 16px
    lg: '1.5rem',    // 24px
    xl: '2rem',      // 32px
    '2xl': '3rem',   // 48px
    '3xl': '4rem',   // 64px
    '4xl': '6rem',   // 96px
  },

  // Border radius scale
  radius: {
    none: '0',
    sm: '0.25rem',   // 4px
    md: '0.5rem',    // 8px
    lg: '0.75rem',   // 12px
    xl: '1rem',      // 16px
    '2xl': '1.5rem', // 24px
    full: '9999px',
  },

  // Font sizes
  fontSize: {
    xs: '0.75rem',     // 12px
    sm: '0.875rem',    // 14px
    base: '1rem',      // 16px
    lg: '1.125rem',    // 18px
    xl: '1.25rem',     // 20px
    '2xl': '1.5rem',   // 24px
    '3xl': '1.875rem', // 30px
    '4xl': '2.25rem',  // 36px
    '5xl': '3rem',     // 48px
  },

  // Font weights
  fontWeight: {
    light: 300,
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    extrabold: 800,
  },

  // Line heights
  lineHeight: {
    none: 1,
    tight: 1.25,
    snug: 1.375,
    normal: 1.5,
    relaxed: 1.625,
    loose: 2,
  },

  // Shadows
  shadows: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    DEFAULT: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
    '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
    inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
    none: 'none',
  },

  // Transitions
  transitions: {
    fast: '150ms',
    default: '200ms',
    slow: '300ms',
    slowest: '500ms',
  },

  // Z-index scale
  zIndex: {
    auto: 'auto',
    0: 0,
    10: 10,
    20: 20,
    30: 30,
    40: 40,
    50: 50,
    dropdown: 1000,
    sticky: 1020,
    modal: 1030,
    popover: 1040,
    tooltip: 1050,
  },

  // Breakpoints (matching Tailwind)
  breakpoints: {
    xs: '375px',   // Small phones
    sm: '640px',   // Large phones
    md: '768px',   // Tablets
    lg: '1024px',  // Small laptops
    xl: '1280px',  // Desktops
    '2xl': '1536px', // Large screens
  },

  // Blur values for glassmorphism
  blur: {
    none: '0',
    sm: '4px',
    DEFAULT: '8px',
    md: '12px',
    lg: '16px',
    xl: '24px',
    '2xl': '40px',
    '3xl': '64px',
  },
} as const

// Color system with Solana-inspired gradients
export const colorSystem = {
  // Solana brand colors
  solana: {
    purple: '#9945FF',
    green: '#14F195',
    cyan: '#00D4FF',
    gradientPurple: 'linear-gradient(135deg, #9333EA 0%, #A855F7 100%)',
    gradientGreen: 'linear-gradient(135deg, #14F195 0%, #00D18C 100%)',
    gradientCyan: 'linear-gradient(135deg, #00D4FF 0%, #00A8CC 100%)',
    gradientPrimary: 'linear-gradient(135deg, #9945FF 0%, #14F195 100%)',
  },

  // Dark theme colors
  dark: {
    // Backgrounds
    bg: {
      primary: '#0A0B0D',
      secondary: '#12131A',
      tertiary: '#1C1D26',
      card: '#16171F',
      elevated: '#1E1F28',
      hover: '#252633',
      active: '#2A2B3A',
    },
    // Text colors
    text: {
      primary: '#FFFFFF',
      secondary: '#B8BCC8',
      muted: '#6B7280',
      disabled: '#4B5563',
    },
    // Border colors
    border: {
      default: '#2A2B3A',
      hover: '#3A3B4A',
      focus: '#4A4B5A',
    },
    // Surface colors
    surface: {
      card: '#16171F',
      elevated: '#1E1F28',
      overlay: 'rgba(10, 11, 13, 0.8)',
      glassmorphism: 'rgba(22, 23, 31, 0.7)',
    },
  },

  // Light theme colors
  light: {
    // Backgrounds
    bg: {
      primary: '#FFFFFF',
      secondary: '#F9FAFB',
      tertiary: '#F3F4F6',
      card: '#FFFFFF',
      elevated: '#F9FAFB',
      hover: '#F3F4F6',
      active: '#E5E7EB',
    },
    // Text colors
    text: {
      primary: '#111827',
      secondary: '#6B7280',
      muted: '#9CA3AF',
      disabled: '#D1D5DB',
    },
    // Border colors
    border: {
      default: '#E5E7EB',
      hover: '#D1D5DB',
      focus: '#9CA3AF',
    },
    // Surface colors
    surface: {
      card: '#FFFFFF',
      elevated: '#F9FAFB',
      overlay: 'rgba(255, 255, 255, 0.8)',
      glassmorphism: 'rgba(255, 255, 255, 0.7)',
    },
  },

  // Semantic colors (same for both themes)
  semantic: {
    success: '#10B981',
    successLight: '#34D399',
    successDark: '#059669',
    warning: '#F59E0B',
    warningLight: '#FCD34D',
    warningDark: '#D97706',
    error: '#EF4444',
    errorLight: '#F87171',
    errorDark: '#DC2626',
    info: '#3B82F6',
    infoLight: '#60A5FA',
    infoDark: '#2563EB',
  },

  // Chart colors
  chart: {
    purple: '#9945FF',
    green: '#14F195',
    cyan: '#00D4FF',
    pink: '#FF00D4',
    orange: '#FF9500',
    yellow: '#FFD700',
    blue: '#3B82F6',
    red: '#EF4444',
  },

  // Alpha values for various use cases
  alpha: {
    5: '0.05',
    10: '0.1',
    20: '0.2',
    30: '0.3',
    40: '0.4',
    50: '0.5',
    60: '0.6',
    70: '0.7',
    80: '0.8',
    90: '0.9',
  },
} as const

// Type exports for TypeScript
export type DesignTokens = typeof designTokens
export type ColorSystem = typeof colorSystem
export type ThemeMode = 'light' | 'dark' | 'system'

// Helper function to get CSS variable name
export const getCSSVariable = (name: string) => `var(--${name})`

// Helper function to generate theme CSS variables
export const generateThemeVariables = (mode: 'light' | 'dark') => {
  const colors = mode === 'dark' ? colorSystem.dark : colorSystem.light
  const variables: Record<string, string> = {}

  // Background colors
  Object.entries(colors.bg).forEach(([key, value]) => {
    variables[`bg-${key}`] = value
  })

  // Text colors
  Object.entries(colors.text).forEach(([key, value]) => {
    variables[`text-${key}`] = value
  })

  // Border colors
  Object.entries(colors.border).forEach(([key, value]) => {
    variables[`border-${key}`] = value
  })

  // Surface colors
  Object.entries(colors.surface).forEach(([key, value]) => {
    variables[`surface-${key}`] = value
  })

  // Semantic colors
  Object.entries(colorSystem.semantic).forEach(([key, value]) => {
    variables[key.toLowerCase().replace('light', '-light').replace('dark', '-dark')] = value
  })

  // Solana colors
  Object.entries(colorSystem.solana).forEach(([key, value]) => {
    variables[`solana-${key.toLowerCase().replace('gradient', 'gradient-')}`] = value
  })

  // Chart colors
  Object.entries(colorSystem.chart).forEach(([key, value]) => {
    variables[`chart-${key}`] = value
  })

  return variables
}