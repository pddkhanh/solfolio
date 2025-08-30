import { defineConfig } from '@playwright/test'
import baseConfig from './playwright.config'

/**
 * CI-specific Playwright configuration
 * Optimized for GitHub Actions and other CI environments
 */
export default defineConfig({
  ...baseConfig,
  
  // CI-specific overrides
  workers: 1, // Sequential execution in CI to avoid flakiness
  fullyParallel: false, // Disable parallel execution
  
  reporter: [
    ['dot'], // Minimal output for CI logs
    ['json', { outputFile: 'test-results.json' }], // Machine-readable results
    ['html', { open: 'never', outputFolder: 'playwright-report' }], // HTML report for artifacts
  ],
  
  use: {
    ...baseConfig.use,
    // CI-specific settings
    trace: 'retain-on-failure',
    video: 'retain-on-failure',
    screenshot: 'only-on-failure',
    
    // Stricter timeouts for CI
    actionTimeout: 10 * 1000,
    navigationTimeout: 20 * 1000,
  },
  
  // More retries in CI
  retries: 2,
  
  // Fail fast in CI
  maxFailures: process.env.CI ? 5 : undefined,
  
  // Override webServer for CI
  webServer: {
    ...baseConfig.webServer,
    reuseExistingServer: true, // Allow reusing existing server in CI
  },
})