'use client'

import { ThemeProvider as NextThemesProvider } from 'next-themes'
import { useEffect, useState } from 'react'

type ThemeProviderProps = {
  children: React.ReactNode
  attribute?: 'class' | 'data-theme'
  defaultTheme?: string
  enableSystem?: boolean
  disableTransitionOnChange?: boolean
  storageKey?: string
  themes?: string[]
  forcedTheme?: string
  enableColorScheme?: boolean
  value?: { [themeName: string]: string }
}

/**
 * Theme Provider wrapper for SolFolio
 * Provides theme context with system preference detection and localStorage persistence
 */
export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Prevent hydration mismatch by not rendering until mounted
  if (!mounted) {
    return (
      <div suppressHydrationWarning>
        {children}
      </div>
    )
  }

  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem
      disableTransitionOnChange={false}
      storageKey="solfolio-theme"
      themes={['light', 'dark', 'system']}
      {...props}
    >
      <ThemeTransitionManager>
        {children}
      </ThemeTransitionManager>
    </NextThemesProvider>
  )
}

/**
 * Manages smooth theme transitions by temporarily disabling CSS transitions
 * during theme changes to prevent flash of unstyled content
 */
function ThemeTransitionManager({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Add class to disable transitions temporarily when theme changes
    const handleThemeChange = () => {
      document.documentElement.classList.add('theme-switching')
      setTimeout(() => {
        document.documentElement.classList.remove('theme-switching')
      }, 50)
    }

    // Listen for theme changes
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (
          mutation.type === 'attributes' &&
          mutation.attributeName === 'class'
        ) {
          handleThemeChange()
        }
      })
    })

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    })

    return () => observer.disconnect()
  }, [])

  return <>{children}</>
}

// Re-export everything from next-themes for convenience
export { useTheme } from 'next-themes'
export type { ThemeProviderProps }