import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        sans: ['var(--font-inter)', 'Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['var(--font-jetbrains-mono)', 'JetBrains Mono', 'SF Mono', 'Consolas', 'Liberation Mono', 'Menlo', 'monospace'],
      },
      fontSize: {
        // Custom font sizes matching design spec exactly
        'display': ['4rem', { lineHeight: '1.1', fontWeight: '700' }],     // 64px
        'h1': ['3rem', { lineHeight: '1.2', fontWeight: '700' }],          // 48px
        'h2': ['2.25rem', { lineHeight: '1.3', fontWeight: '600' }],       // 36px
        'h3': ['1.875rem', { lineHeight: '1.4', fontWeight: '600' }],      // 30px
        'h4': ['1.5rem', { lineHeight: '1.4', fontWeight: '500' }],        // 24px
        'h5': ['1.25rem', { lineHeight: '1.5', fontWeight: '500' }],       // 20px
        'h6': ['1.125rem', { lineHeight: '1.5', fontWeight: '500' }],      // 18px
        'body-lg': ['1.125rem', { lineHeight: '1.6' }],                    // 18px
        'body': ['1rem', { lineHeight: '1.6' }],                           // 16px
        'body-sm': ['0.875rem', { lineHeight: '1.5' }],                    // 14px
        'body-xs': ['0.75rem', { lineHeight: '1.4' }],                     // 12px
        'caption': ['0.75rem', { lineHeight: '1.3', fontWeight: '500' }],  // 12px
        'code': ['0.875rem', { lineHeight: '1.6' }],                       // 14px
      },
      colors: {
        // Legacy shadcn colors (for compatibility)
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        // New comprehensive theme colors
        'bg-primary': 'var(--bg-primary)',
        'bg-secondary': 'var(--bg-secondary)',
        'bg-tertiary': 'var(--bg-tertiary)',
        'bg-card': 'var(--bg-card)',
        'bg-elevated': 'var(--bg-elevated)',
        'bg-hover': 'var(--bg-hover)',
        'bg-active': 'var(--bg-active)',
        'text-primary': 'var(--text-primary)',
        'text-secondary': 'var(--text-secondary)',
        'text-muted': 'var(--text-muted)',
        'text-disabled': 'var(--text-disabled)',
        'border-default': 'var(--border-default)',
        'border-hover': 'var(--border-hover)',
        'border-focus': 'var(--border-focus)',
        'surface-card': 'var(--surface-card)',
        'surface-elevated': 'var(--surface-elevated)',
        'surface-overlay': 'var(--surface-overlay)',
        'surface-glassmorphism': 'var(--surface-glassmorphism)',
        // Solana colors
        'solana-purple': 'var(--solana-purple)',
        'solana-green': 'var(--solana-green)',
        'solana-cyan': 'var(--solana-cyan)',
        // Semantic colors
        'success': 'var(--success)',
        'success-light': 'var(--success-light)',
        'success-dark': 'var(--success-dark)',
        'warning': 'var(--warning)',
        'warning-light': 'var(--warning-light)',
        'warning-dark': 'var(--warning-dark)',
        'error': 'var(--error)',
        'error-light': 'var(--error-light)',
        'error-dark': 'var(--error-dark)',
        'info': 'var(--info)',
        'info-light': 'var(--info-light)',
        'info-dark': 'var(--info-dark)',
        // Chart colors
        'chart-purple': 'var(--chart-purple)',
        'chart-green': 'var(--chart-green)',
        'chart-cyan': 'var(--chart-cyan)',
        'chart-pink': 'var(--chart-pink)',
        'chart-orange': 'var(--chart-orange)',
        'chart-yellow': 'var(--chart-yellow)',
        'chart-blue': 'var(--chart-blue)',
        'chart-red': 'var(--chart-red)',
      },
      backgroundImage: {
        'solana-gradient-purple': 'var(--solana-gradient-purple)',
        'solana-gradient-green': 'var(--solana-gradient-green)',
        'solana-gradient-cyan': 'var(--solana-gradient-cyan)',
        'solana-gradient-primary': 'var(--solana-gradient-primary)',
      },
      spacing: {
        'header': 'var(--header-height)',
        'sidebar': 'var(--sidebar-width)',
      },
      maxWidth: {
        'content': 'var(--content-max-width)',
      },
      transitionDuration: {
        'fast': 'var(--transition-fast)',
        'default': 'var(--transition-default)',
        'slow': 'var(--transition-slow)',
        'slowest': 'var(--transition-slowest)',
      },
      backdropBlur: {
        xs: '2px',
      },
      boxShadow: {
        'glow-purple': '0 0 20px rgba(153, 69, 255, 0.3)',
        'glow-green': '0 0 20px rgba(20, 241, 149, 0.3)',
        'glow-cyan': '0 0 20px rgba(0, 212, 255, 0.3)',
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
export default config