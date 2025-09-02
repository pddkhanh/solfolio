'use client'

import { useState } from 'react'
import { TrendingUp, Shield, Clock, DollarSign, Info, ArrowRight } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatAPY, formatUSD, formatNumber } from '@/lib/utils'
import { generateYieldOpportunities } from '@/lib/mock-data/generators'
import Image from 'next/image'

export default function YieldPage() {
  const [opportunities] = useState(generateYieldOpportunities())
  const [sortBy, setSortBy] = useState<'apy' | 'tvl' | 'risk'>('apy')
  const [filterRisk, setFilterRisk] = useState<'all' | 'low' | 'medium' | 'high'>('all')

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'success'
      case 'medium': return 'warning'
      case 'high': return 'error'
      default: return 'outline'
    }
  }

  const sortedOpportunities = [...opportunities]
    .filter(opp => filterRisk === 'all' || opp.risk === filterRisk)
    .sort((a, b) => {
      switch (sortBy) {
        case 'apy': return b.apy - a.apy
        case 'tvl': return b.tvl - a.tvl
        case 'risk': 
          const riskOrder = { low: 0, medium: 1, high: 2 }
          return riskOrder[a.risk] - riskOrder[b.risk]
        default: return 0
      }
    })

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Page Header */}
      <div className="space-y-2">
        <h1 className="text-4xl font-bold gradient-text">Yield Opportunities</h1>
        <p className="text-muted-foreground">
          Discover and compare the best yield opportunities across Solana DeFi
        </p>
      </div>

      {/* Filters and Sorting */}
      <div className="flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
        <div className="flex gap-2 flex-wrap">
          <Button
            variant={filterRisk === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilterRisk('all')}
          >
            All Risk Levels
          </Button>
          <Button
            variant={filterRisk === 'low' ? 'success' : 'outline'}
            size="sm"
            onClick={() => setFilterRisk('low')}
          >
            <Shield className="w-4 h-4 mr-2" />
            Low Risk
          </Button>
          <Button
            variant={filterRisk === 'medium' ? 'warning' : 'outline'}
            size="sm"
            onClick={() => setFilterRisk('medium')}
          >
            <Shield className="w-4 h-4 mr-2" />
            Medium Risk
          </Button>
          <Button
            variant={filterRisk === 'high' ? 'error' : 'outline'}
            size="sm"
            onClick={() => setFilterRisk('high')}
          >
            <Shield className="w-4 h-4 mr-2" />
            High Risk
          </Button>
        </div>

        <div className="flex gap-2">
          <Button
            variant={sortBy === 'apy' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSortBy('apy')}
          >
            Sort by APY
          </Button>
          <Button
            variant={sortBy === 'tvl' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSortBy('tvl')}
          >
            Sort by TVL
          </Button>
          <Button
            variant={sortBy === 'risk' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSortBy('risk')}
          >
            Sort by Risk
          </Button>
        </div>
      </div>

      {/* Opportunities Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {sortedOpportunities.map((opportunity) => (
          <Card
            key={opportunity.id}
            className="group hover:shadow-xl transition-all duration-300 relative overflow-hidden"
          >
            {/* APY Highlight */}
            <div className="absolute top-0 right-0 p-4">
              <div className="text-right">
                <p className="text-3xl font-bold gradient-text">
                  {formatAPY(opportunity.apy)}
                </p>
                <p className="text-xs text-muted-foreground">APY</p>
              </div>
            </div>

            <CardHeader className="pb-3">
              <div className="flex items-start gap-3">
                <Image
                  src={opportunity.protocol.logoURI}
                  alt={opportunity.protocol.name}
                  width={48}
                  height={48}
                  className="rounded-full"
                />
                <div className="flex-1">
                  <CardTitle className="text-lg">{opportunity.protocol.name}</CardTitle>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant={opportunity.type === 'staking' ? 'success' : 'secondary'}>
                      {opportunity.type}
                    </Badge>
                    <Badge variant={getRiskColor(opportunity.risk) as any}>
                      {opportunity.risk} risk
                    </Badge>
                  </div>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground line-clamp-2">
                {opportunity.description}
              </p>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground flex items-center gap-1">
                    <DollarSign className="w-3 h-3" />
                    TVL
                  </span>
                  <span className="font-medium">${formatNumber(opportunity.tvl)}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" />
                    Min Deposit
                  </span>
                  <span className="font-medium">{formatUSD(opportunity.minDeposit)}</span>
                </div>
                {opportunity.lockPeriod && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      Lock Period
                    </span>
                    <span className="font-medium">{opportunity.lockPeriod} days</span>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 pt-2">
                {opportunity.tokens.map((token) => (
                  <div key={token.symbol} className="flex items-center gap-1">
                    <Image
                      src={token.logoURI}
                      alt={token.symbol}
                      width={20}
                      height={20}
                      className="rounded-full"
                    />
                    <span className="text-xs font-medium">{token.symbol}</span>
                  </div>
                ))}
              </div>

              <Button className="w-full group" variant="gradient">
                Start Earning
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}