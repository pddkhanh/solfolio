import { PublicKey, Transaction, SendOptions, VersionedTransaction, Keypair } from '@solana/web3.js'
import { EventEmitter } from 'eventemitter3'

export interface MockPhantomWallet {
  isPhantom: boolean
  publicKey: PublicKey | null
  connected: boolean
  connecting: boolean
  connect: (options?: { onlyIfTrusted?: boolean }) => Promise<{ publicKey: PublicKey }>
  disconnect: () => Promise<void>
  signTransaction: <T extends Transaction | VersionedTransaction>(transaction: T) => Promise<T>
  signAllTransactions: <T extends Transaction | VersionedTransaction>(transactions: T[]) => Promise<T[]>
  signMessage: (message: Uint8Array) => Promise<{ signature: Uint8Array; publicKey: PublicKey }>
  signAndSendTransaction: <T extends Transaction | VersionedTransaction>(
    transaction: T,
    options?: SendOptions
  ) => Promise<{ signature: string }>
  on: (event: string, handler: (args: any) => void) => void
  off: (event: string, handler: (args: any) => void) => void
  _events: EventEmitter
}

export class MockWalletProvider implements MockPhantomWallet {
  isPhantom = true
  publicKey: PublicKey | null = null
  connected = false
  connecting = false
  _events = new EventEmitter()
  
  // Use a valid test wallet address
  private mockKeypair = Keypair.generate()
  private mockPublicKey = this.mockKeypair.publicKey

  async connect(options?: { onlyIfTrusted?: boolean }): Promise<{ publicKey: PublicKey }> {
    console.log('[MockWallet] Connect called with options:', options)
    
    if (this.connected) {
      return { publicKey: this.publicKey! }
    }

    this.connecting = true
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500))
    
    this.publicKey = this.mockPublicKey
    this.connected = true
    this.connecting = false
    
    this._events.emit('connect', this.publicKey)
    
    console.log('[MockWallet] Connected successfully with publicKey:', this.publicKey.toString())
    return { publicKey: this.publicKey }
  }

  async disconnect(): Promise<void> {
    console.log('[MockWallet] Disconnect called')
    this.publicKey = null
    this.connected = false
    this._events.emit('disconnect')
  }

  async signTransaction<T extends Transaction | VersionedTransaction>(transaction: T): Promise<T> {
    console.log('[MockWallet] Sign transaction called')
    if (!this.connected || !this.publicKey) {
      throw new Error('Wallet not connected')
    }
    // Return transaction as-is for mock
    return transaction
  }

  async signAllTransactions<T extends Transaction | VersionedTransaction>(transactions: T[]): Promise<T[]> {
    console.log('[MockWallet] Sign all transactions called')
    if (!this.connected || !this.publicKey) {
      throw new Error('Wallet not connected')
    }
    return transactions
  }

  async signMessage(message: Uint8Array): Promise<{ signature: Uint8Array; publicKey: PublicKey }> {
    console.log('[MockWallet] Sign message called')
    if (!this.connected || !this.publicKey) {
      throw new Error('Wallet not connected')
    }
    // Return mock signature
    const signature = new Uint8Array(64).fill(1)
    return { signature, publicKey: this.publicKey }
  }

  async signAndSendTransaction<T extends Transaction | VersionedTransaction>(
    transaction: T,
    options?: SendOptions
  ): Promise<{ signature: string }> {
    console.log('[MockWallet] Sign and send transaction called')
    if (!this.connected || !this.publicKey) {
      throw new Error('Wallet not connected')
    }
    // Return mock signature
    return { signature: '1'.repeat(88) }
  }

  on(event: string, handler: (args: any) => void): void {
    this._events.on(event, handler)
  }

  off(event: string, handler: (args: any) => void): void {
    this._events.off(event, handler)
  }
}

export function injectMockWallet() {
  if (typeof window === 'undefined') return
  
  // Check if we're in test/dev mode
  const isTestMode = process.env.NEXT_PUBLIC_E2E_TEST_MODE === 'true' || 
    process.env.NEXT_PUBLIC_MOCK_WALLET === 'true' ||
    (window as any).__E2E_TEST_MODE__ ||
    (window as any).__MOCK_WALLET__
  
  if (!isTestMode) return
  
  console.log('[MockWallet] Injecting mock Phantom wallet')
  
  // Create mock wallet
  const mockWallet = new MockWalletProvider()
  
  // Inject into window
  ;(window as any).phantom = {
    solana: mockWallet
  }
  
  ;(window as any).solana = mockWallet
  
  // Also add to solflare namespace for testing
  ;(window as any).solflare = mockWallet
  
  console.log('[MockWallet] Mock wallet injected successfully')
}

// Auto-inject on import if in browser
if (typeof window !== 'undefined') {
  injectMockWallet()
}