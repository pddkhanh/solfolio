'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import { ArrowUpRight, ArrowDownLeft, RefreshCw, Search, Filter, ExternalLink } from 'lucide-react';
import { TimePeriod } from '@/app/analytics/page';

interface TransactionHistoryProps {
  timePeriod: TimePeriod;
  selectedAsset: string | null;
}

type TransactionType = 'buy' | 'sell' | 'swap' | 'stake' | 'unstake';

interface Transaction {
  id: string;
  type: TransactionType;
  asset: string;
  amount: number;
  value: number;
  price: number;
  pnl?: number;
  timestamp: Date;
  txHash: string;
}

// Generate mock transactions
const generateMockTransactions = (count: number): Transaction[] => {
  const types: TransactionType[] = ['buy', 'sell', 'swap', 'stake', 'unstake'];
  const assets = ['SOL', 'USDC', 'RAY', 'ORCA', 'MNDE', 'JTO', 'BONK'];
  
  return Array.from({ length: count }, (_, i) => ({
    id: `tx-${i}`,
    type: types[Math.floor(Math.random() * types.length)],
    asset: assets[Math.floor(Math.random() * assets.length)],
    amount: Math.random() * 1000,
    value: Math.random() * 10000,
    price: Math.random() * 100,
    pnl: Math.random() > 0.3 ? (Math.random() - 0.3) * 1000 : undefined,
    timestamp: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
    txHash: `${Math.random().toString(36).substring(2, 15)}...${Math.random().toString(36).substring(2, 7)}`,
  }));
};

export default function TransactionHistory({ timePeriod, selectedAsset }: TransactionHistoryProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<TransactionType | 'all'>('all');
  const [transactions] = useState(() => generateMockTransactions(20));

  const filteredTransactions = transactions.filter(tx => {
    const matchesSearch = tx.asset.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         tx.txHash.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = selectedType === 'all' || tx.type === selectedType;
    const matchesAsset = !selectedAsset || tx.asset === selectedAsset;
    return matchesSearch && matchesType && matchesAsset;
  });

  const getTypeIcon = (type: TransactionType) => {
    switch (type) {
      case 'buy':
        return <ArrowDownLeft className="w-4 h-4 text-success" />;
      case 'sell':
        return <ArrowUpRight className="w-4 h-4 text-danger" />;
      case 'swap':
        return <RefreshCw className="w-4 h-4 text-accent" />;
      default:
        return <ArrowUpRight className="w-4 h-4 text-text-secondary" />;
    }
  };

  const getTypeLabel = (type: TransactionType) => {
    return type.charAt(0).toUpperCase() + type.slice(1);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-bg-secondary border border-border-default rounded-xl p-6"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h2 className="text-xl font-semibold text-white mb-1">
            Transaction History
          </h2>
          <p className="text-text-secondary text-sm">
            {selectedAsset ? `${selectedAsset} transactions` : 'All transactions'} in {timePeriod}
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input
              type="text"
              placeholder="Search transactions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 bg-bg-tertiary border border-border-default rounded-lg text-white placeholder-text-muted focus:outline-none focus:border-border-hover transition-all text-sm w-full sm:w-48"
            />
          </div>

          {/* Type Filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-text-muted" />
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value as TransactionType | 'all')}
              className="pl-10 pr-8 py-2 bg-bg-tertiary border border-border-default rounded-lg text-white focus:outline-none focus:border-border-hover transition-all text-sm appearance-none cursor-pointer"
            >
              <option value="all">All Types</option>
              <option value="buy">Buy</option>
              <option value="sell">Sell</option>
              <option value="swap">Swap</option>
              <option value="stake">Stake</option>
              <option value="unstake">Unstake</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border-default">
              <th className="text-left text-text-secondary text-sm font-medium pb-3">Type</th>
              <th className="text-left text-text-secondary text-sm font-medium pb-3">Asset</th>
              <th className="text-right text-text-secondary text-sm font-medium pb-3">Amount</th>
              <th className="text-right text-text-secondary text-sm font-medium pb-3">Value</th>
              <th className="text-right text-text-secondary text-sm font-medium pb-3">Price</th>
              <th className="text-right text-text-secondary text-sm font-medium pb-3">P&L</th>
              <th className="text-left text-text-secondary text-sm font-medium pb-3">Time</th>
              <th className="text-center text-text-secondary text-sm font-medium pb-3">TX</th>
            </tr>
          </thead>
          <tbody>
            {filteredTransactions.map((tx, index) => (
              <motion.tr
                key={tx.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.02 * index }}
                className="border-b border-border-default hover:bg-bg-tertiary/50 transition-colors"
              >
                <td className="py-3">
                  <div className="flex items-center gap-2">
                    {getTypeIcon(tx.type)}
                    <span className="text-white text-sm">{getTypeLabel(tx.type)}</span>
                  </div>
                </td>
                <td className="py-3">
                  <span className="text-white font-medium text-sm">{tx.asset}</span>
                </td>
                <td className="py-3 text-right">
                  <span className="text-white text-sm">{tx.amount.toFixed(2)}</span>
                </td>
                <td className="py-3 text-right">
                  <span className="text-white text-sm">${tx.value.toLocaleString()}</span>
                </td>
                <td className="py-3 text-right">
                  <span className="text-text-secondary text-sm">${tx.price.toFixed(2)}</span>
                </td>
                <td className="py-3 text-right">
                  {tx.pnl !== undefined ? (
                    <span className={`text-sm font-medium ${tx.pnl >= 0 ? 'text-success' : 'text-danger'}`}>
                      {tx.pnl >= 0 ? '+' : ''}${Math.abs(tx.pnl).toFixed(2)}
                    </span>
                  ) : (
                    <span className="text-text-muted text-sm">-</span>
                  )}
                </td>
                <td className="py-3">
                  <span className="text-text-secondary text-sm">
                    {tx.timestamp.toLocaleDateString('en', { 
                      month: 'short', 
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </td>
                <td className="py-3 text-center">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    className="text-text-secondary hover:text-white transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </motion.button>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Summary Stats */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4"
      >
        <div className="bg-bg-tertiary rounded-lg p-3 border border-border-default">
          <p className="text-text-muted text-xs mb-1">Total Transactions</p>
          <p className="text-white font-semibold">{filteredTransactions.length}</p>
        </div>
        <div className="bg-bg-tertiary rounded-lg p-3 border border-border-default">
          <p className="text-text-muted text-xs mb-1">Total Volume</p>
          <p className="text-white font-semibold">
            ${filteredTransactions.reduce((sum, tx) => sum + tx.value, 0).toLocaleString()}
          </p>
        </div>
        <div className="bg-bg-tertiary rounded-lg p-3 border border-border-default">
          <p className="text-text-muted text-xs mb-1">Realized P&L</p>
          <p className="text-success font-semibold">
            +${filteredTransactions
              .filter(tx => tx.pnl && tx.pnl > 0)
              .reduce((sum, tx) => sum + (tx.pnl || 0), 0)
              .toFixed(2)}
          </p>
        </div>
        <div className="bg-bg-tertiary rounded-lg p-3 border border-border-default">
          <p className="text-text-muted text-xs mb-1">Avg Transaction</p>
          <p className="text-white font-semibold">
            ${(filteredTransactions.reduce((sum, tx) => sum + tx.value, 0) / filteredTransactions.length).toFixed(0)}
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}