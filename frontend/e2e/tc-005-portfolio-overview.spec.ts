import { test, expect } from '@playwright/test'

/**
 * TC-005: View Portfolio Overview - CI-friendly version
 * 
 * Simplified tests that work reliably in CI environment.
 * Focuses on testing the portfolio page structure without complex wallet mocking.
 */

test.describe('TC-005: Portfolio Overview - CI Tests', () => {
  test.beforeEach(async ({ page, baseURL }) => {
    // Start fresh on each test
    await page.goto(baseURL || '/')
    await page.waitForLoadState('networkidle')
  })

  /**
   * Test 1: Verify portfolio page structure when not connected
   */
  test('Portfolio page displays connect wallet message when not connected', async ({ page }) => {
    // Navigate directly to portfolio page
    await page.goto('http://localhost:3000/portfolio')
    await page.waitForLoadState('networkidle')
    
    // Should show portfolio heading
    await expect(page.getByRole('heading', { name: 'Portfolio' })).toBeVisible()
    
    // Should show connect wallet message
    await expect(page.getByText(/connect your wallet to view your portfolio/i)).toBeVisible()
    
    // Should have connect wallet button in the main content
    const connectButton = page.getByRole('main').getByRole('button', { name: /connect wallet/i })
    await expect(connectButton).toBeVisible()
  })

  /**
   * Test 2: Verify wallet connection modal opens
   */
  test('Wallet connection modal opens when clicking connect button', async ({ page }) => {
    // Click connect wallet button in header
    const connectButton = page.getByRole('button', { name: /connect wallet/i }).first()
    await expect(connectButton).toBeVisible()
    await connectButton.click()
    
    // Wait for modal to appear
    const modalContent = page.locator('[data-testid="wallet-connect-modal"]')
    await expect(modalContent).toBeVisible({ timeout: 5000 })
    
    // Verify modal has wallet options
    await expect(page.getByText(/connect your wallet/i)).toBeVisible()
    
    // Check for Phantom wallet option
    const phantomOption = page.locator('[data-testid="wallet-option-phantom"]')
    await expect(phantomOption).toBeVisible()
  })

  /**
   * Test 3: Verify navigation to portfolio page works
   */
  test('Navigation link to portfolio page works correctly', async ({ page }) => {
    // Find and click portfolio link in navigation
    const portfolioLink = page.getByRole('navigation').getByRole('link', { name: 'Portfolio' })
    await expect(portfolioLink).toBeVisible()
    await portfolioLink.click()
    
    // Wait for navigation
    await page.waitForURL('**/portfolio')
    
    // Verify we're on portfolio page
    await expect(page).toHaveURL(/\/portfolio/)
    await expect(page.getByRole('heading', { name: 'Portfolio' })).toBeVisible()
  })
})