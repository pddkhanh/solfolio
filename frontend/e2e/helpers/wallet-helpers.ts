import { Page } from '@playwright/test'

/**
 * Mock Phantom wallet object in the browser
 * This injects a mock wallet adapter that simulates Phantom wallet behavior
 */
export async function mockPhantomWallet(page: Page) {
  await page.addInitScript(() => {
    // Create a mock Phantom wallet object
    const mockPhantom = {
      isPhantom: true,
      isConnected: false,
      publicKey: null,
      
      connect: async () => {
        // Simulate connection delay
        await new Promise(resolve => setTimeout(resolve, 500))
        
        // Set connected state
        mockPhantom.isConnected = true
        mockPhantom.publicKey = {
          toString: () => '7EYnhQoR9YM3N7UoaKRoA44Uy8JeaZV3qyouov87awMs',
          toBase58: () => '7EYnhQoR9YM3N7UoaKRoA44Uy8JeaZV3qyouov87awMs',
          toBytes: () => new Uint8Array(32).fill(1),
        }
        
        // Store in localStorage to persist connection
        if (typeof window !== 'undefined' && window.localStorage) {
          window.localStorage.setItem('walletName', 'Phantom')
          window.localStorage.setItem('walletConnected', 'true')
        }
        
        // Emit connect event
        if (mockPhantom.onConnect) {
          mockPhantom.onConnect(mockPhantom.publicKey)
        }
        
        // Dispatch a custom event to notify the app
        window.dispatchEvent(new CustomEvent('wallet-connected', { 
          detail: { publicKey: mockPhantom.publicKey }
        }))
        
        return { publicKey: mockPhantom.publicKey }
      },
      
      disconnect: async () => {
        await new Promise(resolve => setTimeout(resolve, 200))
        mockPhantom.isConnected = false
        mockPhantom.publicKey = null
        
        // Emit disconnect event
        if (mockPhantom.onDisconnect) {
          mockPhantom.onDisconnect()
        }
      },
      
      signMessage: async (message: Uint8Array) => {
        // Simulate signing delay
        await new Promise(resolve => setTimeout(resolve, 300))
        // Return mock signature
        return { signature: new Uint8Array(64).fill(1) }
      },
      
      signTransaction: async (transaction: any) => {
        await new Promise(resolve => setTimeout(resolve, 300))
        return transaction
      },
      
      // Event handlers
      onConnect: null,
      onDisconnect: null,
      onAccountChanged: null,
      
      // Method to add event listeners
      on: function(event: string, handler: Function) {
        if (event === 'connect') {
          this.onConnect = handler
        } else if (event === 'disconnect') {
          this.onDisconnect = handler
        } else if (event === 'accountChanged') {
          this.onAccountChanged = handler
        }
      },
      
      off: function(event: string, handler: Function) {
        if (event === 'connect') {
          this.onConnect = null
        } else if (event === 'disconnect') {
          this.onDisconnect = null
        } else if (event === 'accountChanged') {
          this.onAccountChanged = null
        }
      }
    }
    
    // Inject into window.solana
    ;(window as any).solana = mockPhantom
    ;(window as any).phantom = { solana: mockPhantom }
  })
}

/**
 * Inject a connected wallet with specific test wallet data
 */
export async function injectConnectedWallet(page: Page, walletData: { address: string; name: string }) {
  // First, inject the localStorage values before page load
  await page.addInitScript((data) => {
    // Set localStorage to persist connection
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem('walletName', data.name)
      window.localStorage.setItem('walletConnected', 'true')
    }
    
    // Also create the mock wallet
    const mockWallet = {
      isPhantom: true,
      isConnected: true,
      publicKey: {
        toString: () => data.address,
        toBase58: () => data.address,
        toBytes: () => new Uint8Array(32).fill(1),
      },
      
      connect: async () => {
        return { publicKey: mockWallet.publicKey }
      },
      
      disconnect: async () => {
        mockWallet.isConnected = false
        mockWallet.publicKey = null
      },
      
      signMessage: async () => {
        return { signature: new Uint8Array(64).fill(1) }
      },
      
      signTransaction: async (transaction: any) => {
        return transaction
      },
      
      on: () => {},
      off: () => {},
    }
    
    ;(window as any).solana = mockWallet
    ;(window as any).phantom = { solana: mockWallet }
  }, walletData)
}

/**
 * Wait for wallet modal to appear or disappear
 */
export async function waitForWalletModal(page: Page, shouldBeVisible: boolean = true) {
  // Wait for the wallet adapter modal to appear or disappear
  const state = shouldBeVisible ? 'visible' : 'hidden'
  await page.waitForSelector('.wallet-adapter-modal', { state, timeout: 5000 })
}

/**
 * Wait for wallet modal to disappear
 */
export async function waitForModalToClose(page: Page) {
  // Wait for the wallet adapter modal to disappear
  await page.waitForSelector('.wallet-adapter-modal', { state: 'hidden', timeout: 5000 })
}

/**
 * Get the abbreviated wallet address from the page
 */
export async function getWalletAddress(page: Page): Promise<string | null> {
  // Look for the wallet button with abbreviated address pattern
  // First try the data-testid, then look for button with abbreviated pattern
  try {
    const addressElement = await page.locator('[data-testid="wallet-address"]').first()
    if (await addressElement.isVisible()) {
      return await addressElement.textContent()
    }
  } catch {
    // Fallback to looking for button with pattern
  }
  
  // Look for button containing pattern like "1234...5678"
  const buttons = await page.locator('button').all()
  for (const button of buttons) {
    const text = await button.textContent()
    if (text && /^\w{4}\.\.\.\w{4}$/.test(text.trim())) {
      return text.trim()
    }
  }
  
  return null
}

/**
 * Get the connected wallet address (alias for getWalletAddress)
 */
export async function getConnectedWalletAddress(page: Page): Promise<string | null> {
  return getWalletAddress(page)
}

/**
 * Check if wallet is connected
 */
export async function isWalletConnected(page: Page): Promise<boolean> {
  // Check for wallet address or disconnect button
  try {
    const addressVisible = await page.locator('[data-testid="wallet-address"]').isVisible()
    if (addressVisible) return true
  } catch {
    // Continue checking
  }
  
  const disconnectVisible = await page.locator('button:has-text("Disconnect")').isVisible().catch(() => false)
  
  return disconnectVisible
}

/**
 * Simulate wallet connection approval
 */
export async function approveWalletConnection(page: Page) {
  // This would be used with real wallet extensions
  // For mock, connection is auto-approved
  await page.evaluate(() => {
    const wallet = (window as any).solana
    if (wallet && wallet.connect) {
      wallet.connect()
    }
  })
}

/**
 * Mock all wallet adapters as "not installed"
 */
export async function mockWalletsNotInstalled(page: Page) {
  await page.addInitScript(() => {
    // Remove any existing wallet objects
    delete (window as any).solana
    delete (window as any).phantom
    delete (window as any).solflare
    delete (window as any).ledger
    delete (window as any).torus
  })
}

/**
 * Mock multiple wallet adapters
 */
export async function mockMultipleWallets(page: Page) {
  await page.addInitScript(() => {
    // Mock Phantom
    ;(window as any).phantom = {
      solana: {
        isPhantom: true,
        isConnected: false,
        connect: async () => ({ publicKey: { toString: () => 'phantom-address' } }),
        disconnect: async () => {},
      }
    }
    
    // Mock Solflare
    ;(window as any).solflare = {
      isSolflare: true,
      isConnected: false,
      connect: async () => ({ publicKey: { toString: () => 'solflare-address' } }),
      disconnect: async () => {},
    }
    
    // Set the default solana object to Phantom
    ;(window as any).solana = (window as any).phantom.solana
  })
}

/**
 * Clear wallet connection from localStorage
 */
export async function clearWalletConnection(page: Page) {
  // Only clear localStorage after page navigation to avoid security errors
  await page.addInitScript(() => {
    // Clear wallet-related items from localStorage on page load
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.removeItem('walletName')
      window.localStorage.removeItem('walletConnected')
    }
  })
}

/**
 * Wait for page to be ready for wallet operations
 */
export async function waitForPageReady(page: Page) {
  // Wait for the page to be fully loaded
  await page.waitForLoadState('networkidle')
  
  // Wait for body or main element to be present (Next.js app)
  await page.waitForSelector('body, main', { state: 'attached', timeout: 10000 })
  
  // Additional wait for wallet adapter to initialize
  await page.waitForTimeout(500)
}

/**
 * Get wallet modal state
 */
export async function getWalletModalState(page: Page) {
  const modalVisible = await page.locator('.wallet-adapter-modal').isVisible().catch(() => false)
  const overlayVisible = await page.locator('.wallet-adapter-modal-overlay').isVisible().catch(() => false)
  
  return {
    isOpen: modalVisible,
    hasOverlay: overlayVisible,
    wallets: {
      phantom: await page.locator('.wallet-adapter-modal button:has-text("Phantom")').isVisible().catch(() => false),
      solflare: await page.locator('.wallet-adapter-modal button:has-text("Solflare")').isVisible().catch(() => false),
      ledger: await page.locator('.wallet-adapter-modal button:has-text("Ledger")').isVisible().catch(() => false),
      torus: await page.locator('.wallet-adapter-modal button:has-text("Torus")').isVisible().catch(() => false),
    }
  }
}

/**
 * Click wallet option in modal
 */
export async function selectWalletInModal(page: Page, walletName: string) {
  const walletButton = page.locator(`.wallet-adapter-modal button:has-text("${walletName}")`)
  await walletButton.click()
}