/**
 * Advanced Filter Types for SolFolio
 * TASK-UI-021: Advanced Filtering System
 */

export type TokenType = 'native' | 'spl' | 'wrapped' | 'stable' | 'lp';
export type ProtocolType = 'marinade' | 'kamino' | 'orca' | 'raydium' | 'marginfi' | 'solend' | 'jupiter';
export type ChainType = 'solana' | 'ethereum' | 'polygon' | 'arbitrum' | 'optimism';
export type PositionType = 'staking' | 'lending' | 'liquidity' | 'farming' | 'vault';

export interface ValueRange {
  min: number;
  max: number;
}

export interface FilterState {
  // Search
  searchQuery: string;
  
  // Multi-select filters
  tokenTypes: TokenType[];
  protocols: ProtocolType[];
  chains: ChainType[];
  positionTypes: PositionType[];
  
  // Range filters
  valueRange: ValueRange | null;
  apyRange: ValueRange | null;
  
  // Boolean filters
  hideSmallBalances: boolean;
  hideZeroBalances: boolean;
  showOnlyStaked: boolean;
  showOnlyActive: boolean;
  
  // Sorting
  sortBy: 'value' | 'amount' | 'name' | 'apy' | 'protocol' | 'change24h' | 'allocation';
  sortOrder: 'asc' | 'desc';
  
  // View options
  viewMode: 'grid' | 'list' | 'compact';
  groupBy: 'none' | 'protocol' | 'type' | 'chain';
}

export interface FilterPreset {
  id: string;
  name: string;
  description?: string;
  filters: Partial<FilterState>;
  isDefault?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface QuickFilter {
  id: string;
  label: string;
  icon?: string;
  filters: Partial<FilterState>;
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info';
}

export const DEFAULT_FILTER_STATE: FilterState = {
  searchQuery: '',
  tokenTypes: [],
  protocols: [],
  chains: [],
  positionTypes: [],
  valueRange: null,
  apyRange: null,
  hideSmallBalances: false,
  hideZeroBalances: true,
  showOnlyStaked: false,
  showOnlyActive: false,
  sortBy: 'value',
  sortOrder: 'desc',
  viewMode: 'list',
  groupBy: 'none',
};

export const QUICK_FILTERS: QuickFilter[] = [
  {
    id: 'high-value',
    label: 'High Value',
    icon: '💰',
    filters: {
      valueRange: { min: 1000, max: Number.MAX_SAFE_INTEGER },
      sortBy: 'value',
      sortOrder: 'desc',
    },
    color: 'success',
  },
  {
    id: 'staking-only',
    label: 'Staking',
    icon: '🔒',
    filters: {
      positionTypes: ['staking'],
      showOnlyStaked: true,
    },
    color: 'primary',
  },
  {
    id: 'defi-positions',
    label: 'DeFi',
    icon: '🌊',
    filters: {
      positionTypes: ['lending', 'liquidity', 'farming'],
    },
    color: 'secondary',
  },
  {
    id: 'high-apy',
    label: 'High APY',
    icon: '📈',
    filters: {
      apyRange: { min: 10, max: Number.MAX_SAFE_INTEGER },
      sortBy: 'apy',
      sortOrder: 'desc',
    },
    color: 'warning',
  },
  {
    id: 'solana-only',
    label: 'Solana',
    icon: '⚡',
    filters: {
      chains: ['solana'],
    },
    color: 'info',
  },
];

// Protocol metadata
export const PROTOCOL_INFO: Record<ProtocolType, { name: string; logo: string; color: string }> = {
  marinade: { name: 'Marinade', logo: '/logos/marinade.svg', color: '#4ECDC4' },
  kamino: { name: 'Kamino', logo: '/logos/kamino.svg', color: '#FF6B6B' },
  orca: { name: 'Orca', logo: '/logos/orca.svg', color: '#FFD93D' },
  raydium: { name: 'Raydium', logo: '/logos/raydium.svg', color: '#7B68EE' },
  marginfi: { name: 'MarginFi', logo: '/logos/marginfi.svg', color: '#00D4FF' },
  solend: { name: 'Solend', logo: '/logos/solend.svg', color: '#14F195' },
  jupiter: { name: 'Jupiter', logo: '/logos/jupiter.svg', color: '#FFA500' },
};

// Token type metadata
export const TOKEN_TYPE_INFO: Record<TokenType, { label: string; description: string }> = {
  native: { label: 'Native', description: 'Native blockchain tokens' },
  spl: { label: 'SPL Token', description: 'Solana Program Library tokens' },
  wrapped: { label: 'Wrapped', description: 'Wrapped tokens from other chains' },
  stable: { label: 'Stablecoin', description: 'Stable value tokens' },
  lp: { label: 'LP Token', description: 'Liquidity provider tokens' },
};