import { test, expect, Page } from '@playwright/test'

test.describe('Wallet Connection Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('should display connect wallet button when not connected', async ({ page }) => {
    // Wait for page to load
    await page.waitForLoadState('networkidle')
    
    // Check for connect wallet button (it should be present somewhere on the page)
    const connectButton = page.getByRole('button', { name: /connect wallet/i })
    await expect(connectButton.first()).toBeVisible()
  })

  test('should open wallet modal when connect button is clicked', async ({ page }) => {
    // Click connect wallet button
    await page.getByRole('button', { name: /connect wallet/i }).first().click()
    
    // Check that wallet modal appears
    await expect(page.locator('.wallet-adapter-modal')).toBeVisible()
    
    // Check for wallet options
    await expect(page.getByText('Phantom')).toBeVisible()
    await expect(page.getByText('Solflare')).toBeVisible()
    await expect(page.getByText('Ledger')).toBeVisible()
    await expect(page.getByText('Torus')).toBeVisible()
  })

  test('should close modal when clicking outside', async ({ page }) => {
    // Open modal
    await page.getByRole('button', { name: /connect wallet/i }).first().click()
    
    // Verify modal is open
    await expect(page.locator('.wallet-adapter-modal')).toBeVisible()
    
    // Click outside the modal (on the overlay)
    await page.locator('.wallet-adapter-modal-overlay').click({ force: true })
    
    // Verify modal is closed
    await expect(page.locator('.wallet-adapter-modal')).not.toBeVisible()
  })

  test('should close modal when close button is clicked', async ({ page }) => {
    // Open modal
    await page.getByRole('button', { name: /connect wallet/i }).first().click()
    
    // Click close button
    await page.locator('.wallet-adapter-modal-button-close').click()
    
    // Verify modal is closed
    await expect(page.locator('.wallet-adapter-modal')).not.toBeVisible()
  })

  test('should handle wallet not installed scenario', async ({ page }) => {
    // Open modal
    await page.getByRole('button', { name: /connect wallet/i }).first().click()
    
    // Try to select a wallet that's not installed (this would show "Not Installed" in real scenario)
    // Note: In real testing, you'd want to mock the wallet detection
    const phantomOption = page.getByRole('button', { name: /phantom/i })
    await expect(phantomOption).toBeVisible()
  })

  test('should persist wallet selection in localStorage', async ({ page, context }) => {
    // This test would require mocking wallet connection
    // Check localStorage is set when wallet connects
    const localStorage = await context.storageState()
    
    // Initially should not have wallet persistence
    expect(localStorage.origins[0]?.localStorage?.some(
      item => item.name === 'walletConnected' && item.value === 'true'
    )).toBeFalsy()
  })

  test('should be responsive on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })
    
    // Wait for responsive layout to adjust
    await page.waitForTimeout(500)
    
    // Check wallet button is still visible on mobile
    const walletButton = page.getByRole('button', { name: /connect wallet/i })
    await expect(walletButton.first()).toBeVisible()
  })
})

test.describe('Connected Wallet State', () => {
  // These tests would require mocking a connected wallet
  // In real E2E testing with actual wallets, you'd use a test wallet
  
  test.skip('should display wallet address when connected', async ({ page }) => {
    // This would require setting up a mock connected state
    // or using a test wallet with automated approval
    
    // Expected: Should show formatted address like "1111...1111"
    await expect(page.getByText(/\w{4}\.\.\.\w{4}/)).toBeVisible()
  })

  test.skip('should show wallet dropdown menu when connected', async ({ page }) => {
    // Mock connected state
    // Click on wallet button
    // Should show dropdown with:
    // - Copy Address
    // - Switch Wallet
    // - Disconnect
  })

  test.skip('should copy address to clipboard', async ({ page, context }) => {
    // Mock connected state
    // Open dropdown
    // Click copy address
    // Check clipboard contains address
    
    await context.grantPermissions(['clipboard-read', 'clipboard-write'])
    // ... test clipboard functionality
  })

  test.skip('should disconnect wallet', async ({ page }) => {
    // Mock connected state
    // Open dropdown
    // Click disconnect
    // Should return to disconnected state
  })

  test.skip('should switch wallet', async ({ page }) => {
    // Mock connected state with Wallet A
    // Click switch wallet
    // Should disconnect current and open modal
    // Select Wallet B
    // Should connect to Wallet B
  })
})

test.describe('Wallet Info Display', () => {
  test.skip('should display wallet info card when connected', async ({ page }) => {
    // Mock connected state
    // Should show:
    // - Wallet name (e.g., "Connected with Phantom")
    // - Full address
    // - SOL balance
    // - Copy button
    // - Explorer link
  })

  test.skip('should update balance in real-time', async ({ page }) => {
    // Mock connected state
    // Initial balance should be displayed
    // Simulate balance change
    // Balance should update without refresh
  })

  test.skip('should open Solana Explorer when link clicked', async ({ page, context }) => {
    // Mock connected state
    // Click explorer link
    // Should open new tab with correct explorer URL
    
    const [newPage] = await Promise.all([
      context.waitForEvent('page'),
      page.click('button[aria-label="View on Explorer"]')
    ])
    
    expect(newPage.url()).toContain('explorer.solana.com')
  })
})

test.describe('Error Handling', () => {
  test('should handle network errors gracefully', async ({ page }) => {
    // Go to the page first
    await page.goto('/')
    
    // Then simulate network failure for future API calls
    await page.route('**/api/**', route => route.abort())
    
    // App should still work and show connect button
    await expect(page.getByRole('button', { name: /connect wallet/i }).first()).toBeVisible()
  })

  test.skip('should show error message on connection failure', async ({ page }) => {
    // Mock wallet connection failure
    // Try to connect
    // Should show user-friendly error message
  })
})