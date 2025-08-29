import { test, expect } from '@playwright/test'

/**
 * TC-001: Real Wallet Connection Test
 * 
 * This test verifies the actual wallet connection behavior WITHOUT mocks
 * to identify real issues in the UI.
 */
test.describe('TC-001: Real Wallet Connection (No Mocks)', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to homepage
    await page.goto('/')
    
    // DO NOT inject any mocks - test real behavior
    
    // Wait for page to fully load
    await page.waitForLoadState('networkidle')
  })

  test('should detect when Phantom click does nothing', async ({ page }) => {
    // Enable console logging to see errors
    page.on('console', msg => {
      console.log('Browser console:', msg.type(), msg.text())
    })
    
    // Monitor for any errors
    page.on('pageerror', err => {
      console.log('Page error:', err.message)
    })
    
    // Prerequisites: User not connected
    const connectButton = page.getByRole('button', { name: /connect wallet/i })
    await expect(connectButton.first()).toBeVisible()
    
    // Click Connect Wallet button
    await connectButton.first().click()
    
    // Wait for modal
    await page.waitForSelector('.wallet-adapter-modal', { state: 'visible', timeout: 5000 })
    const modal = page.locator('.wallet-adapter-modal')
    await expect(modal).toBeVisible()
    
    // Verify Phantom button is there
    const phantomButton = page.getByRole('button', { name: /phantom/i })
    await expect(phantomButton).toBeVisible()
    
    console.log('Clicking Phantom button...')
    
    // Click Phantom and see what happens
    await phantomButton.click()
    
    // Wait to see if anything happens
    await page.waitForTimeout(3000)
    
    // Check various possible outcomes
    const modalStillVisible = await modal.isVisible()
    const connectingVisible = await page.getByText(/connecting/i).isVisible().catch(() => false)
    const connectedVisible = await page.locator('button:has-text("...")').isVisible().catch(() => false)
    const errorVisible = await page.getByText(/error|failed/i).isVisible().catch(() => false)
    
    console.log('After clicking Phantom:')
    console.log('- Modal still visible:', modalStillVisible)
    console.log('- Connecting state:', connectingVisible)
    console.log('- Connected state:', connectedVisible)
    console.log('- Error visible:', errorVisible)
    
    // Check if Phantom extension popup opened (would be in a new window/popup)
    const pages = page.context().pages()
    console.log('Number of browser windows/tabs:', pages.length)
    
    // Check for the bug: Modal closes but no connection happens
    if (!modalStillVisible && !connectingVisible && !connectedVisible && !errorVisible) {
      // This is the bug - modal closes but nothing else happens
      throw new Error(
        'BUG DETECTED: Phantom wallet click closes modal but doesn\'t connect!\n' +
        'Expected: Either connection attempt, error message, or Phantom extension popup.\n' +
        'Actual: Modal just closes with no further action.\n' +
        'This indicates the wallet adapter is not properly configured or Phantom is not detected.'
      )
    }
    
    // If we get here, something happened (good or bad)
    if (errorVisible) {
      console.log('Error detected after clicking Phantom')
    }
    if (connectingVisible) {
      console.log('Connection attempt detected')
    }
    if (connectedVisible) {
      console.log('Successfully connected!')
    }
  })
})