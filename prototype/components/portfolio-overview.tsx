'use client'

import { useState, useEffect } from 'react'
import { TrendingUp, TrendingDown, DollarSign, PieChart, Activity } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatUSD, formatPercentage, getChangeColor } from '@/lib/utils'
import { generateMockPortfolio } from '@/lib/mock-data/generators'
import { Skeleton } from '@/components/ui/skeleton'

export function PortfolioOverview() {
  const [portfolio, setPortfolio] = useState(generateMockPortfolio())
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate loading
    setTimeout(() => {
      setLoading(false)
    }, 1500)

    // Simulate real-time updates
    const interval = setInterval(() => {
      setPortfolio(generateMockPortfolio())
    }, 10000)

    return () => clearInterval(interval)
  }, [])

  const stats = [
    {
      title: 'Total Value',
      value: portfolio.totalValue,
      format: 'usd',
      icon: DollarSign,
      description: 'Portfolio Balance',
      gradient: 'from-purple-500 to-pink-500',
    },
    {
      title: '24h Change',
      value: portfolio.change24h,
      format: 'percentage',
      icon: portfolio.change24h >= 0 ? TrendingUp : TrendingDown,
      description: 'Daily Performance',
      gradient: portfolio.change24h >= 0 ? 'from-green-500 to-emerald-500' : 'from-red-500 to-pink-500',
    },
    {
      title: '7d Change',
      value: portfolio.change7d,
      format: 'percentage',
      icon: portfolio.change7d >= 0 ? TrendingUp : TrendingDown,
      description: 'Weekly Performance',
      gradient: portfolio.change7d >= 0 ? 'from-green-500 to-emerald-500' : 'from-red-500 to-pink-500',
    },
    {
      title: '30d Change',
      value: portfolio.change30d,
      format: 'percentage',
      icon: portfolio.change30d >= 0 ? TrendingUp : TrendingDown,
      description: 'Monthly Performance',
      gradient: portfolio.change30d >= 0 ? 'from-green-500 to-emerald-500' : 'from-red-500 to-pink-500',
    },
  ]

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="relative overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-8 w-8 rounded-full" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-32 mb-2" />
              <Skeleton className="h-3 w-24" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, index) => (
        <Card
          key={stat.title}
          className="relative overflow-hidden group hover:shadow-xl transition-all duration-300 card-hover"
        >
          <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-5 group-hover:opacity-10 transition-opacity`} />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {stat.title}
            </CardTitle>
            <div className={`p-2 rounded-lg bg-gradient-to-br ${stat.gradient} bg-opacity-10`}>
              <stat.icon className="h-4 w-4 text-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold number-transition">
              {stat.format === 'usd' 
                ? formatUSD(stat.value)
                : <span className={getChangeColor(stat.value)}>
                    {formatPercentage(stat.value)}
                  </span>
              }
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {stat.description}
            </p>
            {index === 0 && (
              <div className="mt-2 flex items-center gap-1">
                <Activity className="h-3 w-3 text-success animate-pulse" />
                <span className="text-xs text-muted-foreground">Live</span>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}