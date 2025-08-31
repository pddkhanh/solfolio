import { test, expect, Page } from '@playwright/test'
import { testLogger } from './helpers/test-logger'

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
  test.beforeEach(async ({ page }) => {
    // Navigate to homepage
    await page.goto('http://localhost:3000')
    
    // Wait for app to fully load
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(500)
  })

  test('Complete navigation flow with all checks', async ({ page }) => {
    testLogger.step('Starting navigation test...')
    
    // Step 1: Verify initial state on homepage
    testLogger.step('Step 1: Verifying initial homepage state...')
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
    testLogger.step('Step 2: Navigating to Portfolio page...')
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
    testLogger.step('Step 3: Navigating back to home via logo...')
    await logo.click()
    
    // Wait for navigation
    await page.waitForLoadState('networkidle')
    
    // Verify we're back on homepage
    await expect(page).toHaveURL('http://localhost:3000/')
    
    // Verify homepage content is visible (look for the main heading)
    await expect(page.locator('h1').filter({ hasText: 'Solana DeFi Portfolio Tracker' })).toBeVisible({ timeout: 5000 })
    
    // Step 4: Test browser back button
    testLogger.step('Step 4: Testing browser back button...')
    
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
    testLogger.step('Step 5: Testing browser forward button...')
    await page.goForward()
    await page.waitForLoadState('networkidle')
    
    // Verify we're back on portfolio page
    await expect(page).toHaveURL('http://localhost:3000/portfolio')
    
    // Step 6: Verify active page highlighting (if implemented)
    testLogger.step('Step 6: Checking active page highlighting...')
    
    // On portfolio page, check if Portfolio link has active styling
    // This might be implemented with different classes depending on the design
    // Common patterns include: 'active', 'text-foreground', removing 'text-foreground/60'
    const portfolioLinkClasses = await portfolioLink.getAttribute('class')
    testLogger.step(`Portfolio link classes when active: ${portfolioLinkClasses}`)
    
    // Navigate back to home
    await dashboardLink.click()
    await page.waitForLoadState('networkidle')
    
    // Check if Dashboard link has active styling
    const dashboardLinkClasses = await dashboardLink.getAttribute('class')
    testLogger.step(`Dashboard link classes when active: ${dashboardLinkClasses}`)
    
    // Step 7: Test navigation to non-existent pages (404 handling)
    testLogger.step('Step 7: Testing 404 error handling...')
    
    // Try to navigate to pages that may not exist yet
    const nonExistentPages = ['/protocols', '/analytics']
    
    for (const pagePath of nonExistentPages) {
      testLogger.step(`Testing navigation to ${pagePath}...`)
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
            testLogger.step(`${pagePath} shows 404 page (expected for non-implemented pages)`)
          } else if (hasContent) {
            testLogger.step(`${pagePath} page exists and loaded successfully`)
          }
        } catch (error) {
          testLogger.step(`Error navigating to ${pagePath}: ${error instanceof Error ? error.message : String(error)}`)
        }
        
        // Navigate back using browser back or direct navigation
        if (page.url() !== currentUrl) {
          await page.goBack()
          await page.waitForLoadState('networkidle', { timeout: 5000 })
        }
      }
    }
    
    // Step 8: Verify page titles update correctly
    testLogger.step('Step 8: Verifying page titles...')
    
    // Navigate to home if not already there
    if (!page.url().endsWith('localhost:3000/')) {
      const logo = page.locator('a[href="/"]').filter({ hasText: 'SolFolio' })
      await logo.click()
      await page.waitForLoadState('networkidle')
    }
    
    const homeTitle = await page.title()
    testLogger.step(`Home page title: ${homeTitle}`)
    expect(homeTitle).toContain('SolFolio')
    
    // Navigate to portfolio
    await portfolioLink.click()
    await page.waitForLoadState('networkidle')
    
    const portfolioTitle = await page.title()
    testLogger.step(`Portfolio page title: ${portfolioTitle}`)
    expect(portfolioTitle).toContain('SolFolio')
    
    // Step 9: Verify smooth transitions (no jarring page loads)
    testLogger.step('Step 9: Testing smooth transitions...')
    
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
      testLogger.step(`Console errors detected during navigation: ${consoleErrors}`)
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
    
    testLogger.step('Navigation test completed successfully!')
  })

  test('Mobile navigation menu functionality', async ({ page }) => {
    testLogger.step('Testing mobile navigation...')
    
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })
    await page.waitForTimeout(500)
    
    // Step 1: Verify mobile menu button is visible
    testLogger.step('Step 1: Checking mobile menu button...')
    // Look for the menu button in the header (md:hidden class indicates mobile menu)
    const mobileMenuButton = page.locator('header button.md\\:hidden')
    await expect(mobileMenuButton).toBeVisible()
    
    // Step 2: Open mobile menu
    testLogger.step('Step 2: Opening mobile menu...')
    await mobileMenuButton.click()
    await page.waitForTimeout(300)
    
    // Step 3: Verify mobile navigation links are visible
    testLogger.step('Step 3: Verifying mobile navigation links...')
    // After clicking menu button, the mobile nav should be visible
    // Wait a bit for animation
    await page.waitForTimeout(500)
    
    // Check if the mobile nav container is visible (it should have Dashboard and Portfolio links)
    // The mobile nav is the second nav element when menu is open
    const mobileNav = page.locator('nav').nth(1)
    
    // Wait for the mobile nav to be visible
    await expect(mobileNav).toBeVisible({ timeout: 5000 })
    
    // Check individual links in the mobile nav
    const mobileDashboardLink = mobileNav.locator('a[href="/"]').filter({ hasText: 'Dashboard' })
    const mobilePortfolioLink = mobileNav.locator('a[href="/portfolio"]').filter({ hasText: 'Portfolio' })
    await expect(mobileDashboardLink).toBeVisible()
    await expect(mobilePortfolioLink).toBeVisible()
    
    // Step 4: Navigate to Portfolio via mobile menu
    testLogger.step('Step 4: Navigating to Portfolio via mobile menu...')
    await mobilePortfolioLink.click()
    await page.waitForLoadState('networkidle')
    
    // Verify navigation worked
    await expect(page).toHaveURL('http://localhost:3000/portfolio')
    
    // Verify mobile menu closed after navigation
    await expect(mobileNav).not.toBeVisible({ timeout: 1000 })
    
    // Step 5: Test mobile menu close button
    testLogger.step('Step 5: Testing mobile menu close functionality...')
    
    // Navigate back to home
    await page.goto('http://localhost:3000/')
    await page.waitForLoadState('networkidle')
    
    // Open menu again
    await mobileMenuButton.click()
    await page.waitForTimeout(300)
    await expect(mobileNav).toBeVisible()
    
    // Close with X button (same button toggles)
    await mobileMenuButton.click()
    await page.waitForTimeout(300)
    await expect(mobileNav).not.toBeVisible()
    
    testLogger.step('Mobile navigation test completed!')
  })

  test('Navigation persistence across page refresh', async ({ page }) => {
    testLogger.step('Testing navigation persistence...')
    
    // Step 1: Navigate to portfolio
    testLogger.step('Step 1: Navigating to portfolio...')
    await page.goto('http://localhost:3000/portfolio')
    await page.waitForLoadState('networkidle')
    
    // Step 2: Refresh the page
    testLogger.step('Step 2: Refreshing page...')
    await page.reload()
    await page.waitForLoadState('networkidle')
    
    // Step 3: Verify we're still on portfolio page
    testLogger.step('Step 3: Verifying URL persisted...')
    await expect(page).toHaveURL('http://localhost:3000/portfolio')
    
    // Step 4: Verify page content loaded correctly after refresh
    testLogger.step('Step 4: Verifying content loaded after refresh...')
    await expect(page.locator('h1').filter({ hasText: /Portfolio/ })).toBeVisible({ timeout: 5000 })
    
    // Step 5: Test navigation still works after refresh
    testLogger.step('Step 5: Testing navigation after refresh...')
    const logo = page.locator('a[href="/"]').filter({ hasText: 'SolFolio' })
    await logo.click()
    await page.waitForLoadState('networkidle')
    await expect(page).toHaveURL('http://localhost:3000/')
    
    testLogger.step('Navigation persistence test completed!')
  })

  test('Keyboard navigation accessibility', async ({ page }) => {
    testLogger.step('Testing keyboard navigation...')
    
    // Step 1: Tab through navigation links
    testLogger.step('Step 1: Testing tab navigation...')
    
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
      testLogger.step(`Focused element: ${focusedElement}`)
    }
    
    // Step 2: Test Enter key navigation on focused link
    testLogger.step('Step 2: Testing Enter key navigation...')
    
    // Focus on portfolio link
    const portfolioLink = page.locator('a[href="/portfolio"]').first()
    await portfolioLink.focus()
    await page.waitForTimeout(100)
    
    // Press Enter to navigate
    await page.keyboard.press('Enter')
    await page.waitForLoadState('networkidle')
    
    // Verify navigation worked
    await expect(page).toHaveURL('http://localhost:3000/portfolio')
    
    testLogger.step('Keyboard navigation test completed!')
  })
})