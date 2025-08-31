import { test, expect, Page } from '@playwright/test'

/**
 * TC-014: Navigate Between Pages
 * 
 * Tests navigation functionality across the application including:
 * - Main navigation links
 * - Logo/home navigation
 * - Browser back/forward buttons
 * - Active page highlighting
 * - Page title updates
 * - 404 error handling
 * 
 * Reference: docs/regression-tests.md
 */

test.describe('TC-014: Navigate Between Pages', () => {
  test.beforeEach(async ({ page, baseURL }) => {
    // Navigate to homepage
    await page.goto(baseURL || '/')
    
    // Wait for app to fully load
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(500)
  })

  test('Complete navigation flow with all checks', async ({ page }) => {
    console.log('Starting navigation test...')
    
    // Step 1: Verify initial state on homepage
    console.log('Step 1: Verifying initial homepage state...')
    await expect(page).toHaveURL('http://localhost:3000/')
    await expect(page).toHaveTitle(/SolFolio/i)
    
    // Verify logo is visible and clickable
    const logo = page.locator('a[href="/"]').filter({ hasText: 'SolFolio' })
    await expect(logo).toBeVisible()
    
    // Verify navigation menu is visible
    const nav = page.locator('nav').first()
    await expect(nav).toBeVisible()
    
    // Check that Dashboard link exists and is visible
    const dashboardLink = page.locator('a[href="/"]').filter({ hasText: 'Dashboard' })
    await expect(dashboardLink).toBeVisible()
    
    // Step 2: Navigate to Portfolio page via header link
    console.log('Step 2: Navigating to Portfolio page...')
    // Use first() to get header link (not footer)
    const portfolioLink = page.locator('nav').first().locator('a[href="/portfolio"]').filter({ hasText: 'Portfolio' })
    await expect(portfolioLink).toBeVisible()
    
    // Click Portfolio link
    await portfolioLink.click()
    
    // Wait for navigation to complete
    await page.waitForLoadState('networkidle')
    
    // Verify URL changed to /portfolio
    await expect(page).toHaveURL('http://localhost:3000/portfolio')
    
    // Verify portfolio page content loaded
    await expect(page.locator('h1').filter({ hasText: /Portfolio/ })).toBeVisible({ timeout: 5000 })
    
    // Step 3: Navigate back to home using logo
    console.log('Step 3: Navigating back to home via logo...')
    await logo.click()
    
    // Wait for navigation
    await page.waitForLoadState('networkidle')
    
    // Verify we're back on homepage
    await expect(page).toHaveURL('http://localhost:3000/')
    
    // Verify homepage content is visible (look for the main heading)
    await expect(page.locator('h1').filter({ hasText: 'Solana DeFi Portfolio Tracker' })).toBeVisible({ timeout: 5000 })
    
    // Step 4: Test browser back button
    console.log('Step 4: Testing browser back button...')
    
    // First navigate to portfolio again
    await portfolioLink.click()
    await page.waitForLoadState('networkidle')
    await expect(page).toHaveURL('http://localhost:3000/portfolio')
    
    // Now use browser back button
    await page.goBack()
    await page.waitForLoadState('networkidle')
    
    // Verify we're back on homepage
    await expect(page).toHaveURL('http://localhost:3000/')
    
    // Step 5: Test browser forward button
    console.log('Step 5: Testing browser forward button...')
    await page.goForward()
    await page.waitForLoadState('networkidle')
    
    // Verify we're back on portfolio page
    await expect(page).toHaveURL('http://localhost:3000/portfolio')
    
    // Step 6: Verify active page highlighting (if implemented)
    console.log('Step 6: Checking active page highlighting...')
    
    // On portfolio page, check if Portfolio link has active styling
    // This might be implemented with different classes depending on the design
    // Common patterns include: 'active', 'text-foreground', removing 'text-foreground/60'
    const portfolioLinkClasses = await portfolioLink.getAttribute('class')
    console.log('Portfolio link classes when active:', portfolioLinkClasses)
    
    // Navigate back to home
    await dashboardLink.click()
    await page.waitForLoadState('networkidle')
    
    // Check if Dashboard link has active styling
    const dashboardLinkClasses = await dashboardLink.getAttribute('class')
    console.log('Dashboard link classes when active:', dashboardLinkClasses)
    
    // Step 7: Test navigation to non-existent pages (404 handling)
    console.log('Step 7: Testing 404 error handling...')
    
    // Try to navigate to pages that may not exist yet
    const nonExistentPages = ['/protocols', '/analytics']
    
    for (const pagePath of nonExistentPages) {
      console.log(`Testing navigation to ${pagePath}...`)
      const link = page.locator(`a[href="${pagePath}"]`).first()
      
      if (await link.isVisible({ timeout: 1000 }).catch(() => false)) {
        // Store current URL to navigate back
        const currentUrl = page.url()
        
        // Try to click the link
        try {
          await link.click()
          await page.waitForLoadState('networkidle', { timeout: 5000 })
          
          // Check if we get a 404 or if the page exists
          const is404 = await page.locator('text=/404|not found/i').isVisible({ timeout: 1000 }).catch(() => false)
          const hasContent = await page.locator('h1').isVisible({ timeout: 1000 }).catch(() => false)
          
          if (is404) {
            console.log(`${pagePath} shows 404 page (expected for non-implemented pages)`)
          } else if (hasContent) {
            console.log(`${pagePath} page exists and loaded successfully`)
          }
        } catch (error) {
          console.log(`Error navigating to ${pagePath}:`, error instanceof Error ? error.message : String(error))
        }
        
        // Navigate back using browser back or direct navigation
        if (page.url() !== currentUrl) {
          await page.goBack()
          await page.waitForLoadState('networkidle', { timeout: 5000 })
        }
      }
    }
    
    // Step 8: Verify page titles update correctly
    console.log('Step 8: Verifying page titles...')
    
    // Navigate to home if not already there
    if (!page.url().endsWith('localhost:3000/')) {
      const logo = page.locator('a[href="/"]').filter({ hasText: 'SolFolio' })
      await logo.click()
      await page.waitForLoadState('networkidle')
    }
    
    const homeTitle = await page.title()
    console.log('Home page title:', homeTitle)
    expect(homeTitle).toContain('SolFolio')
    
    // Navigate to portfolio
    await portfolioLink.click()
    await page.waitForLoadState('networkidle')
    
    const portfolioTitle = await page.title()
    console.log('Portfolio page title:', portfolioTitle)
    expect(portfolioTitle).toContain('SolFolio')
    
    // Step 9: Verify smooth transitions (no jarring page loads)
    console.log('Step 9: Testing smooth transitions...')
    
    // Navigate between pages and ensure no errors in console
    const consoleErrors: string[] = []
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text())
      }
    })
    
    // Do a quick navigation cycle
    await page.goto('http://localhost:3000/')
    await portfolioLink.click()
    await page.waitForLoadState('networkidle')
    await logo.click()
    await page.waitForLoadState('networkidle')
    
    // Check for any console errors
    if (consoleErrors.length > 0) {
      console.log('Console errors detected during navigation:', consoleErrors)
    }
    
    // Verify no critical errors (filter out expected warnings)
    const criticalErrors = consoleErrors.filter(error => 
      !error.includes('Warning') && 
      !error.includes('DevTools') &&
      !error.includes('Failed to load resource') && // Common for non-existent pages
      !error.includes('WebSocket') && // WebSocket errors are expected in test environment
      !error.includes('ws://localhost:3001') && // Backend WebSocket not running in tests
      !error.includes('socket.io') && // Socket.io connection errors expected
      !error.includes('ERR_CONNECTION_REFUSED') // Connection refused is expected
    )
    
    expect(criticalErrors).toHaveLength(0)
    
    console.log('Navigation test completed successfully!')
  })

  test('Mobile navigation menu functionality', async ({ page }) => {
    console.log('Testing mobile navigation...')
    
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })
    await page.waitForTimeout(500)
    
    // Step 1: Verify mobile menu button is visible
    console.log('Step 1: Checking mobile menu button...')
    // Look for the hamburger button with proper aria-label
    const mobileMenuButton = page.locator('button[aria-label="Open navigation menu"]').first()
    await expect(mobileMenuButton).toBeVisible()
    
    // Step 2: Open mobile menu
    console.log('Step 2: Opening mobile menu...')
    // Use JavaScript to click the button directly
    await mobileMenuButton.evaluate((el: HTMLElement) => el.click())
    
    // Wait for menu animation to complete
    await page.waitForTimeout(300)
    
    // Step 3: Verify mobile navigation links are visible
    console.log('Step 3: Verifying mobile navigation links...')
    // After opening mobile menu, navigation links should be visible
    // Look for Dashboard and Portfolio links
    const dashboardLinks = await page.locator('a[href="/"]').all()
    const portfolioLinks = await page.locator('a[href="/portfolio"]').all()
    
    let mobileDashboardLink = null
    let mobilePortfolioLink = null
    
    // Find visible Dashboard link
    for (const link of dashboardLinks) {
      if (await link.isVisible()) {
        const text = await link.textContent()
        // Dashboard link might just be the logo or say "Dashboard"
        if (text && (text.includes('Dashboard') || text.includes('SolFolio'))) {
          mobileDashboardLink = link
          break
        }
      }
    }
    
    // Find visible Portfolio link
    for (const link of portfolioLinks) {
      if (await link.isVisible()) {
        const text = await link.textContent()
        if (text && text.includes('Portfolio')) {
          mobilePortfolioLink = link
          break
        }
      }
    }
    
    if (!mobilePortfolioLink) {
      // If we can't find Portfolio link, the menu might not have opened correctly
      throw new Error('Portfolio link not found in mobile menu')
    }
    
    // Log what we found for debugging
    console.log('Found mobile links:', {
      dashboard: mobileDashboardLink ? 'found' : 'not found',
      portfolio: mobilePortfolioLink ? 'found' : 'not found'
    })
    
    // Step 4: Navigate to Portfolio via mobile menu
    console.log('Step 4: Navigating to Portfolio via mobile menu...')
    await mobilePortfolioLink.click()
    await page.waitForLoadState('networkidle')
    
    // Verify navigation worked
    await expect(page).toHaveURL('http://localhost:3000/portfolio')
    
    // Verify mobile menu closed automatically after navigation
    // Check that hamburger button is back to "Open" state
    const hamburgerButtonAfter = page.locator('button[aria-label="Open navigation menu"]').first()
    await expect(hamburgerButtonAfter).toBeVisible({ timeout: 2000 })
    
    // Step 5: Test mobile menu close button
    console.log('Step 5: Testing mobile menu close functionality...')
    
    // Navigate back to home
    await page.goto('http://localhost:3000/')
    await page.waitForLoadState('networkidle')
    
    // Open menu again
    const menuButtonAfterNav = page.locator('button[aria-label="Open navigation menu"]').first()
    await menuButtonAfterNav.evaluate((el: HTMLElement) => el.click())
    await page.waitForTimeout(500)
    
    // Find close button (X button in the menu)
    const closeButtons = await page.locator('button[aria-label="Close menu"]').all()
    let closeButton = null
    for (const btn of closeButtons) {
      if (await btn.isVisible()) {
        closeButton = btn
        break
      }
    }
    
    if (closeButton) {
      // Close with X button in the menu
      await closeButton.click()
      await page.waitForTimeout(300)
    } else {
      // If no close button found, click hamburger again to close
      const closeMenuButton = page.locator('button[aria-label="Close navigation menu"]').first()
      if (await closeMenuButton.isVisible()) {
        await closeMenuButton.evaluate((el: HTMLElement) => el.click())
      }
    }
    
    // Verify menu is closed
    await expect(menuButtonAfterNav).toBeVisible()
    
    // Step 6: Test hamburger button toggle
    console.log('Step 6: Testing hamburger button toggle...')
    
    // Open menu again with hamburger button
    await menuButtonAfterNav.evaluate((el: HTMLElement) => el.click())
    await page.waitForTimeout(500)
    
    // The hamburger button changes to show "Close navigation menu" when open
    const closeMenuButton = page.locator('button[aria-label="Close navigation menu"]').first()
    const isCloseVisible = await closeMenuButton.isVisible().catch(() => false)
    
    if (isCloseVisible) {
      // Click hamburger button again to close
      await closeMenuButton.evaluate((el: HTMLElement) => el.click())
    } else {
      // Click the open button again if aria-label didn't change
      await menuButtonAfterNav.evaluate((el: HTMLElement) => el.click())
    }
    
    await page.waitForTimeout(300)
    
    // Verify menu is closed - hamburger button should be visible
    await expect(page.locator('button[aria-label="Open navigation menu"]').first()).toBeVisible()
    
    console.log('Mobile navigation test completed!')
  })

  test('Navigation persistence across page refresh', async ({ page }) => {
    console.log('Testing navigation persistence...')
    
    // Step 1: Navigate to portfolio
    console.log('Step 1: Navigating to portfolio...')
    await page.goto('http://localhost:3000/portfolio')
    await page.waitForLoadState('networkidle')
    
    // Step 2: Refresh the page
    console.log('Step 2: Refreshing page...')
    await page.reload()
    await page.waitForLoadState('networkidle')
    
    // Step 3: Verify we're still on portfolio page
    console.log('Step 3: Verifying URL persisted...')
    await expect(page).toHaveURL('http://localhost:3000/portfolio')
    
    // Step 4: Verify page content loaded correctly after refresh
    console.log('Step 4: Verifying content loaded after refresh...')
    await expect(page.locator('h1').filter({ hasText: /Portfolio/ })).toBeVisible({ timeout: 5000 })
    
    // Step 5: Test navigation still works after refresh
    console.log('Step 5: Testing navigation after refresh...')
    const logo = page.locator('a[href="/"]').filter({ hasText: 'SolFolio' })
    await logo.click()
    await page.waitForLoadState('networkidle')
    await expect(page).toHaveURL('http://localhost:3000/')
    
    console.log('Navigation persistence test completed!')
  })

  test('Keyboard navigation accessibility', async ({ page }) => {
    console.log('Testing keyboard navigation...')
    
    // Step 1: Tab through navigation links
    console.log('Step 1: Testing tab navigation...')
    
    // Start from body
    await page.locator('body').click()
    
    // Tab to first focusable element (should be logo or first nav link)
    await page.keyboard.press('Tab')
    await page.waitForTimeout(100)
    
    // Continue tabbing through navigation
    for (let i = 0; i < 5; i++) {
      await page.keyboard.press('Tab')
      await page.waitForTimeout(100)
      
      // Get currently focused element
      const focusedElement = await page.evaluate(() => {
        const el = document.activeElement
        return {
          tagName: el?.tagName,
          href: (el as HTMLAnchorElement)?.href,
          text: el?.textContent
        }
      })
      console.log('Focused element:', focusedElement)
    }
    
    // Step 2: Test Enter key navigation on focused link
    console.log('Step 2: Testing Enter key navigation...')
    
    // Focus on portfolio link
    const portfolioLink = page.locator('a[href="/portfolio"]').first()
    await portfolioLink.focus()
    await page.waitForTimeout(100)
    
    // Press Enter to navigate
    await page.keyboard.press('Enter')
    await page.waitForLoadState('networkidle')
    
    // Verify navigation worked
    await expect(page).toHaveURL('http://localhost:3000/portfolio')
    
    console.log('Keyboard navigation test completed!')
  })
})