/**
 * Portfolio Export Section Component
 * Integrates export functionality into the portfolio overview
 */

'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { useWallet } from '@solana/wallet-adapter-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ExportButton } from '@/components/ui/export-button';
import { ExportProgress } from '@/components/ui/export-progress';
import { useExport, useExportData } from '@/hooks/useExport';
import { getMockPortfolioStats, getMockTokenList, getMockPositions } from '@/lib/mock-data';
import { Download, TrendingUp, Coins, Activity, Share2 } from 'lucide-react';
import { staggerContainer, staggerItem, cardHoverVariants } from '@/lib/animations';
import { cn } from '@/lib/utils';
import type { ExportData } from '@/lib/export-utils';

interface PortfolioExportSectionProps {
  className?: string;
}

export function PortfolioExportSection({ className }: PortfolioExportSectionProps) {
  const { connected, publicKey } = useWallet();
  const { isExporting, progress } = useExport();
  const { transformPortfolioData } = useExportData();
  const [exportData, setExportData] = React.useState<ExportData | null>(null);

  // Generate mock data for demonstration
  React.useEffect(() => {
    const generateExportData = async () => {
      if (connected && publicKey) {
        // In a real app, this would fetch actual data
        const mockStats = getMockPortfolioStats();
        const mockTokens = getMockTokenList(10);
        const mockPositions = getMockPositions(5);

        const data: ExportData = {
          portfolio: {
            totalValue: mockStats.totalValue,
            change24h: mockStats.change24h || 0,
            changePercent: mockStats.changePercent24h || 0,
            lastUpdated: new Date().toISOString(),
          },
          tokens: mockTokens.map(token => ({
            symbol: token.symbol,
            name: token.name,
            balance: token.balance,
            value: token.value,
            price: token.price,
            change24h: token.change24h || 0,
            changePercent: token.changePercent24h || 0,
          })),
          positions: mockPositions.map(position => ({
            protocol: position.protocol,
            type: position.type,
            value: position.value,
            apy: position.apy || 0,
            rewards: position.rewards || 0,
            status: position.status,
          })),
        };

        setExportData(data);
      }
    };

    generateExportData();
  }, [connected, publicKey]);

  if (!connected || !exportData) {
    return (
      <Card className={cn("border-dashed border-2", className)}>
        <CardContent className="flex flex-col items-center justify-center p-8 text-center">
          <div className="p-3 rounded-full bg-muted mb-4">
            <Download className="w-6 h-6 text-muted-foreground" />
          </div>
          <h3 className="font-semibold mb-2">Export Not Available</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Connect your wallet to enable portfolio export functionality
          </p>
        </CardContent>
      </Card>
    );
  }

  const stats = [
    {
      label: 'Total Value',
      value: `$${exportData.portfolio.totalValue.toLocaleString()}`,
      icon: TrendingUp,
      color: 'text-green-500',
    },
    {
      label: 'Token Holdings',
      value: exportData.tokens.length.toString(),
      icon: Coins,
      color: 'text-blue-500',
    },
    {
      label: 'DeFi Positions',
      value: exportData.positions.length.toString(),
      icon: Activity,
      color: 'text-purple-500',
    },
  ];

  return (
    <motion.div
      variants={staggerContainer}
      initial="initial"
      animate="animate"
      className={cn("space-y-6", className)}
    >
      {/* Export Overview Card */}
      <motion.div variants={staggerItem}>
        <Card className="relative overflow-hidden group">
          {/* Background gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
          
          <CardHeader className="relative">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Share2 className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-lg">Export Portfolio</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Download your portfolio data in multiple formats
                  </p>
                </div>
              </div>
              
              {!isExporting && (
                <ExportButton 
                  data={exportData}
                  variant="dropdown"
                  showQuickActions={true}
                  className="shadow-lg"
                />
              )}
            </div>
          </CardHeader>

          <CardContent className="relative space-y-4">
            {/* Export Progress */}
            {isExporting && progress && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
              >
                <ExportProgress progress={progress} />
              </motion.div>
            )}

            {/* Portfolio Stats Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {stats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <motion.div
                    key={stat.label}
                    variants={staggerItem}
                    className="flex items-center gap-3 p-3 rounded-lg bg-card/50 border border-border/50"
                  >
                    <div className={cn("p-2 rounded-md bg-current/10", stat.color)}>
                      <Icon className={cn("w-4 h-4", stat.color)} />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">{stat.label}</p>
                      <p className="font-semibold">{stat.value}</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Export Formats Preview */}
            <div className="pt-4 border-t border-border/50">
              <h4 className="text-sm font-medium mb-3">Available Export Formats</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {[
                  { format: 'CSV', desc: 'Spreadsheet', icon: '📊' },
                  { format: 'PDF', desc: 'Report', icon: '📄' },
                  { format: 'JSON', desc: 'Raw Data', icon: '💾' },
                  { format: 'PNG', desc: 'Screenshot', icon: '📸' },
                ].map((item) => (
                  <div
                    key={item.format}
                    className="flex items-center gap-2 p-2 rounded-md bg-muted/30 text-xs"
                  >
                    <span className="text-base">{item.icon}</span>
                    <div>
                      <span className="font-medium">{item.format}</span>
                      <span className="text-muted-foreground ml-1">{item.desc}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Last Updated */}
            <div className="pt-2 text-xs text-muted-foreground">
              Last updated: {new Date(exportData.portfolio.lastUpdated).toLocaleString()}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Export Tips Card */}
      <motion.div variants={staggerItem}>
        <Card className="bg-accent/20 border-accent/30">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="p-1.5 rounded-full bg-accent/50 mt-0.5">
                <Download className="w-3 h-3 text-accent-foreground" />
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-medium mb-1">Export Tips</h4>
                <ul className="text-xs text-muted-foreground space-y-1">
                  <li>• CSV format is perfect for Excel or Google Sheets analysis</li>
                  <li>• PDF reports include visual formatting and charts</li>
                  <li>• JSON exports contain raw data for developers</li>
                  <li>• Screenshots capture the visual dashboard state</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}

export default PortfolioExportSection;