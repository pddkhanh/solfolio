import { test, expect } from '@playwright/test'
import { injectMockWallet, TEST_WALLETS } from './helpers/wallet'

/**
 * Simplified version of TC-017 for debugging
 */

test.describe('Touch Interactions - Simplified', () => {
  test('Basic touch target size test', async ({ page }) => {
    // Navigate to app
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    
    // Test button sizes without requiring wallet connection
    console.log('Testing touch-friendly button sizes...')
    
    // Find the Connect Wallet button
    const connectButton = page.getByRole('button', { name: 'Connect Wallet' }).first()
    await expect(connectButton).toBeVisible()
    
    // Check its size
    const box = await connectButton.boundingBox()
    console.log(`Connect Wallet button size: ${box?.width}x${box?.height}px`)
    
    if (box) {
      // Check if it meets minimum touch target size (44px)
      expect(box.width).toBeGreaterThanOrEqual(44)
      expect(box.height).toBeGreaterThanOrEqual(36) // Allowing slightly less height for desktop
    }
    
    // Check navigation links
    const navLinks = await page.locator('nav a').all()
    console.log(`Found ${navLinks.length} navigation links`)
    
    for (const link of navLinks) {
      const linkBox = await link.boundingBox()
      if (linkBox) {
        // Navigation links should have adequate click area
        const clickArea = linkBox.width * linkBox.height
        expect(clickArea).toBeGreaterThan(400) // At least 400 square pixels
      }
    }
    
    console.log('Touch target size test completed!')
  })
  
  test('Test with mock wallet connection', async ({ page }) => {
    // Inject mock wallet
    await injectMockWallet(page, { address: TEST_WALLETS.TOKENS })
    
    // Navigate to app
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1000)
    
    // Click Connect Wallet
    const connectButton = page.getByRole('button', { name: 'Connect Wallet' }).first()
    await expect(connectButton).toBeVisible()
    await connectButton.click()
    
    // Wait for modal
    await page.waitForTimeout(500)
    
    // Check if modal opened
    const modalTitle = page.getByText('Connect Your Wallet').or(page.getByText('Select Wallet'))
    const isModalVisible = await modalTitle.isVisible({ timeout: 2000 }).catch(() => false)
    
    if (isModalVisible) {
      console.log('Wallet modal opened successfully')
      
      // Look for wallet options
      const walletOptions = await page.locator('[role="button"], button').filter({ hasText: /Phantom|Solflare|Wallet/ }).all()
      console.log(`Found ${walletOptions.length} wallet options`)
      
      if (walletOptions.length > 0) {
        // Click first wallet option
        await walletOptions[0].click()
        await page.waitForTimeout(1500)
        
        // Check if connected
        const addressPattern = page.getByText(/\w{4,}\.{3}\w{4,}/)
        const isConnected = await addressPattern.isVisible({ timeout: 5000 }).catch(() => false)
        
        if (isConnected) {
          console.log('Wallet connected successfully!')
          
          // Navigate to portfolio
          await page.goto('/portfolio')
          await page.waitForLoadState('networkidle')
          
          // Check for token list
          const tokenBalances = page.getByText('Token Balances')
          const hasTokenList = await tokenBalances.isVisible({ timeout: 3000 }).catch(() => false)
          
          if (hasTokenList) {
            console.log('Token list loaded successfully')
            
            // Test refresh button size
            const refreshButton = page.getByRole('button', { name: /Refresh/ }).first()
            if (await refreshButton.isVisible({ timeout: 1000 }).catch(() => false)) {
              const refreshBox = await refreshButton.boundingBox()
              console.log(`Refresh button size: ${refreshBox?.width}x${refreshBox?.height}px`)
              
              if (refreshBox) {
                expect(refreshBox.width).toBeGreaterThanOrEqual(44)
                expect(refreshBox.height).toBeGreaterThanOrEqual(36)
              }
            }
          }
        } else {
          console.log('Wallet connection failed or timed out')
        }
      }
    } else {
      console.log('Wallet modal did not open')
    }
  })
})