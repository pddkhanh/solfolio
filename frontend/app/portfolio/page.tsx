'use client';

import { useWallet } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@/contexts/WalletContextProvider';
import { Button } from '@/components/ui/button';

import { PortfolioOverview } from '@/components/portfolio/PortfolioOverview';
import { TokenList } from '@/components/portfolio/TokenList';
import { PositionsList } from '@/components/positions/PositionsList';
import { PortfolioPieChart } from '@/components/portfolio/PortfolioPieChart';
import { ProtocolBreakdown } from '@/components/portfolio/ProtocolBreakdown';
import { HistoricalValueChart } from '@/components/portfolio/HistoricalValueChart';

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

        {/* Historical Value Chart */}
        <HistoricalValueChart />

        {/* Portfolio Analytics Section */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 lg:gap-8">
          <div className="w-full">
            <PortfolioPieChart />
          </div>
          <div className="w-full">
            <ProtocolBreakdown />
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