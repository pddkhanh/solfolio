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

const PositionsList = dynamic(
  () => import('@/components/positions/PositionsList').then(mod => ({ default: mod.PositionsList })),
  { ssr: false }
);

const PortfolioPieChart = dynamic(
  () => import('@/components/portfolio/PortfolioPieChart').then(mod => ({ default: mod.PortfolioPieChart })),
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

        {/* Portfolio Analytics Section */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 lg:gap-8">
          <div className="w-full">
            <PortfolioPieChart />
          </div>
          <div className="space-y-4">
            {/* This space is reserved for additional analytics components */}
            {/* Future: Protocol breakdown chart, historical value chart, etc. */}
          </div>
        </div>

        {/* Token List */}
        <TokenList />

        {/* Protocol Positions */}
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">DeFi Positions</h2>
          <PositionsList />
        </div>
      </div>
    </div>
  );
}