import { Page, test as base } from '@playwright/test'
import { injectMockWallet, clearWalletPersistence, MockWalletConfig, TEST_WALLETS } from './wallet'
import { testLogger } from './test-logger'

/**
 * Extended test fixture with automatic setup and cleanup
 */
export const test = base.extend<{
  setupWallet: (config?: MockWalletConfig) => Promise<void>
  cleanupTest: () => Promise<void>
}>({
  /**
   * Automatically inject mock wallet and handle setup
   */
  setupWallet: async ({ page }, use) => {
    const setupWallet = async (config?: MockWalletConfig) => {
      try {
        // Clear any previous wallet state
        await clearWalletPersistence(page)
        
        // Inject mock wallet with config
        await injectMockWallet(page, config)
        
        testLogger.debug('Wallet setup completed', config)
      } catch (error) {
        testLogger.error('Failed to setup wallet:', error)
        throw error
      }
    }
    
    await use(setupWallet)
  },
  
  /**
   * Automatic cleanup after each test
   */
  cleanupTest: async ({ page }, use) => {
    const cleanupTest = async () => {
      try {
        // Clear localStorage
        await page.evaluate(() => {
          localStorage.clear()
          sessionStorage.clear()
        })
        
        // Clear any mock wallet state
        await page.evaluate(() => {
          const wallet = (window as any).mockWallet
          if (wallet) {
            wallet.connected = false
            wallet.publicKey = null
            wallet.connecting = false
            wallet.failNextConnect = false
          }
        })
        
        testLogger.debug('Test cleanup completed')
      } catch (error) {
        testLogger.warn('Cleanup error (non-fatal):', error)
      }
    }
    
    await use(cleanupTest)
  },
  
  /**
   * Automatic page setup with error handling
   */
  page: async ({ page, browserName }, use) => {
    // Set default timeout for CI
    if (process.env.CI) {
      page.setDefaultTimeout(15000)
      page.setDefaultNavigationTimeout(20000)
    }
    
    // Add error event listeners
    page.on('pageerror', (error) => {
      testLogger.error(`Page error in ${browserName}:`, error.message)
    })
    
    page.on('console', (msg) => {
      // Only log errors and warnings
      if (msg.type() === 'error') {
        testLogger.error(`Console error: ${msg.text()}`)
      } else if (msg.type() === 'warning' && !msg.text().includes('Download the React DevTools')) {
        testLogger.warn(`Console warning: ${msg.text()}`)
      }
    })
    
    // Handle uncaught exceptions
    page.on('crash', () => {
      testLogger.error('Page crashed!')
    })
    
    await use(page)
    
    // Cleanup after test
    try {
      await page.evaluate(() => {
        localStorage.clear()
        sessionStorage.clear()
      })
    } catch {
      // Page might be closed already
    }
  }
})

/**
 * Test hooks for common setup/teardown
 */
test.beforeEach(async ({ page, setupWallet }) => {
  // Default wallet setup for most tests
  await setupWallet({ address: TEST_WALLETS.TOKENS })
  
  // Navigate to homepage with retry logic
  let retries = 3
  while (retries > 0) {
    try {
      await page.goto('http://localhost:3000', {
        waitUntil: 'domcontentloaded',
        timeout: 20000
      })
      
      // Wait for app to be ready
      await page.waitForLoadState('networkidle', { timeout: 10000 })
      break
    } catch (error) {
      retries--
      if (retries === 0) {
        testLogger.error('Failed to navigate to homepage after 3 attempts')
        throw error
      }
      testLogger.warn(`Navigation failed, retrying... (${retries} attempts left)`)
      await page.waitForTimeout(2000)
    }
  }
})

test.afterEach(async ({ cleanupTest }) => {
  await cleanupTest()
})

export { expect } from '@playwright/test'