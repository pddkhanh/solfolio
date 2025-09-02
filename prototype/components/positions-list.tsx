'use client'

import { useState } from 'react'
import Image from 'next/image'
import { ExternalLink, TrendingUp, TrendingDown, Info, Layers } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatUSD, formatAPY, formatTokenAmount, getTimeAgo, formatPercentage } from '@/lib/utils'
import { generateMockPositions } from '@/lib/mock-data/generators'
import { Position } from '@/lib/mock-data/types'

export function PositionsList() {
  const [positions] = useState(generateMockPositions())
  const [expandedPositions, setExpandedPositions] = useState<Set<string>>(new Set())

  const toggleExpanded = (id: string) => {
    const newExpanded = new Set(expandedPositions)
    if (newExpanded.has(id)) {
      newExpanded.delete(id)
    } else {
      newExpanded.add(id)
    }
    setExpandedPositions(newExpanded)
  }

  const getPositionTypeColor = (type: Position['type']) => {
    switch (type) {
      case 'staking': return 'success'
      case 'lending': return 'warning'
      case 'borrowing': return 'error'
      case 'lp': return 'secondary'
      case 'farming': return 'default'
      default: return 'outline'
    }
  }

  const getHealthColor = (health?: number) => {
    if (!health) return ''
    if (health >= 80) return 'text-success'
    if (health >= 50) return 'text-warning'
    return 'text-error'
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold gradient-text">Active Positions</h2>
        <Button variant="outline" size="sm">
          Export CSV
        </Button>
      </div>

      <div className="grid gap-4">
        {positions.map((position) => {
          const isExpanded = expandedPositions.has(position.id)
          const totalRewards = position.rewards.reduce((sum, r) => sum + r.value, 0)

          return (
            <Card
              key={position.id}
              className="group hover:shadow-lg transition-all duration-300 cursor-pointer"
              onClick={() => toggleExpanded(position.id)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Image
                        src={position.protocol.logoURI}
                        alt={position.protocol.name}
                        width={40}
                        height={40}
                        className="rounded-full"
                      />
                      <Layers className="absolute -bottom-1 -right-1 w-4 h-4 text-primary bg-background rounded-full p-0.5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{position.protocol.name}</h3>
                        <Badge variant={getPositionTypeColor(position.type) as any}>
                          {position.type}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {getTimeAgo(position.depositedAt)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold">
                      {formatUSD(Math.abs(position.totalValue))}
                    </p>
                    <div className="flex items-center gap-1 justify-end">
                      <span className="text-sm text-muted-foreground">APY</span>
                      <span className={`text-sm font-medium ${position.apy > 0 ? 'text-success' : 'text-error'}`}>
                        {formatAPY(Math.abs(position.apy))}
                      </span>
                    </div>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-3">
                {/* Token Holdings */}
                <div className="space-y-2">
                  {position.tokens.map((holding, index) => (
                    <div key={index} className="flex items-center justify-between py-1">
                      <div className="flex items-center gap-2">
                        <Image
                          src={holding.token.logoURI}
                          alt={holding.token.symbol}
                          width={24}
                          height={24}
                          className="rounded-full"
                        />
                        <span className="font-medium">
                          {formatTokenAmount(Math.abs(holding.amount))} {holding.token.symbol}
                        </span>
                        {holding.amount < 0 && (
                          <Badge variant="error" className="text-xs">Borrowed</Badge>
                        )}
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {formatUSD(Math.abs(holding.value))}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Health & Metrics */}
                {(position.health !== undefined || position.utilization !== undefined) && (
                  <div className="flex gap-4 pt-2 border-t">
                    {position.health !== undefined && (
                      <div className="flex items-center gap-1">
                        <span className="text-sm text-muted-foreground">Health:</span>
                        <span className={`text-sm font-medium ${getHealthColor(position.health)}`}>
                          {position.health}%
                        </span>
                      </div>
                    )}
                    {position.utilization !== undefined && (
                      <div className="flex items-center gap-1">
                        <span className="text-sm text-muted-foreground">Utilization:</span>
                        <span className="text-sm font-medium">
                          {position.utilization}%
                        </span>
                      </div>
                    )}
                    {position.impermanentLoss !== undefined && (
                      <div className="flex items-center gap-1">
                        <span className="text-sm text-muted-foreground">IL:</span>
                        <span className={`text-sm font-medium ${position.impermanentLoss < 0 ? 'text-error' : 'text-success'}`}>
                          {formatPercentage(position.impermanentLoss)}
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {/* Rewards */}
                {position.rewards.length > 0 && (
                  <div className="pt-2 border-t">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-muted-foreground">Pending Rewards</span>
                      <span className="text-sm font-bold text-success">
                        {formatUSD(totalRewards)}
                      </span>
                    </div>
                    {isExpanded && (
                      <div className="space-y-1">
                        {position.rewards.map((reward, index) => (
                          <div key={index} className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Image
                                src={reward.token.logoURI}
                                alt={reward.token.symbol}
                                width={20}
                                height={20}
                                className="rounded-full"
                              />
                              <span className="text-sm">
                                {formatTokenAmount(reward.amount)} {reward.token.symbol}
                              </span>
                            </div>
                            <span className="text-sm text-muted-foreground">
                              {formatUSD(reward.value)}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Actions */}
                {isExpanded && (
                  <div className="flex gap-2 pt-2">
                    <Button size="sm" variant="outline" className="flex-1">
                      <ExternalLink className="w-4 h-4 mr-2" />
                      View on {position.protocol.name}
                    </Button>
                    {position.rewards.length > 0 && (
                      <Button size="sm" variant="gradient" className="flex-1">
                        Claim Rewards
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}