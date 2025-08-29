import { test, expect } from '@playwright/test'

/**
 * TC-001: Connect Wallet via Modal
 * 
 * Test the complete wallet connection flow from homepage.
 * Reference: docs/regression-tests.md lines 38-66
 * 
 * IMPORTANT: This test uses a mock Phantom wallet to simulate connection
 */
test.describe('TC-001: Connect Wallet via Modal', () => {
  test.beforeEach(async ({ page, context }) => {
    // Inject mock Phantom wallet at the context level so it's available immediately
    await context.addInitScript(() => {
      // Create mock PublicKey class similar to Solana's
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
          return new Uint8Array(32).fill(1)
        }
        
        equals(other: any) {
          return other && other.toString() === this._address
        }
      }
      
      // Create a mock Phantom wallet that matches the real interface
      const mockWallet = {
        isPhantom: true,
        publicKey: null as any,
        isConnected: false,
        
        connect: async (opts?: { onlyIfTrusted?: boolean }) => {
          console.log('[Mock Phantom] Connect called with options:', opts)
          
          // Don't auto-connect on page load if onlyIfTrusted is true
          if (opts?.onlyIfTrusted && !mockWallet.isConnected) {
            console.log('[Mock Phantom] Skipping auto-connect (onlyIfTrusted=true)')
            return { publicKey: null }
          }
          
          // Simulate connection delay
          await new Promise(resolve => setTimeout(resolve, 100))
          
          // Create mock public key
          const publicKey = new MockPublicKey('7EYnhQoR9YM3N7UoaKRoA44Uy8JeaZV3qyouov87awMs')
          
          mockWallet.publicKey = publicKey
          mockWallet.isConnected = true
          
          console.log('[Mock Phantom] Connected with address:', publicKey.toString())
          
          // Emit connect event - this is crucial for the adapter to know we're connected
          setTimeout(() => {
            if (mockWallet._events && mockWallet._events.connect) {
              console.log('[Mock Phantom] Emitting connect event')
              mockWallet._events.connect.forEach((handler: any) => handler(publicKey))
            }
          }, 0)
          
          return { publicKey }
        },
        
        disconnect: async () => {
          console.log('[Mock Phantom] Disconnect called')
          mockWallet.publicKey = null
          mockWallet.isConnected = false
          
          // Emit disconnect event
          if (mockWallet._events && mockWallet._events.disconnect) {
            mockWallet._events.disconnect.forEach((handler: any) => handler())
          }
        },
        
        signTransaction: async (transaction: any) => {
          console.log('[Mock Phantom] Sign transaction called')
          if (!mockWallet.isConnected) throw new Error('Wallet not connected')
          return transaction
        },
        
        signAllTransactions: async (transactions: any[]) => {
          console.log('[Mock Phantom] Sign all transactions called')
          if (!mockWallet.isConnected) throw new Error('Wallet not connected')
          return transactions
        },
        
        signMessage: async (message: Uint8Array) => {
          console.log('[Mock Phantom] Sign message called')
          if (!mockWallet.isConnected) throw new Error('Wallet not connected')
          return { signature: new Uint8Array(64).fill(0), publicKey: mockWallet.publicKey }
        },
        
        signAndSendTransaction: async (transaction: any) => {
          console.log('[Mock Phantom] Sign and send transaction called')
          if (!mockWallet.isConnected) throw new Error('Wallet not connected')
          return { signature: 'mock_signature_' + Date.now() }
        },
        
        // Event handling
        _events: {
          connect: [] as any[],
          disconnect: [] as any[],
          accountChanged: [] as any[]
        },
        
        on: (event: string, handler: Function) => {
          console.log('[Mock Phantom] Event listener added:', event)
          if (!mockWallet._events[event as keyof typeof mockWallet._events]) {
            mockWallet._events[event as keyof typeof mockWallet._events] = []
          }
          mockWallet._events[event as keyof typeof mockWallet._events].push(handler)
          return mockWallet
        },
        
        off: (event: string, handler: Function) => {
          console.log('[Mock Phantom] Event listener removed:', event)
          const handlers = mockWallet._events[event as keyof typeof mockWallet._events]
          if (handlers) {
            const index = handlers.indexOf(handler)
            if (index > -1) handlers.splice(index, 1)
          }
          return mockWallet
        },
        
        removeListener: (event: string, handler: Function) => {
          return mockWallet.off(event, handler)
        },
        
        // Phantom also exposes these
        request: async (method: any) => {
          console.log('[Mock Phantom] Request called:', method)
          if (method.method === 'connect') {
            return mockWallet.connect()
          }
          return null
        }
      }
      
      // Inject into window in all the places Phantom might be checked
      // IMPORTANT: PhantomWalletAdapter checks window.phantom.solana
      ;(window as any).phantom = { 
        solana: mockWallet,
        ethereum: null // Phantom also has ethereum support
      }
      ;(window as any).solana = mockWallet
      
      // Set E2E test mode flag for debug logging
      ;(window as any).__E2E_TEST_MODE__ = true
      
      // Store reference for debugging
      ;(window as any).__mockPhantom = mockWallet
      
      // Make sure isPhantom is always true
      Object.defineProperty(mockWallet, 'isPhantom', {
        value: true,
        writable: false,
        configurable: false
      })
      
      // Trigger a custom event that some adapters listen for
      setTimeout(() => {
        window.dispatchEvent(new Event('wallet-standard:app-ready'))
      }, 0)
      
      console.log('[E2E] Mock Phantom wallet injected successfully')
      console.log('[E2E] window.phantom.solana:', (window as any).phantom?.solana)
      console.log('[E2E] window.phantom.solana.isPhantom:', (window as any).phantom?.solana?.isPhantom)
      console.log('[E2E] window.solana.isPhantom:', (window as any).solana?.isPhantom)
    })
    
    // Navigate to homepage
    await page.goto('/')
    
    // Wait for page to fully load
    await page.waitForLoadState('networkidle')
  })

  test('should complete full wallet connection flow', async ({ page }) => {
    // Enable console logging to debug
    page.on('console', msg => {
      console.log(`[Browser ${msg.type()}]:`, msg.text())
    })
    
    // Prerequisites: User not connected, app loaded on home page
    const connectButton = page.getByRole('button', { name: /connect wallet/i })
    await expect(connectButton.first()).toBeVisible()
    
    // Step 1-2: Click Connect Wallet button
    console.log('[Test] Clicking Connect Wallet button...')
    await connectButton.first().click()
    
    // Step 3: Verify wallet modal appears with animation
    await page.waitForSelector('.wallet-adapter-modal', { state: 'visible', timeout: 5000 })
    const modal = page.locator('.wallet-adapter-modal')
    await expect(modal).toBeVisible()
    await expect(modal).toHaveCSS('opacity', '1') // Animation complete
    console.log('[Test] Wallet modal opened')
    
    // Step 4: Verify Phantom is displayed
    const phantomButton = page.getByRole('button', { name: /phantom/i })
    await expect(phantomButton).toBeVisible()
    console.log('[Test] Phantom wallet option visible')
    
    // Check if it shows "Detected" (meaning our mock is recognized)
    const detectedText = await page.locator('.wallet-adapter-modal').getByText('Detected').isVisible().catch(() => false)
    if (detectedText) {
      console.log('[Test] ✓ Phantom wallet detected by adapter!')
    }
    
    // Verify modal has close button (X) visible
    const closeButton = page.locator('.wallet-adapter-modal-button-close')
    await expect(closeButton).toBeVisible()
    
    // Step 5-6: Click on Phantom and verify connection
    console.log('[Test] Clicking Phantom wallet...')
    await phantomButton.click()
    
    // The wallet adapter should select Phantom and trigger auto-connect
    // Wait for modal to close after successful connection
    await expect(modal).not.toBeVisible({ timeout: 5000 })
    console.log('[Test] ✅ Modal closed after clicking Phantom')
    
    // Wait for React to update UI after connection
    await page.waitForTimeout(1000)
    
    // CRITICAL CHECK: Verify the Connect Wallet button is GONE
    // and has been replaced with a connected wallet button
    const originalConnectButton = page.getByRole('button', { name: /^Connect Wallet$/i })
    
    // Check if the original button is still visible
    const connectButtonStillVisible = await originalConnectButton.isVisible().catch(() => false)
    
    if (connectButtonStillVisible) {
      console.log('[Test] ❌ PROBLEM: "Connect Wallet" button is still visible!')
      console.log('[Test] This means the connection did NOT succeed.')
      console.log('[Test] The modal closed but the wallet did not actually connect.')
      
      // Let's check what errors might have occurred
      const errors = await page.locator('text=/error|failed/i').allTextContents()
      if (errors.length > 0) {
        console.log('[Test] Errors found:', errors)
      }
      
      throw new Error('Wallet connection failed - "Connect Wallet" button still visible after modal closed')
    }
    
    console.log('[Test] ✅ Original "Connect Wallet" button is gone!')
    
    // Now check for the new connected wallet button
    // Look specifically for a button with the truncated address format
    const connectedWalletButton = page.getByRole('button').filter({ hasText: /^\w{4}\.\.\.\w{4}$/ }).first()
    
    // This button MUST be visible if connection succeeded
    await expect(connectedWalletButton).toBeVisible({ timeout: 5000 })
    console.log('[Test] ✅ Connected wallet button is now visible!')
    
    // Verify we can interact with the connected wallet button
    await connectedWalletButton.click()
    
    // Should show dropdown with disconnect option
    const dropdownMenu = page.locator('[role="menu"]').or(
      page.locator('.dropdown-menu-content')
    ).or(
      page.getByText(/Disconnect|Copy Address|Switch Wallet/i).locator('..')
    )
    
    await expect(dropdownMenu).toBeVisible({ timeout: 3000 })
    console.log('[Test] ✅ Wallet dropdown menu opens!')
    
    // Check for disconnect option in dropdown
    const disconnectOption = page.getByText(/Disconnect/i)
    await expect(disconnectOption).toBeVisible()
    console.log('[Test] ✅ Disconnect option available in dropdown!')
    
    // Close dropdown
    await page.keyboard.press('Escape')
    
    // Also check for WalletInfo component on homepage (optional but good to have)
    const walletInfo = page.locator('[data-testid="wallet-info"]')
    const walletInfoVisible = await walletInfo.isVisible({ timeout: 2000 }).catch(() => false)
    if (walletInfoVisible) {
      console.log('[Test] ✅ WalletInfo component also displayed!')
    }
    
    console.log('[Test] ✅✅✅ TC-001 PASSED: Wallet successfully connected!')
    console.log('[Test] Summary:')
    console.log('[Test]   1. Modal closed after connection ✅')
    console.log('[Test]   2. "Connect Wallet" button replaced ✅')
    console.log('[Test]   3. Connected wallet button visible ✅')
    console.log('[Test]   4. Dropdown menu functional ✅')
    console.log('[Test]   5. Disconnect option available ✅')
  })

  test('should handle modal close interactions', async ({ page }) => {
    // Open wallet modal
    await page.getByRole('button', { name: /connect wallet/i }).first().click()
    await page.waitForSelector('.wallet-adapter-modal', { state: 'visible', timeout: 5000 })
    
    const modal = page.locator('.wallet-adapter-modal')
    
    // Test 1: Click X button should close modal
    const closeButton = page.locator('.wallet-adapter-modal-button-close')
    await closeButton.click()
    await expect(modal).not.toBeVisible()
    console.log('[Test] ✓ X button closes modal')
    
    // Re-open modal for next test
    await page.getByRole('button', { name: /connect wallet/i }).first().click()
    await page.waitForSelector('.wallet-adapter-modal', { state: 'visible', timeout: 5000 })
    
    // Test 2: ESC key should close modal
    await page.keyboard.press('Escape')
    await expect(modal).not.toBeVisible()
    console.log('[Test] ✓ ESC key closes modal')
    
    console.log('[Test] ✅ Modal close interactions test complete!')
  })
})