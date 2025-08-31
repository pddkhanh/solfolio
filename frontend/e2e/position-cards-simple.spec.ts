import { test, expect } from '@playwright/test'

/**
 * Simple E2E Tests for Position Cards
 * 
 * Focused tests that can run quickly without full UI mode
 */

test.describe('Position Cards - Simple Tests', () => {
  test.setTimeout(30000) // 30 second timeout per test
  
  test('Should load demo positions page', async ({ page }) => {
    // Navigate to demo page with retry logic
    let retries = 3
    while (retries > 0) {
      try {
        await page.goto('http://localhost:3000/demo/positions', { 
          waitUntil: 'domcontentloaded',
          timeout: 10000 
        })
        break
      } catch (error) {
        retries--
        if (retries === 0) throw error
        await page.waitForTimeout(2000)
      }
    }

    // Basic checks that page loaded
    const title = await page.title()
    expect(title).toBeTruthy()
    
    // Check for main heading
    const heading = page.locator('h1').first()
    await expect(heading).toBeVisible({ timeout: 5000 })
    
    // Take a screenshot as proof
    await page.screenshot({ path: 'test-results/position-cards-loaded.png' })
  })

  test('Should display position cards', async ({ page }) => {
    await page.goto('http://localhost:3000/demo/positions', { 
      waitUntil: 'domcontentloaded',
      timeout: 10000 
    })
    
    // Wait for any text that indicates cards are present
    await page.waitForSelector('text=/Finance|Orca|Kamino/', { timeout: 5000 })
    
    // Check for at least one position card element
    const cards = page.locator('.group, [class*="card"], div').filter({ hasText: /mSOL|USDC|SOL/ })
    const cardCount = await cards.count()
    expect(cardCount).toBeGreaterThan(0)
    
    console.log(`Found ${cardCount} position cards`)
  })

  test('Should have interactive buttons', async ({ page }) => {
    await page.goto('http://localhost:3000/demo/positions', { 
      waitUntil: 'domcontentloaded',
      timeout: 10000 
    })
    
    // Check for control buttons
    const buttons = page.getByRole('button')
    const buttonCount = await buttons.count()
    expect(buttonCount).toBeGreaterThan(0)
    
    // Try clicking a button if available
    if (buttonCount > 0) {
      const firstButton = buttons.first()
      const buttonText = await firstButton.textContent()
      console.log(`Found button: ${buttonText}`)
      
      // Click and see if page responds
      await firstButton.click()
      await page.waitForTimeout(500)
    }
  })

  test('Should be responsive', async ({ page }) => {
    await page.goto('http://localhost:3000/demo/positions', { 
      waitUntil: 'domcontentloaded',
      timeout: 10000 
    })
    
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })
    await page.waitForTimeout(500)
    
    // Page should still have content
    const mobileContent = await page.textContent('body')
    expect(mobileContent).toBeTruthy()
    
    // Test desktop viewport
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.waitForTimeout(500)
    
    const desktopContent = await page.textContent('body')
    expect(desktopContent).toBeTruthy()
  })
})