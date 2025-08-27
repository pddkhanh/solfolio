import { test, expect } from '@playwright/test'
import {
  mockPhantomWallet,
  waitForWalletModal,
} from './helpers/wallet-helpers'

/**
 * TC-001: Connect Wallet via Modal
 * 
 * Test the complete wallet connection flow from homepage.
 * Reference: docs/regression-tests.md lines 38-66
 */
test.describe('TC-001: Connect Wallet via Modal', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to homepage
    await page.goto('/')
    
    // Mock Phantom wallet for testing
    await mockPhantomWallet(page)
    
    // Wait for page to fully load
    await page.waitForLoadState('networkidle')
  })

  test('should complete wallet modal interactions and display', async ({ page }) => {
    // Prerequisites: User not connected, app loaded on home page
    const connectButton = page.getByRole('button', { name: /connect wallet/i })
    await expect(connectButton.first()).toBeVisible()
    
    // Step 1-2: Click Connect Wallet button
    await connectButton.first().click()
    
    // Step 3: Verify wallet modal appears with animation
    await waitForWalletModal(page, true)
    const modal = page.locator('.wallet-adapter-modal')
    await expect(modal).toBeVisible()
    await expect(modal).toHaveCSS('opacity', '1') // Animation complete
    
    // Step 4: Verify all supported wallets are displayed
    const wallets = ['Phantom', 'Solflare', 'Ledger', 'Torus']
    for (const wallet of wallets) {
      await expect(page.getByText(wallet, { exact: false })).toBeVisible()
    }
    
    // Verify modal has close button (X) visible
    const closeButton = page.locator('.wallet-adapter-modal-button-close')
    await expect(closeButton).toBeVisible()
    
    // Step 5: Test clicking on a wallet option
    const phantomButton = page.getByText('Phantom')
    await expect(phantomButton).toBeVisible()
    
    // Note: Actual wallet connection requires full wallet adapter integration
    // This test verifies the UI flow up to the connection point
    // The connection itself would be handled by the wallet adapter
  })

  test('should handle modal interactions correctly', async ({ page }) => {
    // Open wallet modal
    await page.getByRole('button', { name: /connect wallet/i }).first().click()
    await waitForWalletModal(page, true)
    
    const modal = page.locator('.wallet-adapter-modal')
    const overlay = page.locator('.wallet-adapter-modal-overlay')
    
    // Test 1: Click outside (overlay) should close modal
    await overlay.click({ force: true })
    await expect(modal).not.toBeVisible()
    
    // Re-open modal for next test
    await page.getByRole('button', { name: /connect wallet/i }).first().click()
    await waitForWalletModal(page, true)
    
    // Test 2: Click X button should close modal
    await page.locator('.wallet-adapter-modal-button-close').click()
    await expect(modal).not.toBeVisible()
    
    // Re-open modal for next test
    await page.getByRole('button', { name: /connect wallet/i }).first().click()
    await waitForWalletModal(page, true)
    
    // Test 3: ESC key should close modal
    await page.keyboard.press('Escape')
    await expect(modal).not.toBeVisible()
  })

  test('should work correctly on mobile viewport', async ({ page }) => {
    // Set mobile viewport (iPhone SE)
    await page.setViewportSize({ width: 375, height: 667 })
    
    // Ensure wallet button is accessible on mobile
    const connectButton = page.getByRole('button', { name: /connect wallet/i })
    await expect(connectButton.first()).toBeVisible()
    
    // Open modal on mobile
    await connectButton.first().click()
    await waitForWalletModal(page, true)
    
    // Verify modal fits mobile screen
    const modal = page.locator('.wallet-adapter-modal')
    await expect(modal).toBeVisible()
    
    // Verify all wallets are still accessible
    await expect(page.getByText('Phantom')).toBeVisible()
    await expect(page.getByText('Solflare')).toBeVisible()
    
    // Modal should be scrollable if needed but not overflow
    const modalWrapper = page.locator('.wallet-adapter-modal-wrapper')
    const boundingBox = await modalWrapper.boundingBox()
    expect(boundingBox?.width).toBeLessThanOrEqual(375)
  })
})