import {
  BaseMessageSignerWalletAdapter,
  WalletReadyState,
  WalletConnectionError,
  WalletNotConnectedError,
  WalletPublicKeyError,
} from '@solana/wallet-adapter-base'
import { PublicKey, Transaction } from '@solana/web3.js'

/**
 * Test Wallet Adapter for E2E Testing
 * 
 * This adapter simulates a wallet connection for automated testing.
 * It automatically approves connections and transactions without user interaction.
 */
export class TestWalletAdapter extends BaseMessageSignerWalletAdapter {
  name = 'Test Wallet' as const
  url = 'https://github.com/solfolio/test-wallet' as const
  icon = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzQiIGhlaWdodD0iMzQiIHZpZXdCb3g9IjAgMCAzNCAzNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMTciIGN5PSIxNyIgcj0iMTciIGZpbGw9InVybCgjcGFpbnQwX2xpbmVhcikiLz4KPHBhdGggZD0iTTI5LjE3MDcgMTdDMjkuMTcwNyAyMy42NjUyIDIzLjY2NTIgMjkuMTcwNyAxNyAyOS4xNzA3QzEwLjMzNDggMjkuMTcwNyA0LjgyOTI3IDIzLjY2NTIgNC44MjkyNyAxN0M0LjgyOTI3IDEwLjMzNDggMTAuMzM0OCA0LjgyOTI3IDE3IDQuODI5MjdDMjMuNjY1MiA0LjgyOTI3IDI5LjE3MDcgMTAuMzM0OCAyOS4xNzA3IDE3WiIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLXdpZHRoPSIxLjE3MDczIi8+CjxwYXRoIGQ9Ik0xNyA5VjI1IiBzdHJva2U9IndoaXRlIiBzdHJva2Utd2lkdGg9IjIiLz4KPHBhdGggZD0iTTkgMTdIMjUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMiIvPgo8ZGVmcz4KPGxpbmVhckdyYWRpZW50IGlkPSJwYWludDBfbGluZWFyIiB4MT0iMTciIHkxPSIwIiB4Mj0iMTciIHkyPSIzNCIgZ3JhZGllbnRVbml0cz0idXNlclNwYWNlT25Vc2UiPgo8c3RvcCBzdG9wLWNvbG9yPSIjNTM0QkI5Ii8+CjxzdG9wIG9mZnNldD0iMSIgc3RvcC1jb2xvcj0iIzE1MTMyQiIvPgo8L2xpbmVhckdyYWRpZW50Pgo8L2RlZnM+Cjwvc3ZnPg=='
  
  private _connecting: boolean
  private _connected: boolean
  private _publicKey: PublicKey | null
  private _readyState: WalletReadyState = WalletReadyState.Installed
  
  // Test wallet addresses
  static readonly TEST_ADDRESSES = {
    DEFAULT: '7EYnhQoR9YM3N7UoaKRoA44Uy8JeaZV3qyouov87awMs',
    EMPTY: '11111111111111111111111111111111',
    BASIC: '22222222222222222222222222222222',
    TOKENS: '33333333333333333333333333333333',
    DEFI: '44444444444444444444444444444444',
    WHALE: '55555555555555555555555555555555',
  }
  
  constructor(address?: string) {
    super()
    this._connecting = false
    this._connected = false
    // Use provided address or default test address
    const testAddress = address || TestWalletAdapter.TEST_ADDRESSES.DEFAULT
    this._publicKey = new PublicKey(testAddress)
  }
  
  get publicKey(): PublicKey | null {
    return this._connected ? this._publicKey : null
  }
  
  get connecting(): boolean {
    return this._connecting
  }
  
  get connected(): boolean {
    return this._connected
  }
  
  get readyState(): WalletReadyState {
    return this._readyState
  }
  
  async connect(): Promise<void> {
    try {
      if (this.connected || this.connecting) return
      if (this.readyState !== WalletReadyState.Installed) {
        throw new WalletNotConnectedError()
      }
      
      this._connecting = true
      
      // Simulate connection delay
      await new Promise(resolve => setTimeout(resolve, 300))
      
      // Simulate successful connection
      this._connected = true
      this._connecting = false
      
      // Store in localStorage to simulate persistence
      if (typeof window !== 'undefined') {
        window.localStorage.setItem('walletConnected', 'true')
        window.localStorage.setItem('solfolio-wallet', '"Test Wallet"')
        window.localStorage.setItem('testWalletAddress', this._publicKey!.toBase58())
      }
      
      this.emit('connect', this._publicKey!)
      
      console.log('[TestWalletAdapter] Connected with address:', this._publicKey!.toBase58())
    } catch (error: any) {
      this._connecting = false
      throw new WalletConnectionError(error?.message, error)
    }
  }
  
  async disconnect(): Promise<void> {
    this._connected = false
    
    // Clear localStorage
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem('walletConnected')
      window.localStorage.removeItem('solfolio-wallet')
      window.localStorage.removeItem('testWalletAddress')
    }
    
    this.emit('disconnect')
    
    console.log('[TestWalletAdapter] Disconnected')
  }
  
  async signTransaction(transaction: Transaction): Promise<Transaction> {
    if (!this.connected) throw new WalletNotConnectedError()
    
    // Simulate signing - in real adapter this would use private key
    // For testing, we just return the transaction as-is
    console.log('[TestWalletAdapter] Signing transaction')
    return transaction
  }
  
  async signAllTransactions(transactions: Transaction[]): Promise<Transaction[]> {
    if (!this.connected) throw new WalletNotConnectedError()
    
    // Simulate signing all transactions
    console.log('[TestWalletAdapter] Signing', transactions.length, 'transactions')
    return transactions
  }
  
  async signMessage(message: Uint8Array): Promise<Uint8Array> {
    if (!this.connected) throw new WalletNotConnectedError()
    
    // Simulate message signing - return a mock signature
    console.log('[TestWalletAdapter] Signing message')
    return new Uint8Array(64).fill(0) // Mock signature
  }
}

/**
 * Create a Phantom-like test adapter that appears as Phantom in the UI
 */
export class TestPhantomAdapter extends TestWalletAdapter {
  name = 'Phantom' as const
  url = 'https://phantom.app' as const
  icon = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzQiIGhlaWdodD0iMzQiIHZpZXdCb3g9IjAgMCAzNCAzNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMTciIGN5PSIxNyIgcj0iMTciIGZpbGw9InVybCgjcGFpbnQwX2xpbmVhcl8xNzRfNDQwMykiLz4KPHBhdGggZmlsbC1ydWxlPSJldmVub2RkIiBjbGlwLXJ1bGU9ImV2ZW5vZGQiIGQ9Ik0xMC42ODQ2IDEwLjMxNDJIMjMuMzA3N0MyNi4yODkyIDEwLjMxNDIgMjguNzA3NyAxMi43MzI3IDI4LjcwNzcgMTUuNzE0MlYyMi4xMTQyQzI4LjcwNzcgMjUuMDk1NyAyNi4yODkyIDI3LjUxNDIgMjMuMzA3NyAyNy41MTQySDEzLjA3NjlDMTAuMDk1NCAyNy41MTQyIDcuNjc2OTIgMjUuMDk1NyA3LjY3NjkyIDIyLjExNDJWMTUuNzE0MkM3LjY3NjkyIDEzLjc2NjUgOC4wNjg2OSAxMS45MTEgOS4xMDc3OSAxMC4zMTQySDE5Ljg0NjJDMTkuODQ2MiAxMC4zMTQyIDEwLjY4NDYgMTAuMzE0MiAxMC42ODQ2IDEwLjMxNDJaIiBmaWxsPSJ3aGl0ZSIvPgo8L3N2Zz4='
  
  constructor(address?: string) {
    super(address)
  }
}