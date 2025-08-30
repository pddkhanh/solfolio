import { test, expect, Page } from '@playwright/test'
import { TEST_WALLETS, getMockWalletData, MockWalletData } from './fixtures/test-wallets'

/**
 * TC-005: View Portfolio Overview - Simplified Comprehensive Tests
 * 
 * Tests combine multiple verification points in realistic user flows.
 * Each test represents a complete user journey.
 */

// Helper to inject mock wallet
async function injectMockWallet(page: Page, testWallet = TEST_WALLETS.TOKENS) {
  await page.addInitScript((wallet) => {
    (window as any).__E2E_TEST_MODE__ = true
    
    class MockPublicKey {
      private _address: string
      constructor(address: string) { this._address = address }
      toString() { return this._address }
      toBase58() { return this._address }
      toBytes() { return new Uint8Array(32) }
      equals(other: any) { return this._address === other?.toString() }
    }
    
    const mockWallet = {
      isPhantom: true,
      publicKey: null as any,
      connected: false,
      connecting: false,
      
      connect: async function() {
        this.connecting = true
        await new Promise(resolve => setTimeout(resolve, 500))
        this.publicKey = new MockPublicKey(wallet.address)
        this.connected = true
        this.connecting = false
        return { publicKey: this.publicKey }
      },
      
      disconnect: async function() {
        this.publicKey = null
        this.connected = false
        this.connecting = false
      },
      
      signTransaction: async (tx: any) => tx,
      signAllTransactions: async (txs: any[]) => txs,
      signMessage: async () => ({ signature: new Uint8Array(64) }),
      on: () => {},
      off: () => {},
      removeAllListeners: () => {}
    }
    
    ;(window as any).phantom = { solana: mockWallet }
    ;(window as any).solana = mockWallet
    ;(window as any).mockWallet = mockWallet
  }, getMockWalletData(testWallet))
}

// Helper to mock portfolio API
async function mockPortfolioAPI(page: Page, walletData: MockWalletData) {
  await page.route('**/api/wallet/*/balance', async (route) => {
    await page.waitForTimeout(100)
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        wallet: walletData.address,
        solBalance: walletData.solBalance,
        tokens: walletData.tokens,
        totalValue: walletData.solBalance * 100 + 
          walletData.tokens.reduce((sum, token) => sum + (token.usdValue || 0), 0),
        timestamp: Date.now()
      })
    })
  })
}

test.describe('TC-005: Portfolio Overview - Comprehensive User Flows', () => {
  test.beforeEach(async ({ page }) => {
    // Suppress console errors
    page.on('console', msg => {
      if (msg.type() === 'error' && !msg.text().includes('Failed to fetch positions')) {
        console.error('[Browser]:', msg.text())
      }
    })
  })

  /**
   * Test 1: Complete happy path - Connect wallet and view portfolio with all data
   */
  test('Complete user journey: Connect wallet → View portfolio → Verify all data displays', async ({ page }) => {
    console.log('[TC-005-1] Starting complete user journey test...')
    
    // Setup wallet and API
    const testWallet = TEST_WALLETS.TOKENS
    const walletData = getMockWalletData(testWallet)
    await injectMockWallet(page, testWallet)
    await mockPortfolioAPI(page, walletData)
    
    // Navigate to homepage
    await page.goto('http://localhost:3000')
    await page.waitForLoadState('networkidle')
    
    // Connect wallet
    await page.getByRole('button', { name: /connect wallet/i }).first().click()
    await page.locator('[data-testid="wallet-connect-modal"]').waitFor()
    await page.locator('[data-testid="wallet-option-phantom"]').click()
    await page.waitForTimeout(1000)
    
    // Verify wallet connected
    const walletButton = page.locator('[data-testid="wallet-dropdown-button"]')
    await expect(walletButton).toBeVisible()
    
    // Navigate to portfolio
    await page.getByRole('navigation').getByRole('link', { name: 'Portfolio' }).click()
    await page.waitForURL('**/portfolio')
    
    // Wait for portfolio card
    const portfolioCard = page.locator('[data-testid="portfolio-overview-card"]')
    await expect(portfolioCard).toBeVisible()
    
    // Wait for data to load
    await page.waitForTimeout(500)
    
    // Verify all portfolio data
    const totalValue = page.locator('[data-testid="total-value"]')
    await expect(totalValue).toBeVisible()
    await expect(totalValue).toContainText('$')
    
    const tokenCount = page.locator('[data-testid="total-tokens"]')
    await expect(tokenCount).toBeVisible()
    const expectedTokens = walletData.tokens.length + 1 // +1 for SOL
    await expect(tokenCount).toContainText(expectedTokens.toString())
    
    // Verify labels
    await expect(page.getByText('Total Value')).toBeVisible()
    await expect(page.getByText('Total Tokens')).toBeVisible()
    
    console.log('[TC-005-1] ✅ Complete user journey test passed!')
  })

  /**
   * Test 2: Edge cases - Disconnected wallet, empty wallet, and high value wallet
   */
  test('Edge cases: Disconnected → Empty wallet → High value wallet', async ({ page }) => {
    console.log('[TC-005-2] Starting edge cases test...')
    
    // Part 1: Disconnected wallet
    await page.goto('http://localhost:3000/portfolio')
    await page.waitForLoadState('networkidle')
    await expect(page.getByText(/connect your wallet/i)).toBeVisible()
    console.log('[TC-005-2] ✓ Part 1: Disconnected wallet handled')
    
    // Part 2: Empty wallet
    const emptyWallet = TEST_WALLETS.EMPTY
    const emptyData = getMockWalletData(emptyWallet)
    await injectMockWallet(page, emptyWallet)
    await mockPortfolioAPI(page, emptyData)
    
    await page.goto('http://localhost:3000')
    await page.getByRole('button', { name: /connect wallet/i }).first().click()
    await page.locator('[data-testid="wallet-connect-modal"]').waitFor()
    await page.locator('[data-testid="wallet-option-phantom"]').click()
    await page.waitForTimeout(1000)
    
    await page.getByRole('navigation').getByRole('link', { name: 'Portfolio' }).click()
    await page.waitForURL('**/portfolio')
    
    const portfolioCard = page.locator('[data-testid="portfolio-overview-card"]')
    await expect(portfolioCard).toBeVisible()
    await expect(page.locator('[data-testid="total-value"]')).toContainText('$0')
    await expect(page.locator('[data-testid="total-tokens"]')).toContainText('0')
    console.log('[TC-005-2] ✓ Part 2: Empty wallet handled')
    
    // Part 3: High value wallet
    await page.evaluate(() => {
      if ((window as any).mockWallet) {
        (window as any).mockWallet.disconnect()
      }
    })
    
    const whaleWallet = TEST_WALLETS.WHALE
    const whaleData = getMockWalletData(whaleWallet)
    await injectMockWallet(page, whaleWallet)
    await mockPortfolioAPI(page, whaleData)
    
    await page.reload()
    await page.waitForLoadState('networkidle')
    
    await page.getByRole('button', { name: /connect wallet/i }).first().click()
    await page.locator('[data-testid="wallet-connect-modal"]').waitFor()
    await page.locator('[data-testid="wallet-option-phantom"]').click()
    await page.waitForTimeout(1000)
    
    await page.getByRole('navigation').getByRole('link', { name: 'Portfolio' }).click()
    await page.waitForURL('**/portfolio')
    
    await expect(portfolioCard).toBeVisible()
    const highValue = page.locator('[data-testid="total-value"]')
    await expect(highValue).toBeVisible()
    const valueText = await highValue.textContent()
    expect(valueText).toMatch(/\$[\d,]+/)
    
    const highTokenCount = page.locator('[data-testid="total-tokens"]')
    const expectedCount = whaleData.tokens.length + 1
    await expect(highTokenCount).toContainText(expectedCount.toString())
    console.log('[TC-005-2] ✓ Part 3: High value wallet handled')
    
    console.log('[TC-005-2] ✅ Edge cases test passed!')
  })
})