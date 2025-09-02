'use client'

import { useState, useEffect } from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatUSD, formatPercentage } from '@/lib/utils'
import { generateMockPortfolio } from '@/lib/mock-data/generators'
import { Skeleton } from '@/components/ui/skeleton'

const COLORS = [
  '#9945FF', // Solana Purple
  '#14F195', // Solana Green
  '#00D4FF', // Solana Blue
  '#FF6B6B', // Red
  '#4ECDC4', // Teal
  '#FFD93D', // Yellow
  '#6C5CE7', // Purple
  '#A8E6CF', // Light Green
]

export function AssetAllocation() {
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<any[]>([])

  useEffect(() => {
    setTimeout(() => {
      const portfolio = generateMockPortfolio()
      const tokenMap = new Map<string, number>()

      // Aggregate token values from all positions
      portfolio.positions.forEach(position => {
        position.tokens.forEach(holding => {
          const current = tokenMap.get(holding.token.symbol) || 0
          tokenMap.set(holding.token.symbol, current + Math.abs(holding.value))
        })
      })

      // Convert to chart data
      const chartData = Array.from(tokenMap.entries())
        .map(([symbol, value]) => ({
          name: symbol,
          value: value,
          percentage: (value / portfolio.totalValue) * 100
        }))
        .sort((a, b) => b.value - a.value)

      setData(chartData)
      setLoading(false)
    }, 1000)
  }, [])

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload[0]) {
      return (
        <div className="bg-background/95 backdrop-blur-xl border rounded-lg p-3 shadow-lg">
          <p className="font-semibold">{payload[0].name}</p>
          <p className="text-sm text-muted-foreground">
            Value: {formatUSD(payload[0].value)}
          </p>
          <p className="text-sm text-muted-foreground">
            Allocation: {formatPercentage(payload[0].payload.percentage)}
          </p>
        </div>
      )
    }
    return null
  }

  const CustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, value, index }: any) => {
    const RADIAN = Math.PI / 180
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5
    const x = cx + radius * Math.cos(-midAngle * RADIAN)
    const y = cy + radius * Math.sin(-midAngle * RADIAN)

    if (value < 5) return null // Don't show label for small slices

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? 'start' : 'end'}
        dominantBaseline="central"
        className="text-xs font-medium"
      >
        {`${value.toFixed(1)}%`}
      </text>
    )
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Asset Allocation</CardTitle>
        </CardHeader>
        <CardContent className="h-[300px] flex items-center justify-center">
          <Skeleton className="w-[250px] h-[250px] rounded-full" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="hover:shadow-lg transition-all duration-300">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Asset Allocation
          <span className="text-sm text-muted-foreground font-normal">
            {data.length} tokens
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={CustomLabel}
              outerRadius={100}
              fill="#8884d8"
              dataKey="percentage"
              animationBegin={0}
              animationDuration={800}
            >
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={COLORS[index % COLORS.length]}
                  className="hover:opacity-80 transition-opacity cursor-pointer"
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              verticalAlign="bottom" 
              height={36}
              formatter={(value: string) => (
                <span className="text-sm">{value}</span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}