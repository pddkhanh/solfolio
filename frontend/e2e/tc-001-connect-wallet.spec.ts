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

  test('should complete wallet connection flow with mocked Phantom', async ({ page }) => {
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
    
    // Step 5: Click on Phantom wallet option
    const phantomButton = page.getByRole('button', { name: /phantom/i })
    await expect(phantomButton).toBeVisible()
    
    // Before clicking, set up response monitoring to detect if connection happens
    let connectionAttempted = false
    page.on('console', msg => {
      if (msg.text().includes('Wallet error') || msg.text().includes('connect')) {
        connectionAttempted = true
      }
    })
    
    // Inject mock to handle the connection
    await page.evaluate(() => {
      // Override the Phantom adapter's connect method
      const originalConnect = window.solana?.connect
      if (window.solana) {
        window.solana.connect = async () => {
          console.log('Mock Phantom connect called')
          // Simulate successful connection
          const mockPublicKey = {
            toString: () => '7EYnhQoR9YM3N7UoaKRoA44Uy8JeaZV3qyouov87awMs',
            toBase58: () => '7EYnhQoR9YM3N7UoaKRoA44Uy8JeaZV3qyouov87awMs',
          }
          window.solana.publicKey = mockPublicKey
          window.solana.isConnected = true
          
          // Store in localStorage
          localStorage.setItem('walletConnected', 'true')
          localStorage.setItem('solfolio-wallet', '"Phantom"')
          
          // Trigger wallet adapter events
          window.dispatchEvent(new CustomEvent('wallet-connected', { 
            detail: { publicKey: mockPublicKey }
          }))
          
          return { publicKey: mockPublicKey }
        }
      }
    })
    
    // Click Phantom and wait for something to happen
    await phantomButton.click()
    
    // Wait a bit for any connection attempt
    await page.waitForTimeout(2000)
    
    // Check what happened after clicking
    // Option 1: Modal should close if connection successful
    const modalStillVisible = await modal.isVisible()
    
    // Option 2: Check if we're now showing connected state
    const connectedButton = page.getByRole('button', { name: /\w{4}\.\.\.\w{4}/i })
    const isConnected = await connectedButton.isVisible().catch(() => false)
    
    // Option 3: Check if "Connecting..." state appears
    const connectingState = await page.getByText(/connecting/i).isVisible().catch(() => false)
    
    // FAIL TEST if nothing happens after clicking Phantom
    if (modalStillVisible && !isConnected && !connectingState) {
      throw new Error('Clicking Phantom wallet did nothing - connection not working!')
    }
    
    // If connected, verify the UI shows it
    if (isConnected) {
      await expect(connectedButton).toBeVisible()
      // Modal should be closed
      await expect(modal).not.toBeVisible()
    }
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
})