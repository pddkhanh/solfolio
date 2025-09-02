'use client'

import { useState } from 'react'
import { PositionsList } from '@/components/positions-list'
import { Filter, Download, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatUSD, formatPercentage } from '@/lib/utils'
import { generateMockPortfolio } from '@/lib/mock-data/generators'

export default function PositionsPage() {
  const [portfolio] = useState(generateMockPortfolio())
  const [filter, setFilter] = useState<'all' | 'staking' | 'lending' | 'lp'>('all')
  const [refreshing, setRefreshing] = useState(false)

  const handleRefresh = () => {
    setRefreshing(true)
    setTimeout(() => setRefreshing(false), 1000)
  }

  const stats = [
    { label: 'Total Positions', value: portfolio.positions.length },
    { label: 'Active Protocols', value: portfolio.protocols.length },
    { label: 'Total Value', value: formatUSD(portfolio.totalValue) },
    { label: 'Avg APY', value: formatPercentage(portfolio.positions.reduce((sum, p) => sum + p.apy, 0) / portfolio.positions.length) },
  ]

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold gradient-text">Positions</h1>
          <p className="text-muted-foreground mt-2">
            Manage and monitor all your DeFi positions
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant="outline" size="sm">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </Button>
          <Button variant="gradient" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="hover:shadow-lg transition-all duration-300">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 flex-wrap">
        {['all', 'staking', 'lending', 'lp'].map((type) => (
          <Button
            key={type}
            variant={filter === type ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter(type as any)}
            className="capitalize"
          >
            {type === 'all' ? 'All Positions' : type === 'lp' ? 'LP Positions' : `${type} Positions`}
            {type === 'all' && (
              <Badge variant="secondary" className="ml-2">
                {portfolio.positions.length}
              </Badge>
            )}
          </Button>
        ))}
      </div>

      {/* Positions List */}
      <PositionsList />
    </div>
  )
}