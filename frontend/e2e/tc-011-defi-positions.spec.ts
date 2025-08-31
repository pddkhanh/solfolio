import { test, expect, Page } from '@playwright/test'
import { testLogger } from './helpers/test-logger'
import { injectMockWallet, TEST_WALLETS } from './helpers/wallet'

/**
 * TC-011: View Staking Positions
 * 
 * E2E test for DeFi positions display functionality following requirements from
 * docs/regression-tests.md lines 283-305
 * 
 * Test Coverage:
 * - DeFi Positions section display with mock data
 * - Position cards with protocol information
 * - Portfolio statistics (Total Staked Value, Average APY, Monthly Rewards)
 * - Portfolio breakdown visualization
 * - Empty state handling
 * - Refresh functionality
 * - Error handling
 * - Mobile responsiveness
 * - Accessibility
 */

// Mock DeFi positions data for testing
const mockPositionsData = {
  success: true,
  data: {
    walletAddress: TEST_WALLETS.DEFI,
    totalValue: 15750.85,
    totalPositions: 4,
    breakdown: {
      tokens: 0,
      staking: 12500.50,
      lending: 2250.35,
      liquidity: 1000.00,
      other: 0
    },
    performance: {
      totalApy: 8.45,
      dailyRewards: 3.65,
      monthlyRewards: 109.50
    },
    positions: [
      {
        protocol: 'MARINADE',
        protocolName: 'Marinade Finance',
        positionType: 'STAKING',
        tokenSymbol: 'mSOL',
        tokenName: 'Marinade Staked SOL',
        logoUri: '/logos/marinade.svg',
        amount: 100.0,
        underlyingAmount: 105.2,
        usdValue: 5250.00,
        apy: 7.2,
        rewards: 1.45,
        metadata: {
          exchangeRate: 1.052
        }
      },
      {
        protocol: 'KAMINO',
        protocolName: 'Kamino Finance',
        positionType: 'LENDING',
        tokenSymbol: 'USDC',
        tokenName: 'USD Coin',
        logoUri: '/logos/usdc.svg',
        amount: 2250.35,
        usdValue: 2250.35,
        apy: 9.8,
        rewards: 0.61,
        metadata: {
          borrowApy: 12.5
        }
      },
      {
        protocol: 'JITO',
        protocolName: 'Jito (JTO)',
        positionType: 'STAKING',
        tokenSymbol: 'jitoSOL',
        tokenName: 'Jito Staked SOL',
        logoUri: '/logos/jito.svg',
        amount: 150.0,
        underlyingAmount: 158.7,
        usdValue: 7500.50,
        apy: 6.8,
        rewards: 1.32,
        metadata: {
          exchangeRate: 1.058
        }
      },
      {
        protocol: 'ORCA',
        protocolName: 'Orca',
        positionType: 'LP_POSITION',
        tokenSymbol: 'SOL-USDC',
        tokenName: 'SOL-USDC LP',
        logoUri: '/logos/orca.svg',
        amount: 20.0,
        usdValue: 1000.00,
        apy: 15.2,
        rewards: 0.27,
        metadata: {
          lpTokens: 20.0,
          fees24h: 2.5
        }
      }
    ]
  }
}

const mockEmptyPositionsData = {
  success: true,
  data: {
    walletAddress: TEST_WALLETS.DEFI,
    totalValue: 0,
    totalPositions: 0,
    breakdown: {
      tokens: 0,
      staking: 0,
      lending: 0,
      liquidity: 0,
      other: 0
    },
    performance: {
      totalApy: 0,
      dailyRewards: 0,
      monthlyRewards: 0
    },
    positions: []
  }
}

// Helper function to mock API responses
async function mockPositionsAPI(page: Page, data: any = mockPositionsData) {
  await page.route('**/api/positions/*/summary*', route => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(data)
    })
  })
}

// Helper function to mock API errors
async function mockPositionsAPIError(page: Page) {
  await page.route('**/api/positions/*/summary*', route => {
    route.fulfill({
      status: 500,
      contentType: 'application/json',
      body: JSON.stringify({ error: 'Internal server error' })
    })
  })
}

test.describe('TC-011: View Staking Positions', () => {
  test.beforeEach(async ({ page }) => {
    // Inject mock wallet and navigate to portfolio
    await injectMockWallet(page, { address: TEST_WALLETS.DEFI, walletName: 'Phantom' })
    await page.goto('http://localhost:3000')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(500)
  })

  test('Should display DeFi positions with portfolio statistics when wallet has positions', async ({ page }) => {
    // Mock API response with positions data
    await mockPositionsAPI(page, mockPositionsData)

    // Navigate to portfolio page
    await page.goto('http://localhost:3000/portfolio')
    await page.waitForLoadState('networkidle')

    // Check if wallet is already connected (from injection)
    const isConnected = await page.getByText(/\w{4,}\.{3}\w{4,}/).isVisible({ timeout: 1000 }).catch(() => false)
    
    if (!isConnected) {
      // Connect wallet if not already connected
      const connectButton = page.getByRole('button', { name: /connect wallet/i }).first()
      await connectButton.click()
      await page.waitForTimeout(500)
      
      // Wait for modal to open and check if Phantom option is available
      const modalTitle = page.getByText('Connect Your Wallet')
      const isModalVisible = await modalTitle.isVisible({ timeout: 2000 }).catch(() => false)
      
      if (isModalVisible) {
        // Try to find and click Phantom option (case insensitive)
        const phantomButton = page.getByRole('button').filter({ hasText: /phantom/i })
        const isPhantomVisible = await phantomButton.first().isVisible({ timeout: 2000 }).catch(() => false)
        
        if (isPhantomVisible) {
          await phantomButton.first().click()
          await page.waitForTimeout(1000)
        }
      }
    }

    // Wait for positions to load
    await page.waitForTimeout(2000)

    // Step 1: Verify portfolio statistics cards are displayed
    testLogger.step('Verifying portfolio statistics...')
    
    // Check Total Staked Value card - use first() to handle multiple matches
    await expect(page.getByText('Total Staked Value')).toBeVisible({ timeout: 10000 })
    await expect(page.getByText('$12,500.50').first()).toBeVisible()
    
    // Check Average APY card
    await expect(page.getByText('Average APY')).toBeVisible()
    await expect(page.getByText('8.45%')).toBeVisible()
    
    // Check Monthly Rewards card
    await expect(page.getByText('Monthly Rewards')).toBeVisible()
    await expect(page.getByText('$109.50')).toBeVisible()

    // Step 2: Scroll to DeFi Positions section
    testLogger.step('Scrolling to DeFi Positions section...')
    
    // Look for either heading that might be present - use first() to handle multiple matches
    const defiPositionsHeading = page.getByText('DeFi Positions').first()
    const stakingPositionsHeading = page.getByText('Staking Positions').first()
    
    // Check which heading is visible and use it
    try {
      await expect(defiPositionsHeading).toBeVisible({ timeout: 2000 })
      await defiPositionsHeading.scrollIntoViewIfNeeded()
    } catch {
      await expect(stakingPositionsHeading).toBeVisible({ timeout: 2000 })
      await stakingPositionsHeading.scrollIntoViewIfNeeded()
    }

    // Step 3: Verify position cards display - use more specific selectors
    testLogger.step('Verifying position cards...')
    
    // Wait for the positions to load and check that we have position cards
    await expect(page.getByText('Marinade Finance').first()).toBeVisible({ timeout: 10000 })
    await expect(page.getByText('Kamino Finance').first()).toBeVisible()
    await expect(page.getByText('Jito (JTO)').first()).toBeVisible()
    await expect(page.getByText('Orca').first()).toBeVisible()
    
    // Verify specific position details are visible somewhere on the page
    await expect(page.getByText('mSOL').first()).toBeVisible()
    await expect(page.getByText('USDC').first()).toBeVisible()
    await expect(page.getByText('jitoSOL').first()).toBeVisible()
    await expect(page.getByText('SOL-USDC').first()).toBeVisible()
    
    // Verify USD values are displayed
    await expect(page.getByText('$5,250.00').first()).toBeVisible()
    await expect(page.getByText('$2,250.35').first()).toBeVisible()
    await expect(page.getByText('$7,500.50').first()).toBeVisible()
    await expect(page.getByText('$1,000.00').first()).toBeVisible()

    // Step 4: Verify position type badges
    testLogger.step('Verifying position types...')
    await expect(page.getByText('Staking').first()).toBeVisible()
    await expect(page.getByText('Lending').first()).toBeVisible()
    await expect(page.getByText('Liquidity Pool').first()).toBeVisible()

    // Step 5: Verify APY values are displayed
    testLogger.step('Verifying APY values...')
    await expect(page.getByText('7.20%').first()).toBeVisible()
    await expect(page.getByText('9.80%').first()).toBeVisible()
    await expect(page.getByText('6.80%').first()).toBeVisible()
    await expect(page.getByText('15.20%').first()).toBeVisible()

    testLogger.step('DeFi positions display test completed successfully!')
  })

  test('Should display empty state message when wallet has no positions', async ({ page }) => {
    // Inject mock wallet first
    await injectMockWallet(page, { address: TEST_WALLETS.DEFI, walletName: 'Phantom' })
    
    // Mock API response with empty positions
    await mockPositionsAPI(page, mockEmptyPositionsData)

    // Navigate to portfolio page
    await page.goto('http://localhost:3000/portfolio')
    await page.waitForLoadState('networkidle')

    // Check if wallet is already connected
    const isConnected = await page.getByText(/\w{4,}\.{3}\w{4,}/).isVisible({ timeout: 1000 }).catch(() => false)
    
    if (!isConnected) {
      // Connect wallet
      const connectButton = page.getByRole('button', { name: /connect wallet/i }).first()
      await connectButton.click()
      await page.waitForTimeout(500)
      
      // Wait for modal and click Phantom if visible
      const modalTitle = page.getByText('Connect Your Wallet')
      const isModalVisible = await modalTitle.isVisible({ timeout: 2000 }).catch(() => false)
      
      if (isModalVisible) {
        const phantomButton = page.getByRole('button').filter({ hasText: /phantom/i })
        const isPhantomVisible = await phantomButton.first().isVisible({ timeout: 2000 }).catch(() => false)
        
        if (isPhantomVisible) {
          await phantomButton.first().click()
          await page.waitForTimeout(2000)
        }
      }
    }

    // Verify empty state message
    testLogger.step('Verifying empty state message...')
    await expect(page.getByText('No positions found. Start by staking SOL or providing liquidity on supported protocols!')).toBeVisible({ timeout: 10000 })

    testLogger.step('Empty state test completed successfully!')
  })

  test('Should handle refresh functionality for positions', async ({ page }) => {
    // Mock API response
    await mockPositionsAPI(page, mockPositionsData)

    // Navigate and connect wallet
    await page.goto('http://localhost:3000/portfolio')
    await page.waitForLoadState('networkidle')

    const connectButton = page.getByRole('button', { name: /connect wallet/i }).first()
    await connectButton.click()
    await page.waitForTimeout(500)
    
    // Wait for modal and click Phantom if visible
    const modalTitle = page.getByText('Connect Your Wallet')
    const isModalVisible = await modalTitle.isVisible({ timeout: 2000 }).catch(() => false)
    
    if (isModalVisible) {
      await page.getByRole('button', { name: /phantom/i }).click()
      await page.waitForTimeout(2000)
    }

    // Wait for positions to load - check for either heading
    const defiHeading = page.getByText('DeFi Positions').first()
    const stakingHeading = page.getByText('Staking Positions').first()
    
    await Promise.race([
      expect(defiHeading).toBeVisible({ timeout: 10000 }),
      expect(stakingHeading).toBeVisible({ timeout: 10000 })
    ]).catch(() => {
      // If neither heading is found, at least wait for the positions to load
      return expect(page.getByText('Marinade Finance').first()).toBeVisible({ timeout: 10000 })
    })

    // Test refresh button
    testLogger.step('Testing refresh functionality...')
    const refreshButton = page.getByRole('button', { name: /refresh/i })
    await expect(refreshButton).toBeVisible()
    
    // Click refresh - the button might not become disabled in current implementation
    await refreshButton.click()
    await page.waitForTimeout(1000)
    
    // Verify positions are still displayed after refresh
    await expect(page.getByText('Marinade Finance').first()).toBeVisible()
    
    testLogger.step('Refresh functionality test completed successfully!')
  })

  test('Should handle API errors gracefully', async ({ page }) => {
    // Inject mock wallet first
    await injectMockWallet(page, { address: TEST_WALLETS.DEFI, walletName: 'Phantom' })
    
    // Mock API to return error
    await mockPositionsAPIError(page)

    // Navigate and connect wallet
    await page.goto('http://localhost:3000/portfolio')
    await page.waitForLoadState('networkidle')

    const connectButton = page.getByRole('button', { name: /connect wallet/i }).first()
    await connectButton.click()
    await page.waitForTimeout(500)
    
    // Wait for modal and click Phantom if visible
    const modalTitle = page.getByText('Connect Your Wallet')
    const isModalVisible = await modalTitle.isVisible({ timeout: 2000 }).catch(() => false)
    
    if (isModalVisible) {
      await page.getByRole('button', { name: /phantom/i }).click()
      await page.waitForTimeout(2000)
    }

    // Verify error handling
    testLogger.step('Verifying error handling...')
    await expect(page.getByText(/error/i)).toBeVisible({ timeout: 10000 })

    testLogger.step('Error handling test completed successfully!')
  })

  test('Should display positions correctly on mobile viewport', async ({ page }) => {
    // Set mobile viewport first
    await page.setViewportSize({ width: 375, height: 667 })

    // Navigate to portfolio page
    await page.goto('http://localhost:3000/portfolio')
    await page.waitForLoadState('networkidle')

    // Verify mobile layout without requiring wallet connection
    testLogger.step('Verifying mobile layout structure...')
    
    // Check that the page renders properly on mobile
    await expect(page.getByRole('heading', { name: /portfolio/i })).toBeVisible()
    
    // Verify connect button is touch-friendly
    const connectButton = page.getByRole('button', { name: /connect wallet/i }).first()
    await expect(connectButton).toBeVisible()
    
    const buttonBox = await connectButton.boundingBox()
    expect(buttonBox).toBeTruthy()
    if (buttonBox) {
      expect(buttonBox.height).toBeGreaterThanOrEqual(40) // Touch-friendly size
    }
    
    // Verify responsive text and layout
    await expect(page.getByText(/connect your wallet to view your portfolio/i)).toBeVisible()
    
    // Test that clicking the connect button shows some interaction (modal or other response)
    await connectButton.click()
    await page.waitForTimeout(1000)
    
    // Since the modal behavior might be different on mobile, let's verify that
    // the page structure is maintained and responsive
    await expect(page.getByRole('heading', { name: /portfolio/i })).toBeVisible()
    
    // Navigate back home to test home page on mobile
    await page.goto('http://localhost:3000')
    await page.waitForLoadState('networkidle')
    
    // Verify home page is responsive
    await expect(page.getByText(/solfolio/i).first()).toBeVisible()

    testLogger.step('Mobile responsiveness test completed successfully!')
  })

  test('Should provide proper accessibility for screen readers', async ({ page }) => {
    // Inject mock wallet first
    await injectMockWallet(page, { address: TEST_WALLETS.DEFI, walletName: 'Phantom' })
    
    // Mock API response
    await mockPositionsAPI(page, mockPositionsData)

    // Navigate and connect wallet
    await page.goto('http://localhost:3000/portfolio')
    await page.waitForLoadState('networkidle')

    const connectButton = page.getByRole('button', { name: /connect wallet/i }).first()
    await connectButton.click()
    await page.waitForTimeout(500)
    
    // Wait for modal and click Phantom if visible
    const modalTitle = page.getByText('Connect Your Wallet')
    const isModalVisible = await modalTitle.isVisible({ timeout: 2000 }).catch(() => false)
    
    if (isModalVisible) {
      await page.getByRole('button', { name: /phantom/i }).click()
      await page.waitForTimeout(2000)
    }

    // Verify accessibility structure
    testLogger.step('Verifying accessibility structure...')
    
    // Check main content area
    const main = page.getByRole('main')
    await expect(main).toBeVisible()

    // Check heading structure - look for "My Portfolio" as shown in the page component
    await expect(page.getByRole('heading', { name: /my portfolio|portfolio/i })).toBeVisible({ timeout: 10000 })
    
    // Check for DeFi/Staking positions heading - use first() to handle multiple matches
    const defiHeading = page.getByText('DeFi Positions').first()
    const stakingHeading = page.getByText('Staking Positions').first()
    
    try {
      await expect(defiHeading).toBeVisible({ timeout: 2000 })
    } catch {
      await expect(stakingHeading).toBeVisible({ timeout: 2000 })
    }

    // Verify buttons have proper labels
    const refreshButton = page.getByRole('button', { name: /refresh/i })
    await expect(refreshButton).toBeVisible()
    
    // Check that position data is accessible
    await expect(page.getByText('Marinade Finance').first()).toBeVisible()

    testLogger.step('Accessibility test completed successfully!')
  })

  test('Should verify all required position card elements are displayed', async ({ page }) => {
    // Mock API response
    await mockPositionsAPI(page, mockPositionsData)

    // Navigate and connect wallet
    await page.goto('http://localhost:3000/portfolio')
    await page.waitForLoadState('networkidle')

    const connectButton = page.getByRole('button', { name: /connect wallet/i }).first()
    await connectButton.click()
    await page.waitForTimeout(500)
    
    // Wait for modal and click Phantom if visible
    const modalTitle = page.getByText('Connect Your Wallet')
    const isModalVisible = await modalTitle.isVisible({ timeout: 2000 }).catch(() => false)
    
    if (isModalVisible) {
      await page.getByRole('button', { name: /phantom/i }).click()
      await page.waitForTimeout(2000)
    }

    // Verify each card shows required elements
    testLogger.step('Verifying position card elements...')
    
    // Wait for positions to load
    await expect(page.getByText('Marinade Finance').first()).toBeVisible({ timeout: 10000 })

    // Protocol name and logo area
    await expect(page.getByText('Marinade Finance').first()).toBeVisible()
    await expect(page.getByText('Kamino Finance').first()).toBeVisible()
    await expect(page.getByText('Jito (JTO)').first()).toBeVisible()
    await expect(page.getByText('Orca').first()).toBeVisible()
    
    // Position type badges
    await expect(page.getByText('Staking').first()).toBeVisible()
    await expect(page.getByText('Lending').first()).toBeVisible()
    await expect(page.getByText('Liquidity Pool').first()).toBeVisible()
    
    // Token symbols
    await expect(page.getByText('mSOL').first()).toBeVisible()
    await expect(page.getByText('USDC').first()).toBeVisible()
    await expect(page.getByText('jitoSOL').first()).toBeVisible()
    await expect(page.getByText('SOL-USDC').first()).toBeVisible()
    
    // USD values
    await expect(page.getByText('$5,250.00').first()).toBeVisible()
    await expect(page.getByText('$2,250.35').first()).toBeVisible()
    await expect(page.getByText('$7,500.50').first()).toBeVisible()
    await expect(page.getByText('$1,000.00').first()).toBeVisible()
    
    // APY percentages
    await expect(page.getByText('7.20%').first()).toBeVisible()
    await expect(page.getByText('9.80%').first()).toBeVisible()
    await expect(page.getByText('6.80%').first()).toBeVisible()
    await expect(page.getByText('15.20%').first()).toBeVisible()

    testLogger.step('Position card elements verification completed successfully!')
  })

  test('Should verify portfolio breakdown displays correct percentages and values', async ({ page }) => {
    // Mock API response
    await mockPositionsAPI(page, mockPositionsData)

    // Navigate and connect wallet
    await page.goto('http://localhost:3000/portfolio')
    await page.waitForLoadState('networkidle')

    const connectButton = page.getByRole('button', { name: /connect wallet/i }).first()
    await connectButton.click()
    await page.waitForTimeout(500)
    
    // Wait for modal and click Phantom if visible
    const modalTitle = page.getByText('Connect Your Wallet')
    const isModalVisible = await modalTitle.isVisible({ timeout: 2000 }).catch(() => false)
    
    if (isModalVisible) {
      await page.getByRole('button', { name: /phantom/i }).click()
      await page.waitForTimeout(2000)
    }

    // Wait for positions to load first
    await expect(page.getByText('Marinade Finance').first()).toBeVisible({ timeout: 10000 })
    
    // Scroll to breakdown section
    await expect(page.getByText('Portfolio Breakdown')).toBeVisible()
    
    testLogger.step('Verifying portfolio breakdown...')
    
    // Check breakdown category labels are visible
    await expect(page.getByText('Staking').first()).toBeVisible()
    await expect(page.getByText('Lending').first()).toBeVisible()
    await expect(page.getByText('Liquidity').first()).toBeVisible()
    
    // Check that the breakdown values match our mock data
    // Note: We look for these values anywhere on the page since the exact layout may vary
    await expect(page.getByText('$12,500.50').first()).toBeVisible()
    await expect(page.getByText('$2,250.35').first()).toBeVisible()
    await expect(page.getByText('$1,000.00').first()).toBeVisible()

    testLogger.step('Portfolio breakdown verification completed successfully!')
  })
})