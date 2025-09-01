'use client'

import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ExternalLink, TrendingUp, Users, DollarSign } from 'lucide-react'
import { fadeInUp, staggerContainer } from '@/lib/animations'

interface Protocol {
  name: string
  description: string
  tvl: string
  apr: string
  category: string
  status: 'integrated' | 'coming-soon' | 'planned'
  website: string
  logo: string
}

const protocols: Protocol[] = [
  {
    name: 'Marinade Finance',
    description: 'Liquid staking protocol for Solana',
    tvl: '$1.2B',
    apr: '7.2%',
    category: 'Liquid Staking',
    status: 'coming-soon',
    website: 'https://marinade.finance',
    logo: '/protocols/marinade.svg'
  },
  {
    name: 'Kamino Finance',
    description: 'Automated liquidity management and lending',
    tvl: '$890M',
    apr: '12.5%',
    category: 'Lending',
    status: 'coming-soon',
    website: 'https://kamino.finance',
    logo: '/protocols/kamino.svg'
  },
  {
    name: 'Orca',
    description: 'User-friendly DEX and concentrated liquidity',
    tvl: '$450M',
    apr: '18.3%',
    category: 'DEX',
    status: 'planned',
    website: 'https://orca.so',
    logo: '/protocols/orca.svg'
  },
  {
    name: 'Raydium',
    description: 'AMM and liquidity provider',
    tvl: '$380M',
    apr: '15.7%',
    category: 'DEX',
    status: 'planned',
    website: 'https://raydium.io',
    logo: '/protocols/raydium.svg'
  },
  {
    name: 'Jito',
    description: 'MEV-powered liquid staking',
    tvl: '$1.5B',
    apr: '8.1%',
    category: 'Liquid Staking',
    status: 'planned',
    website: 'https://jito.network',
    logo: '/protocols/jito.svg'
  },
  {
    name: 'Marginfi',
    description: 'Decentralized lending and borrowing',
    tvl: '$220M',
    apr: '9.8%',
    category: 'Lending',
    status: 'planned',
    website: 'https://marginfi.com',
    logo: '/protocols/marginfi.svg'
  },
  {
    name: 'Drift',
    description: 'Perpetual futures and spot trading',
    tvl: '$180M',
    apr: '22.4%',
    category: 'Derivatives',
    status: 'planned',
    website: 'https://drift.trade',
    logo: '/protocols/drift.svg'
  },
  {
    name: 'Meteora',
    description: 'Dynamic liquidity market maker',
    tvl: '$150M',
    apr: '14.2%',
    category: 'DEX',
    status: 'planned',
    website: 'https://meteora.ag',
    logo: '/protocols/meteora.svg'
  }
]

const statusColors = {
  'integrated': 'bg-success/10 text-success border-success/20',
  'coming-soon': 'bg-warning/10 text-warning border-warning/20',
  'planned': 'bg-muted text-muted-foreground border-muted'
}

const statusLabels = {
  'integrated': 'Live',
  'coming-soon': 'Coming Soon',
  'planned': 'Planned'
}

export default function ProtocolsPage() {
  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="show"
      className="container mx-auto px-4 py-8 max-w-7xl"
    >
      {/* Header */}
      <motion.div variants={fadeInUp} className="mb-8">
        <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-solana-purple to-solana-green bg-clip-text text-transparent">
          Supported Protocols
        </h1>
        <p className="text-lg text-muted-foreground">
          Track your positions across the leading DeFi protocols on Solana
        </p>
      </motion.div>

      {/* Stats Overview */}
      <motion.div variants={fadeInUp} className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card className="bg-gradient-to-br from-solana-purple/10 to-transparent border-solana-purple/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Protocols</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold">{protocols.length}</span>
              <Badge variant="secondary" className="ml-auto">
                {protocols.filter(p => p.status === 'integrated').length} Live
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-solana-green/10 to-transparent border-solana-green/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Combined TVL</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold">$5.2B</span>
              <TrendingUp className="h-4 w-4 text-success ml-auto" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-solana-aqua/10 to-transparent border-solana-aqua/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Avg APR</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold">13.8%</span>
              <DollarSign className="h-4 w-4 text-warning ml-auto" />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Protocol Grid */}
      <motion.div 
        variants={staggerContainer}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {protocols.map((protocol, index) => (
          <motion.div
            key={protocol.name}
            variants={fadeInUp}
            custom={index}
            whileHover={{ y: -4 }}
            transition={{ duration: 0.2 }}
          >
            <Card className="h-full hover:shadow-lg hover:shadow-solana-purple/10 transition-all duration-300 group">
              <CardHeader>
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-solana-purple/20 to-solana-green/20 p-2 flex items-center justify-center">
                      <span className="text-lg font-bold">{protocol.name[0]}</span>
                    </div>
                    <div>
                      <CardTitle className="text-lg group-hover:text-solana-purple transition-colors">
                        {protocol.name}
                      </CardTitle>
                      <Badge 
                        variant="outline" 
                        className={`mt-1 text-xs ${statusColors[protocol.status]}`}
                      >
                        {statusLabels[protocol.status]}
                      </Badge>
                    </div>
                  </div>
                </div>
                <CardDescription className="mt-2">
                  {protocol.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Category</span>
                    <Badge variant="secondary">{protocol.category}</Badge>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">TVL</span>
                    <span className="font-semibold">{protocol.tvl}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Avg APR</span>
                    <span className="font-semibold text-success">{protocol.apr}</span>
                  </div>
                  <div className="pt-3 border-t">
                    <a
                      href={protocol.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-sm text-primary hover:text-solana-purple transition-colors"
                    >
                      Visit Website
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Coming Soon Notice */}
      <motion.div variants={fadeInUp} className="mt-12 text-center">
        <Card className="bg-gradient-to-r from-solana-purple/5 to-solana-green/5 border-dashed">
          <CardContent className="py-8">
            <h3 className="text-xl font-semibold mb-2">More Protocols Coming Soon</h3>
            <p className="text-muted-foreground mb-4">
              We&apos;re continuously adding support for more DeFi protocols on Solana.
            </p>
            <p className="text-sm text-muted-foreground">
              Have a protocol you&apos;d like to see? Let us know!
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  )
}