import { test, expect, Page } from '@playwright/test'

/**
 * TC-001: Connect Wallet via Modal
 * 
 * Complete test suite for wallet connection functionality
 * Reference: docs/regression-tests.md lines 38-66
 * 
 * This test uses a mock Phantom wallet to ensure consistent E2E testing
 * without requiring actual wallet extensions.
 */

// Helper to inject mock wallet
async function injectMockWallet(page: Page) {
  await page.addInitScript(() => {
    // Set E2E test mode flag
    (window as any).__E2E_TEST_MODE__ = true
    
    // Create mock PublicKey class
    class MockPublicKey {
      private _address: string
      
      constructor(address: string) {
        this._address = address
      }
      
      toString() {
        return this._address
      }
      
      toBase58() {
        return this._address
      }
      
      toBytes() {
        // Return a Uint8Array for compatibility
        const bytes = new Uint8Array(32)
        for (let i = 0; i < 32; i++) {
          bytes[i] = i
        }
        return bytes
      }
      
      equals(other: any) {
        return this._address === other?.toString()
      }
    }
    
    // Create mock wallet
    const mockWallet = {
      isPhantom: true,
      publicKey: null as any,
      connected: false,
      connecting: false,
      
      connect: async function() {
        console.log('[E2E Mock Wallet] Connect called')
        this.connecting = true
        
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 500))
        
        // Create test wallet address - use a deterministic address for testing
        this.publicKey = new MockPublicKey('8BsE6Pts5DwuHqjrefTtzd9THkttVJtUMAXecg9J9xer')
        this.connected = true
        this.connecting = false
        
        console.log('[E2E Mock Wallet] Connected with address:', this.publicKey.toString())
        return { publicKey: this.publicKey }
      },
      
      disconnect: async function() {
        console.log('[E2E Mock Wallet] Disconnect called')
        this.publicKey = null
        this.connected = false
        this.connecting = false
      },
      
      signTransaction: async (tx: any) => tx,
      signAllTransactions: async (txs: any[]) => txs,
      signMessage: async (_msg: any) => ({ 
        signature: new Uint8Array(64), 
        publicKey: mockWallet.publicKey 
      }),
      
      on: () => {},
      off: () => {},
      removeAllListeners: () => {}
    }
    
    // Inject into window
    ;(window as any).phantom = { solana: mockWallet }
    ;(window as any).solana = mockWallet
    
    console.log('[E2E] Mock wallet injected successfully')
  })
}

test.describe('TC-001: Connect Wallet via Modal', () => {
  test.beforeEach(async ({ page }) => {
    // Inject mock wallet before navigating
    await injectMockWallet(page)
    
    // Navigate to homepage with E2E test mode
    await page.goto('http://localhost:3000')
    
    // Wait for app to load and any initial connection attempts to settle
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1000)
    
    // Wait for Connect Wallet button in header to be visible
    await expect(page.getByRole('button', { name: 'Connect Wallet' }).first()).toBeVisible({ timeout: 10000 })
  })
  
  test('Step 1-3: Opens wallet selection modal', async ({ page }) => {
    // Find and click Connect Wallet button
    const connectButton = page.getByRole('button', { name: 'Connect Wallet' }).first()
    
    await expect(connectButton).toBeVisible()
    await connectButton.click()
    
    // Wait a bit for modal animation
    await page.waitForTimeout(500)
    
    // Verify modal appears - use text content as Dialog might not have role=dialog
    await expect(page.getByText('Connect Your Wallet')).toBeVisible()
    await expect(page.getByText('Choose a wallet to connect to SolFolio')).toBeVisible()
  })
  
  test('Step 4: Displays all supported wallets', async ({ page }) => {
    // Open modal
    await page.getByRole('button', { name: 'Connect Wallet' }).first().click()
    await page.waitForTimeout(500)
    
    // Verify all wallet options are visible
    const wallets = ['Phantom', 'Solflare', 'Ledger', 'Torus']
    
    for (const wallet of wallets) {
      await expect(page.getByText(wallet)).toBeVisible()
    }
    
    // Verify Phantom shows as "Installed" due to mock
    await expect(page.getByText('Installed')).toBeVisible()
  })
  
  test('Step 5-6: Successfully connects to wallet', async ({ page }) => {
    // Open modal
    await page.getByRole('button', { name: 'Connect Wallet' }).first().click()
    await page.waitForTimeout(500)
    
    // Click Phantom wallet
    await page.getByRole('button', { name: /Phantom/ }).click()
    
    // Wait for connection to complete
    await page.waitForTimeout(1500)
    
    // Verify connection succeeded - look for abbreviated address pattern
    await expect(page.getByText(/8BsE.*9xer/)).toBeVisible({ timeout: 10000 })
    
    // Verify WalletInfo component appears on homepage
    await expect(page.getByText('Connected with Phantom')).toBeVisible()
    
    // Verify full address is displayed
    await expect(page.getByText('8BsE6Pts5DwuHqjrefTtzd9THkttVJtUMAXecg9J9xer')).toBeVisible()
  })
  
  test('Modal close interactions: Close button', async ({ page }) => {
    // Open modal
    await page.getByRole('button', { name: 'Connect Wallet' }).first().click()
    
    // Find and click close button
    const closeButton = page.getByRole('button', { name: 'Close' }).or(
      page.getByTestId('modal-close-button')
    )
    await closeButton.click()
    
    // Verify modal is closed
    await expect(page.getByRole('dialog')).not.toBeVisible()
  })
  
  test('Modal close interactions: Click outside', async ({ page }) => {
    // Open modal
    await page.getByRole('button', { name: 'Connect Wallet' }).first().click()
    
    // Click outside modal (on backdrop/overlay)
    await page.locator('[data-radix-dialog-overlay]').or(
      page.locator('.fixed.inset-0')
    ).first().click({ position: { x: 10, y: 10 }, force: true })
    
    // Verify modal is closed
    await expect(page.getByRole('dialog')).not.toBeVisible()
  })
  
  test('Modal close interactions: ESC key', async ({ page }) => {
    // Open modal
    await page.getByRole('button', { name: 'Connect Wallet' }).first().click()
    
    // Press ESC key
    await page.keyboard.press('Escape')
    
    // Verify modal is closed
    await expect(page.getByRole('dialog')).not.toBeVisible()
  })
  
  test('Error handling: Connection failure recovery', async ({ page }) => {
    // Modify mock to fail first attempt
    await page.evaluate(() => {
      const wallet = (window as any).phantom?.solana
      if (wallet) {
        const originalConnect = wallet.connect
        let attemptCount = 0
        
        wallet.connect = async function() {
          attemptCount++
          if (attemptCount === 1) {
            throw new Error('Connection failed')
          }
          return originalConnect.call(this)
        }
      }
    })
    
    // Open modal and try to connect
    await page.getByRole('button', { name: 'Connect Wallet' }).first().click()
    await page.getByRole('button', { name: /Phantom/i }).click()
    
    // Should show error state
    await expect(page.getByText(/failed|error/i).first()).toBeVisible({ timeout: 5000 })
    
    // Retry button should be available
    const retryButton = page.getByRole('button', { name: /Try Again|Retry/i })
    await expect(retryButton).toBeVisible()
    
    // Click retry - should succeed this time
    await retryButton.click()
    await page.waitForTimeout(1000)
    
    // Verify successful connection
    await expect(page.getByText(/8BsE.*9xer/)).toBeVisible({ timeout: 10000 })
  })
  
  test('Smooth animations and transitions', async ({ page }) => {
    // Open modal
    await page.getByRole('button', { name: 'Connect Wallet' }).first().click()
    
    // Check for animation classes
    const modal = page.getByRole('dialog')
    await expect(modal).toBeVisible()
    
    // Modal should have animation/transition classes
    const modalElement = await modal.elementHandle()
    const hasAnimation = await modalElement?.evaluate(el => {
      const styles = window.getComputedStyle(el)
      return styles.transition !== 'none' || 
             styles.animation !== 'none' ||
             el.classList.toString().includes('animate')
    })
    
    expect(hasAnimation).toBeTruthy()
  })
  
  test('Wallet state persistence check', async ({ page }) => {
    // Connect wallet
    await page.getByRole('button', { name: 'Connect Wallet' }).first().click()
    await page.getByRole('button', { name: /Phantom/i }).click()
    
    // Wait for connection
    await expect(page.getByText(/8BsE.*9xer/)).toBeVisible({ timeout: 10000 })
    
    // Store localStorage state
    const hasWalletConnected = await page.evaluate(() => {
      return localStorage.getItem('walletConnected') === 'true'
    })
    
    expect(hasWalletConnected).toBeTruthy()
    
    // Note: Full persistence test (TC-004) would reload the page
    // and verify wallet auto-connects
  })
  
  test('Multiple connection attempts handling', async ({ page }) => {
    // Open modal
    await page.getByRole('button', { name: 'Connect Wallet' }).first().click()
    
    // Click Phantom multiple times rapidly
    const phantomButton = page.getByRole('button', { name: /Phantom/i })
    await phantomButton.click()
    await phantomButton.click({ force: true }).catch(() => {})
    
    // Should handle gracefully - only one connection
    await page.waitForTimeout(1000)
    
    // Verify only connected once
    await expect(page.getByText(/8BsE.*9xer/)).toBeVisible()
    
    // Should not show error
    await expect(page.getByText(/error/i)).not.toBeVisible()
  })
})

// Additional test for mobile viewport (TC-015 reference)
test.describe('TC-001: Mobile Viewport', () => {
  test.use({ viewport: { width: 375, height: 667 } })
  
  test('Wallet connection works on mobile', async ({ page }) => {
    await injectMockWallet(page)
    await page.goto('http://localhost:3000')
    
    // Find Connect Wallet button (might be in mobile menu)
    const connectButton = page.getByRole('button', { name: 'Connect Wallet' }).first()
    await expect(connectButton).toBeVisible({ timeout: 10000 })
    
    // Click to open modal
    await connectButton.click()
    
    // Modal should be visible and properly sized for mobile
    await expect(page.getByText('Connect Your Wallet')).toBeVisible()
    
    // Connect to wallet
    await page.getByRole('button', { name: /Phantom/i }).click()
    
    // Verify connection on mobile
    await expect(page.getByText(/8BsE/)).toBeVisible({ timeout: 10000 })
  })
})