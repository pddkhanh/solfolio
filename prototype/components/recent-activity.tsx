'use client'

import { useState } from 'react'
import { ArrowUpRight, ArrowDownLeft, RefreshCw, Plus, Minus, Award } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatUSD, getTimeAgo } from '@/lib/utils'
import Image from 'next/image'
import { mockTokens, mockProtocols } from '@/lib/mock-data/generators'

interface Activity {
  id: string
  type: 'deposit' | 'withdraw' | 'swap' | 'claim' | 'stake' | 'unstake'
  protocol: typeof mockProtocols[0]
  tokens: {
    from?: typeof mockTokens[0]
    to?: typeof mockTokens[0]
    amount: number
    value: number
  }[]
  timestamp: Date
  txHash: string
}

const mockActivities: Activity[] = [
  {
    id: '1',
    type: 'deposit',
    protocol: mockProtocols[2], // Kamino
    tokens: [{
      from: mockTokens[3], // USDC
      amount: 5000,
      value: 5000
    }],
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    txHash: '5xKt...9aZL'
  },
  {
    id: '2',
    type: 'swap',
    protocol: mockProtocols[4], // Orca
    tokens: [
      {
        from: mockTokens[0], // SOL
        amount: 10,
        value: 984.5
      },
      {
        to: mockTokens[3], // USDC
        amount: 980,
        value: 980
      }
    ],
    timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000),
    txHash: '3bNm...7xPQ'
  },
  {
    id: '3',
    type: 'claim',
    protocol: mockProtocols[0], // Marinade
    tokens: [{
      to: mockTokens[1], // mSOL
      amount: 0.234,
      value: 24.86
    }],
    timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000),
    txHash: '8yTr...4mKL'
  },
  {
    id: '4',
    type: 'stake',
    protocol: mockProtocols[1], // Jito
    tokens: [{
      from: mockTokens[0], // SOL
      to: mockTokens[2], // jitoSOL
      amount: 25,
      value: 2461.25
    }],
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
    txHash: '2pQs...6vNB'
  },
  {
    id: '5',
    type: 'withdraw',
    protocol: mockProtocols[3], // MarginFi
    tokens: [{
      to: mockTokens[4], // USDT
      amount: 1000,
      value: 1000
    }],
    timestamp: new Date(Date.now() - 36 * 60 * 60 * 1000),
    txHash: '9kLm...3zXC'
  }
]

export function RecentActivity() {
  const [activities] = useState<Activity[]>(mockActivities)

  const getActivityIcon = (type: Activity['type']) => {
    switch (type) {
      case 'deposit': return <ArrowDownLeft className="w-4 h-4" />
      case 'withdraw': return <ArrowUpRight className="w-4 h-4" />
      case 'swap': return <RefreshCw className="w-4 h-4" />
      case 'claim': return <Award className="w-4 h-4" />
      case 'stake': return <Plus className="w-4 h-4" />
      case 'unstake': return <Minus className="w-4 h-4" />
    }
  }

  const getActivityColor = (type: Activity['type']) => {
    switch (type) {
      case 'deposit':
      case 'stake': return 'success'
      case 'withdraw':
      case 'unstake': return 'warning'
      case 'swap': return 'secondary'
      case 'claim': return 'default'
      default: return 'outline'
    }
  }

  const getActivityDescription = (activity: Activity) => {
    switch (activity.type) {
      case 'deposit':
        return `Deposited ${activity.tokens[0].amount} ${activity.tokens[0].from?.symbol}`
      case 'withdraw':
        return `Withdrew ${activity.tokens[0].amount} ${activity.tokens[0].to?.symbol}`
      case 'swap':
        return `Swapped ${activity.tokens[0].amount} ${activity.tokens[0].from?.symbol} for ${activity.tokens[1].amount} ${activity.tokens[1].to?.symbol}`
      case 'claim':
        return `Claimed ${activity.tokens[0].amount} ${activity.tokens[0].to?.symbol} rewards`
      case 'stake':
        return `Staked ${activity.tokens[0].amount} ${activity.tokens[0].from?.symbol}`
      case 'unstake':
        return `Unstaked ${activity.tokens[0].amount} ${activity.tokens[0].to?.symbol}`
    }
  }

  return (
    <Card className="hover:shadow-lg transition-all duration-300">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Recent Activity
          <Badge variant="outline" className="font-normal">
            {activities.length} transactions
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity) => (
            <div
              key={activity.id}
              className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent/50 transition-colors cursor-pointer group"
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg bg-${getActivityColor(activity.type)}/10`}>
                  {getActivityIcon(activity.type)}
                </div>
                <div className="flex items-center gap-3">
                  <Image
                    src={activity.protocol.logoURI}
                    alt={activity.protocol.name}
                    width={32}
                    height={32}
                    className="rounded-full"
                  />
                  <div>
                    <p className="font-medium text-sm">
                      {getActivityDescription(activity)}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-muted-foreground">
                        {activity.protocol.name}
                      </span>
                      <span className="text-xs text-muted-foreground">•</span>
                      <span className="text-xs text-muted-foreground">
                        {getTimeAgo(activity.timestamp)}
                      </span>
                      <span className="text-xs text-muted-foreground">•</span>
                      <span className="text-xs text-muted-foreground font-mono">
                        {activity.txHash}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold">
                  {formatUSD(activity.tokens.reduce((sum, t) => sum + t.value, 0))}
                </p>
                <Badge variant={getActivityColor(activity.type) as any} className="text-xs mt-1">
                  {activity.type}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}