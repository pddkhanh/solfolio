import { test, expect, Page } from '@playwright/test'
import { TEST_WALLETS, getMockWalletData, MockWalletData } from './fixtures/test-wallets'

/**
 * TC-005: View Portfolio Overview
 * 
 * Comprehensive test flows that simulate real user interactions with the portfolio overview.
 * Tests combine multiple verification points to mirror actual manual testing behavior.
 * 
 * Reference: docs/regression-tests.md lines 143-165
 */

// Helper to inject mock wallet with specific test wallet data
async function injectMockWallet(page: Page, testWallet = TEST_WALLETS.TOKENS) {
  await page.addInitScript((wallet) => {
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
    
    // Create mock wallet with test wallet address
    const mockWallet = {
      isPhantom: true,
      publicKey: null as any,
      connected: false,
      connecting: false,
      failNextConnect: false,
      
      connect: async function() {
        console.log('[E2E Mock Wallet] Connect called with address:', wallet.address)
        
        if (this.failNextConnect) {
          this.failNextConnect = false
          throw new Error('Connection failed - User rejected')
        }
        
        this.connecting = true
        await new Promise(resolve => setTimeout(resolve, 500))
        
        this.publicKey = new MockPublicKey(wallet.address)
        this.connected = true
        this.connecting = false
        
        console.log('[E2E Mock Wallet] Connected successfully')
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
    ;(window as any).mockWallet = mockWallet
    ;(window as any).testWalletData = wallet // Store for later use
    
    console.log('[E2E] Mock wallet injected with test wallet')
  }, getMockWalletData(testWallet))
}

// Helper to mock portfolio API responses
async function mockPortfolioAPI(
  page: Page, 
  walletData: MockWalletData,
  options: { delay?: number; shouldFail?: boolean } = {}
) {
  await page.route('**/api/wallet/*/balance', async (route) => {
    console.log('[E2E] Intercepting wallet balance API call')
    
    if (options.shouldFail) {
      await route.abort('failed')
      return
    }
    
    const delay = options.delay || 100
    await page.waitForTimeout(delay)
    
    const response = {
      wallet: walletData.address,
      solBalance: walletData.solBalance,
      tokens: walletData.tokens.map(token => ({
        symbol: token.symbol,
        name: token.name,
        balance: token.balance,
        decimals: token.decimals,
        usdValue: token.usdValue
      })),
      totalValue: walletData.solBalance * 100 + 
        walletData.tokens.reduce((sum, token) => sum + (token.usdValue || 0), 0),
      timestamp: Date.now()
    }
    
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(response)
    })
  })
}

// Helper to connect wallet and navigate to portfolio
async function connectWalletAndNavigate(page: Page) {
  // Click connect wallet button
  const connectButton = page.getByRole('button', { name: /connect wallet/i }).first()
  await expect(connectButton).toBeVisible()
  await connectButton.click()
  
  // Wait for modal and select Phantom
  const modal = page.locator('[data-testid="wallet-connect-modal"]')
  await expect(modal).toBeVisible()
  
  const phantomButton = page.locator('[data-testid="wallet-option-phantom"]')
  await expect(phantomButton).toBeVisible()
  await phantomButton.click()
  
  // Wait for connection
  await page.waitForTimeout(1000)
  
  // Verify wallet connected
  const walletButton = page.locator('[data-testid="wallet-dropdown-button"]')
  await expect(walletButton).toBeVisible()
  await expect(walletButton).toContainText(/[A-Za-z0-9]{3,}\.{3}[A-Za-z0-9]{3,}/)
  
  // Navigate to portfolio
  const portfolioLink = page.getByRole('navigation').getByRole('link', { name: 'Portfolio' })
  await expect(portfolioLink).toBeVisible()
  await portfolioLink.click()
  await page.waitForURL('**/portfolio', { timeout: 5000 })
}

test.describe('TC-005: View Portfolio Overview - Realistic User Flows', () => {
  test.beforeEach(async ({ page }) => {
    // Set up console logging for debugging
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.error('[Browser Error]:', msg.text())
      }
    })
  })

  /**
   * Flow 1: Complete happy path - Connect wallet, view portfolio, verify all data displays correctly
   * This test simulates a user's complete journey from landing to viewing their portfolio
   */
  test('Complete portfolio viewing journey - From wallet connection to data display', async ({ page }) => {
    console.log('[E2E] Starting complete portfolio viewing journey test...')
    
    // Setup: Prepare test wallet with realistic token data
    const testWallet = TEST_WALLETS.TOKENS
    const walletData = getMockWalletData(testWallet)
    await injectMockWallet(page, testWallet)
    await mockPortfolioAPI(page, walletData, { delay: 1000 })
    
    // Step 1: User lands on homepage
    await page.goto('http://localhost:3000')
    await page.waitForLoadState('networkidle')
    console.log('[E2E] Step 1: Landed on homepage')
    
    // Step 2: User connects their wallet
    const connectButton = page.getByRole('button', { name: /connect wallet/i }).first()
    await expect(connectButton).toBeVisible()
    await connectButton.click()
    console.log('[E2E] Step 2: Clicked connect wallet')
    
    // Step 3: User selects Phantom wallet from modal
    const modal = page.locator('[data-testid="wallet-connect-modal"]')
    await expect(modal).toBeVisible()
    const phantomButton = page.locator('[data-testid="wallet-option-phantom"]')
    await expect(phantomButton).toBeVisible()
    await phantomButton.click()
    await page.waitForTimeout(1000)
    console.log('[E2E] Step 3: Selected Phantom wallet')
    
    // Step 4: Verify wallet connected successfully
    const walletButton = page.locator('[data-testid="wallet-dropdown-button"]')
    await expect(walletButton).toBeVisible()
    await expect(walletButton).toContainText(/[A-Za-z0-9]{3,}\.{3}[A-Za-z0-9]{3,}/)
    console.log('[E2E] Step 4: Wallet connected successfully')
    
    // Step 5: User navigates to portfolio page
    const portfolioLink = page.getByRole('navigation').getByRole('link', { name: 'Portfolio' })
    await expect(portfolioLink).toBeVisible()
    await portfolioLink.click()
    await page.waitForURL('**/portfolio', { timeout: 5000 })
    console.log('[E2E] Step 5: Navigated to portfolio page')
    
    // Step 6: Verify portfolio overview card appears
    const portfolioCard = page.locator('[data-testid="portfolio-overview-card"]')
    await expect(portfolioCard).toBeVisible()
    console.log('[E2E] Step 6: Portfolio overview card is visible')
    
    // Step 7: Check loading state briefly appears
    const hasLoadingAttr = await portfolioCard.getAttribute('data-loading')
    if (hasLoadingAttr === 'true') {
      console.log('[E2E] Step 7: Loading state detected')
    }
    
    // Step 8: Wait for data to load
    await page.waitForTimeout(1500)
    
    // Step 9: Verify total value displays correctly
    const totalValue = page.locator('[data-testid="total-value"]')
    await expect(totalValue).toBeVisible()
    const totalValueText = await totalValue.textContent()
    expect(totalValueText).toContain('$')
    console.log('[E2E] Step 9: Total value displayed:', totalValueText)
    
    // Step 10: Verify token count displays
    const tokenCount = page.locator('[data-testid="total-tokens"]')
    await expect(tokenCount).toBeVisible()
    const expectedTokenCount = walletData.tokens.length + 1 // +1 for SOL
    await expect(tokenCount).toContainText(expectedTokenCount.toString())
    console.log('[E2E] Step 10: Token count displayed:', expectedTokenCount)
    
    // Step 11: Verify all labels are present
    await expect(page.getByText('Total Value')).toBeVisible()
    await expect(page.getByText('Total Tokens')).toBeVisible()
    console.log('[E2E] Step 11: All labels displayed correctly')
    
    // Step 12: Check if 24h change is displayed (optional feature)
    const changeSection = page.getByText('24h Change')
    if (await changeSection.isVisible({ timeout: 1000 }).catch(() => false)) {
      await expect(page.getByText(/\$0\.00/)).toBeVisible()
      console.log('[E2E] Step 12: 24h change section is implemented')
    } else {
      console.log('[E2E] Step 12: 24h change section not yet implemented (expected)')
    }
    
    console.log('[E2E] ✅ Complete portfolio viewing journey test passed!')
  })

  /**
   * Flow 2: Error handling and edge cases - Tests disconnected wallet, API failures, and empty wallet
   * This simulates various error conditions and edge cases a user might encounter
   */
  test('Error handling and edge cases flow - Disconnected wallet, API errors, and empty wallet', async ({ page }) => {
    console.log('[E2E] Starting error handling and edge cases flow test...')
    
    // Part A: Test disconnected wallet state
    console.log('[E2E] Part A: Testing disconnected wallet state...')
    await page.goto('http://localhost:3000/portfolio')
    await page.waitForLoadState('networkidle')
    
    // Should show "Connect your wallet" message
    await expect(page.getByText(/connect your wallet/i)).toBeVisible()
    console.log('[E2E] ✓ Disconnected wallet message displayed correctly')
    
    // Part B: Test API failure scenario
    console.log('[E2E] Part B: Testing API failure scenario...')
    const failWallet = TEST_WALLETS.BASIC
    await injectMockWallet(page, failWallet)
    
    // Set up API to fail
    await page.route('**/api/wallet/*/balance', async (route) => {
      console.log('[E2E] Simulating API failure')
      await route.abort('failed')
    })
    
    // Connect wallet
    await page.goto('http://localhost:3000')
    await page.waitForLoadState('networkidle')
    const connectButton = page.getByRole('button', { name: /connect wallet/i }).first()
    await connectButton.click()
    
    const modal = page.locator('[data-testid="wallet-connect-modal"]')
    await expect(modal).toBeVisible()
    const phantomButton = page.locator('[data-testid="wallet-option-phantom"]')
    await phantomButton.click()
    await page.waitForTimeout(1000)
    
    // Navigate to portfolio
    const portfolioLink = page.getByRole('navigation').getByRole('link', { name: 'Portfolio' })
    await portfolioLink.click()
    await page.waitForURL('**/portfolio')
    
    // Should show error message
    const errorMessage = page.locator('[data-testid="error-message"]')
    await expect(errorMessage).toBeVisible({ timeout: 10000 })
    await expect(errorMessage).toContainText(/error|failed/i)
    console.log('[E2E] ✓ API error message displayed correctly')
    
    // Part C: Test empty wallet scenario
    console.log('[E2E] Part C: Testing empty wallet scenario...')
    const emptyWallet = TEST_WALLETS.EMPTY
    const emptyWalletData = getMockWalletData(emptyWallet)
    
    // Inject new wallet and set up successful API
    await page.evaluate(() => {
      // Disconnect current wallet
      if ((window as any).mockWallet) {
        (window as any).mockWallet.disconnect()
      }
    })
    
    await injectMockWallet(page, emptyWallet)
    await mockPortfolioAPI(page, emptyWalletData)
    
    // Refresh and reconnect
    await page.reload()
    await page.waitForLoadState('networkidle')
    
    const connectButton2 = page.getByRole('button', { name: /connect wallet/i }).first()
    await connectButton2.click()
    
    const modal2 = page.locator('[data-testid="wallet-connect-modal"]')
    await expect(modal2).toBeVisible()
    const phantomButton2 = page.locator('[data-testid="wallet-option-phantom"]')
    await phantomButton2.click()
    await page.waitForTimeout(1000)
    
    // Navigate to portfolio
    const portfolioLink2 = page.getByRole('link', { name: /portfolio/i }).first()
    await portfolioLink2.click()
    await page.waitForURL('**/portfolio')
    
    // Verify empty wallet displays correctly
    const portfolioCard = page.locator('[data-testid="portfolio-overview-card"]')
    await expect(portfolioCard).toBeVisible()
    
    const totalValue = page.locator('[data-testid="total-value"]')
    await expect(totalValue).toContainText('$0')
    
    const tokenCount = page.locator('[data-testid="total-tokens"]')
    await expect(tokenCount).toContainText('0')
    console.log('[E2E] ✓ Empty wallet displayed correctly')
    
    console.log('[E2E] ✅ Error handling and edge cases flow test passed!')
  })

  /**
   * Flow 3: High value portfolio and data refresh - Tests large numbers formatting and data updates
   * This simulates a whale wallet with many tokens and verifies proper formatting
   */
  test('High value portfolio display and data refresh flow', async ({ page }) => {
    console.log('[E2E] Starting high value portfolio and refresh flow test...')
    
    // Part A: Set up whale wallet with many tokens
    const whaleWallet = TEST_WALLETS.WHALE
    const whaleData = getMockWalletData(whaleWallet)
    await injectMockWallet(page, whaleWallet)
    
    // Initial API setup
    let apiCallCount = 0
    await page.route('**/api/wallet/*/balance', async (route) => {
      apiCallCount++
      console.log(`[E2E] API call #${apiCallCount}`)
      
      // Simulate different values on refresh
      const multiplier = apiCallCount === 1 ? 1 : 1.1
      const response = {
        wallet: whaleData.address,
        solBalance: whaleData.solBalance * multiplier,
        tokens: whaleData.tokens.map(token => ({
          ...token,
          usdValue: (token.usdValue || 0) * multiplier
        })),
        totalValue: (whaleData.solBalance * 100 + 
          whaleData.tokens.reduce((sum, token) => sum + (token.usdValue || 0), 0)) * multiplier,
        timestamp: Date.now()
      }
      
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(response)
      })
    })
    
    // Connect wallet and navigate to portfolio
    await page.goto('http://localhost:3000')
    await page.waitForLoadState('networkidle')
    await connectWalletAndNavigate(page)
    
    // Part B: Verify high value formatting
    console.log('[E2E] Verifying high value portfolio display...')
    
    const portfolioCard = page.locator('[data-testid="portfolio-overview-card"]')
    await expect(portfolioCard).toBeVisible()
    
    // Wait for data to load
    await page.waitForTimeout(1000)
    
    const totalValue = page.locator('[data-testid="total-value"]')
    await expect(totalValue).toBeVisible()
    const totalValueText = await totalValue.textContent()
    
    // Should format large numbers with commas or K/M notation
    expect(totalValueText).toMatch(/\$[\d,]+(\.\d{1,2})?[KM]?/)
    console.log('[E2E] High value displayed correctly:', totalValueText)
    
    const tokenCount = page.locator('[data-testid="total-tokens"]')
    const expectedCount = whaleData.tokens.length + 1
    await expect(tokenCount).toContainText(expectedCount.toString())
    console.log('[E2E] High token count displayed:', expectedCount)
    
    // Part C: Test data refresh without page reload
    console.log('[E2E] Testing data refresh flow...')
    
    // Store initial value
    const initialValue = await totalValue.textContent()
    console.log('[E2E] Initial value:', initialValue)
    
    // Trigger refresh by navigating away and back
    await page.goto('http://localhost:3000')
    await page.waitForLoadState('networkidle')
    
    // Navigate back to portfolio
    const portfolioLink = page.getByRole('link', { name: /portfolio/i }).first()
    await portfolioLink.click()
    await page.waitForURL('**/portfolio')
    
    // Wait for new data to load
    await page.waitForTimeout(1500)
    
    // Verify value updated (should be 10% higher due to our mock)
    const updatedValue = await totalValue.textContent()
    console.log('[E2E] Updated value:', updatedValue)
    
    // Values should be different (since we multiplied by 1.1)
    expect(initialValue).not.toBe(updatedValue)
    console.log('[E2E] ✓ Values refreshed successfully')
    
    // Verify API was called multiple times
    expect(apiCallCount).toBeGreaterThan(1)
    console.log(`[E2E] ✓ API called ${apiCallCount} times`)
    
    console.log('[E2E] ✅ High value portfolio and refresh flow test passed!')
  })
})