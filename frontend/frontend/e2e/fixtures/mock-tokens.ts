/**
 * Mock token data for E2E testing
 * Provides realistic token balance data for testing portfolio display
 */

export interface MockToken {
  mint: string
  symbol: string
  name: string
  balance: number
  decimals: number
  usdValue: number
  price?: number
  logoURI?: string
  isNative?: boolean
}


/**
 * Common Solana token addresses for testing
 */
export const TOKEN_MINTS = {
  SOL: 'So11111111111111111111111111111111111111112',
  WSOL: 'So11111111111111111111111111111111111111112',
  USDC: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
  USDT: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB',
  mSOL: 'mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So',
  BONK: 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263',
  JUP: 'JUPyiwrYJFskUPiHa9hkeR8VUtAeFPxgHqGKZwyTDt1v',
  ORCA: 'orcaEKTdK7LKz57vaAYr9QeNsVEPvaTiC1DxgyVkH44',
  RAY: '4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R',
  MNDE: 'MNDEFzGvMt87ueuHvVU9VcTqsAP5b3fTGPsHuuPA5ey',
} as const

/**
 * Test token sets for different scenarios
 */
export const MOCK_TOKEN_SETS = {
  // Empty wallet - no tokens
  EMPTY: [] as MockToken[],
  
  // Basic wallet - only native SOL
  BASIC_SOL: [
    {
      mint: TOKEN_MINTS.SOL,
      symbol: 'SOL',
      name: 'Solana',
      balance: 10.5,
      decimals: 9,
      usdValue: 1050.00,
      price: 100.00,
      isNative: true,
      logoURI: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png'
    }
  ] as MockToken[],
  
  // Standard token portfolio
  STANDARD: [
    {
      mint: TOKEN_MINTS.SOL,
      symbol: 'SOL',
      name: 'Solana',
      balance: 5.25,
      decimals: 9,
      usdValue: 525.00,
      price: 100.00,
      isNative: true,
      logoURI: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png'
    },
    {
      mint: TOKEN_MINTS.USDC,
      symbol: 'USDC',
      name: 'USD Coin',
      balance: 1234.56,
      decimals: 6,
      usdValue: 1234.56,
      price: 1.00,
      logoURI: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v/logo.png'
    },
    {
      mint: TOKEN_MINTS.USDT,
      symbol: 'USDT',
      name: 'Tether USD',
      balance: 500.00,
      decimals: 6,
      usdValue: 500.00,
      price: 1.00,
      logoURI: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB/logo.png'
    },
    {
      mint: TOKEN_MINTS.mSOL,
      symbol: 'mSOL',
      name: 'Marinade staked SOL',
      balance: 3.75,
      decimals: 9,
      usdValue: 412.50,
      price: 110.00,
      logoURI: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So/logo.png'
    },
    {
      mint: TOKEN_MINTS.JUP,
      symbol: 'JUP',
      name: 'Jupiter',
      balance: 100.00,
      decimals: 6,
      usdValue: 120.00,
      price: 1.20,
      logoURI: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/JUPyiwrYJFskUPiHa9hkeR8VUtAeFPxgHqGKZwyTDt1v/logo.png'
    }
  ] as MockToken[],
  
  // Portfolio with small balances (for filter testing)
  WITH_SMALL_BALANCES: [
    {
      mint: TOKEN_MINTS.SOL,
      symbol: 'SOL',
      name: 'Solana',
      balance: 2.00,
      decimals: 9,
      usdValue: 200.00,
      price: 100.00,
      isNative: true,
      logoURI: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png'
    },
    {
      mint: TOKEN_MINTS.USDC,
      symbol: 'USDC',
      name: 'USD Coin',
      balance: 50.00,
      decimals: 6,
      usdValue: 50.00,
      price: 1.00,
      logoURI: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v/logo.png'
    },
    {
      mint: TOKEN_MINTS.BONK,
      symbol: 'BONK',
      name: 'Bonk',
      balance: 10000000,
      decimals: 5,
      usdValue: 0.50,  // Small balance
      price: 0.00000005,
      logoURI: 'https://arweave.net/hQiPZOsRZXGXBJd_82PhVdlM_hACsT_q6wqwf5cSY7I'
    },
    {
      mint: TOKEN_MINTS.ORCA,
      symbol: 'ORCA',
      name: 'Orca',
      balance: 0.5,
      decimals: 6,
      usdValue: 0.75,  // Small balance
      price: 1.50,
      logoURI: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/orcaEKTdK7LKz57vaAYr9QeNsVEPvaTiC1DxgyVkH44/logo.png'
    },
    {
      mint: TOKEN_MINTS.RAY,
      symbol: 'RAY',
      name: 'Raydium',
      balance: 0.1,
      decimals: 6,
      usdValue: 0.30,  // Small balance
      price: 3.00,
      logoURI: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R/logo.png'
    }
  ] as MockToken[],
  
  // Large portfolio (for performance testing)
  LARGE: Array.from({ length: 25 }, (_, i) => ({
    mint: `MockToken${i}Mint${i.toString().padEnd(32, '0')}`,
    symbol: `TK${i}`,
    name: `Test Token ${i}`,
    balance: 100 + i * 10,
    decimals: 6,
    usdValue: (100 + i * 10) * (1 + i * 0.1),
    price: 1 + i * 0.1,
    logoURI: undefined
  })) as MockToken[]
}

/**
 * Convert MockToken to TokenBalance (component format)
 */
interface TokenBalance {
  mint: string;
  symbol?: string;
  name?: string;
  logoUri?: string;
  balance: string;
  decimals: number;
  uiAmount?: number;
  valueUSD: number;
  metadata?: {
    symbol: string;
    name: string;
    logoUri?: string;
  };
}

/**
 * Component expects WalletBalances format
 */
interface WalletBalances {
  wallet: string;
  nativeSol?: {
    amount: string;
    decimals: number;
    uiAmount: number;
  };
  tokens: TokenBalance[];
  totalValueUSD: number;
  lastUpdated: string;
}

/**
 * Generate mock API response for token balances (TokenList component format)
 */
export function generateMockTokenResponse(
  wallet: string,
  tokens: MockToken[] = MOCK_TOKEN_SETS.STANDARD
): WalletBalances {
  // Separate SOL from other tokens
  const solToken = tokens.find(t => t.isNative || t.symbol === 'SOL')
  const otherTokens = tokens.filter(t => !t.isNative && t.symbol !== 'SOL')
  
  // Convert to component format
  const tokenBalances: TokenBalance[] = otherTokens.map(token => ({
    mint: token.mint,
    symbol: token.symbol,
    name: token.name,
    logoUri: token.logoURI,
    balance: (token.balance * Math.pow(10, token.decimals)).toString(),
    decimals: token.decimals,
    uiAmount: token.balance,
    valueUSD: token.usdValue,
    metadata: {
      symbol: token.symbol,
      name: token.name,
      logoUri: token.logoURI
    }
  }))
  
  const totalValue = tokens.reduce((sum, token) => sum + token.usdValue, 0)
  
  return {
    wallet,
    nativeSol: solToken ? {
      amount: (solToken.balance * Math.pow(10, solToken.decimals)).toString(),
      decimals: solToken.decimals,
      uiAmount: solToken.balance
    } : undefined,
    tokens: tokenBalances,
    totalValueUSD: totalValue,
    lastUpdated: new Date().toISOString()
  }
}

/**
 * Sort tokens by different criteria
 */
export function sortTokens(tokens: MockToken[], sortBy: 'value' | 'amount' | 'name'): MockToken[] {
  const sorted = [...tokens]
  
  switch (sortBy) {
    case 'value':
      return sorted.sort((a, b) => {
        // Native SOL always first when sorting by value
        if (a.isNative) return -1
        if (b.isNative) return 1
        return b.usdValue - a.usdValue
      })
    
    case 'amount':
      return sorted.sort((a, b) => b.balance - a.balance)
    
    case 'name':
      return sorted.sort((a, b) => a.name.localeCompare(b.name))
    
    default:
      return sorted
  }
}

/**
 * Filter tokens by minimum USD value
 */
export function filterSmallBalances(tokens: MockToken[], minValue = 1.00): MockToken[] {
  return tokens.filter(token => token.usdValue >= minValue)
}

/**
 * Format token balance for display
 */
export function formatTokenBalance(balance: number, decimals: number): string {
  // For very small numbers, show more decimals
  if (balance < 0.01) {
    return balance.toFixed(6)
  }
  // For standard amounts, show 2 decimals
  return balance.toFixed(2)
}

/**
 * Format USD value for display
 */
export function formatUsdValue(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value)
}

/**
 * Abbreviate mint address for display
 */
export function abbreviateMint(mint: string): string {
  if (!mint || mint.length < 8) return mint
  return `${mint.slice(0, 4)}...${mint.slice(-4)}`
}