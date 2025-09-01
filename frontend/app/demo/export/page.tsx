/**
 * Export Demo Page
 * Demonstrates the export functionality with sample data
 */

'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { ExportButton } from '@/components/ui/export-button';
import { PortfolioExportSection } from '@/components/portfolio/PortfolioExportSection';
import { PortfolioOverview } from '@/components/portfolio/PortfolioOverview';
import { TokenList } from '@/components/portfolio/TokenList';
import { PortfolioPieChart } from '@/components/portfolio/PortfolioPieChart';
import { HistoricalValueChart } from '@/components/portfolio/HistoricalValueChart';
import { getMockPortfolioStats, getMockTokenList, getMockPositions } from '@/lib/mock-data';
import { 
  Download,
  FileText,
  Code,
  Palette,
  Zap,
  CheckCircle2,
  Sparkles,
  ArrowLeft
} from 'lucide-react';
import { fadeInUp, staggerContainer, staggerItem } from '@/lib/animations';
import { cn } from '@/lib/utils';
import type { ExportData } from '@/lib/export-utils';
import Link from 'next/link';

// Sample export data for demo
const demoExportData: ExportData = {
  portfolio: {
    totalValue: 125420.87,
    change24h: 3420.15,
    changePercent: 2.81,
    lastUpdated: new Date().toISOString(),
  },
  tokens: [
    {
      symbol: 'SOL',
      name: 'Solana',
      balance: 245.67,
      value: 45230.12,
      price: 184.15,
      change24h: 850.25,
      changePercent: 1.92,
    },
    {
      symbol: 'USDC',
      name: 'USD Coin',
      balance: 25000,
      value: 25000.00,
      price: 1.00,
      change24h: 0,
      changePercent: 0,
    },
    {
      symbol: 'RAY',
      name: 'Raydium',
      balance: 1420.33,
      value: 18420.15,
      price: 12.97,
      change24h: 420.33,
      changePercent: 2.34,
    },
    {
      symbol: 'ORCA',
      name: 'Orca',
      balance: 8420.15,
      value: 12840.25,
      price: 1.53,
      change24h: -125.80,
      changePercent: -0.97,
    },
    {
      symbol: 'MNDE',
      name: 'Marinade',
      balance: 15420.67,
      value: 23930.35,
      price: 1.55,
      change24h: 1275.25,
      changePercent: 5.63,
    },
  ],
  positions: [
    {
      protocol: 'Marinade',
      type: 'Liquid Staking',
      value: 45230.12,
      apy: 6.8,
      rewards: 125.45,
      status: 'Active',
    },
    {
      protocol: 'Kamino',
      type: 'Lending',
      value: 25000.00,
      apy: 12.4,
      rewards: 89.25,
      status: 'Active',
    },
    {
      protocol: 'Orca',
      type: 'Liquidity Pool',
      value: 18420.15,
      apy: 18.2,
      rewards: 215.80,
      status: 'Active',
    },
    {
      protocol: 'Raydium',
      type: 'Farming',
      value: 12840.25,
      apy: 24.6,
      rewards: 342.15,
      status: 'Active',
    },
    {
      protocol: 'Jupiter',
      type: 'DCA Strategy',
      value: 23930.35,
      apy: 15.3,
      rewards: 178.90,
      status: 'Active',
    },
  ],
};

export default function ExportDemoPage() {
  const features = [
    {
      icon: FileText,
      title: 'Multiple Formats',
      description: 'Export to CSV, PDF, JSON, or capture screenshots',
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
    },
    {
      icon: Zap,
      title: 'Fast Processing',
      description: 'Optimized export with real-time progress tracking',
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-500/10',
    },
    {
      icon: Palette,
      title: 'Beautiful Design',
      description: 'Professional formatting with Solana branding',
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
    },
    {
      icon: Code,
      title: 'Developer Friendly',
      description: 'JSON exports with complete portfolio data',
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-accent/10" />
        
        <div className="relative container mx-auto px-4 py-12">
          <motion.div
            variants={staggerContainer}
            initial="initial"
            animate="animate"
            className="max-w-4xl mx-auto"
          >
            {/* Navigation */}
            <motion.div variants={staggerItem} className="mb-8">
              <Link
                href="/"
                className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Dashboard
              </Link>
            </motion.div>

            {/* Header */}
            <motion.div variants={staggerItem} className="text-center mb-12">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
                <Sparkles className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-primary">TASK-UI-022</span>
                <Badge variant="secondary" className="text-xs">
                  Export Functionality
                </Badge>
              </div>
              
              <h1 className="text-4xl font-bold mb-4">
                Portfolio Export System
              </h1>
              <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                Comprehensive data export with multiple formats, progress tracking, 
                and beautiful user experience following SolFolio design specifications.
              </p>
            </motion.div>

            {/* Features Grid */}
            <motion.div 
              variants={staggerItem}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12"
            >
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <Card key={index} className="text-center">
                    <CardContent className="p-6">
                      <div className={cn(
                        "w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-4",
                        feature.bgColor
                      )}>
                        <Icon className={cn("w-6 h-6", feature.color)} />
                      </div>
                      <h3 className="font-semibold mb-2">{feature.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {feature.description}
                      </p>
                    </CardContent>
                  </Card>
                );
              })}
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Demo Section */}
      <div className="container mx-auto px-4 pb-12">
        <div className="max-w-6xl mx-auto space-y-8">
          
          {/* Quick Export Demo */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Try Export Functionality</h2>
                  <p className="text-muted-foreground">
                    Experience the export system with sample portfolio data
                  </p>
                </div>
                <ExportButton 
                  data={demoExportData}
                  variant="dropdown"
                  size="lg"
                  showQuickActions={true}
                />
              </div>

              {/* Sample Data Preview */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="text-center p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                  <div className="text-2xl font-bold text-green-600 mb-1">
                    ${demoExportData.portfolio.totalValue.toLocaleString()}
                  </div>
                  <div className="text-sm text-muted-foreground">Total Value</div>
                </div>
                <div className="text-center p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
                  <div className="text-2xl font-bold text-blue-600 mb-1">
                    {demoExportData.tokens.length}
                  </div>
                  <div className="text-sm text-muted-foreground">Token Holdings</div>
                </div>
                <div className="text-center p-4 rounded-lg bg-purple-500/10 border border-purple-500/20">
                  <div className="text-2xl font-bold text-purple-600 mb-1">
                    {demoExportData.positions.length}
                  </div>
                  <div className="text-sm text-muted-foreground">DeFi Positions</div>
                </div>
              </div>

              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-4">
                  Click the export button above to download sample data in your preferred format
                </p>
                <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  <span>All export formats available</span>
                  <span>•</span>
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  <span>Progress tracking enabled</span>
                  <span>•</span>
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  <span>Custom filename support</span>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Dashboard Preview (for screenshot export) */}
          <motion.div
            id="portfolio-dashboard"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="space-y-6"
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Download className="w-5 h-5" />
                  Portfolio Dashboard Preview
                </CardTitle>
                <p className="text-muted-foreground">
                  This section demonstrates what gets captured in screenshot exports
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Portfolio Overview */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">Portfolio Value</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        ${demoExportData.portfolio.totalValue.toLocaleString()}
                      </div>
                      <div className="text-sm text-green-600 flex items-center gap-1">
                        <span>+{demoExportData.portfolio.changePercent.toFixed(2)}%</span>
                        <span className="text-muted-foreground">24h</span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">Top Position</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-lg font-semibold">Marinade</div>
                      <div className="text-sm text-muted-foreground">Liquid Staking</div>
                      <div className="text-sm text-green-600">6.8% APY</div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">Active Protocols</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {demoExportData.positions.length}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Earning rewards
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Token Holdings Preview */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Token Holdings</h3>
                  <div className="space-y-2">
                    {demoExportData.tokens.slice(0, 3).map((token, index) => (
                      <div 
                        key={token.symbol}
                        className="flex items-center justify-between p-3 rounded-lg bg-muted/30"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold">
                            {token.symbol.slice(0, 2)}
                          </div>
                          <div>
                            <div className="font-medium">{token.symbol}</div>
                            <div className="text-xs text-muted-foreground">{token.name}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">${token.value.toLocaleString()}</div>
                          <div className={cn(
                            "text-xs",
                            token.changePercent >= 0 ? "text-green-600" : "text-red-600"
                          )}>
                            {token.changePercent >= 0 ? '+' : ''}
                            {token.changePercent.toFixed(2)}%
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Implementation Details */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Implementation Details</CardTitle>
                <p className="text-muted-foreground">
                  Technical specifications and features implemented
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-3">Export Formats</h4>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                        CSV - Spreadsheet compatible format
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                        PDF - Professional report with branding
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                        JSON - Complete raw data export
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                        Screenshot - High-resolution PNG capture
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-3">Features</h4>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                        Real-time progress tracking
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                        Custom filename support
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                        Timestamp and watermark options
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                        Error handling with user feedback
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                        Responsive design for all screens
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                        60 FPS animations throughout
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

        </div>
      </div>
    </div>
  );
}