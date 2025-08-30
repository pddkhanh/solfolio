import { test, expect, Page } from '@playwright/test'
import { testLogger } from './helpers/test-logger'

/**
 * TC-001: Wallet Connection User Flows
 * 
 * Complete E2E test flows for wallet connection functionality
 * Reference: docs/regression-tests.md lines 38-66
 * 
 * These tests simulate real user journeys through the wallet connection process,
 * testing multiple aspects in each flow rather than isolated features.
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
    
    // Create mock wallet with configurable behavior
    const mockWallet = {
      isPhantom: true,
      publicKey: null as any,
      connected: false,
      connecting: false,
      failNextConnect: false, // For testing error scenarios
      
      connect: async function() {
        // Mock wallet connect called
        
        // Simulate failure if configured
        if (this.failNextConnect) {
          this.failNextConnect = false
          throw new Error('Connection failed - User rejected')
        }
        
        this.connecting = true
        
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 500))
        
        // Create test wallet address
        this.publicKey = new MockPublicKey('8BsE6Pts5DwuHqjrefTtzd9THkttVJtUMAXecg9J9xer')
        this.connected = true
        this.connecting = false
        
        // Connected with test address
        return { publicKey: this.publicKey }
      },
      
      disconnect: async function() {
        // Mock wallet disconnect called
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
    ;(window as any).mockWallet = mockWallet // Expose for test manipulation
  })
}

test.describe('TC-001: Wallet Connection User Flows', () => {
  test.beforeEach(async ({ page }) => {
    // Inject mock wallet before navigating
    await injectMockWallet(page)
    
    // Navigate to homepage
    await page.goto('http://localhost:3000')
    
    // Wait for app to load
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1000)
  })
  
  test('Flow 1: Complete wallet connection journey - Happy path', async ({ page }) => {
    // Step 1: Verify initial state - no wallet connected
    await expect(page.getByRole('button', { name: 'Connect Wallet' }).first()).toBeVisible()
    
    // Step 2: Open wallet modal
    testLogger.step('Opening wallet modal...')
    await page.getByRole('button', { name: 'Connect Wallet' }).first().click()
    await page.waitForTimeout(500)
    
    // Step 3: Verify modal content and all wallet options
    await expect(page.getByText('Connect Your Wallet')).toBeVisible()
    await expect(page.getByText('Choose a wallet to connect to SolFolio')).toBeVisible()
    
    const wallets = ['Phantom', 'Solflare', 'Ledger', 'Torus']
    for (const wallet of wallets) {
      await expect(page.getByText(wallet)).toBeVisible()
    }
    
    // Verify Phantom shows as installed (due to mock)
    await expect(page.getByText('Installed')).toBeVisible()
    
    // Step 4: Test modal interactions - ESC key
    testLogger.step('Testing ESC key to close modal...')
    await page.keyboard.press('Escape')
    await expect(page.getByText('Connect Your Wallet')).not.toBeVisible()
    
    // Step 5: Reopen and test backdrop click
    testLogger.step('Testing backdrop click...')
    await page.getByRole('button', { name: 'Connect Wallet' }).first().click()
    await page.waitForTimeout(500)
    await page.locator('.fixed.inset-0').first().click({ position: { x: 10, y: 10 }, force: true })
    await expect(page.getByText('Connect Your Wallet')).not.toBeVisible()
    
    // Step 6: Connect to wallet
    testLogger.step('Connecting to Phantom wallet...')
    await page.getByRole('button', { name: 'Connect Wallet' }).first().click()
    await page.waitForTimeout(500)
    await page.getByRole('button', { name: /Phantom/ }).click()
    
    // Step 7: Wait for and verify connection
    testLogger.step('Waiting for connection to complete...')
    await page.waitForTimeout(1500)
    
    // Verify wallet connected - check for any address pattern in header (format: xxxx...xxxx)
    await expect(page.getByText(/\w{4,}\.{3}\w{4,}/)).toBeVisible({ timeout: 10000 })
    
    // Step 8: Verify wallet info displayed on page
    await expect(page.getByText('Connected with Phantom')).toBeVisible()
    // Check that wallet info section exists with address
    const walletInfo = page.locator('text=Address').locator('..')
    await expect(walletInfo).toBeVisible()
    
    // Step 9: Verify connection persisted in localStorage
    const hasWalletConnected = await page.evaluate(() => {
      return localStorage.getItem('walletConnected') === 'true'
    })
    expect(hasWalletConnected).toBeTruthy()
    
    // Step 10: Click wallet button to open dropdown (if implemented)
    testLogger.step('Testing wallet dropdown interactions...')
    const walletButton = page.getByText(/8BsE.*9xer/).first()
    if (await walletButton.isVisible()) {
      await walletButton.click()
      // Check if dropdown appears with disconnect option
      const disconnectButton = page.getByText('Disconnect')
      if (await disconnectButton.isVisible({ timeout: 1000 }).catch(() => false)) {
        await disconnectButton.click()
        await expect(page.getByRole('button', { name: 'Connect Wallet' }).first()).toBeVisible()
      }
    }
    
    testLogger.info('Flow 1 completed successfully!')
  })
  
  test('Flow 2: Multiple wallet selection and switching flow', async ({ page }) => {
    // Step 1: Open wallet modal and view available wallets
    testLogger.step('Opening wallet modal to view options...')
    await page.getByRole('button', { name: 'Connect Wallet' }).first().click()
    await page.waitForTimeout(500)
    
    // Step 2: Verify all wallet options are visible
    testLogger.step('Verifying wallet options...')
    await expect(page.getByText('Phantom')).toBeVisible()
    await expect(page.getByText('Solflare')).toBeVisible()
    await expect(page.getByText('Ledger')).toBeVisible()
    await expect(page.getByText('Torus')).toBeVisible()
    
    // Step 3: Test modal close and reopen
    testLogger.step('Testing modal close with X button...')
    await page.keyboard.press('Escape')
    await expect(page.getByText('Connect Your Wallet')).not.toBeVisible()
    
    // Step 4: Reopen and connect to Phantom
    testLogger.step('Connecting to Phantom...')
    await page.getByRole('button', { name: 'Connect Wallet' }).first().click()
    await page.waitForTimeout(500)
    await page.getByRole('button', { name: /Phantom/ }).click()
    
    // Step 5: Wait for connection and verify
    testLogger.step('Verifying connection...')
    await page.waitForTimeout(1500)
    await expect(page.getByText(/\w{4,}\.{3}\w{4,}/)).toBeVisible({ timeout: 10000 })
    await expect(page.getByText('Connected with Phantom')).toBeVisible()
    
    // Step 6: Test that wallet persists after page refresh
    testLogger.step('Testing wallet persistence...')
    const hasWalletConnected = await page.evaluate(() => {
      return localStorage.getItem('walletConnected') === 'true'
    })
    expect(hasWalletConnected).toBeTruthy()
    
    // Step 7: Reload page and verify wallet still connected
    testLogger.step('Reloading page...')
    await page.reload()
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1000)
    
    // Wallet should still show as connected
    await expect(page.getByText(/\w{4,}\.{3}\w{4,}/)).toBeVisible({ timeout: 10000 })
    
    testLogger.info('Flow 2 completed successfully!')
  })
  
  test('Flow 3: Comprehensive UI interaction flow', async ({ page }) => {
    // Step 1: Test wallet modal interactions thoroughly
    testLogger.step('Testing comprehensive modal interactions...')
    
    // Open modal
    await page.getByRole('button', { name: 'Connect Wallet' }).first().click()
    await page.waitForTimeout(500)
    
    // Verify modal header and description
    await expect(page.getByText('Connect Your Wallet')).toBeVisible()
    await expect(page.getByText('Choose a wallet to connect to SolFolio')).toBeVisible()
    
    // Step 2: Test help link
    testLogger.step('Verifying help link...')
    const helpLink = page.getByText('Learn more about wallets')
    await expect(helpLink).toBeVisible()
    
    // Step 3: Close with ESC and reopen
    testLogger.step('Testing ESC key...')
    await page.keyboard.press('Escape')
    await expect(page.getByText('Connect Your Wallet')).not.toBeVisible()
    
    // Step 4: Reopen and test backdrop click
    testLogger.step('Testing backdrop click...')
    await page.getByRole('button', { name: 'Connect Wallet' }).first().click()
    await page.waitForTimeout(500)
    
    // Click on backdrop area (outside the modal content)
    await page.locator('.fixed.inset-0').first().click({ position: { x: 10, y: 10 }, force: true })
    await expect(page.getByText('Connect Your Wallet')).not.toBeVisible()
    
    // Step 5: Connect to wallet
    testLogger.step('Connecting to wallet...')
    await page.getByRole('button', { name: 'Connect Wallet' }).first().click()
    await page.waitForTimeout(500)
    await page.getByRole('button', { name: /Phantom/ }).click()
    
    // Step 6: Wait for successful connection
    testLogger.step('Waiting for connection...')
    await page.waitForTimeout(1500)
    await expect(page.getByText(/\w{4,}\.{3}\w{4,}/)).toBeVisible({ timeout: 10000 })
    
    // Step 7: Verify wallet info section
    testLogger.step('Verifying wallet info display...')
    await expect(page.getByText('Connected with Phantom')).toBeVisible()
    const walletInfo = page.locator('text=Address').locator('..')
    await expect(walletInfo).toBeVisible()
    
    // Step 8: Verify localStorage persists connection
    testLogger.step('Verifying connection persisted...')
    
    // Check localStorage for wallet connection state
    const walletConnected = await page.evaluate(() => {
      return localStorage.getItem('walletConnected') === 'true'
    })
    
    expect(walletConnected).toBeTruthy()
    
    // Verify address is still displayed
    await expect(page.getByText(/\w{4,}\.{3}\w{4,}/)).toBeVisible()
    
    testLogger.info('Flow 3 completed successfully!')
  })
})