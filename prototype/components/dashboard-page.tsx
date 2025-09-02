'use client'

import { useState } from 'react'
import { TrendingUp, TrendingDown, DollarSign, Activity, PieChart, BarChart3, RefreshCw, Download, Plus } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface DashboardPageProps {
  walletAddress: string
  onDisconnect: () => void
}

export function DashboardPage({ walletAddress, onDisconnect }: DashboardPageProps) {
  const [isRefreshing, setIsRefreshing] = useState(false)

  const handleRefresh = () => {
    setIsRefreshing(true)
    setTimeout(() => setIsRefreshing(false), 2000)
  }

  const stats = [
    {
      title: 'Total Value',
      value: '$125,432.89',
      change: '+5.23%',
      changeValue: '+$6,234.12',
      icon: DollarSign,
      trend: 'up',
      gradient: 'from-primary to-secondary',
    },
    {
      title: '24h Change',
      value: '+$6,234.12',
      change: '+5.23%',
      changeValue: undefined,
      icon: TrendingUp,
      trend: 'up',
      gradient: 'from-green-500 to-emerald-500',
    },
    {
      title: '7d Change',
      value: '+$12,456.78',
      change: '+11.04%',
      changeValue: undefined,
      icon: TrendingUp,
      trend: 'up',
      gradient: 'from-blue-500 to-cyan-500',
    },
    {
      title: 'Active Positions',
      value: '12',
      change: '6 protocols',
      changeValue: undefined,
      icon: Activity,
      trend: 'neutral',
      gradient: 'from-orange-500 to-yellow-500',
    },
  ]

  const positions = [
    { 
      protocol: 'Marinade', 
      type: 'Staking', 
      value: '$45,234.56', 
      apy: '7.2%', 
      token: 'mSOL',
      amount: '425.5 mSOL',
      rewards: '$124.56',
      health: 100
    },
    { 
      protocol: 'Jito', 
      type: 'Staking', 
      value: '$32,456.78', 
      apy: '8.1%', 
      token: 'jitoSOL',
      amount: '295.8 jitoSOL',
      rewards: '$89.23',
      health: 100
    },
    { 
      protocol: 'Kamino', 
      type: 'Lending', 
      value: '$28,123.45', 
      apy: '12.5%', 
      token: 'USDC',
      amount: '28,123 USDC',
      rewards: '$45.67',
      health: 85
    },
    { 
      protocol: 'Orca', 
      type: 'LP', 
      value: '$12,345.67', 
      apy: '24.7%', 
      token: 'SOL-USDC',
      amount: 'LP Tokens',
      rewards: '$234.12',
      health: 92
    },
    { 
      protocol: 'Raydium', 
      type: 'Farming', 
      value: '$7,272.43', 
      apy: '89.3%', 
      token: 'RAY-USDC',
      amount: 'LP Tokens',
      rewards: '$567.89',
      health: 78
    },
  ]

  const topOpportunities = [
    { protocol: 'Meteora', apy: '125.4%', tvl: '$45.2M', risk: 'high' },
    { protocol: 'Drift', apy: '42.3%', tvl: '$123.4M', risk: 'medium' },
    { protocol: 'Phoenix', apy: '28.7%', tvl: '$234.5M', risk: 'low' },
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold text-gradient">Portfolio Overview</h1>
              <Badge variant="outline" className="font-mono">
                {walletAddress.slice(0, 4)}...{walletAddress.slice(-4)}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleRefresh}
                disabled={isRefreshing}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button variant="ghost" size="sm" onClick={onDisconnect}>
                Disconnect
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, index) => {
            const Icon = stat.icon
            return (
              <Card key={index} className="glass-card overflow-hidden">
                <div className={`h-1 bg-gradient-to-r ${stat.gradient}`} />
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-2 rounded-lg bg-gradient-to-r ${stat.gradient} bg-opacity-10`}>
                      <Icon className="h-5 w-5 text-white" />
                    </div>
                    {stat.trend !== 'neutral' && (
                      <span className={`text-sm font-medium ${
                        stat.trend === 'up' ? 'text-green-500' : 'text-red-500'
                      }`}>
                        {stat.change}
                      </span>
                    )}
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">{stat.title}</p>
                    <p className="text-2xl font-bold">{stat.value}</p>
                    {stat.changeValue && (
                      <p className="text-xs text-muted-foreground">{stat.changeValue}</p>
                    )}
                    {stat.trend === 'neutral' && (
                      <p className="text-xs text-muted-foreground">{stat.change}</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Main Content Grid */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Positions List - Takes 2 columns */}
          <div className="lg:col-span-2">
            <Card className="glass-card">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Active Positions</CardTitle>
                <Button size="sm" variant="ghost">
                  View All
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {positions.map((position, index) => (
                    <div 
                      key={index} 
                      className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-muted/50 transition-all cursor-pointer"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-primary to-secondary opacity-20" />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold">{position.protocol}</span>
                            <Badge variant="secondary" className="text-xs">
                              {position.type}
                            </Badge>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {position.amount} • APY {position.apy}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">{position.value}</div>
                        <div className="text-sm text-green-500">
                          +{position.rewards} rewards
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button className="w-full justify-start" variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Position Manually
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Sync All Positions
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Download Report
                </Button>
              </CardContent>
            </Card>

            {/* Top Opportunities */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="text-lg">Top Opportunities</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {topOpportunities.map((opp, index) => (
                  <div key={index} className="p-3 rounded-lg border border-border">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">{opp.protocol}</span>
                      <Badge 
                        variant={opp.risk === 'high' ? 'destructive' : opp.risk === 'medium' ? 'default' : 'secondary'}
                      >
                        {opp.risk} risk
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">APY</span>
                      <span className="font-semibold text-green-500">{opp.apy}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">TVL</span>
                      <span>{opp.tvl}</span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Portfolio Distribution */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="text-lg">Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {['Staking 60%', 'Lending 20%', 'LP 15%', 'Farming 5%'].map((item) => {
                    const [type, percent] = item.split(' ')
                    return (
                      <div key={type} className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">{type}</span>
                        <div className="flex items-center gap-2">
                          <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-gradient-to-r from-primary to-secondary"
                              style={{ width: percent }}
                            />
                          </div>
                          <span className="text-sm font-medium w-12 text-right">{percent}</span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}