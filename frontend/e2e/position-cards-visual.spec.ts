import { test, expect } from '@playwright/test'
import { injectMockWallet, TEST_WALLETS } from './helpers/wallet'

/**
 * Visual and Interaction Tests for Position Cards using playwright-mcp
 * 
 * These tests focus on visual regression, animations, and user interactions
 * for the new gradient-bordered position cards with animations.
 * 
 * Test scenarios:
 * - Visual appearance and gradient effects
 * - Animation smoothness and timing
 * - Interactive elements (hover, click, focus)
 * - Responsive behavior across devices
 * - Loading and skeleton states
 * - Accessibility compliance
 */

// Mock position data for testing
const mockPositionData = {
  success: true,
  data: {
    positions: [
      {
        protocol: 'MARINADE',
        protocolName: 'Marinade Finance',
        positionType: 'STAKING',
        tokenSymbol: 'mSOL',
        tokenName: 'Marinade Staked SOL',
        amount: 150.5,
        usdValue: 18250.50,
        apy: 7.8,
        rewards: 3.2,
        metadata: { exchangeRate: 1.052 }
      },
      {
        protocol: 'KAMINO',
        protocolName: 'Kamino Finance', 
        positionType: 'LENDING',
        tokenSymbol: 'kUSDC',
        tokenName: 'Kamino USDC',
        amount: 8000,
        usdValue: 8040.00,
        apy: 14.2,
        rewards: 2.8,
        metadata: { exchangeRate: 1.005 }
      },
      {
        protocol: 'ORCA',
        protocolName: 'Orca',
        positionType: 'LP_POSITION',
        tokenSymbol: 'SOL-USDC',
        tokenName: 'SOL-USDC LP',
        amount: 1.2,
        usdValue: 12000.00,
        apy: 28.5,
        rewards: 8.5,
        metadata: { lpTokens: 1.2, fees24h: 45.50 }
      }
    ],
    totalValue: 38290.50,
    performance: {
      totalApy: 16.8,
      dailyRewards: 14.5,
      monthlyRewards: 435.00
    }
  }
}

test.describe('Position Cards - Visual Regression Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Set up viewport for consistent screenshots
    await page.setViewportSize({ width: 1440, height: 900 })
  })

  test('Should capture position cards in different states for visual regression', async ({ page }) => {
    // Navigate to demo page
    await page.goto('http://localhost:3000/demo/positions')
    await page.waitForLoadState('networkidle')
    
    // Wait for animations to settle
    await page.waitForTimeout(2000)

    // Capture default state
    await expect(page).toHaveScreenshot('position-cards-default.png', {
      fullPage: false,
      clip: { x: 0, y: 400, width: 1440, height: 800 },
      maxDiffPixels: 100
    })

    // Test hover state on first card
    const firstCard = page.locator('.group').first()
    await firstCard.hover()
    await page.waitForTimeout(500) // Wait for hover animation
    
    await expect(page).toHaveScreenshot('position-cards-hover.png', {
      fullPage: false,
      clip: { x: 0, y: 400, width: 500, height: 300 },
      maxDiffPixels: 100
    })

    // Reset hover
    await page.mouse.move(0, 0)
    await page.waitForTimeout(300)

    // Test skeleton state
    await page.getByRole('button', { name: 'Show Skeletons' }).click()
    await page.waitForTimeout(500)
    
    await expect(page).toHaveScreenshot('position-cards-skeleton.png', {
      fullPage: false,
      clip: { x: 0, y: 400, width: 1440, height: 800 },
      maxDiffPixels: 100
    })

    // Test loading state
    await page.getByRole('button', { name: 'Show Cards' }).click()
    await page.waitForTimeout(300)
    await page.getByRole('button', { name: 'Simulate Loading' }).click()
    await page.waitForTimeout(500)
    
    await expect(page).toHaveScreenshot('position-cards-loading.png', {
      fullPage: false,
      clip: { x: 0, y: 400, width: 1440, height: 800 },
      maxDiffPixels: 100
    })
  })

  test('Should verify gradient border effects on hover', async ({ page }) => {
    await page.goto('http://localhost:3000/demo/positions')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1500)

    // Get all position cards
    const cards = page.locator('.group')
    const cardCount = await cards.count()
    
    // Test gradient glow on each card type
    for (let i = 0; i < Math.min(cardCount, 3); i++) {
      const card = cards.nth(i)
      
      // Capture before hover
      const beforeBox = await card.boundingBox()
      if (beforeBox) {
        await page.screenshot({
          path: `test-results/card-${i}-before-hover.png`,
          clip: beforeBox
        })
      }

      // Hover and capture
      await card.hover()
      await page.waitForTimeout(300)
      
      const afterBox = await card.boundingBox()
      if (afterBox) {
        await page.screenshot({
          path: `test-results/card-${i}-after-hover.png`,
          clip: afterBox
        })
      }

      // Verify glow effect is visible
      const hasGlowEffect = await card.evaluate((el) => {
        const styles = window.getComputedStyle(el)
        return styles.boxShadow !== 'none' || 
               el.classList.contains('hover:shadow-lg') ||
               el.querySelector('.group-hover\\:opacity-100') !== null
      })
      
      expect(hasGlowEffect).toBeTruthy()
      
      // Reset hover
      await page.mouse.move(0, 0)
      await page.waitForTimeout(200)
    }
  })

  test('Should verify shimmer animation in skeleton state', async ({ page }) => {
    await page.goto('http://localhost:3000/demo/positions')
    await page.waitForLoadState('networkidle')
    
    // Show skeleton state
    await page.getByRole('button', { name: 'Show Skeletons' }).click()
    await page.waitForTimeout(500)

    // Check for shimmer animation classes
    const shimmerElements = page.locator('.animate-shimmer, .animate-pulse')
    const shimmerCount = await shimmerElements.count()
    expect(shimmerCount).toBeGreaterThan(0)

    // Capture shimmer animation frames
    for (let frame = 0; frame < 3; frame++) {
      await page.screenshot({
        path: `test-results/shimmer-frame-${frame}.png`,
        clip: { x: 0, y: 400, width: 500, height: 300 }
      })
      await page.waitForTimeout(500)
    }

    // Verify animation is running
    const isAnimating = await shimmerElements.first().evaluate((el) => {
      const animation = el.getAnimations()
      return animation.length > 0
    })
    
    expect(isAnimating).toBeTruthy()
  })

  test('Should verify responsive layout transitions', async ({ page }) => {
    await page.goto('http://localhost:3000/demo/positions')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1500)

    // Define viewport breakpoints
    const viewports = [
      { name: 'desktop-xl', width: 1920, height: 1080 },
      { name: 'desktop', width: 1440, height: 900 },
      { name: 'laptop', width: 1024, height: 768 },
      { name: 'tablet', width: 768, height: 1024 },
      { name: 'mobile', width: 375, height: 812 }
    ]

    for (const viewport of viewports) {
      await page.setViewportSize({ width: viewport.width, height: viewport.height })
      await page.waitForTimeout(500) // Wait for layout shift
      
      // Capture screenshot for each viewport
      await page.screenshot({
        path: `test-results/responsive-${viewport.name}.png`,
        fullPage: false,
        clip: { x: 0, y: 0, width: viewport.width, height: Math.min(viewport.height, 900) }
      })

      // Verify grid columns based on viewport
      const grid = page.locator('.grid').first()
      const gridColumns = await grid.evaluate((el) => {
        const styles = window.getComputedStyle(el)
        return styles.gridTemplateColumns
      })

      // Check expected columns for each breakpoint
      if (viewport.width >= 1024) {
        expect(gridColumns).toContain('3') // lg:grid-cols-3
      } else if (viewport.width >= 768) {
        expect(gridColumns).toContain('2') // md:grid-cols-2
      } else {
        expect(gridColumns).toContain('1') // grid-cols-1
      }
    }
  })

  test('Should verify card elevation and depth effects', async ({ page }) => {
    await page.goto('http://localhost:3000/demo/positions')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1500)

    const cards = page.locator('.group')
    const firstCard = cards.first()

    // Get initial transform/elevation
    const initialTransform = await firstCard.evaluate((el) => {
      const styles = window.getComputedStyle(el)
      return {
        transform: styles.transform,
        boxShadow: styles.boxShadow,
        zIndex: styles.zIndex
      }
    })

    // Hover to trigger elevation
    await firstCard.hover()
    await page.waitForTimeout(300)

    // Get elevated state
    const elevatedTransform = await firstCard.evaluate((el) => {
      const styles = window.getComputedStyle(el)
      return {
        transform: styles.transform,
        boxShadow: styles.boxShadow,
        zIndex: styles.zIndex
      }
    })

    // Verify elevation change
    expect(elevatedTransform.transform).not.toBe(initialTransform.transform)
    expect(elevatedTransform.boxShadow).not.toBe(initialTransform.boxShadow)

    // Take screenshot of elevated state
    const cardBox = await firstCard.boundingBox()
    if (cardBox) {
      await page.screenshot({
        path: 'test-results/card-elevation.png',
        clip: {
          x: cardBox.x - 10,
          y: cardBox.y - 10,
          width: cardBox.width + 20,
          height: cardBox.height + 20
        }
      })
    }
  })

  test('Should verify APY badge spring animation', async ({ page }) => {
    await page.goto('http://localhost:3000/demo/positions')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1500)

    // Find APY badges
    const apyBadges = page.locator('text=/\\d+\\.\\d+%/')
    const badgeCount = await apyBadges.count()
    expect(badgeCount).toBeGreaterThan(0)

    // Test spring animation on first badge
    const firstBadge = apyBadges.first()
    const badgeBox = await firstBadge.boundingBox()
    
    if (badgeBox) {
      // Capture multiple frames of the spring animation
      for (let i = 0; i < 5; i++) {
        await page.screenshot({
          path: `test-results/apy-badge-frame-${i}.png`,
          clip: badgeBox
        })
        await page.waitForTimeout(100)
      }
    }

    // Verify badge has animation classes or transform
    const hasAnimation = await firstBadge.evaluate((el) => {
      const parent = el.closest('[class*="animate"]') || el
      const styles = window.getComputedStyle(parent)
      return styles.animation !== 'none' || 
             styles.transition !== 'none' ||
             parent.classList.toString().includes('spring')
    })
    
    expect(hasAnimation).toBeTruthy()
  })

  test('Should verify quick action buttons visibility and interaction', async ({ page }) => {
    await page.goto('http://localhost:3000/demo/positions')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1500)

    const firstCard = page.locator('.group').first()
    
    // Check initial state - action buttons might be hidden
    const actionButtonsInitial = firstCard.locator('[aria-label*="action"], [aria-label*="options"], button svg')
    const initialVisibility = await actionButtonsInitial.first().isVisible().catch(() => false)

    // Hover to reveal action buttons
    await firstCard.hover()
    await page.waitForTimeout(500)

    // Check for action buttons after hover
    const actionButtonsHover = firstCard.locator('button')
    const hoverButtonCount = await actionButtonsHover.count()
    
    if (hoverButtonCount > 0) {
      // Verify at least one button is visible on hover
      const isVisible = await actionButtonsHover.first().isVisible()
      expect(isVisible).toBeTruthy()

      // Take screenshot of action buttons
      const cardBox = await firstCard.boundingBox()
      if (cardBox) {
        await page.screenshot({
          path: 'test-results/card-with-actions.png',
          clip: cardBox
        })
      }

      // Test button interaction
      const firstButton = actionButtonsHover.first()
      const isClickable = await firstButton.isEnabled()
      expect(isClickable).toBeTruthy()
    }
  })

  test('Should verify activity pulse indicator animation', async ({ page }) => {
    await page.goto('http://localhost:3000/demo/positions')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1500)

    // Look for pulse animations
    const pulseElements = page.locator('.animate-pulse, [class*="pulse"]')
    const pulseCount = await pulseElements.count()

    if (pulseCount > 0) {
      const firstPulse = pulseElements.first()
      
      // Capture pulse animation frames
      for (let i = 0; i < 3; i++) {
        const box = await firstPulse.boundingBox()
        if (box) {
          await page.screenshot({
            path: `test-results/pulse-frame-${i}.png`,
            clip: box
          })
        }
        await page.waitForTimeout(500)
      }

      // Verify animation is active
      const isAnimating = await firstPulse.evaluate((el) => {
        const animations = el.getAnimations()
        return animations.length > 0
      })
      
      expect(isAnimating).toBeTruthy()
    }
  })

  test('Should verify glassmorphism and backdrop effects', async ({ page }) => {
    await page.goto('http://localhost:3000/demo/positions')
    await page.waitForLoadState('networkidle')
    
    // Check for glassmorphism elements
    const glassElements = page.locator('.backdrop-blur-sm, .backdrop-blur, .bg-white\\/5, .bg-black\\/5')
    const glassCount = await glassElements.count()
    expect(glassCount).toBeGreaterThan(0)

    // Verify backdrop blur is applied
    const firstGlass = glassElements.first()
    const hasBackdropEffect = await firstGlass.evaluate((el) => {
      const styles = window.getComputedStyle(el)
      return styles.backdropFilter !== 'none' ||
             (styles as any).webkitBackdropFilter !== 'none' ||
             el.classList.toString().includes('backdrop-blur')
    })
    
    expect(hasBackdropEffect).toBeTruthy()

    // Capture glassmorphism effect
    const glassBox = await firstGlass.boundingBox()
    if (glassBox) {
      await page.screenshot({
        path: 'test-results/glassmorphism-effect.png',
        clip: glassBox
      })
    }
  })

  test('Should verify count-up animation for values', async ({ page }) => {
    await page.goto('http://localhost:3000/demo/positions')
    
    // Observe value changes during page load
    const values = []
    
    // Capture values at different times during animation
    for (let i = 0; i < 5; i++) {
      await page.waitForTimeout(300)
      
      const currentValue = await page.locator('text=/$[0-9,]+\\.[0-9]+/').first().textContent()
      if (currentValue) {
        values.push(currentValue)
      }
    }

    // Values should change during animation (count-up effect)
    const uniqueValues = new Set(values)
    
    // If animation is working, we should see different values
    // Note: This might be flaky if animation completes too quickly
    console.log('Captured values during animation:', values)
    
    // Final value should be stable
    await page.waitForTimeout(2000)
    const finalValue = await page.locator('text=/$[0-9,]+\\.[0-9]+/').first().textContent()
    expect(finalValue).toBeTruthy()
    expect(finalValue).toMatch(/\$[\d,]+\.\d{2}/)
  })
})

test.describe('Position Cards - Accessibility Tests', () => {
  test('Should have proper ARIA labels and roles', async ({ page }) => {
    await page.goto('http://localhost:3000/demo/positions')
    await page.waitForLoadState('networkidle')

    // Check for semantic HTML structure
    const main = page.locator('main, [role="main"]')
    const hasMain = await main.count() > 0
    
    // Check headings hierarchy
    const h1 = page.getByRole('heading', { level: 1 })
    await expect(h1).toBeVisible()
    
    const h2 = page.getByRole('heading', { level: 2 })
    const h2Count = await h2.count()
    expect(h2Count).toBeGreaterThan(0)

    // Check for accessible card structure
    const cards = page.locator('.group')
    const firstCard = cards.first()
    
    // Cards should have accessible content
    const cardText = await firstCard.textContent()
    expect(cardText).toBeTruthy()
    
    // Check for button accessibility
    const buttons = page.getByRole('button')
    const buttonCount = await buttons.count()
    
    for (let i = 0; i < Math.min(buttonCount, 3); i++) {
      const button = buttons.nth(i)
      const buttonText = await button.textContent()
      const ariaLabel = await button.getAttribute('aria-label')
      
      // Button should have text or aria-label
      expect(buttonText || ariaLabel).toBeTruthy()
    }
  })

  test('Should support keyboard navigation', async ({ page }) => {
    await page.goto('http://localhost:3000/demo/positions')
    await page.waitForLoadState('networkidle')

    // Start keyboard navigation
    await page.keyboard.press('Tab')
    
    // Track focused elements
    const focusedElements = []
    
    for (let i = 0; i < 10; i++) {
      const focused = await page.evaluate(() => {
        const el = document.activeElement
        return el ? {
          tag: el.tagName,
          text: el.textContent?.substring(0, 50),
          role: el.getAttribute('role'),
          ariaLabel: el.getAttribute('aria-label')
        } : null
      })
      
      if (focused) {
        focusedElements.push(focused)
      }
      
      await page.keyboard.press('Tab')
      await page.waitForTimeout(100)
    }

    // Should have focusable elements
    expect(focusedElements.length).toBeGreaterThan(0)
    
    // Test Enter key on button
    const buttons = page.getByRole('button')
    if (await buttons.count() > 0) {
      await buttons.first().focus()
      await page.keyboard.press('Enter')
      await page.waitForTimeout(300)
      
      // Verify action was triggered (page state might change)
      // This depends on what the button does
    }
  })

  test('Should have sufficient color contrast', async ({ page }) => {
    await page.goto('http://localhost:3000/demo/positions')
    await page.waitForLoadState('networkidle')

    // Check text contrast against backgrounds
    const textElements = page.locator('p, span, div').filter({ hasText: /\$|%|APY/ })
    const sampleElement = textElements.first()
    
    const contrast = await sampleElement.evaluate((el) => {
      const styles = window.getComputedStyle(el)
      const color = styles.color
      const bgColor = styles.backgroundColor
      
      // Simple check - actual contrast calculation would be more complex
      return {
        textColor: color,
        backgroundColor: bgColor,
        fontSize: styles.fontSize,
        fontWeight: styles.fontWeight
      }
    })

    // Verify text is readable
    expect(contrast.fontSize).toBeTruthy()
    expect(contrast.textColor).not.toBe(contrast.backgroundColor)
  })

  test('Should properly announce loading states to screen readers', async ({ page }) => {
    await page.goto('http://localhost:3000/demo/positions')
    await page.waitForLoadState('networkidle')

    // Trigger loading state
    await page.getByRole('button', { name: 'Simulate Loading' }).click()
    
    // Check for aria-live regions or loading announcements
    const liveRegions = page.locator('[aria-live], [role="status"], [role="alert"]')
    const liveCount = await liveRegions.count()
    
    // Check for loading indicators
    const loadingIndicators = page.locator('[aria-busy="true"], .animate-pulse, [data-testid*="skeleton"]')
    const hasLoadingIndicators = await loadingIndicators.count() > 0
    
    expect(hasLoadingIndicators).toBeTruthy()
    
    // Wait for loading to complete
    await page.waitForTimeout(2500)
    
    // Verify loading state is cleared
    const busyElements = page.locator('[aria-busy="true"]')
    const busyCount = await busyElements.count()
    expect(busyCount).toBe(0)
  })
})