/**
 * Test wallet configurations for E2E testing
 * These are deterministic test wallets used across all E2E tests
 */

export interface TestWallet {
  id: string
  name: string
  address: string
  abbreviatedAddress: string
  solBalance: number
  tokenCount: number
  description: string
  privateKey?: string // Only for test networks, NEVER use real keys
}

// Export individual wallet constants for easier access
export const TEST_WALLET_EMPTY = '11111111111111111111111111111empty'
export const TEST_WALLET_BASIC = '22222222222222222222222222222basic'
export const TEST_WALLET_TOKENS = '33333333333333333333333333333token'
export const TEST_WALLET_DEFI = '44444444444444444444444444444defi4'
export const TEST_WALLET_WHALE = '55555555555555555555555555555whale'

/**
 * Test wallet constants matching the testing strategy document
 */
export const TEST_WALLETS = {
  // Empty wallet with no SOL or tokens
  EMPTY: {
    id: 'TEST_WALLET_EMPTY',
    name: 'Empty Test Wallet',
    address: '11111111111111111111111111111empty',
    abbreviatedAddress: '1111...mpty',
    solBalance: 0,
    tokenCount: 0,
    description: 'Empty wallet for testing zero balance states',
  } as TestWallet,
  
  // Basic wallet with SOL but no tokens
  BASIC: {
    id: 'TEST_WALLET_BASIC',
    name: 'Basic Test Wallet',
    address: '7EYnhQoR9YM3N7UoaKRoA44Uy8JeaZV3qyouov87awMs',
    abbreviatedAddress: '7EYn...awMs',
    solBalance: 10,
    tokenCount: 0,
    description: 'Basic wallet with SOL only',
  } as TestWallet,
  
  // Wallet with various tokens
  TOKENS: {
    id: 'TEST_WALLET_TOKENS',
    name: 'Token Holder Wallet',
    address: 'TokenHo1derWa11et1234567890ABCDEFtokens123',
    abbreviatedAddress: 'Toke...s123',
    solBalance: 5,
    tokenCount: 15,
    description: 'Wallet with 15+ different tokens',
  } as TestWallet,
  
  // DeFi positions wallet
  DEFI: {
    id: 'TEST_WALLET_DEFI',
    name: 'DeFi User Wallet',
    address: 'DeFiUserWa11et1234567890StakingPositions',
    abbreviatedAddress: 'DeFi...ions',
    solBalance: 20,
    tokenCount: 8,
    description: 'Wallet with active DeFi positions',
  } as TestWallet,
  
  // High value wallet
  WHALE: {
    id: 'TEST_WALLET_WHALE',
    name: 'Whale Test Wallet',
    address: 'Wha1eWa11et1234567890HighVa1ueBa1ances',
    abbreviatedAddress: 'Wha1...nces',
    solBalance: 10000,
    tokenCount: 50,
    description: 'High value wallet for testing large balances',
  } as TestWallet,
}

/**
 * Mock wallet data structure for API responses
 */
export interface MockWalletData {
  address: string
  solBalance: number
  tokens: Array<{
    mint: string
    symbol: string
    name: string
    balance: number
    decimals: number
    usdValue?: number
  }>
  positions?: Array<{
    protocol: string
    type: string
    value: number
    apy?: number
  }>
}

/**
 * Generate mock wallet data based on test wallet type
 */
export function getMockWalletData(wallet: TestWallet): MockWalletData {
  switch (wallet.id) {
    case 'TEST_WALLET_EMPTY':
      return {
        address: wallet.address,
        solBalance: 0,
        tokens: [],
      }
    
    case 'TEST_WALLET_BASIC':
      return {
        address: wallet.address,
        solBalance: 10,
        tokens: [],
      }
    
    case 'TEST_WALLET_TOKENS':
      return {
        address: wallet.address,
        solBalance: 5,
        tokens: [
          { mint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', symbol: 'USDC', name: 'USD Coin', balance: 1000, decimals: 6, usdValue: 1000 },
          { mint: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB', symbol: 'USDT', name: 'Tether', balance: 500, decimals: 6, usdValue: 500 },
          { mint: 'So11111111111111111111111111111111111111112', symbol: 'WSOL', name: 'Wrapped SOL', balance: 2, decimals: 9, usdValue: 200 },
          { mint: 'mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So', symbol: 'mSOL', name: 'Marinade SOL', balance: 5, decimals: 9, usdValue: 550 },
          { mint: '7kbnvuGBxxj8AG9qp8Scn56muWGaRaFqxuFeFfQFtttN', symbol: 'UXD', name: 'UXD Stablecoin', balance: 100, decimals: 6, usdValue: 100 },
          { mint: 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263', symbol: 'BONK', name: 'Bonk', balance: 1000000, decimals: 5, usdValue: 50 },
          { mint: 'JUPyiwrYJFskUPiHa9hkeR8VUtAeFPxgHqGKZwyTDt1v', symbol: 'JUP', name: 'Jupiter', balance: 100, decimals: 6, usdValue: 120 },
          { mint: 'orcaEKTdK7LKz57vaAYr9QeNsVEPvaTiC1DxgyVkH44', symbol: 'ORCA', name: 'Orca', balance: 50, decimals: 6, usdValue: 75 },
          { mint: '7xKXtdK7LKz57vaAYr9QeNsVEPvaTiC1DxgyVkH44ray', symbol: 'RAY', name: 'Raydium', balance: 30, decimals: 6, usdValue: 90 },
          { mint: '4k3DmVAzsQgn8RY4KJqXPxMRE3gD1fqNyJNpJz9ycHBA', symbol: 'MNDE', name: 'Marinade', balance: 200, decimals: 6, usdValue: 60 },
        ],
      }
    
    case 'TEST_WALLET_DEFI':
      return {
        address: wallet.address,
        solBalance: 20,
        tokens: [
          { mint: 'mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So', symbol: 'mSOL', name: 'Marinade SOL', balance: 10, decimals: 9, usdValue: 1100 },
          { mint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', symbol: 'USDC', name: 'USD Coin', balance: 500, decimals: 6, usdValue: 500 },
        ],
        positions: [
          { protocol: 'Marinade', type: 'Staking', value: 1100, apy: 7.2 },
          { protocol: 'Kamino', type: 'Lending', value: 500, apy: 8.5 },
          { protocol: 'Orca', type: 'LP', value: 800, apy: 24.3 },
        ],
      }
    
    case 'TEST_WALLET_WHALE':
      return {
        address: wallet.address,
        solBalance: 10000,
        tokens: Array.from({ length: 50 }, (_, i) => ({
          mint: `token${i}mint1234567890abcdef`,
          symbol: `TK${i}`,
          name: `Token ${i}`,
          balance: 1000 + i * 100,
          decimals: 6,
          usdValue: (1000 + i * 100) * 1.5,
        })),
        positions: [
          { protocol: 'Marinade', type: 'Staking', value: 50000, apy: 7.2 },
          { protocol: 'Kamino', type: 'Lending', value: 100000, apy: 8.5 },
          { protocol: 'Marginfi', type: 'Lending', value: 75000, apy: 9.1 },
        ],
      }
    
    default:
      return {
        address: wallet.address,
        solBalance: wallet.solBalance,
        tokens: [],
      }
  }
}

/**
 * Test seed phrases for deterministic wallet generation
 * ONLY USE ON TEST NETWORKS - NEVER ON MAINNET
 */
export const TEST_SEED_PHRASES = {
  EMPTY: 'test test test test test test test test test test test junk',
  BASIC: 'basic basic basic basic basic basic basic basic basic basic basic junk',
  TOKENS: 'token token token token token token token token token token token junk',
  DEFI: 'defi defi defi defi defi defi defi defi defi defi defi junk',
  WHALE: 'whale whale whale whale whale whale whale whale whale whale whale junk',
}

/**
 * Helper to format address as abbreviated
 */
export function abbreviateAddress(address: string): string {
  if (!address || address.length < 8) return address
  return `${address.slice(0, 4)}...${address.slice(-4)}`
}

/**
 * Helper to validate if address format is correct
 */
export function isValidSolanaAddress(address: string): boolean {
  // Basic validation - Solana addresses are base58 encoded and typically 32-44 characters
  return /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(address)
}