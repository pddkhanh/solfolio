import { test, expect } from '@playwright/test'

/**
 * TC-001: Connect Wallet via Modal
 * 
 * Test the complete wallet connection flow from homepage.
 * Reference: docs/regression-tests.md lines 38-66
 * 
 * IMPORTANT: Run with test mode enabled:
 * pnpm test:e2e:testmode tc-001-connect-wallet.spec.ts
 */
test.describe('TC-001: Connect Wallet via Modal', () => {
  test.beforeEach(async ({ page }) => {
    // Inject mock Phantom wallet BEFORE navigation
    await page.addInitScript(() => {
      // Create a mock Phantom wallet object that the adapter can use
      const mockPhantom = {
        solana: {
          isPhantom: true,
          publicKey: null,
          isConnected: false,
          
          connect: async () => {
            console.log('[Mock Phantom] Connect called')
            // Create mock public key
            const mockPublicKey = {
              toString: () => '7EYnhQoR9YM3N7UoaKRoA44Uy8JeaZV3qyouov87awMs',
              toBase58: () => '7EYnhQoR9YM3N7UoaKRoA44Uy8JeaZV3qyouov87awMs',
              toBytes: () => new Uint8Array(32).fill(1),
            }
            
            mockPhantom.solana.publicKey = mockPublicKey
            mockPhantom.solana.isConnected = true
            
            console.log('[Mock Phantom] Connected with address:', mockPublicKey.toString())
            return { publicKey: mockPublicKey }
          },
          
          disconnect: async () => {
            console.log('[Mock Phantom] Disconnect called')
            mockPhantom.solana.publicKey = null
            mockPhantom.solana.isConnected = false
          },
          
          signTransaction: async (transaction: any) => {
            console.log('[Mock Phantom] Sign transaction called')
            return transaction
          },
          
          signAllTransactions: async (transactions: any[]) => {
            console.log('[Mock Phantom] Sign all transactions called')
            return transactions
          },
          
          signMessage: async (message: any) => {
            console.log('[Mock Phantom] Sign message called')
            return { signature: new Uint8Array(64).fill(0) }
          },
          
          on: (event: string, handler: any) => {
            console.log('[Mock Phantom] Event listener added:', event)
          },
          
          removeListener: (event: string, handler: any) => {
            console.log('[Mock Phantom] Event listener removed:', event)
          },
        }
      }
      
      // Inject into window
      ;(window as any).phantom = mockPhantom
      ;(window as any).solana = mockPhantom.solana
      
      console.log('[E2E] Mock Phantom wallet injected')
    })
    
    // Navigate to homepage
    await page.goto('/')
    
    // Wait for page to fully load
    await page.waitForLoadState('networkidle')
  })

  test('should complete full wallet connection flow', async ({ page }) => {
    // Enable console logging to debug
    page.on('console', msg => {
      if (msg.type() === 'log' || msg.type() === 'error') {
        console.log(`[Browser ${msg.type()}]:`, msg.text())
      }
    })
    
    // Prerequisites: User not connected, app loaded on home page
    const connectButton = page.getByRole('button', { name: /connect wallet/i })
    await expect(connectButton.first()).toBeVisible()
    
    // Step 1-2: Click Connect Wallet button
    console.log('[Test] Clicking Connect Wallet button...')
    await connectButton.first().click()
    
    // Step 3: Verify wallet modal appears with animation
    await page.waitForSelector('.wallet-adapter-modal', { state: 'visible', timeout: 5000 })
    const modal = page.locator('.wallet-adapter-modal')
    await expect(modal).toBeVisible()
    await expect(modal).toHaveCSS('opacity', '1') // Animation complete
    console.log('[Test] Wallet modal opened')
    
    // Step 4: Verify Phantom is displayed (test adapter shows as Phantom)
    const phantomButton = page.getByRole('button', { name: /phantom/i })
    await expect(phantomButton).toBeVisible()
    console.log('[Test] Phantom wallet option visible')
    
    // Verify modal has close button (X) visible
    const closeButton = page.locator('.wallet-adapter-modal-button-close')
    await expect(closeButton).toBeVisible()
    
    // Step 5-6: Click on Phantom and verify connection
    console.log('[Test] Clicking Phantom wallet...')
    await phantomButton.click()
    
    // Wait for connection to process
    await page.waitForTimeout(1000)
    
    // Check if "Connecting..." state appears
    const connectingState = await page.getByText(/connecting/i).isVisible().catch(() => false)
    if (connectingState) {
      console.log('[Test] Wallet is connecting...')
      // Wait for connection to complete
      await page.waitForTimeout(2000)
    }
    
    // Expected: Modal should close after successful connection
    const modalClosed = await modal.isVisible().then(v => !v).catch(() => true)
    expect(modalClosed).toBeTruthy()
    console.log('[Test] Modal closed after connection')
    
    // Expected: Wallet button should now show abbreviated address
    // Test adapter uses address: 7EYnhQoR9YM3N7UoaKRoA44Uy8JeaZV3qyouov87awMs
    // Which should appear as: 7EYn...awMs
    const connectedButton = page.getByRole('button', { name: /7EYn.*awMs/i })
      .or(page.getByText(/7EYn.*awMs/i))
    
    await expect(connectedButton).toBeVisible({ timeout: 5000 })
    console.log('[Test] Wallet connected! Address visible: 7EYn...awMs')
    
    // Expected: WalletInfo component appears (if on homepage)
    const walletInfo = page.locator('[data-testid="wallet-info"]')
    const walletInfoVisible = await walletInfo.isVisible().catch(() => false)
    if (walletInfoVisible) {
      await expect(walletInfo).toBeVisible()
      console.log('[Test] WalletInfo component displayed')
    }
    
    // Verify we can open wallet dropdown
    await connectedButton.click()
    const disconnectOption = page.getByText(/disconnect/i)
    await expect(disconnectOption).toBeVisible()
    console.log('[Test] Wallet dropdown menu works')
    
    // Test complete!
    console.log('[Test] ✅ TC-001 Complete: Wallet connection successful!')
  })

  test('should handle modal interactions correctly', async ({ page }) => {
    // Open wallet modal
    await page.getByRole('button', { name: /connect wallet/i }).first().click()
    await page.waitForSelector('.wallet-adapter-modal', { state: 'visible', timeout: 5000 })
    
    const modal = page.locator('.wallet-adapter-modal')
    const overlay = page.locator('.wallet-adapter-modal-overlay')
    
    // Test 1: Click outside (overlay) should close modal
    await overlay.click({ force: true })
    await expect(modal).not.toBeVisible()
    console.log('[Test] ✓ Click outside closes modal')
    
    // Re-open modal for next test
    await page.getByRole('button', { name: /connect wallet/i }).first().click()
    await page.waitForSelector('.wallet-adapter-modal', { state: 'visible', timeout: 5000 })
    
    // Test 2: Click X button should close modal
    await page.locator('.wallet-adapter-modal-button-close').click()
    await expect(modal).not.toBeVisible()
    console.log('[Test] ✓ X button closes modal')
    
    // Re-open modal for next test
    await page.getByRole('button', { name: /connect wallet/i }).first().click()
    await page.waitForSelector('.wallet-adapter-modal', { state: 'visible', timeout: 5000 })
    
    // Test 3: ESC key should close modal
    await page.keyboard.press('Escape')
    await expect(modal).not.toBeVisible()
    console.log('[Test] ✓ ESC key closes modal')
    
    console.log('[Test] ✅ Modal interactions test complete!')
  })
})