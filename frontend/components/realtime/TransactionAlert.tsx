'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { CheckCircle2, XCircle, AlertCircle, ArrowUpRight, ArrowDownLeft, Activity, ExternalLink } from 'lucide-react';
import { useEffect } from 'react';
import { cn } from '@/lib/utils';

export type TransactionType = 'send' | 'receive' | 'swap' | 'stake' | 'unstake' | 'claim' | 'deposit' | 'withdraw';
export type TransactionStatus = 'pending' | 'success' | 'error';

export interface Transaction {
  id: string;
  type: TransactionType;
  status: TransactionStatus;
  amount?: number;
  token?: string;
  from?: string;
  to?: string;
  txHash?: string;
  timestamp: Date;
  message?: string;
}

const transactionIcons = {
  send: ArrowUpRight,
  receive: ArrowDownLeft,
  swap: Activity,
  stake: CheckCircle2,
  unstake: XCircle,
  claim: CheckCircle2,
  deposit: ArrowDownLeft,
  withdraw: ArrowUpRight,
};

const statusConfig = {
  pending: {
    icon: AlertCircle,
    color: 'text-yellow-500',
    bgColor: 'bg-yellow-500/10',
    title: 'Transaction Pending',
  },
  success: {
    icon: CheckCircle2,
    color: 'text-green-500',
    bgColor: 'bg-green-500/10',
    title: 'Transaction Successful',
  },
  error: {
    icon: XCircle,
    color: 'text-red-500',
    bgColor: 'bg-red-500/10',
    title: 'Transaction Failed',
  },
};

interface TransactionAlertProps {
  transaction: Transaction;
  onClose?: () => void;
  autoClose?: boolean;
  duration?: number;
}

export function TransactionAlert({
  transaction,
  onClose,
  autoClose = true,
  duration = 5000,
}: TransactionAlertProps) {
  const TxIcon = transactionIcons[transaction.type];
  const StatusIcon = statusConfig[transaction.status].icon;
  const config = statusConfig[transaction.status];

  useEffect(() => {
    if (autoClose && transaction.status !== 'pending') {
      const timer = setTimeout(() => {
        onClose?.();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [autoClose, duration, transaction.status, onClose]);

  const formatAddress = (address: string) => {
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  };

  const formatAmount = (amount: number, token: string) => {
    return `${amount.toLocaleString()} ${token}`;
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 50, scale: 0.3 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
      className={cn(
        'relative overflow-hidden bg-white dark:bg-gray-900 rounded-lg shadow-lg border border-gray-200 dark:border-gray-800 p-4',
        'min-w-[320px] max-w-[420px]'
      )}
    >
      {/* Progress bar for pending transactions */}
      {transaction.status === 'pending' && (
        <motion.div
          className="absolute top-0 left-0 h-1 bg-yellow-500"
          initial={{ width: '0%' }}
          animate={{ width: '100%' }}
          transition={{ duration: 10, ease: 'linear' }}
        />
      )}

      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className={cn('p-2 rounded-lg', config.bgColor)}>
          <TxIcon className={cn('w-5 h-5', config.color)} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="font-semibold text-gray-900 dark:text-gray-100">
              {config.title}
            </h4>
            <StatusIcon className={cn('w-4 h-4', config.color)} />
          </div>

          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            {transaction.message || (
              <>
                {transaction.type === 'send' && `Sent ${transaction.amount ? formatAmount(transaction.amount, transaction.token!) : ''}`}
                {transaction.type === 'receive' && `Received ${transaction.amount ? formatAmount(transaction.amount, transaction.token!) : ''}`}
                {transaction.type === 'swap' && 'Swap completed'}
                {transaction.type === 'stake' && `Staked ${transaction.amount ? formatAmount(transaction.amount, transaction.token!) : ''}`}
                {transaction.type === 'unstake' && `Unstaked ${transaction.amount ? formatAmount(transaction.amount, transaction.token!) : ''}`}
                {transaction.type === 'claim' && 'Rewards claimed'}
                {transaction.type === 'deposit' && `Deposited ${transaction.amount ? formatAmount(transaction.amount, transaction.token!) : ''}`}
                {transaction.type === 'withdraw' && `Withdrew ${transaction.amount ? formatAmount(transaction.amount, transaction.token!) : ''}`}
              </>
            )}
          </p>

          {/* Transaction details */}
          {(transaction.from || transaction.to) && (
            <div className="mt-2 text-xs text-gray-500 dark:text-gray-500">
              {transaction.from && (
                <div>From: {formatAddress(transaction.from)}</div>
              )}
              {transaction.to && (
                <div>To: {formatAddress(transaction.to)}</div>
              )}
            </div>
          )}

          {/* View on explorer link */}
          {transaction.txHash && (
            <motion.a
              href={`https://solscan.io/tx/${transaction.txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 mt-2 text-xs text-blue-500 hover:text-blue-600"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              View transaction
              <ExternalLink className="w-3 h-3" />
            </motion.a>
          )}
        </div>

        {/* Close button */}
        {onClose && (
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <XCircle className="w-4 h-4" />
          </motion.button>
        )}
      </div>

      {/* Animated border for status */}
      <motion.div
        className={cn('absolute inset-0 border-2 rounded-lg pointer-events-none', {
          'border-yellow-500/30': transaction.status === 'pending',
          'border-green-500/30': transaction.status === 'success',
          'border-red-500/30': transaction.status === 'error',
        })}
        animate={
          transaction.status === 'pending'
            ? {
                opacity: [0.3, 1, 0.3],
              }
            : {}
        }
        transition={{
          duration: 2,
          repeat: transaction.status === 'pending' ? Infinity : 0,
          ease: 'easeInOut',
        }}
      />
    </motion.div>
  );
}

// Hook to show transaction alerts using sonner
export function useTransactionAlerts() {
  const showTransaction = (transaction: Transaction) => {
    const id = transaction.id || `tx-${Date.now()}`;
    
    toast.custom(
      (t) => (
        <TransactionAlert
          transaction={transaction}
          onClose={() => toast.dismiss(t)}
        />
      ),
      {
        id,
        duration: transaction.status === 'pending' ? Infinity : 5000,
      }
    );

    return id;
  };

  const updateTransaction = (id: string, updates: Partial<Transaction>) => {
    toast.custom(
      (t) => (
        <TransactionAlert
          transaction={{ id, ...updates } as Transaction}
          onClose={() => toast.dismiss(t)}
        />
      ),
      {
        id,
        duration: updates.status === 'pending' ? Infinity : 5000,
      }
    );
  };

  const dismissTransaction = (id: string) => {
    toast.dismiss(id);
  };

  return {
    showTransaction,
    updateTransaction,
    dismissTransaction,
  };
}

// Transaction notification component for embedding in UI
export function TransactionNotificationCenter({ transactions }: { transactions: Transaction[] }) {
  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-2 max-h-[400px] overflow-y-auto">
      <AnimatePresence mode="popLayout">
        {transactions.map((tx) => (
          <TransactionAlert
            key={tx.id}
            transaction={tx}
            autoClose={tx.status !== 'pending'}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}