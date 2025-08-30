import { Page } from '@playwright/test'

/**
 * Mock wallet configuration for E2E tests
 */
export interface MockWalletConfig {
  address?: string
  walletName?: string
  failConnect?: boolean
  autoApprove?: boolean
}

/**
 * Default test wallet addresses from docs/e2e-testing-strategy.md
 */
export const TEST_WALLETS = {
  EMPTY: '7EYCwbsxDfcquQPsNm5dkmfRuTQ4bXBEYs4xfZYKCVvf',
  TOKENS: '8BsE6Pts5DwuHqjrefTtzd9THkttVJtUMAXecg9J9xer',
  DEFI: '9WzDXwBbmkg8ZTbNDqSwhJMDBvfKNbVhm9iR9GkTqdZ3',
  LARGE: 'FvPH7PrVrLGKPfqafxXJxHhqpRfmE5FZGewMMKwKj8YD'
} as const

/**
 * Inject a mock wallet into the page for E2E testing
 * This simulates Phantom wallet behavior without requiring the actual extension
 */
export async function injectMockWallet(page: Page, config: MockWalletConfig = {}) {
  const { 
    address = TEST_WALLETS.TOKENS,
    walletName = 'Phantom',
    failConnect = false,
    autoApprove = true
  } = config

  await page.addInitScript((injectedConfig) => {
    // Set E2E test mode flag
    (window as any).__E2E_TEST_MODE__ = true
    
    // Create mock PublicKey class that mimics Solana's PublicKey
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
      isPhantom: injectedConfig.walletName === 'Phantom',
      isSolflare: injectedConfig.walletName === 'Solflare',
      isLedger: injectedConfig.walletName === 'Ledger',
      isTorus: injectedConfig.walletName === 'Torus',
      publicKey: null as any,
      connected: false,
      connecting: false,
      autoApprove: injectedConfig.autoApprove,
      failNextConnect: injectedConfig.failConnect,
      
      connect: async function(options?: { onlyIfTrusted?: boolean }) {
        console.log('[E2E Mock Wallet] Connect called with options:', options)
        
        // Handle onlyIfTrusted - for auto-reconnection
        if (options?.onlyIfTrusted) {
          // Check if wallet was previously connected (stored in localStorage)
          const storedWallet = localStorage.getItem('walletName')
          const storedAddress = localStorage.getItem('walletAddress')
          
          if (storedWallet === injectedConfig.walletName && storedAddress) {
            console.log('[E2E Mock Wallet] Auto-reconnecting with trusted connection')
            this.publicKey = new MockPublicKey(storedAddress)
            this.connected = true
            return { publicKey: this.publicKey }
          }
          
          // If not trusted, return without connecting
          console.log('[E2E Mock Wallet] Not trusted, skipping auto-connect')
          return null
        }
        
        // Simulate failure if configured
        if (this.failNextConnect) {
          this.failNextConnect = false
          throw new Error('Connection failed - User rejected')
        }
        
        this.connecting = true
        
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 500))
        
        // Create test wallet address
        this.publicKey = new MockPublicKey(injectedConfig.address)
        this.connected = true
        this.connecting = false
        
        // Store in localStorage for persistence
        localStorage.setItem('walletName', injectedConfig.walletName)
        localStorage.setItem('walletAddress', injectedConfig.address)
        localStorage.setItem('walletConnected', 'true')
        
        console.log('[E2E Mock Wallet] Connected with address:', this.publicKey.toString())
        return { publicKey: this.publicKey }
      },
      
      disconnect: async function() {
        console.log('[E2E Mock Wallet] Disconnect called')
        this.publicKey = null
        this.connected = false
        this.connecting = false
        
        // Clear localStorage
        localStorage.removeItem('walletName')
        localStorage.removeItem('walletAddress')
        localStorage.removeItem('walletConnected')
      },
      
      signTransaction: async (tx: any) => {
        if (!mockWallet.connected) throw new Error('Wallet not connected')
        return tx
      },
      
      signAllTransactions: async (txs: any[]) => {
        if (!mockWallet.connected) throw new Error('Wallet not connected')
        return txs
      },
      
      signMessage: async (_msg: any) => {
        if (!mockWallet.connected) throw new Error('Wallet not connected')
        return { 
          signature: new Uint8Array(64), 
          publicKey: mockWallet.publicKey 
        }
      },
      
      signAndSendTransaction: async (tx: any) => {
        if (!mockWallet.connected) throw new Error('Wallet not connected')
        // Return a mock transaction signature
        return {
          signature: 'mock_signature_' + Date.now()
        }
      },
      
      on: (_event: string, _handler: any) => {},
      off: (_event: string, _handler: any) => {},
      removeAllListeners: () => {},
      
      // Additional methods for wallet adapter compatibility
      addEventListener: (_event: string, _handler: any) => {},
      removeEventListener: (_event: string, _handler: any) => {}
    }
    
    // Inject into window based on wallet type
    if (injectedConfig.walletName === 'Phantom') {
      ;(window as any).phantom = { solana: mockWallet }
      ;(window as any).solana = mockWallet
    } else if (injectedConfig.walletName === 'Solflare') {
      ;(window as any).solflare = mockWallet
    } else if (injectedConfig.walletName === 'Ledger') {
      ;(window as any).ledger = { solana: mockWallet }
    } else if (injectedConfig.walletName === 'Torus') {
      ;(window as any).torus = { solana: mockWallet }
    }
    
    // Always expose for test manipulation
    ;(window as any).mockWallet = mockWallet
    
    console.log(`[E2E] Mock ${injectedConfig.walletName} wallet injected successfully`)
  }, { address, walletName, failConnect, autoApprove })
}

/**
 * Wait for wallet to be connected
 */
export async function waitForWalletConnection(page: Page, timeout = 10000) {
  await page.waitForFunction(
    () => {
      const wallet = (window as any).mockWallet
      return wallet && wallet.connected && wallet.publicKey
    },
    { timeout }
  )
}

/**
 * Disconnect wallet
 */
export async function disconnectWallet(page: Page) {
  await page.evaluate(() => {
    const wallet = (window as any).mockWallet
    if (wallet && wallet.disconnect) {
      return wallet.disconnect()
    }
  })
}

/**
 * Get current wallet state
 */
export async function getWalletState(page: Page) {
  return page.evaluate(() => {
    const wallet = (window as any).mockWallet
    if (!wallet) return null
    
    return {
      connected: wallet.connected,
      connecting: wallet.connecting,
      address: wallet.publicKey?.toString() || null,
      walletName: localStorage.getItem('walletName'),
      localStorage: {
        walletName: localStorage.getItem('walletName'),
        walletAddress: localStorage.getItem('walletAddress'),
        walletConnected: localStorage.getItem('walletConnected')
      }
    }
  })
}

/**
 * Simulate wallet connection persistence (for page refresh tests)
 */
export async function setupWalletPersistence(page: Page, address: string, walletName = 'Phantom') {
  await page.evaluate(({ addr, name }) => {
    localStorage.setItem('walletName', name)
    localStorage.setItem('walletAddress', addr)
    localStorage.setItem('walletConnected', 'true')
  }, { addr: address, name: walletName })
}

/**
 * Clear wallet persistence data
 */
export async function clearWalletPersistence(page: Page) {
  await page.evaluate(() => {
    localStorage.removeItem('walletName')
    localStorage.removeItem('walletAddress')
    localStorage.removeItem('walletConnected')
  })
}

/**
 * Helper to format wallet address like the UI does (xxxx...xxxx)
 */
export function formatWalletAddress(address: string): string {
  if (!address || address.length < 8) return address
  return `${address.slice(0, 4)}...${address.slice(-4)}`
}