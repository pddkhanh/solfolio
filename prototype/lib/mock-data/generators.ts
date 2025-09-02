import { Token, Protocol, Position, PortfolioData, YieldOpportunity } from './types'

export const mockTokens: Token[] = [
  {
    symbol: 'SOL',
    name: 'Solana',
    logoURI: '',
    price: 98.45,
    change24h: 5.23,
    change7d: 12.45,
    change30d: 45.67,
  },
  {
    symbol: 'mSOL',
    name: 'Marinade SOL',
    logoURI: '',
    price: 106.23,
    change24h: 5.18,
    change7d: 12.38,
    change30d: 44.92,
  },
  {
    symbol: 'jitoSOL',
    name: 'Jito Staked SOL',
    logoURI: '',
    price: 109.84,
    change24h: 5.31,
    change7d: 12.89,
    change30d: 46.23,
  },
  {
    symbol: 'USDC',
    name: 'USD Coin',
    logoURI: '',
    price: 1.00,
    change24h: 0.01,
    change7d: -0.02,
    change30d: 0.03,
  },
  {
    symbol: 'USDT',
    name: 'Tether',
    logoURI: '',
    price: 1.00,
    change24h: -0.01,
    change7d: 0.01,
    change30d: -0.01,
  },
  {
    symbol: 'RAY',
    name: 'Raydium',
    logoURI: '',
    price: 2.45,
    change24h: 8.92,
    change7d: 15.34,
    change30d: 67.89,
  },
  {
    symbol: 'ORCA',
    name: 'Orca',
    logoURI: '',
    price: 3.67,
    change24h: 6.45,
    change7d: 18.23,
    change30d: 52.34,
  },
]

export const mockProtocols: Protocol[] = [
  {
    id: 'marinade',
    name: 'Marinade',
    logoURI: '',
    tvl: 1234567890,
    category: 'liquid-staking',
  },
  {
    id: 'jito',
    name: 'Jito',
    logoURI: '',
    tvl: 987654321,
    category: 'liquid-staking',
  },
  {
    id: 'kamino',
    name: 'Kamino',
    logoURI: '',
    tvl: 567890123,
    category: 'lending',
  },
  {
    id: 'marginfi',
    name: 'MarginFi',
    logoURI: '',
    tvl: 456789012,
    category: 'lending',
  },
  {
    id: 'orca',
    name: 'Orca',
    logoURI: '',
    tvl: 789012345,
    category: 'dex',
  },
  {
    id: 'raydium',
    name: 'Raydium',
    logoURI: '',
    tvl: 890123456,
    category: 'dex',
  },
]

export function generateMockPositions(): Position[] {
  const positions: Position[] = [
    // Liquid Staking Positions
    {
      id: '1',
      protocol: mockProtocols[0], // Marinade
      type: 'staking',
      tokens: [{
        token: mockTokens[1], // mSOL
        amount: 125.5,
        value: 13332.415,
      }],
      totalValue: 13332.415,
      apy: 7.2,
      rewards: [{
        token: mockTokens[1],
        amount: 0.234,
        value: 24.86,
      }],
      depositedAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
    },
    {
      id: '2',
      protocol: mockProtocols[1], // Jito
      type: 'staking',
      tokens: [{
        token: mockTokens[2], // jitoSOL
        amount: 87.3,
        value: 9589.03,
      }],
      totalValue: 9589.03,
      apy: 8.1,
      rewards: [{
        token: mockTokens[2],
        amount: 0.178,
        value: 19.55,
      }],
      depositedAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
    },
    // Lending Positions
    {
      id: '3',
      protocol: mockProtocols[2], // Kamino
      type: 'lending',
      tokens: [
        {
          token: mockTokens[3], // USDC
          amount: 10000,
          value: 10000,
        },
        {
          token: mockTokens[0], // SOL
          amount: 50,
          value: 4922.5,
        }
      ],
      totalValue: 14922.5,
      apy: 12.5,
      rewards: [{
        token: mockTokens[3],
        amount: 45.67,
        value: 45.67,
      }],
      depositedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      health: 85,
      utilization: 42,
    },
    {
      id: '4',
      protocol: mockProtocols[3], // MarginFi
      type: 'borrowing',
      tokens: [{
        token: mockTokens[4], // USDT
        amount: -5000,
        value: -5000,
      }],
      totalValue: -5000,
      apy: -8.9,
      rewards: [],
      depositedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
      health: 72,
      utilization: 65,
    },
    // LP Positions
    {
      id: '5',
      protocol: mockProtocols[4], // Orca
      type: 'lp',
      tokens: [
        {
          token: mockTokens[0], // SOL
          amount: 25,
          value: 2461.25,
        },
        {
          token: mockTokens[3], // USDC
          amount: 2500,
          value: 2500,
        }
      ],
      totalValue: 4961.25,
      apy: 24.7,
      rewards: [
        {
          token: mockTokens[6], // ORCA
          amount: 12.34,
          value: 45.29,
        }
      ],
      depositedAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
      impermanentLoss: -2.3,
    },
    {
      id: '6',
      protocol: mockProtocols[5], // Raydium
      type: 'farming',
      tokens: [
        {
          token: mockTokens[5], // RAY
          amount: 500,
          value: 1225,
        },
        {
          token: mockTokens[3], // USDC
          amount: 1250,
          value: 1250,
        }
      ],
      totalValue: 2475,
      apy: 89.3,
      rewards: [
        {
          token: mockTokens[5], // RAY
          amount: 8.91,
          value: 21.83,
        }
      ],
      depositedAt: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000),
      impermanentLoss: -5.7,
    },
  ]

  return positions
}

export function generateMockPortfolio(): PortfolioData {
  const positions = generateMockPositions()
  const totalValue = positions.reduce((sum, pos) => sum + pos.totalValue, 0)
  
  return {
    totalValue,
    change24h: 5.67,
    change7d: 14.23,
    change30d: 48.92,
    positions,
    tokens: mockTokens,
    protocols: mockProtocols,
  }
}

export function generateYieldOpportunities(): YieldOpportunity[] {
  return [
    {
      id: 'opp-1',
      protocol: mockProtocols[0],
      type: 'staking',
      apy: 7.2,
      tvl: 1234567890,
      risk: 'low',
      tokens: [mockTokens[0]],
      minDeposit: 0.1,
      description: 'Stake SOL and receive mSOL liquid staking tokens. Earn staking rewards while maintaining liquidity.',
    },
    {
      id: 'opp-2',
      protocol: mockProtocols[1],
      type: 'staking',
      apy: 8.1,
      tvl: 987654321,
      risk: 'low',
      tokens: [mockTokens[0]],
      minDeposit: 0.1,
      description: 'Stake SOL with Jito for MEV-boosted rewards. Receive jitoSOL tokens.',
    },
    {
      id: 'opp-3',
      protocol: mockProtocols[2],
      type: 'lending',
      apy: 12.5,
      tvl: 567890123,
      risk: 'medium',
      tokens: [mockTokens[3], mockTokens[4]],
      minDeposit: 10,
      description: 'Lend stablecoins on Kamino for competitive yields with auto-compounding.',
    },
    {
      id: 'opp-4',
      protocol: mockProtocols[4],
      type: 'lp',
      apy: 24.7,
      tvl: 789012345,
      risk: 'medium',
      tokens: [mockTokens[0], mockTokens[3]],
      minDeposit: 100,
      description: 'Provide liquidity to SOL/USDC pool on Orca. Earn trading fees and ORCA rewards.',
    },
    {
      id: 'opp-5',
      protocol: mockProtocols[5],
      type: 'farming',
      apy: 89.3,
      tvl: 890123456,
      risk: 'high',
      tokens: [mockTokens[5], mockTokens[3]],
      minDeposit: 50,
      description: 'Farm RAY rewards by providing liquidity to RAY/USDC pool on Raydium.',
    },
    {
      id: 'opp-6',
      protocol: mockProtocols[3],
      type: 'lending',
      apy: 15.8,
      tvl: 456789012,
      risk: 'medium',
      tokens: [mockTokens[0]],
      minDeposit: 1,
      description: 'Lend SOL on MarginFi for leveraged yield farming opportunities.',
    },
  ]
}