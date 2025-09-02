export interface Token {
  symbol: string
  name: string
  logoURI: string
  price: number
  change24h: number
  change7d: number
  change30d: number
}

export interface Protocol {
  id: string
  name: string
  logoURI: string
  tvl: number
  category: 'liquid-staking' | 'lending' | 'dex' | 'yield'
}

export interface Position {
  id: string
  protocol: Protocol
  type: 'staking' | 'lending' | 'borrowing' | 'lp' | 'farming'
  tokens: {
    token: Token
    amount: number
    value: number
  }[]
  totalValue: number
  apy: number
  rewards: {
    token: Token
    amount: number
    value: number
  }[]
  depositedAt: Date
  health?: number // For lending positions
  utilization?: number // For lending positions
  impermanentLoss?: number // For LP positions
}

export interface PortfolioData {
  totalValue: number
  change24h: number
  change7d: number
  change30d: number
  positions: Position[]
  tokens: Token[]
  protocols: Protocol[]
}

export interface YieldOpportunity {
  id: string
  protocol: Protocol
  type: 'staking' | 'lending' | 'lp' | 'farming'
  apy: number
  tvl: number
  risk: 'low' | 'medium' | 'high'
  tokens: Token[]
  minDeposit: number
  lockPeriod?: number // in days
  description: string
}