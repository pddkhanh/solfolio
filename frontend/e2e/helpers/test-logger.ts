/**
 * Test logger utility for E2E tests
 * Provides controlled logging that can be suppressed in CI environments
 */

const isCI = process.env.CI === 'true'
const isDebug = process.env.DEBUG_E2E === 'true'

export const testLogger = {
  /**
   * Log debug information (only in debug mode)
   */
  debug: (message: string, ...args: any[]) => {
    if (isDebug && !isCI) {
      console.log(`[DEBUG] ${message}`, ...args)
    }
  },

  /**
   * Log info messages (suppressed in CI unless debug is enabled)
   */
  info: (message: string, ...args: any[]) => {
    if (!isCI || isDebug) {
      console.log(`[INFO] ${message}`, ...args)
    }
  },

  /**
   * Log warnings (always shown)
   */
  warn: (message: string, ...args: any[]) => {
    console.warn(`[WARN] ${message}`, ...args)
  },

  /**
   * Log errors (always shown)
   */
  error: (message: string, ...args: any[]) => {
    console.error(`[ERROR] ${message}`, ...args)
  },

  /**
   * Log test flow steps (suppressed in CI)
   */
  step: (step: string) => {
    if (!isCI) {
      console.log(`\n→ ${step}`)
    }
  }
}