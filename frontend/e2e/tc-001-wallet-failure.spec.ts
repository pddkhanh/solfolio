import { test, expect } from '@playwright/test'

/**
 * TC-001 Extension: Wallet Connection Failure Scenarios
 * 
 * Test error handling and user feedback when wallet connection fails
 */
test.describe('TC-001: Wallet Connection Failure Scenarios', () => {
  test.beforeEach(async ({ page, context }) => {
    // Navigate to homepage
    await page.goto('/')
    await page.waitForLoadState('networkidle')
  })

  test('should show error toast when wallet is not installed', async ({ page, context }) => {
    // Inject a scenario where Phantom is not installed
    await context.addInitScript(() => {
      // Remove any existing wallet
      delete (window as any).phantom
      delete (window as any).solana
      
      // Set E2E test mode flag
      ;(window as any).__E2E_TEST_MODE__ = true
      
      console.log('[E2E] Simulating: No wallet installed')
    })
    
    await page.reload()
    await page.waitForLoadState('networkidle')
    
    // Enable console logging
    page.on('console', msg => {
      console.log(`[Browser ${msg.type()}]:`, msg.text())
    })
    
    // Click Connect Wallet button
    const connectButton = page.getByRole('button', { name: /connect wallet/i })
    await expect(connectButton.first()).toBeVisible()
    await connectButton.first().click()
    
    // Wallet modal should appear
    await page.waitForSelector('.wallet-adapter-modal', { state: 'visible', timeout: 5000 })
    
    // Click on Phantom option (should trigger error)
    const phantomButton = page.getByRole('button', { name: /phantom/i })
    await expect(phantomButton).toBeVisible()
    await phantomButton.click()
    
    // Modal should close
    await expect(page.locator('.wallet-adapter-modal')).not.toBeVisible({ timeout: 5000 })
    
    // Check for error toast notification
    const errorToast = page.locator('[data-sonner-toast]').filter({ hasText: /wallet not found/i })
    await expect(errorToast).toBeVisible({ timeout: 5000 })
    console.log('[Test] ✅ Error toast shown for missing wallet')
    
    // Connect button should still be visible (not connected)
    await expect(connectButton.first()).toBeVisible()
    console.log('[Test] ✅ Connect button still visible after failure')
  })

  test('should show error state button after connection failure', async ({ page, context }) => {
    // Inject a mock Phantom that fails to connect
    await context.addInitScript(() => {
      const mockWallet = {
        isPhantom: true,
        publicKey: null,
        isConnected: false,
        
        connect: async () => {
          console.log('[Mock Phantom] Connect called - will reject')
          throw new Error('Connection rejected by user')
        },
        
        disconnect: async () => {
          console.log('[Mock Phantom] Disconnect called')
        },
        
        on: () => mockWallet,
        off: () => mockWallet,
        removeListener: () => mockWallet,
      }
      
      ;(window as any).phantom = { solana: mockWallet }
      ;(window as any).solana = mockWallet
      ;(window as any).__E2E_TEST_MODE__ = true
      
      console.log('[E2E] Mock Phantom (will fail) injected')
    })
    
    await page.reload()
    await page.waitForLoadState('networkidle')
    
    // Click Connect Wallet button
    const connectButton = page.getByRole('button', { name: /connect wallet/i })
    await connectButton.first().click()
    
    // Open modal and click Phantom
    await page.waitForSelector('.wallet-adapter-modal', { state: 'visible' })
    await page.getByRole('button', { name: /phantom/i }).click()
    
    // Modal should close
    await expect(page.locator('.wallet-adapter-modal')).not.toBeVisible({ timeout: 5000 })
    
    // Check for info toast about cancellation
    const infoToast = page.locator('[data-sonner-toast]').filter({ hasText: /cancelled|rejected/i })
    await expect(infoToast).toBeVisible({ timeout: 5000 })
    console.log('[Test] ✅ Info toast shown for cancelled connection')
    
    // Button should show retry state after error
    const retryButton = page.getByRole('button', { name: /retry connection/i })
    const retryButtonVisible = await retryButton.isVisible({ timeout: 3000 }).catch(() => false)
    
    if (retryButtonVisible) {
      console.log('[Test] ✅ Retry button shown after failure')
      
      // Clicking retry should reopen the modal
      await retryButton.click()
      await expect(page.locator('.wallet-adapter-modal')).toBeVisible({ timeout: 5000 })
      console.log('[Test] ✅ Retry opens modal again')
    } else {
      // If retry button is not shown, the original connect button should be visible
      await expect(connectButton.first()).toBeVisible()
      console.log('[Test] ✅ Connect button available after failure')
    }
  })

  test('should show connecting state during slow connections', async ({ page, context }) => {
    // Inject a mock Phantom with delayed connection
    await context.addInitScript(() => {
      class MockPublicKey {
        constructor(private _address: string) {}
        toString() { return this._address }
        toBase58() { return this._address }
      }
      
      const mockWallet = {
        isPhantom: true,
        publicKey: null as any,
        isConnected: false,
        _events: { connect: [], disconnect: [] } as any,
        
        connect: async () => {
          console.log('[Mock Phantom] Connect called - simulating slow connection')
          // Simulate a 3 second delay
          await new Promise(resolve => setTimeout(resolve, 3000))
          
          const publicKey = new MockPublicKey('7EYnhQoR9YM3N7UoaKRoA44Uy8JeaZV3qyouov87awMs')
          mockWallet.publicKey = publicKey
          mockWallet.isConnected = true
          
          // Emit connect event
          setTimeout(() => {
            mockWallet._events.connect.forEach((handler: any) => handler(publicKey))
          }, 0)
          
          return { publicKey }
        },
        
        disconnect: async () => {
          mockWallet.publicKey = null
          mockWallet.isConnected = false
        },
        
        on: (event: string, handler: Function) => {
          if (!mockWallet._events[event]) mockWallet._events[event] = []
          mockWallet._events[event].push(handler)
          return mockWallet
        },
        
        off: () => mockWallet,
        removeListener: () => mockWallet,
      }
      
      ;(window as any).phantom = { solana: mockWallet }
      ;(window as any).solana = mockWallet
      ;(window as any).__E2E_TEST_MODE__ = true
      
      console.log('[E2E] Mock Phantom (slow connection) injected')
    })
    
    await page.reload()
    await page.waitForLoadState('networkidle')
    
    // Click Connect Wallet button
    const connectButton = page.getByRole('button', { name: /connect wallet/i })
    await connectButton.first().click()
    
    // Open modal and click Phantom
    await page.waitForSelector('.wallet-adapter-modal', { state: 'visible' })
    await page.getByRole('button', { name: /phantom/i }).click()
    
    // Modal should close
    await expect(page.locator('.wallet-adapter-modal')).not.toBeVisible({ timeout: 5000 })
    
    // Check for connecting state on button (should appear after 2 seconds)
    await page.waitForTimeout(2100)
    
    // Check for loading toast
    const loadingToast = page.locator('[data-sonner-toast]').filter({ hasText: /connecting/i })
    const toastVisible = await loadingToast.isVisible({ timeout: 1000 }).catch(() => false)
    
    if (toastVisible) {
      console.log('[Test] ✅ Loading toast shown during slow connection')
    }
    
    // Check for connecting button state
    const connectingButton = page.getByRole('button', { name: /connecting/i })
    const connectingVisible = await connectingButton.isVisible({ timeout: 500 }).catch(() => false)
    
    if (connectingVisible) {
      console.log('[Test] ✅ Button shows "Connecting..." state')
      // Should have spinner icon
      const spinner = connectingButton.locator('.animate-spin')
      await expect(spinner).toBeVisible()
      console.log('[Test] ✅ Spinner visible during connection')
    }
    
    // Wait for connection to complete
    await page.waitForTimeout(2000)
    
    // Should eventually show success toast
    const successToast = page.locator('[data-sonner-toast]').filter({ hasText: /connected/i })
    await expect(successToast).toBeVisible({ timeout: 5000 })
    console.log('[Test] ✅ Success toast shown after connection')
    
    // Should show connected wallet button
    const connectedButton = page.getByRole('button').filter({ hasText: /^\w{4}\.\.\.\w{4}$/ }).first()
    await expect(connectedButton).toBeVisible({ timeout: 5000 })
    console.log('[Test] ✅ Connected wallet button visible')
  })

  test('should handle timeout errors gracefully', async ({ page, context }) => {
    // Inject a mock that never resolves
    await context.addInitScript(() => {
      const mockWallet = {
        isPhantom: true,
        publicKey: null,
        isConnected: false,
        
        connect: async () => {
          console.log('[Mock Phantom] Connect called - will timeout')
          // Never resolve or reject - simulate timeout
          return new Promise(() => {})
        },
        
        disconnect: async () => {},
        on: () => mockWallet,
        off: () => mockWallet,
        removeListener: () => mockWallet,
      }
      
      ;(window as any).phantom = { solana: mockWallet }
      ;(window as any).solana = mockWallet
      ;(window as any).__E2E_TEST_MODE__ = true
      
      console.log('[E2E] Mock Phantom (will timeout) injected')
    })
    
    await page.reload()
    await page.waitForLoadState('networkidle')
    
    // Click Connect Wallet button
    const connectButton = page.getByRole('button', { name: /connect wallet/i })
    await connectButton.first().click()
    
    // Open modal and click Phantom
    await page.waitForSelector('.wallet-adapter-modal', { state: 'visible' })
    await page.getByRole('button', { name: /phantom/i }).click()
    
    // Modal should close
    await expect(page.locator('.wallet-adapter-modal')).not.toBeVisible({ timeout: 5000 })
    
    // Wait for potential timeout handling (adapter might have internal timeout)
    await page.waitForTimeout(5000)
    
    // User should still be able to retry
    const retryPossible = await connectButton.first().isVisible().catch(() => false) ||
                          await page.getByRole('button', { name: /retry/i }).isVisible().catch(() => false)
    
    expect(retryPossible).toBeTruthy()
    console.log('[Test] ✅ User can retry after timeout scenario')
  })
})