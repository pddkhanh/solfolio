export interface MockToken {
  mint: string;
  symbol: string;
  name: string;
  balance: number;
  decimals: number;
  price: number;
  value: number;
  change24h: number;
  changePercent24h: number;
}

export interface MockPosition {
  id: string;
  protocol: string;
  type: string;
  value: number;
  apy?: number;
  rewards?: number;
  tokens: Array<{
    symbol: string;
    amount: number;
    value: number;
  }>;
}

export interface MockProtocolData {
  protocol: string;
  value: number;
  percentage: number;
  positions: number;
}

export const MOCK_TOKENS: MockToken[] = [
  {
    mint: 'So11111111111111111111111111111111111111112',
    symbol: 'SOL',
    name: 'Solana',
    balance: 10.5,
    decimals: 9,
    price: 145.32,
    value: 1525.86,
    change24h: 2.45,
    changePercent24h: 1.71,
  },
  {
    mint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
    symbol: 'USDC',
    name: 'USD Coin',
    balance: 500,
    decimals: 6,
    price: 1.0,
    value: 500,
    change24h: 0,
    changePercent24h: 0,
  },
  {
    mint: 'mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So',
    symbol: 'mSOL',
    name: 'Marinade Staked SOL',
    balance: 5.2,
    decimals: 9,
    price: 156.78,
    value: 815.26,
    change24h: 3.12,
    changePercent24h: 2.03,
  },
  {
    mint: 'J1toso1uCk3RLmjorhTtrVwY9HJ7X8V9yYac6Y7kGCPn',
    symbol: 'JitoSOL',
    name: 'Jito Staked SOL',
    balance: 2.1,
    decimals: 9,
    price: 162.45,
    value: 341.15,
    change24h: 2.89,
    changePercent24h: 1.81,
  },
];

export const MOCK_POSITIONS: MockPosition[] = [
  {
    id: 'marinade-staking-1',
    protocol: 'Marinade',
    type: 'Staking',
    value: 815.26,
    apy: 7.2,
    rewards: 2.15,
    tokens: [
      { symbol: 'mSOL', amount: 5.2, value: 815.26 }
    ]
  },
  {
    id: 'kamino-lending-1',
    protocol: 'Kamino',
    type: 'Lending',
    value: 500,
    apy: 4.5,
    tokens: [
      { symbol: 'USDC', amount: 500, value: 500 }
    ]
  },
  {
    id: 'orca-lp-1',
    protocol: 'Orca',
    type: 'Liquidity Pool',
    value: 1200,
    apy: 12.8,
    rewards: 5.32,
    tokens: [
      { symbol: 'SOL', amount: 4, value: 581.28 },
      { symbol: 'USDC', amount: 618.72, value: 618.72 }
    ]
  },
];

export const MOCK_PROTOCOL_DATA: MockProtocolData[] = [
  { protocol: 'Marinade', value: 815.26, percentage: 25.3, positions: 1 },
  { protocol: 'Kamino', value: 500, percentage: 15.5, positions: 1 },
  { protocol: 'Orca', value: 1200, percentage: 37.2, positions: 1 },
  { protocol: 'Wallet', value: 706.01, percentage: 21.9, positions: 0 },
];

export const MOCK_HISTORICAL_DATA = [
  { date: '2024-01-01', value: 2800 },
  { date: '2024-01-02', value: 2850 },
  { date: '2024-01-03', value: 2920 },
  { date: '2024-01-04', value: 2890 },
  { date: '2024-01-05', value: 2950 },
  { date: '2024-01-06', value: 3020 },
  { date: '2024-01-07', value: 3100 },
  { date: '2024-01-08', value: 3150 },
  { date: '2024-01-09', value: 3080 },
  { date: '2024-01-10', value: 3221.27 },
];

export const getMockPortfolioStats = () => {
  const totalValue = MOCK_TOKENS.reduce((sum, token) => sum + token.value, 0) +
    MOCK_POSITIONS.reduce((sum, pos) => sum + pos.value, 0);
  const change24h = MOCK_TOKENS.reduce((sum, token) => sum + token.change24h * token.balance, 0);
  const changePercent24h = (change24h / totalValue) * 100;

  return {
    totalValue,
    totalTokens: MOCK_TOKENS.length,
    totalPositions: MOCK_POSITIONS.length,
    change24h,
    changePercent24h,
    change7d: totalValue * 0.052,
    changePercent7d: 5.2,
    change30d: totalValue * 0.123,
    changePercent30d: 12.3,
  };
};

export const isMockMode = () => {
  return process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true';
};