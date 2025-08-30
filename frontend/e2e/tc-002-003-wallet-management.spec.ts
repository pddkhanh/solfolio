import { test, expect, Page } from '@playwright/test'
import { TEST_WALLETS, abbreviateAddress } from './fixtures/test-wallets'

/**
 * TC-002 & TC-003: Wallet Management (Disconnect and Switch)
 * 
 * Complete E2E test flows for wallet disconnection and switching functionality
 * Reference: docs/regression-tests.md lines 68-106
 * 
 * These tests verify the wallet dropdown menu functionality including:
 * - Disconnecting a connected wallet
 * - Switching between different wallets
 * - Proper UI state updates after wallet changes
 */

// Helper to inject mock wallet with switchable behavior (kept for reference but not used)
// The original injectMockWallet function has been commented out since we're using simpler inline mocks
/*
async function injectMockWallet(page: Page, walletType: 'phantom' | 'solflare' = 'phantom') {
  await page.addInitScript((config) => {
    // Set E2E test mode flag
    (window as any).__E2E_TEST_MODE__ = true
    
    // Create mock PublicKey class
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
        // Return a Uint8Array for compatibility
        const bytes = new Uint8Array(32)
        for (let i = 0; i < 32; i++) {
          bytes[i] = i
        }
        return bytes
      }
      
      equals(other: any) {
        return this._address === other?.toString()
      }
    }
    
    // Define wallet addresses based on type
    const walletAddresses = {
      phantom: '8BsE6Pts5DwuHqjrefTtzd9THkttVJtUMAXecg9J9xer',
      solflare: 'So1f1areWa11etAddressF0rTesting123456789ABC'
    }
    
    // Create mock wallet with configurable behavior
    const createMockWallet = (type: string, address: string) => ({
      isPhantom: type === 'phantom',
      isSolflare: type === 'solflare',
      publicKey: null as any,
      connected: false,
      connecting: false,
      disconnecting: false,
      walletType: type,
      
      connect: async function() {
        console.log(`[E2E Mock ${type}] Connect called`)
        
        this.connecting = true
        
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 500))
        
        // Create test wallet address
        this.publicKey = new MockPublicKey(address)
        this.connected = true
        this.connecting = false
        
        console.log(`[E2E Mock ${type}] Connected with address:`, this.publicKey.toString())
        
        // Store connection state
        localStorage.setItem('walletConnected', 'true')
        localStorage.setItem('walletType', type)
        
        return { publicKey: this.publicKey }
      },
      
      disconnect: async function() {
        console.log(`[E2E Mock ${type}] Disconnect called`)
        
        this.disconnecting = true
        
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 300))
        
        this.publicKey = null
        this.connected = false
        this.connecting = false
        this.disconnecting = false
        
        // Clear connection state
        localStorage.removeItem('walletConnected')
        localStorage.removeItem('walletType')
        
        console.log(`[E2E Mock ${type}] Disconnected`)
      },
      
      signTransaction: async (tx: any) => tx,
      signAllTransactions: async (txs: any[]) => txs,
      signMessage: async (_msg: any) => ({ 
        signature: new Uint8Array(64), 
        publicKey: null 
      }),
      
      on: () => {},
      off: () => {},
      removeAllListeners: () => {}
    })
    
    // Create both wallet mocks
    const phantomWallet = createMockWallet('phantom', walletAddresses.phantom)
    const solflareWallet = createMockWallet('solflare', walletAddresses.solflare)
    
    // Set initial wallet based on config
    const initialWallet = config.walletType === 'solflare' ? solflareWallet : phantomWallet
    
    // Inject wallets into window
    ;(window as any).phantom = { solana: phantomWallet }
    ;(window as any).solflare = { solana: solflareWallet }  // Solflare also uses solana property
    ;(window as any).solana = initialWallet
    ;(window as any).mockWallet = initialWallet // Expose for test manipulation
    ;(window as any).mockPhantom = phantomWallet // Expose phantom for switching
    ;(window as any).mockSolflare = solflareWallet // Expose solflare for switching
    
    console.log(`[E2E] Mock wallets injected successfully, initial: ${config.walletType}`)
  }, { walletType })
}
*/

// Helper to connect wallet
async function connectWallet(page: Page, walletName: string = 'Phantom') {
  console.log(`Connecting to ${walletName} wallet...`)
  
  // Click Connect Wallet button
  await page.getByRole('button', { name: 'Connect Wallet' }).first().click()
  await page.waitForTimeout(500)
  
  // Wait for modal and click wallet option
  await expect(page.getByText('Connect Your Wallet')).toBeVisible()
  await page.getByRole('button', { name: new RegExp(walletName, 'i') }).click()
  
  // Wait for connection to complete
  await page.waitForTimeout(1500)
  
  // Verify wallet connected - check for address pattern
  await expect(page.getByText(/\w{4,}\.{3}\w{4,}/)).toBeVisible({ timeout: 10000 })
  
  // Debug: Log the actual connected address
  const connectedAddress = await page.evaluate(() => {
    const wallet = (window as any).mockWallet || (window as any).solana
    return wallet?.publicKey?.toString() || 'No wallet found'
  })
  console.log(`${walletName} wallet connected with address: ${connectedAddress}`)
}

// Helper to verify wallet disconnected state
async function verifyDisconnectedState(page: Page) {
  // Wait a bit for UI to update
  await page.waitForTimeout(500)
  
  // Verify Connect Wallet button is visible
  await expect(page.getByRole('button', { name: 'Connect Wallet' }).first()).toBeVisible()
  
  // Verify wallet info is not displayed on homepage
  const walletInfo = page.locator('[data-testid="wallet-info"]')
  await expect(walletInfo).not.toBeVisible()
  
  // The wallet dropdown button should not be visible
  const dropdownButton = page.getByTestId('wallet-dropdown-button')
  await expect(dropdownButton).not.toBeVisible()
  
  // Verify localStorage cleared or set to false
  const walletConnected = await page.evaluate(() => {
    return localStorage.getItem('walletConnected')
  })
  expect(walletConnected === null || walletConnected === 'false').toBeTruthy()
}

// Helper to verify connected wallet state
async function verifyConnectedState(page: Page, walletName: string, expectedAddress?: string) {
  // Verify wallet address is displayed in header
  await expect(page.getByText(/\w{4,}\.{3}\w{4,}/)).toBeVisible()
  
  // Verify wallet info on homepage - it's in the CardDescription
  const walletInfo = page.locator('[data-testid="wallet-info"]')
  if (await walletInfo.isVisible({ timeout: 1000 }).catch(() => false)) {
    await expect(walletInfo.getByText(`Connected with ${walletName}`)).toBeVisible()
  }
  
  // If expected address provided, verify it matches
  if (expectedAddress) {
    const abbreviatedAddress = abbreviateAddress(expectedAddress)
    await expect(page.getByText(abbreviatedAddress)).toBeVisible()
  }
  
  // Verify localStorage has connection state
  const walletConnected = await page.evaluate(() => {
    return localStorage.getItem('walletConnected')
  })
  expect(walletConnected).toBe('true')
}

test.describe('TC-002: Disconnect Wallet', () => {
  test.beforeEach(async ({ page }) => {
    // Use the same mock injection approach as TC-001
    await page.addInitScript(() => {
      // Set E2E test mode flag
      (window as any).__E2E_TEST_MODE__ = true
      
      // Create mock PublicKey class
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
          // Return a Uint8Array for compatibility
          const bytes = new Uint8Array(32)
          for (let i = 0; i < 32; i++) {
            bytes[i] = i
          }
          return bytes
        }
        
        equals(other: any) {
          return this._address === other?.toString()
        }
      }
      
      // Create mock wallet with configurable behavior
      const mockWallet = {
        isPhantom: true,
        publicKey: null as any,
        connected: false,
        connecting: false,
        
        connect: async function() {
          console.log('[E2E Mock Wallet] Connect called')
          
          this.connecting = true
          
          // Simulate network delay
          await new Promise(resolve => setTimeout(resolve, 500))
          
          // Create test wallet address - same as TC-001
          this.publicKey = new MockPublicKey('8BsE6Pts5DwuHqjrefTtzd9THkttVJtUMAXecg9J9xer')
          this.connected = true
          this.connecting = false
          
          console.log('[E2E Mock Wallet] Connected with address:', this.publicKey.toString())
          
          // Store connection state
          localStorage.setItem('walletConnected', 'true')
          
          return { publicKey: this.publicKey }
        },
        
        disconnect: async function() {
          console.log('[E2E Mock Wallet] Disconnect called')
          
          // Simulate network delay
          await new Promise(resolve => setTimeout(resolve, 300))
          
          this.publicKey = null
          this.connected = false
          this.connecting = false
          
          // Clear connection state
          localStorage.removeItem('walletConnected')
          
          console.log('[E2E Mock Wallet] Disconnected')
        },
        
        signTransaction: async (tx: any) => tx,
        signAllTransactions: async (txs: any[]) => txs,
        signMessage: async (_msg: any) => ({ 
          signature: new Uint8Array(64), 
          publicKey: mockWallet.publicKey 
        }),
        
        on: () => {},
        off: () => {},
        removeAllListeners: () => {}
      }
      
      // Inject into window - same as TC-001
      ;(window as any).phantom = { solana: mockWallet }
      ;(window as any).solana = mockWallet
      ;(window as any).mockWallet = mockWallet // Expose for test manipulation
      
      console.log('[E2E] Mock wallet injected successfully')
    })
    
    // Navigate to homepage
    await page.goto('http://localhost:3000')
    
    // Wait for app to load
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1000)
    
    // Connect wallet first (prerequisite)
    await connectWallet(page, 'Phantom')
  })
  
  test('should disconnect wallet through dropdown menu', async ({ page }) => {
    console.log('Testing wallet disconnect flow...')
    
    // Step 1: Click on connected wallet button in header to open dropdown
    console.log('Opening wallet dropdown...')
    const walletButton = page.getByTestId('wallet-dropdown-button')
    await expect(walletButton).toBeVisible()
    await walletButton.click()
    
    // Step 2: Verify dropdown menu appears with expected options
    console.log('Verifying dropdown menu options...')
    await expect(page.getByText('Connected Wallet')).toBeVisible()
    // Look for Phantom in dropdown content specifically
    const dropdownContent = page.locator('[role="menu"]')
    await expect(dropdownContent.getByText('Phantom')).toBeVisible()
    await expect(page.getByText('Copy Address')).toBeVisible()
    await expect(page.getByText('Switch Wallet')).toBeVisible()
    await expect(page.getByText('Disconnect')).toBeVisible()
    
    // Verify wallet address is shown in dropdown (look specifically in the dropdown content)
    await expect(dropdownContent.locator('.font-mono').filter({ hasText: /\w{4,}\.{3}\w{4,}/ })).toBeVisible()
    
    // Step 3: Click Disconnect option
    console.log('Clicking Disconnect...')
    await page.getByText('Disconnect').click()
    
    // Step 4: Wait for disconnection to complete
    await page.waitForTimeout(1000)
    
    // Debug: Check what's on the page after disconnect
    const walletConnectedAfter = await page.evaluate(() => {
      const wallet = (window as any).mockWallet || (window as any).solana
      return {
        connected: wallet?.connected,
        publicKey: wallet?.publicKey?.toString(),
        localStorage: localStorage.getItem('walletConnected')
      }
    })
    console.log('Wallet state after disconnect:', walletConnectedAfter)
    
    // Step 5: Verify disconnection - returns to "Connect Wallet" button
    console.log('Verifying disconnection...')
    await verifyDisconnectedState(page)
    
    // Step 6: Verify portfolio page shows connect prompt if navigated to
    console.log('Navigating to portfolio page...')
    await page.goto('http://localhost:3000/portfolio')
    await page.waitForLoadState('networkidle')
    
    // Should see connect prompt on portfolio page - be specific about which one
    const portfolioMain = page.getByRole('main')
    await expect(portfolioMain.getByText(/connect.*wallet.*to view/i)).toBeVisible()
    
    console.log('TC-002: Disconnect wallet test completed successfully!')
  })
  
  test('should handle copy address before disconnecting', async ({ page }) => {
    console.log('Testing copy address functionality...')
    
    // Open dropdown
    const walletButton = page.getByTestId('wallet-dropdown-button')
    await walletButton.click()
    
    // Click Copy Address
    console.log('Clicking Copy Address...')
    
    // Grant clipboard permissions for the test
    await page.context().grantPermissions(['clipboard-read', 'clipboard-write'])
    
    await page.getByText('Copy Address').click()
    
    // Small wait for the copy action to complete
    await page.waitForTimeout(1000)
    
    // The dropdown might close after copy, so reopen it
    const dropdownVisible = await page.locator('[role="menu"]').isVisible().catch(() => false)
    if (!dropdownVisible) {
      await walletButton.click()
    }
    
    // Now disconnect
    await page.getByText('Disconnect').click()
    await page.waitForTimeout(500)
    
    // Verify disconnected
    await verifyDisconnectedState(page)
    
    console.log('Copy address before disconnect test completed!')
  })
})

test.describe('TC-003: Switch Between Wallets', () => {
  test.beforeEach(async ({ page }) => {
    // Use the same simple mock as TC-001/TC-002
    await page.addInitScript(() => {
      // Set E2E test mode flag
      (window as any).__E2E_TEST_MODE__ = true
      
      // Create mock PublicKey class
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
          const bytes = new Uint8Array(32)
          for (let i = 0; i < 32; i++) {
            bytes[i] = i
          }
          return bytes
        }
        
        equals(other: any) {
          return this._address === other?.toString()
        }
      }
      
      // Track current wallet type
      let currentWalletType = 'phantom'
      
      // Create mock wallet
      const mockWallet = {
        isPhantom: true,
        publicKey: null as any,
        connected: false,
        connecting: false,
        
        connect: async function() {
          console.log('[E2E Mock Wallet] Connect called')
          
          this.connecting = true
          await new Promise(resolve => setTimeout(resolve, 500))
          
          // Use different addresses for different wallets
          const address = currentWalletType === 'solflare' 
            ? 'So1f1areWa11etAddressF0rTesting123456789ABC'
            : '8BsE6Pts5DwuHqjrefTtzd9THkttVJtUMAXecg9J9xer'
          
          this.publicKey = new MockPublicKey(address)
          this.connected = true
          this.connecting = false
          
          console.log('[E2E Mock Wallet] Connected with address:', this.publicKey.toString())
          localStorage.setItem('walletConnected', 'true')
          localStorage.setItem('walletType', currentWalletType)
          
          return { publicKey: this.publicKey }
        },
        
        disconnect: async function() {
          console.log('[E2E Mock Wallet] Disconnect called')
          
          await new Promise(resolve => setTimeout(resolve, 300))
          
          this.publicKey = null
          this.connected = false
          this.connecting = false
          
          localStorage.removeItem('walletConnected')
          localStorage.removeItem('walletType')
          
          console.log('[E2E Mock Wallet] Disconnected')
        },
        
        // Method to switch wallet type (for testing)
        switchToSolflare: function() {
          currentWalletType = 'solflare'
          this.isPhantom = false
          ;(this as any).isSolflare = true
        },
        
        switchToPhantom: function() {
          currentWalletType = 'phantom'
          this.isPhantom = true
          ;(this as any).isSolflare = false
        },
        
        signTransaction: async (tx: any) => tx,
        signAllTransactions: async (txs: any[]) => txs,
        signMessage: async (_msg: any) => ({ 
          signature: new Uint8Array(64), 
          publicKey: mockWallet.publicKey 
        }),
        
        on: () => {},
        off: () => {},
        removeAllListeners: () => {}
      }
      
      // Inject wallet
      ;(window as any).phantom = { solana: mockWallet }
      ;(window as any).solana = mockWallet
      ;(window as any).mockWallet = mockWallet
      
      console.log('[E2E] Mock wallet injected for switching tests')
    })
    
    // Navigate to homepage
    await page.goto('http://localhost:3000')
    
    // Wait for app to load
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1000)
    
    // Connect to Phantom first (prerequisite - Wallet A)
    await connectWallet(page, 'Phantom')
  })
  
  test('should switch from Phantom to Solflare wallet', async ({ page }) => {
    console.log('Testing wallet switch flow...')
    
    // Step 1: Verify initial state - connected to Phantom
    console.log('Verifying initial Phantom connection...')
    await verifyConnectedState(page, 'Phantom', '8BsE6Pts5DwuHqjrefTtzd9THkttVJtUMAXecg9J9xer')
    
    // Step 2: Click connected wallet button to open dropdown
    console.log('Opening wallet dropdown...')
    const walletButton = page.getByTestId('wallet-dropdown-button')
    await walletButton.click()
    
    // Step 3: Select "Switch Wallet" from dropdown
    console.log('Clicking Switch Wallet...')
    await expect(page.getByText('Switch Wallet')).toBeVisible()
    await page.getByText('Switch Wallet').click()
    
    // Step 4: Verify wallet modal reopens
    console.log('Verifying wallet modal reopened...')
    await page.waitForTimeout(500)
    await expect(page.getByText('Connect Your Wallet')).toBeVisible()
    
    // Verify all wallet options are shown again
    await expect(page.getByText('Phantom')).toBeVisible()
    await expect(page.getByText('Solflare')).toBeVisible()
    await expect(page.getByText('Ledger')).toBeVisible()
    await expect(page.getByText('Torus')).toBeVisible()
    
    // Step 5: Select different wallet (Solflare - Wallet B)
    console.log('Selecting Solflare wallet...')
    
    // Update the mock to use Solflare
    await page.evaluate(() => {
      const mockWallet = (window as any).mockWallet
      if (mockWallet) {
        mockWallet.switchToSolflare()
      }
    })
    
    await page.getByRole('button', { name: /Solflare/i }).click()
    
    // Step 6: Wait for new wallet connection
    console.log('Waiting for Solflare connection...')
    await page.waitForTimeout(1500)
    
    // Step 7: Verify new wallet is connected
    console.log('Verifying Solflare connection...')
    
    // Verify new wallet address displays (Solflare address pattern)
    await expect(page.getByText(/So1f.*9ABC/)).toBeVisible({ timeout: 10000 })
    
    // Verify wallet info shows Solflare
    const walletInfo = page.locator('[data-testid="wallet-info"]')
    if (await walletInfo.isVisible({ timeout: 1000 }).catch(() => false)) {
      await expect(walletInfo.getByText('Connected with Solflare')).toBeVisible()
    }
    
    // Step 8: Verify old wallet (Phantom) is disconnected
    console.log('Verifying Phantom is disconnected...')
    await expect(page.getByText('8BsE...9xer')).not.toBeVisible()
    
    // Step 9: Open dropdown to verify new wallet info
    console.log('Verifying dropdown shows Solflare info...')
    await page.getByTestId('wallet-dropdown-button').click()
    await expect(page.getByText('Solflare')).toBeVisible()
    await expect(page.locator('.font-mono').filter({ hasText: /So1f.*9ABC/ })).toBeVisible()
    
    console.log('TC-003: Switch wallet test completed successfully!')
  })
  
  test('should handle switch wallet cancellation', async ({ page }) => {
    console.log('Testing switch wallet cancellation...')
    
    // Open dropdown and click Switch Wallet
    const walletButton = page.getByTestId('wallet-dropdown-button')
    await walletButton.click()
    await page.getByText('Switch Wallet').click()
    
    // Wait for modal
    await page.waitForTimeout(500)
    await expect(page.getByText('Connect Your Wallet')).toBeVisible()
    
    // Cancel by pressing ESC
    console.log('Cancelling wallet switch with ESC...')
    await page.keyboard.press('Escape')
    
    // Verify modal closed
    await expect(page.getByText('Connect Your Wallet')).not.toBeVisible()
    
    // Verify still connected to original wallet (Phantom)
    console.log('Verifying still connected to Phantom...')
    await verifyConnectedState(page, 'Phantom')
    
    console.log('Switch wallet cancellation test completed!')
  })
  
  test('should maintain wallet state after page refresh during switch', async ({ page }) => {
    console.log('Testing wallet persistence during switch...')
    
    // Switch to Solflare
    const walletButton = page.getByTestId('wallet-dropdown-button')
    await walletButton.click()
    await page.getByText('Switch Wallet').click()
    await page.waitForTimeout(500)
    
    // Update mock to Solflare
    await page.evaluate(() => {
      const mockWallet = (window as any).mockWallet
      if (mockWallet) {
        mockWallet.switchToSolflare()
      }
    })
    
    await page.getByRole('button', { name: /Solflare/i }).click()
    await page.waitForTimeout(1500)
    
    // Verify Solflare connected
    const walletInfo = page.locator('[data-testid="wallet-info"]')
    if (await walletInfo.isVisible({ timeout: 1000 }).catch(() => false)) {
      await expect(walletInfo.getByText('Connected with Solflare')).toBeVisible()
    }
    
    // Reload page
    console.log('Reloading page...')
    await page.reload()
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1000)
    
    // Verify wallet persisted (though mock won't persist, connection state should)
    const walletConnected = await page.evaluate(() => {
      return localStorage.getItem('walletConnected')
    })
    expect(walletConnected).toBe('true')
    
    console.log('Wallet persistence during switch test completed!')
  })
})

test.describe('TC-002 & TC-003: Combined Flow', () => {
  test('should complete full wallet management journey', async ({ page }) => {
    console.log('Testing complete wallet management flow...')
    
    // Setup: Use simple mock wallet like other tests
    await page.addInitScript(() => {
      (window as any).__E2E_TEST_MODE__ = true
      
      class MockPublicKey {
        private _address: string
        constructor(address: string) {
          this._address = address
        }
        toString() { return this._address }
        toBase58() { return this._address }
        toBytes() { return new Uint8Array(32) }
        equals(other: any) { return this._address === other?.toString() }
      }
      
      let currentWalletType = 'phantom'
      const mockWallet = {
        isPhantom: true,
        publicKey: null as any,
        connected: false,
        connecting: false,
        
        connect: async function() {
          this.connecting = true
          await new Promise(resolve => setTimeout(resolve, 500))
          const address = currentWalletType === 'solflare' 
            ? 'So1f1areWa11etAddressF0rTesting123456789ABC'
            : '8BsE6Pts5DwuHqjrefTtzd9THkttVJtUMAXecg9J9xer'
          this.publicKey = new MockPublicKey(address)
          this.connected = true
          this.connecting = false
          localStorage.setItem('walletConnected', 'true')
          return { publicKey: this.publicKey }
        },
        
        disconnect: async function() {
          await new Promise(resolve => setTimeout(resolve, 300))
          this.publicKey = null
          this.connected = false
          localStorage.removeItem('walletConnected')
        },
        
        switchToSolflare: function() {
          currentWalletType = 'solflare'
          this.isPhantom = false
          ;(this as any).isSolflare = true
        },
        
        switchToPhantom: function() {
          currentWalletType = 'phantom'
          this.isPhantom = true
          ;(this as any).isSolflare = false
        },
        
        signTransaction: async (tx: any) => tx,
        signAllTransactions: async (txs: any[]) => txs,
        signMessage: async (_msg: any) => ({ signature: new Uint8Array(64), publicKey: mockWallet.publicKey }),
        on: () => {},
        off: () => {},
        removeAllListeners: () => {}
      }
      
      ;(window as any).phantom = { solana: mockWallet }
      ;(window as any).solana = mockWallet
      ;(window as any).mockWallet = mockWallet
    })
    
    await page.goto('http://localhost:3000')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1000)
    
    // Phase 1: Connect initial wallet
    console.log('Phase 1: Connecting initial wallet...')
    await connectWallet(page, 'Phantom')
    await verifyConnectedState(page, 'Phantom')
    
    // Phase 2: Test dropdown interactions
    console.log('Phase 2: Testing dropdown interactions...')
    const walletButton = page.getByTestId('wallet-dropdown-button')
    
    // Test copy address
    await walletButton.click()
    await page.context().grantPermissions(['clipboard-read', 'clipboard-write'])
    await page.getByText('Copy Address').click()
    await page.waitForTimeout(1000)
    // Dropdown might close, so just continue
    
    // Phase 3: Switch to different wallet
    console.log('Phase 3: Switching wallets...')
    await walletButton.click()
    await page.getByText('Switch Wallet').click()
    await page.waitForTimeout(500)
    
    // Update mock to Solflare
    await page.evaluate(() => {
      const mockWallet = (window as any).mockWallet
      if (mockWallet) {
        mockWallet.switchToSolflare()
      }
    })
    
    await page.getByRole('button', { name: /Solflare/i }).click()
    await page.waitForTimeout(1500)
    await verifyConnectedState(page, 'Solflare')
    
    // Phase 4: Disconnect wallet
    console.log('Phase 4: Disconnecting wallet...')
    await walletButton.click()
    await page.getByText('Disconnect').click()
    await page.waitForTimeout(500)
    await verifyDisconnectedState(page)
    
    // Phase 5: Reconnect to verify clean state
    console.log('Phase 5: Reconnecting to verify clean state...')
    await connectWallet(page, 'Phantom')
    await verifyConnectedState(page, 'Phantom')
    
    console.log('Complete wallet management journey test completed successfully!')
  })
})