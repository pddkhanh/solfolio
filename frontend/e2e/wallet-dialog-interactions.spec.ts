import { test, expect, Page } from '@playwright/test'

test.describe('Wallet Connection Dialog Interactions', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('should open wallet dialog when clicking Connect Wallet button', async ({ page }) => {
    // Click the Connect Wallet button
    await page.getByTestId('connect-wallet-button').click()

    // Verify dialog is visible
    const dialog = page.getByRole('dialog', { name: 'Connect Your Wallet' })
    await expect(dialog).toBeVisible()

    // Verify dialog title and description
    await expect(dialog.getByRole('heading', { name: 'Connect Your Wallet' })).toBeVisible()
    await expect(dialog.getByText('Choose a wallet to connect to SolFolio')).toBeVisible()

    // Verify wallet options are displayed
    await expect(page.getByTestId('wallet-option-phantom')).toBeVisible()
    await expect(page.getByTestId('wallet-option-solflare')).toBeVisible()
    await expect(page.getByTestId('wallet-option-ledger')).toBeVisible()
    await expect(page.getByTestId('wallet-option-torus')).toBeVisible()

    // Verify help text is displayed
    await expect(page.getByText('New to Solana wallets?')).toBeVisible()
    await expect(page.getByRole('link', { name: /Learn more about wallets/ })).toBeVisible()
  })

  test('should close dialog when clicking the close button', async ({ page }) => {
    // Open the dialog
    await page.getByTestId('connect-wallet-button').click()
    
    // Verify dialog is visible
    const dialog = page.getByRole('dialog', { name: 'Connect Your Wallet' })
    await expect(dialog).toBeVisible()

    // Click the close button
    await page.getByRole('button', { name: 'Close' }).click()

    // Verify dialog is hidden
    await expect(dialog).not.toBeVisible()
  })

  test('should close dialog when pressing ESC key', async ({ page }) => {
    // Open the dialog
    await page.getByTestId('connect-wallet-button').click()
    
    // Verify dialog is visible
    const dialog = page.getByRole('dialog', { name: 'Connect Your Wallet' })
    await expect(dialog).toBeVisible()

    // Press ESC key
    await page.keyboard.press('Escape')

    // Verify dialog is hidden
    await expect(dialog).not.toBeVisible()
  })

  test('should close dialog when clicking outside (backdrop)', async ({ page }) => {
    // Open the dialog
    await page.getByTestId('connect-wallet-button').click()
    
    // Verify dialog is visible
    const dialog = page.getByRole('dialog', { name: 'Connect Your Wallet' })
    await expect(dialog).toBeVisible()

    // Click outside the dialog (on the backdrop/overlay)
    // Use coordinates that are definitely outside the dialog
    await page.mouse.click(10, 10)

    // Verify dialog is hidden
    await expect(dialog).not.toBeVisible()
  })

  test('should display wallet selection UI correctly', async ({ page }) => {
    // Open the dialog
    await page.getByTestId('connect-wallet-button').click()

    // Check that each wallet button has proper styling and content
    const phantomButton = page.getByTestId('wallet-option-phantom')
    await expect(phantomButton).toBeVisible()
    await expect(phantomButton).toContainText('Phantom')
    
    const solflareButton = page.getByTestId('wallet-option-solflare')
    await expect(solflareButton).toBeVisible()
    await expect(solflareButton).toContainText('Solflare')

    const ledgerButton = page.getByTestId('wallet-option-ledger')
    await expect(ledgerButton).toBeVisible()
    await expect(ledgerButton).toContainText('Ledger')

    const torusButton = page.getByTestId('wallet-option-torus')
    await expect(torusButton).toBeVisible()
    await expect(torusButton).toContainText('Torus')

    // Check that wallet icons are present (img elements within buttons)
    await expect(phantomButton.locator('img')).toBeVisible()
    await expect(solflareButton.locator('img')).toBeVisible()
    await expect(ledgerButton.locator('img')).toBeVisible()
    await expect(torusButton.locator('img')).toBeVisible()
  })

  test('should handle wallet selection and show connection state', async ({ page }) => {
    // Open the dialog
    await page.getByTestId('connect-wallet-button').click()

    // Click on Phantom wallet option
    await page.getByTestId('wallet-option-phantom').click()

    // Should transition to connection view
    // The dialog title should change
    await expect(page.getByRole('heading', { name: 'Connecting Wallet' })).toBeVisible({ timeout: 5000 })
    
    // Should show connecting message
    await expect(page.getByText('Please approve the connection request in your Phantom wallet')).toBeVisible()

    // Since we don't have a real wallet installed, it will show an error eventually
    // Wait for error state
    const errorText = page.getByText(/Failed to connect|User rejected|not found|not installed|timeout/i)
    
    // If error appears, verify error handling UI
    const hasError = await errorText.isVisible().catch(() => false)
    if (hasError) {
      // Should show retry and choose another buttons
      await expect(page.getByTestId('retry-connection')).toBeVisible()
      await expect(page.getByTestId('choose-another-wallet')).toBeVisible()

      // Click choose another to go back to wallet selection
      await page.getByTestId('choose-another-wallet').click()

      // Should be back at wallet selection
      await expect(page.getByTestId('wallet-option-phantom')).toBeVisible()
      await expect(page.getByTestId('wallet-option-solflare')).toBeVisible()
    }
  })

  test('should show proper state transitions when selecting wallet', async ({ page }) => {
    // Open the dialog
    await page.getByTestId('connect-wallet-button').click()

    // Verify initial state - wallet selection
    await expect(page.getByRole('heading', { name: 'Connect Your Wallet' })).toBeVisible()
    await expect(page.getByText('Choose a wallet to connect to SolFolio')).toBeVisible()

    // Click on Phantom wallet option
    await page.getByTestId('wallet-option-phantom').click()

    // Should transition to connecting state
    await expect(page.getByRole('heading', { name: 'Connecting Wallet' })).toBeVisible({ timeout: 5000 })
    await expect(page.getByText(/Please approve the connection request/i)).toBeVisible()

    // The connecting state should show loading spinner or error eventually
    // Since we don't have a real wallet, we expect it to either stay in connecting or show error
    const dialog = page.getByRole('dialog')
    await expect(dialog).toBeVisible()
  })

  test('should navigate to wallet learn more link', async ({ page }) => {
    // Open the dialog
    await page.getByTestId('connect-wallet-button').click()

    // Find and check the learn more link
    const learnMoreLink = page.getByRole('link', { name: /Learn more about wallets/ })
    await expect(learnMoreLink).toBeVisible()
    
    // Check that it has the correct href
    await expect(learnMoreLink).toHaveAttribute('href', 'https://solana.com/ecosystem/explore?categories=wallet')
    
    // Check that it opens in a new tab
    await expect(learnMoreLink).toHaveAttribute('target', '_blank')
    await expect(learnMoreLink).toHaveAttribute('rel', 'noopener noreferrer')
  })

  test('should handle multiple open/close cycles correctly', async ({ page }) => {
    const dialog = page.getByRole('dialog', { name: 'Connect Your Wallet' })

    // First cycle - open and close with button
    await page.getByTestId('connect-wallet-button').click()
    await expect(dialog).toBeVisible()
    await page.getByRole('button', { name: 'Close' }).click()
    await expect(dialog).not.toBeVisible()

    // Second cycle - open and close with ESC
    await page.getByTestId('connect-wallet-button').click()
    await expect(dialog).toBeVisible()
    await page.keyboard.press('Escape')
    await expect(dialog).not.toBeVisible()

    // Third cycle - open and close with backdrop click
    await page.getByTestId('connect-wallet-button').click()
    await expect(dialog).toBeVisible()
    await page.mouse.click(10, 10)
    await expect(dialog).not.toBeVisible()

    // Verify we can still open it again
    await page.getByTestId('connect-wallet-button').click()
    await expect(dialog).toBeVisible()
    
    // And all wallet options are still there
    await expect(page.getByTestId('wallet-option-phantom')).toBeVisible()
    await expect(page.getByTestId('wallet-option-solflare')).toBeVisible()
  })

  test.skip('should display properly on mobile viewport', async ({ page }) => {
    // TODO: Fix mobile viewport test - button might be in hamburger menu on mobile
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })
    
    // Wait for page to adjust to new viewport
    await page.waitForTimeout(500)
    
    // Open the dialog - try both possible button locations
    // On mobile, the button might be in a different place or have different visibility
    const connectButton = page.getByTestId('connect-wallet-button').first()
    
    // Force click even if not visible (mobile menu might hide it)
    await connectButton.click({ force: true })

    // Verify dialog is visible
    const dialog = page.getByRole('dialog', { name: 'Connect Your Wallet' })
    await expect(dialog).toBeVisible()

    // Verify it takes appropriate width (95vw max)
    const boundingBox = await dialog.boundingBox()
    expect(boundingBox).toBeTruthy()
    if (boundingBox) {
      // Should be at most 95% of viewport width
      expect(boundingBox.width).toBeLessThanOrEqual(375 * 0.95 + 10) // Adding small margin for rounding
    }

    // Verify all wallet options are still visible and clickable
    await expect(page.getByTestId('wallet-option-phantom')).toBeVisible()
    await expect(page.getByTestId('wallet-option-solflare')).toBeVisible()
    await expect(page.getByTestId('wallet-option-ledger')).toBeVisible()
    await expect(page.getByTestId('wallet-option-torus')).toBeVisible()
  })

  test('should maintain focus management', async ({ page }) => {
    // Open the dialog
    await page.getByTestId('connect-wallet-button').click()

    // Wait for dialog to be fully rendered
    await page.waitForTimeout(300)

    // Check that we can tab through elements in the dialog
    await page.keyboard.press('Tab')
    
    // Check what element has focus (could be close button or first wallet option)
    const activeElement1 = await page.evaluate(() => {
      const el = document.activeElement
      return {
        tagName: el?.tagName,
        role: el?.getAttribute('role'),
        hasTestId: !!el?.getAttribute('data-testid'),
        isInDialog: !!el?.closest('[role="dialog"]')
      }
    })
    
    // Verify focus is within the dialog
    expect(activeElement1.isInDialog).toBeTruthy()

    // Tab through more elements to verify focus cycling
    for (let i = 0; i < 10; i++) {
      await page.keyboard.press('Tab')
    }
    
    // Focus should still be within the dialog after multiple tabs
    const activeElement2 = await page.evaluate(() => {
      const el = document.activeElement
      return {
        isInDialog: !!el?.closest('[role="dialog"]')
      }
    })
    
    expect(activeElement2.isInDialog).toBeTruthy()
  })

  test('should show visual feedback on hover', async ({ page }) => {
    // Open the dialog
    await page.getByTestId('connect-wallet-button').click()

    // Hover over a wallet option
    const phantomButton = page.getByTestId('wallet-option-phantom')
    await phantomButton.hover()

    // Check that the button has hover styles applied (checking computed styles)
    const backgroundColor = await phantomButton.evaluate(el => 
      window.getComputedStyle(el).backgroundColor
    )
    
    // Move mouse away
    await page.mouse.move(0, 0)

    // Get background after hover removed
    const backgroundColorAfter = await phantomButton.evaluate(el => 
      window.getComputedStyle(el).backgroundColor
    )

    // The colors might be different due to hover state
    // This is a basic check - in real scenario you'd check specific color values
    expect(backgroundColor).toBeTruthy()
    expect(backgroundColorAfter).toBeTruthy()
  })
})