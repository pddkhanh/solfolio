'use client'

import { ArrowRight, Shield, TrendingUp, Zap, BarChart3, Eye, Wallet } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

interface LandingPageProps {
  onConnectWallet: () => void
}

export function LandingPage({ onConnectWallet }: LandingPageProps) {
  const features = [
    {
      icon: Eye,
      title: 'Complete Visibility',
      description: 'Track all your DeFi positions across Solana protocols in one unified dashboard',
    },
    {
      icon: TrendingUp,
      title: 'Yield Optimization',
      description: 'Compare APYs across protocols and find the best opportunities for your assets',
    },
    {
      icon: Shield,
      title: 'Risk Management',
      description: 'Monitor health factors, impermanent loss, and protocol risks in real-time',
    },
    {
      icon: Zap,
      title: 'Real-Time Updates',
      description: 'Live portfolio tracking with automatic price and position updates',
    },
    {
      icon: BarChart3,
      title: 'Performance Analytics',
      description: 'Historical performance tracking and detailed P&L analysis',
    },
    {
      icon: Wallet,
      title: 'Multi-Wallet Support',
      description: 'Track multiple wallets and aggregate your entire DeFi portfolio',
    },
  ]

  const protocols = [
    { name: 'Marinade', emoji: '🌊', description: 'Liquid SOL staking', type: 'Staking' },
    { name: 'Kamino', emoji: '⚡', description: 'Lending & borrowing', type: 'Lending' },
    { name: 'Orca', emoji: '🐋', description: 'DEX & liquidity pools', type: 'DEX' },
    { name: 'Jito', emoji: '🚀', description: 'MEV-protected staking', type: 'Staking' },
    { name: 'Jupiter', emoji: '🪐', description: 'DEX aggregator', type: 'DEX' },
    { name: 'MarginFi', emoji: '📈', description: 'Margin trading', type: 'Trading' },
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-secondary/10" />
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5" />
        
        <div className="container relative mx-auto px-4 py-20 md:py-32">
          <div className="mx-auto max-w-4xl text-center">
            <h1 className="mb-6 text-5xl font-bold md:text-7xl">
              Your Complete
              <span className="text-gradient"> Solana DeFi </span>
              Portfolio Tracker
            </h1>
            
            <p className="mb-8 text-xl text-muted-foreground md:text-2xl">
              Track, analyze, and optimize all your DeFi positions across the Solana ecosystem in one powerful dashboard
            </p>
            
            <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Button 
                size="lg" 
                onClick={onConnectWallet}
                className="btn-primary group min-w-[200px]"
              >
                Connect Wallet
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                className="min-w-[200px]"
              >
                View Demo
              </Button>
            </div>
            
            <div className="mt-12 flex items-center justify-center gap-8 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Read-Only Access
              </div>
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4" />
                No Sign-Up Required
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="border-y border-border bg-card/50 py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-500">$2.5B+</div>
              <div className="text-sm text-muted-foreground">Total Value Tracked</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-500">50K+</div>
              <div className="text-sm text-muted-foreground">Active Wallets</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-500">6</div>
              <div className="text-sm text-muted-foreground">Protocols Supported</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-500">99.9%</div>
              <div className="text-sm text-muted-foreground">Uptime</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-4xl font-bold">Everything You Need</h2>
            <p className="text-xl text-muted-foreground">
              Powerful features to manage your DeFi portfolio effectively
            </p>
          </div>
          
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <Card 
                  key={index} 
                  className="glass-card p-6 transition-all hover:scale-105 hover:shadow-xl"
                >
                  <div className="mb-4 inline-flex rounded-lg bg-green-500/10 p-3">
                    <Icon className="h-6 w-6 text-green-500" />
                  </div>
                  <h3 className="mb-2 text-xl font-semibold">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      {/* Protocols Section */}
      <section className="border-t border-border bg-card/30 py-20">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-4xl font-bold">Supported Protocols</h2>
            <p className="text-xl text-muted-foreground">
              Track positions across all major Solana DeFi protocols
            </p>
          </div>
          
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 max-w-4xl mx-auto">
            {protocols.map((protocol) => (
              <Card
                key={protocol.name}
                className="glass-card p-6 transition-all hover:scale-105 hover:shadow-xl"
              >
                <div className="flex items-start gap-4">
                  <div className="text-3xl">{protocol.emoji}</div>
                  <div className="flex-1">
                    <h3 className="font-bold text-lg mb-1">{protocol.name}</h3>
                    <p className="text-sm text-muted-foreground mb-2">{protocol.description}</p>
                    <span className="inline-flex items-center rounded-full bg-green-500/10 px-2 py-1 text-xs font-medium text-green-500">
                      {protocol.type}
                    </span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
          
          <div className="mt-8 text-center">
            <p className="text-sm text-muted-foreground">
              More protocols coming soon
            </p>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-4xl font-bold">How It Works</h2>
            <p className="text-xl text-muted-foreground">
              Get started in seconds with our simple 3-step process
            </p>
          </div>
          
          <div className="mx-auto max-w-4xl">
            <div className="grid gap-8 md:grid-cols-3">
              <div className="text-center">
                <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-2xl font-bold text-primary">
                  1
                </div>
                <h3 className="mb-2 text-xl font-semibold">Connect Wallet</h3>
                <p className="text-muted-foreground">
                  Securely connect your Solana wallet with read-only access
                </p>
              </div>
              
              <div className="text-center">
                <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-2xl font-bold text-primary">
                  2
                </div>
                <h3 className="mb-2 text-xl font-semibold">Auto-Detection</h3>
                <p className="text-muted-foreground">
                  We automatically scan and detect all your DeFi positions
                </p>
              </div>
              
              <div className="text-center">
                <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-2xl font-bold text-primary">
                  3
                </div>
                <h3 className="mb-2 text-xl font-semibold">Track & Optimize</h3>
                <p className="text-muted-foreground">
                  Monitor performance and discover new yield opportunities
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="border-t border-border bg-gradient-to-br from-primary/5 to-secondary/5 py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="mb-4 text-4xl font-bold">
            Ready to Take Control of Your DeFi Portfolio?
          </h2>
          <p className="mb-8 text-xl text-muted-foreground">
            Join thousands of users already tracking their Solana DeFi positions
          </p>
          <Button 
            size="lg" 
            onClick={onConnectWallet}
            className="btn-primary group"
          >
            Get Started Now
            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Button>
        </div>
      </section>
    </div>
  )
}