'use client';

import { useWallet } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import dynamic from 'next/dynamic';
import { Button } from '@/components/ui/button';

const PortfolioOverview = dynamic(
  () => import('@/components/portfolio/PortfolioOverview').then(mod => ({ default: mod.PortfolioOverview })),
  { ssr: false }
);

const TokenList = dynamic(
  () => import('@/components/portfolio/TokenList').then(mod => ({ default: mod.TokenList })),
  { ssr: false }
);

export default function PortfolioPage() {
  const { connected } = useWallet();
  const { setVisible } = useWalletModal();

  if (!connected) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-md mx-auto text-center">
          <h1 className="text-3xl font-bold mb-4">Portfolio</h1>
          <p className="text-muted-foreground mb-8">
            Connect your wallet to view your portfolio and track your DeFi positions.
          </p>
          <Button
            onClick={() => setVisible(true)}
            size="lg"
          >
            Connect Wallet
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">My Portfolio</h1>
      
      <div className="space-y-8">
        {/* Portfolio Overview */}
        <PortfolioOverview />

        {/* Token List */}
        <TokenList />

        {/* Placeholder for future protocol positions */}
        <div className="rounded-lg border bg-card p-6">
          <h2 className="text-xl font-semibold mb-4">Protocol Positions</h2>
          <p className="text-muted-foreground text-center py-8">
            Protocol position tracking coming soon...
          </p>
        </div>
      </div>
    </div>
  );
}