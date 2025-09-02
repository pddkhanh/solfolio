'use client'

import { useState, useEffect } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatUSD, formatNumber } from '@/lib/utils'
import { generateMockPortfolio } from '@/lib/mock-data/generators'
import { Skeleton } from '@/components/ui/skeleton'
import Image from 'next/image'

export function ProtocolDistribution() {
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<any[]>([])

  useEffect(() => {
    setTimeout(() => {
      const portfolio = generateMockPortfolio()
      const protocolMap = new Map<string, { value: number, logo: string }>()

      // Aggregate values by protocol
      portfolio.positions.forEach(position => {
        const current = protocolMap.get(position.protocol.name) || { value: 0, logo: position.protocol.logoURI }
        protocolMap.set(position.protocol.name, {
          value: current.value + Math.abs(position.totalValue),
          logo: position.protocol.logoURI
        })
      })

      // Convert to chart data
      const chartData = Array.from(protocolMap.entries())
        .map(([name, data]) => ({
          name,
          value: data.value,
          logo: data.logo
        }))
        .sort((a, b) => b.value - a.value)

      setData(chartData)
      setLoading(false)
    }, 1200)
  }, [])

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload[0]) {
      return (
        <div className="bg-background/95 backdrop-blur-xl border rounded-lg p-3 shadow-lg">
          <div className="flex items-center gap-2 mb-1">
            <Image
              src={payload[0].payload.logo}
              alt={payload[0].payload.name}
              width={20}
              height={20}
              className="rounded-full"
            />
            <p className="font-semibold">{payload[0].payload.name}</p>
          </div>
          <p className="text-sm text-muted-foreground">
            Value: {formatUSD(payload[0].value)}
          </p>
        </div>
      )
    }
    return null
  }

  const CustomXAxisTick = ({ x, y, payload }: any) => {
    const item = data.find(d => d.name === payload.value)
    if (!item) return null

    return (
      <g transform={`translate(${x},${y})`}>
        <image
          x={-10}
          y={0}
          width={20}
          height={20}
          href={item.logo}
          style={{ borderRadius: '50%' }}
        />
        <text
          x={0}
          y={28}
          textAnchor="middle"
          className="text-xs fill-current"
        >
          {payload.value}
        </text>
      </g>
    )
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Protocol Distribution</CardTitle>
        </CardHeader>
        <CardContent className="h-[300px] flex items-center justify-center">
          <div className="w-full space-y-2">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="w-full h-8" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="hover:shadow-lg transition-all duration-300">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Protocol Distribution
          <span className="text-sm text-muted-foreground font-normal">
            {data.length} protocols
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={data}
            margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
          >
            <defs>
              <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#9945FF" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#14F195" stopOpacity={0.8}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
            <XAxis
              dataKey="name"
              tick={<CustomXAxisTick />}
              interval={0}
            />
            <YAxis
              tickFormatter={(value) => `$${formatNumber(value)}`}
              className="text-xs"
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar
              dataKey="value"
              fill="url(#colorGradient)"
              radius={[8, 8, 0, 0]}
              animationDuration={800}
              className="hover:opacity-80 transition-opacity cursor-pointer"
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}