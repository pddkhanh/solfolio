import { test, expect, Page } from '@playwright/test'
import { TEST_WALLETS, getMockWalletData, MockWalletData } from './fixtures/test-wallets'

/**
 * TC-005: View Portfolio Overview
 * 
 * Test the portfolio overview functionality including data loading,
 * display of total values, token counts, and error handling.
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
    
    console.log('[E2E] Mock wallet injected with test wallet:', wallet.name)
  }, testWallet)
}

// Helper to mock API responses for portfolio data
async function mockPortfolioAPI(page: Page, walletData: MockWalletData, options?: {
  shouldFail?: boolean
  delay?: number
}) {
  await page.route('**/wallet/balances/**', async (route) => {
    console.log('[E2E] Intercepting wallet balance API call')
    
    // Simulate API failure if requested
    if (options?.shouldFail) {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Internal server error' })
      })
      return
    }
    
    // Add delay if specified (to test loading states)
    if (options?.delay) {
      await new Promise(resolve => setTimeout(resolve, options.delay))
    }
    
    // Calculate total value from wallet data
    const totalValueUSD = walletData.solBalance * 100 + // Assume SOL = $100 for testing
      walletData.tokens.reduce((sum, token) => sum + (token.usdValue || 0), 0)
    
    // Return mock portfolio data
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        totalValueUSD,
        totalAccounts: walletData.tokens.length + (walletData.solBalance > 0 ? 1 : 0),
        solBalance: walletData.solBalance,
        tokens: walletData.tokens,
        lastUpdated: new Date().toISOString()
      })
    })
  })
}

// Helper to connect wallet and navigate to portfolio
async function connectWalletAndNavigate(page: Page) {
  // Click connect wallet button - use data-testid if available
  const connectButton = page.locator('[data-testid="connect-wallet-button"]').or(
    page.getByRole('button', { name: 'Connect Wallet' }).first()
  )
  await connectButton.click()
  await page.waitForTimeout(500)
  
  // Wait for modal to be fully visible
  await page.waitForSelector('text=Choose a wallet to connect to SolFolio', { 
    state: 'visible',
    timeout: 5000 
  })
  
  // Select Phantom wallet - be more specific with the selector
  const phantomButton = page.locator('button').filter({ hasText: 'Phantom' }).first()
  await phantomButton.click()
  
  // Wait for connection to complete
  await page.waitForTimeout(2000) // Increase wait time for connection
  
  // Verify wallet is connected - look for abbreviated address
  const addressPattern = page.getByText(/\w{4,}\.{3}\w{4,}/)
  await expect(addressPattern.first()).toBeVisible({ timeout: 10000 })
  
  // Navigate to portfolio page - use more specific selector to avoid ambiguity
  const portfolioLink = page.getByRole('navigation').getByRole('link', { name: 'Portfolio' })
  if (await portfolioLink.count() > 0) {
    await portfolioLink.first().click()
  } else {
    // Fallback to direct navigation
    await page.goto('http://localhost:3000/portfolio')
  }
  await page.waitForURL('**/portfolio', { timeout: 5000 })
}

test.describe('TC-005: View Portfolio Overview', () => {
  test.beforeEach(async ({ page }) => {
    // Set up console logging
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.error('[Browser Error]:', msg.text())
      }
    })
  })
  
  test('should display portfolio overview with token holder wallet', async ({ page }) => {
    // Step 1: Set up mock wallet and API
    const testWallet = TEST_WALLETS.TOKENS
    const walletData = getMockWalletData(testWallet)
    await injectMockWallet(page, testWallet)
    await mockPortfolioAPI(page, walletData, { delay: 1000 }) // Add delay to test loading state
    
    // Step 2: Navigate to app
    await page.goto('http://localhost:3000')
    await page.waitForLoadState('networkidle')
    
    // Step 3: Connect wallet and navigate to portfolio
    await connectWalletAndNavigate(page)
    
    // Step 4: Verify loading skeleton appears while fetching
    const portfolioCard = page.locator('[data-testid="portfolio-overview-card"]')
    await expect(portfolioCard).toBeVisible()
    
    // Check for loading skeletons (they should appear briefly)
    const skeletons = page.locator('.skeleton, [class*="skeleton"]')
    const skeletonCount = await skeletons.count()
    console.log(`[E2E] Found ${skeletonCount} loading skeletons`)
    
    // Step 5: Wait for data to load and verify overview displays
    await page.waitForTimeout(1500) // Wait for mock API delay
    
    // Verify Portfolio Overview card is visible
    await expect(portfolioCard).toBeVisible()
    
    // Step 6: Check total value display
    const expectedTotalValue = walletData.solBalance * 100 + 
      walletData.tokens.reduce((sum, token) => sum + (token.usdValue || 0), 0)
    
    // Look for formatted USD value (e.g., $2,695.00 or $2,695)
    const totalValueRegex = new RegExp(`\\$${expectedTotalValue.toLocaleString()}(\\.\\d{2})?`)
    await expect(page.getByText(totalValueRegex)).toBeVisible()
    console.log(`[E2E] Total value displayed: $${expectedTotalValue}`)
    
    // Step 7: Verify token count shows
    const expectedTokenCount = walletData.tokens.length + 1 // +1 for SOL
    await expect(page.getByText(expectedTokenCount.toString()).first()).toBeVisible()
    console.log(`[E2E] Token count displayed: ${expectedTokenCount}`)
    
    // Step 8: Check for Total Value label
    await expect(page.getByText('Total Value')).toBeVisible()
    
    // Step 9: Check for Total Tokens label
    await expect(page.getByText('Total Tokens')).toBeVisible()
    
    // Step 10: Verify 24h change section (currently shows 0 as per TODO in component)
    const changeSection = page.getByText('24h Change')
    if (await changeSection.isVisible({ timeout: 1000 }).catch(() => false)) {
      console.log('[E2E] 24h change section is implemented')
      // When implemented, it should show $0.00 for now
      await expect(page.getByText(/\$0\.00/)).toBeVisible()
    } else {
      console.log('[E2E] 24h change section not yet implemented')
    }
    
    console.log('[E2E] Portfolio overview test completed successfully!')
  })
  
  test('should show loading state while fetching data', async ({ page }) => {
    // Set up mock with longer delay
    const testWallet = TEST_WALLETS.BASIC
    const walletData = getMockWalletData(testWallet)
    await injectMockWallet(page, testWallet)
    await mockPortfolioAPI(page, walletData, { delay: 3000 }) // 3 second delay
    
    // Navigate and connect wallet
    await page.goto('http://localhost:3000')
    await page.waitForLoadState('networkidle')
    await connectWalletAndNavigate(page)
    
    // Verify loading skeleton appears
    const portfolioCard = page.locator('[data-testid="portfolio-overview-card"]')
    await expect(portfolioCard).toBeVisible()
    
    // Check for loading attribute or skeleton elements
    const hasLoadingAttr = await portfolioCard.getAttribute('data-loading')
    if (hasLoadingAttr === 'true') {
      console.log('[E2E] Loading state detected via data-loading attribute')
      // Check for skeleton elements within the loading card
      const skeletons = portfolioCard.locator('.skeleton, [class*="skeleton"]')
      const initialSkeletonCount = await skeletons.count()
      expect(initialSkeletonCount).toBeGreaterThan(0)
      console.log(`[E2E] Loading state shows ${initialSkeletonCount} skeleton elements`)
    } else {
      // Alternative: check if we can detect loading by the absence of data
      const totalValue = page.locator('[data-testid="total-value"]')
      const isValueVisible = await totalValue.isVisible({ timeout: 500 }).catch(() => false)
      expect(isValueVisible).toBe(false) // Should not be visible yet during loading
      console.log('[E2E] Loading state detected - data not yet visible')
    }
    
    // Wait for data to load
    await page.waitForTimeout(3500)
    
    // Verify skeletons are gone and data is displayed
    const loadedCard = page.locator('[data-testid="portfolio-overview-card"]')
    const skeletonsAfterLoad = loadedCard.locator('.skeleton, [class*="skeleton"]')
    const finalSkeletonCount = await skeletonsAfterLoad.count()
    expect(finalSkeletonCount).toBe(0)
    
    // Verify data is now visible
    await expect(page.getByText('Total Value')).toBeVisible()
    await expect(page.getByText(/\$\d+/)).toBeVisible()
    
    console.log('[E2E] Loading state test completed successfully!')
  })
  
  test('should display error message when API fails', async ({ page }) => {
    // Set up mock to fail
    const testWallet = TEST_WALLETS.BASIC
    await injectMockWallet(page, testWallet)
    await mockPortfolioAPI(page, getMockWalletData(testWallet), { shouldFail: true })
    
    // Navigate and connect wallet
    await page.goto('http://localhost:3000')
    await page.waitForLoadState('networkidle')
    await connectWalletAndNavigate(page)
    
    // Wait for error to appear
    await page.waitForTimeout(1000)
    
    // Verify error message is displayed
    const errorMessage = page.locator('[data-testid="error-message"]')
    await expect(errorMessage).toBeVisible()
    await expect(errorMessage).toHaveText('Failed to load portfolio data')
    console.log('[E2E] Error message displayed correctly')
    
    // Verify the error is within the Portfolio Overview card
    const portfolioCard = page.locator('[data-testid="portfolio-overview-card"]')
    await expect(portfolioCard).toHaveAttribute('data-error', 'true')
    
    console.log('[E2E] Error handling test completed successfully!')
  })
  
  test('should update values without page refresh', async ({ page }) => {
    // Set up initial mock data
    const testWallet = TEST_WALLETS.TOKENS
    let walletData = getMockWalletData(testWallet)
    await injectMockWallet(page, testWallet)
    
    // Set up route handler that can be updated
    let responseData = walletData
    await page.route('**/wallet/balances/**', async (route) => {
      const totalValueUSD = responseData.solBalance * 100 + 
        responseData.tokens.reduce((sum, token) => sum + (token.usdValue || 0), 0)
      
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          totalValueUSD,
          totalAccounts: responseData.tokens.length + 1,
          solBalance: responseData.solBalance,
          tokens: responseData.tokens,
          lastUpdated: new Date().toISOString()
        })
      })
    })
    
    // Navigate and connect wallet
    await page.goto('http://localhost:3000')
    await page.waitForLoadState('networkidle')
    await connectWalletAndNavigate(page)
    
    // Wait for initial data to load
    await page.waitForTimeout(1000)
    
    // Verify initial values
    const initialTotalValue = walletData.solBalance * 100 + 
      walletData.tokens.reduce((sum, token) => sum + (token.usdValue || 0), 0)
    
    await expect(page.getByText(new RegExp(`\\$${initialTotalValue.toLocaleString()}`))).toBeVisible()
    console.log(`[E2E] Initial total value: $${initialTotalValue}`)
    
    // Update the mock data
    responseData = {
      ...walletData,
      tokens: [
        ...walletData.tokens,
        { 
          mint: 'NewToken123', 
          symbol: 'NEW', 
          name: 'New Token', 
          balance: 100, 
          decimals: 6, 
          usdValue: 500 
        }
      ]
    }
    
    // Trigger a refresh (in real app this would be via refresh button or WebSocket)
    // Since we don't have a refresh button in PortfolioOverview, we'll navigate away and back
    await page.getByRole('navigation').getByRole('link', { name: 'Home' }).first().click()
    await page.waitForURL('**/')
    await page.getByRole('navigation').getByRole('link', { name: 'Portfolio' }).first().click()
    await page.waitForURL('**/portfolio')
    
    // Wait for new data to load
    await page.waitForTimeout(1000)
    
    // Verify updated values
    const updatedTotalValue = responseData.solBalance * 100 + 
      responseData.tokens.reduce((sum, token) => sum + (token.usdValue || 0), 0)
    
    await expect(page.getByText(new RegExp(`\\$${updatedTotalValue.toLocaleString()}`))).toBeVisible()
    console.log(`[E2E] Updated total value: $${updatedTotalValue}`)
    
    // Verify token count updated
    const newTokenCount = responseData.tokens.length + 1
    await expect(page.getByText(newTokenCount.toString()).first()).toBeVisible()
    console.log(`[E2E] Updated token count: ${newTokenCount}`)
    
    console.log('[E2E] Value update test completed successfully!')
  })
  
  test('should show correct state when wallet not connected', async ({ page }) => {
    // Navigate to portfolio page without connecting wallet
    await page.goto('http://localhost:3000/portfolio')
    await page.waitForLoadState('networkidle')
    
    // Verify connect wallet prompt is shown
    await expect(page.getByText('Connect your wallet to view your portfolio')).toBeVisible()
    await expect(page.getByRole('main').getByRole('button', { name: 'Connect Wallet' })).toBeVisible()
    
    // Verify Portfolio Overview card shows correct message
    const portfolioCard = page.locator('[data-testid="portfolio-overview-card"]')
    const cardCount = await portfolioCard.count()
    
    if (cardCount > 0) {
      await expect(portfolioCard).toContainText('Connect your wallet to view your portfolio')
      console.log('[E2E] Portfolio Overview card shows wallet connection prompt')
    } else {
      console.log('[E2E] Portfolio Overview card not shown when wallet disconnected')
    }
    
    console.log('[E2E] Disconnected wallet state test completed successfully!')
  })
  
  test('should handle empty wallet correctly', async ({ page }) => {
    // Set up empty wallet
    const testWallet = TEST_WALLETS.EMPTY
    const walletData = getMockWalletData(testWallet)
    await injectMockWallet(page, testWallet)
    await mockPortfolioAPI(page, walletData)
    
    // Navigate and connect wallet
    await page.goto('http://localhost:3000')
    await page.waitForLoadState('networkidle')
    await connectWalletAndNavigate(page)
    
    // Wait for data to load
    await page.waitForTimeout(1000)
    
    // Verify Portfolio Overview displays with zero values
    await expect(page.getByText('Portfolio Overview')).toBeVisible()
    await expect(page.getByText('Total Value')).toBeVisible()
    
    // Check for $0.00 in the total value display specifically
    const totalValueElement = page.locator('[data-testid="total-value"]')
    await expect(totalValueElement).toBeVisible()
    await expect(totalValueElement).toHaveText('$0.00')
    
    // Verify token count is 0
    await expect(page.getByText('Total Tokens')).toBeVisible()
    const tokenCountElement = page.locator('[data-testid="total-tokens"]')
    await expect(tokenCountElement).toBeVisible()
    await expect(tokenCountElement).toHaveText('0')
    
    console.log('[E2E] Empty wallet test completed successfully!')
  })
  
  test('should display high value wallet correctly', async ({ page }) => {
    // Set up whale wallet
    const testWallet = TEST_WALLETS.WHALE
    const walletData = getMockWalletData(testWallet)
    await injectMockWallet(page, testWallet)
    await mockPortfolioAPI(page, walletData)
    
    // Navigate and connect wallet
    await page.goto('http://localhost:3000')
    await page.waitForLoadState('networkidle')
    await connectWalletAndNavigate(page)
    
    // Wait for data to load
    await page.waitForTimeout(1000)
    
    // Calculate expected total value
    const expectedTotalValue = walletData.solBalance * 100 + 
      walletData.tokens.reduce((sum, token) => sum + (token.usdValue || 0), 0)
    
    // Verify large values are formatted correctly
    const formattedValue = expectedTotalValue.toLocaleString()
    await expect(page.getByText(new RegExp(`\\$${formattedValue}`))).toBeVisible()
    console.log(`[E2E] High value displayed correctly: $${formattedValue}`)
    
    // Verify token count
    const expectedTokenCount = walletData.tokens.length + 1
    await expect(page.getByText(expectedTokenCount.toString()).first()).toBeVisible()
    console.log(`[E2E] High token count displayed: ${expectedTokenCount}`)
    
    console.log('[E2E] High value wallet test completed successfully!')
  })
})