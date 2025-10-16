// components/ExchangeDetailsCard.tsx
'use client'

import { AdvancedHolderInfo } from '@/hooks/useAdvancedTokenDistribution'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Building2, 
  ExternalLink, 
  TrendingUp, 
  Activity,
  DollarSign,
  Users,
  Globe,
  Shield,
  AlertTriangle,
  CheckCircle,
  Clock,
  BarChart3
} from 'lucide-react'

type ExchangeDetailsCardProps = {
  holders: AdvancedHolderInfo[]
  analytics: any
}

// Exchange database with known exchanges and their details
const EXCHANGE_DATABASE = {
  'Binance': {
    name: 'Binance',
    type: 'Centralized Exchange',
    website: 'https://binance.com',
    tradingPairs: ['ALPH/USDT', 'ALPH/BTC', 'ALPH/ETH'],
    volume24h: '$2.5M',
    trustScore: 95,
    features: ['Spot Trading', 'Futures', 'Staking'],
    description: 'World\'s largest cryptocurrency exchange by trading volume'
  },
  'Coinbase': {
    name: 'Coinbase',
    type: 'Centralized Exchange',
    website: 'https://coinbase.com',
    tradingPairs: ['ALPH/USD', 'ALPH/USDT'],
    volume24h: '$1.2M',
    trustScore: 98,
    features: ['Spot Trading', 'Institutional', 'Custody'],
    description: 'Leading US-based cryptocurrency exchange'
  },
  'KuCoin': {
    name: 'KuCoin',
    type: 'Centralized Exchange',
    website: 'https://kucoin.com',
    tradingPairs: ['ALPH/USDT', 'ALPH/BTC'],
    volume24h: '$800K',
    trustScore: 88,
    features: ['Spot Trading', 'Margin', 'Futures'],
    description: 'Global cryptocurrency exchange with wide token support'
  },
  'Gate.io': {
    name: 'Gate.io',
    type: 'Centralized Exchange',
    website: 'https://gate.io',
    tradingPairs: ['ALPH/USDT', 'ALPH/BTC'],
    volume24h: '$600K',
    trustScore: 85,
    features: ['Spot Trading', 'Margin', 'Futures', 'Options'],
    description: 'International cryptocurrency exchange'
  },
  'Uniswap': {
    name: 'Uniswap',
    type: 'Decentralized Exchange',
    website: 'https://uniswap.org',
    tradingPairs: ['ALPH/ETH', 'ALPH/USDC'],
    volume24h: '$400K',
    trustScore: 92,
    features: ['DEX', 'Liquidity Pools', 'Governance'],
    description: 'Leading decentralized exchange on Ethereum'
  },
  'Bridge': {
    name: 'Bridge Protocol',
    type: 'Cross-Chain Bridge',
    website: 'https://bridge.alephium.org',
    tradingPairs: ['ALPH/ETH', 'ALPH/BTC'],
    volume24h: '$300K',
    trustScore: 90,
    features: ['Cross-Chain', 'DeFi', 'Staking'],
    description: 'Official Alephium bridge for cross-chain transfers'
  }
}

function getExchangeDetails(type: string | null, name: string | null) {
  if (!type || type === 'Individual') return null
  
  // Try to match by name first, then by type
  const exchangeKey = Object.keys(EXCHANGE_DATABASE).find(key => 
    name && name.toLowerCase().includes(key.toLowerCase())
  ) || type

  return EXCHANGE_DATABASE[exchangeKey as keyof typeof EXCHANGE_DATABASE] || {
    name: type,
    type: 'Unknown Exchange',
    website: null,
    tradingPairs: [],
    volume24h: 'N/A',
    trustScore: 0,
    features: [],
    description: 'Exchange details not available'
  }
}

function formatAbbrev(value: number): string {
  if (value >= 1e9) return `${(value / 1e9).toFixed(2)}B`
  if (value >= 1e6) return `${(value / 1e6).toFixed(2)}M`
  if (value >= 1e3) return `${(value / 1e3).toFixed(2)}K`
  return value.toFixed(2)
}

function getTrustScoreColor(score: number) {
  if (score >= 90) return 'text-green-400'
  if (score >= 70) return 'text-yellow-400'
  return 'text-red-400'
}

function getTrustScoreBadge(score: number) {
  if (score >= 90) return 'default'
  if (score >= 70) return 'secondary'
  return 'destructive'
}

export function ExchangeDetailsCard({ holders, analytics }: ExchangeDetailsCardProps) {
  const exchanges = holders.filter(h => h.type === 'Exchange' || h.type === 'Uniswap' || h.type === 'Bridge')
  const exchangeGroups = exchanges.reduce((acc, holder) => {
    const details = getExchangeDetails(holder.type, holder.name)
    if (details) {
      const key = details.name
      if (!acc[key]) {
        acc[key] = {
          details,
          holders: [],
          totalBalance: 0,
          totalActivity: 0
        }
      }
      acc[key].holders.push(holder)
      acc[key].totalBalance += holder.balance
      acc[key].totalActivity += holder.ins + holder.outs
    }
    return acc
  }, {} as Record<string, any>)

  const exchangeList = Object.values(exchangeGroups).sort((a: any, b: any) => b.totalBalance - a.totalBalance)

  if (exchangeList.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Building2 className="w-5 h-5 text-lavender" />
            <span>Exchange Details</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-white/70">No exchange data available.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Building2 className="w-5 h-5 text-lavender" />
          <span>Exchange & Protocol Details</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {exchangeList.map((exchange: any, index) => (
            <div key={exchange.details.name} className="bg-white/5 rounded-lg p-4">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center">
                    <Building2 className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">{exchange.details.name}</h3>
                    <p className="text-sm text-white/70">{exchange.details.type}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant={getTrustScoreBadge(exchange.details.trustScore)}>
                    Trust: {exchange.details.trustScore}/100
                  </Badge>
                  {exchange.details.website && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => window.open(exchange.details.website, '_blank')}
                      className="h-8 w-8 p-0"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <DollarSign className="w-4 h-4 text-green-400" />
                    <span className="text-sm text-white/70">24h Volume</span>
                  </div>
                  <div className="text-lg font-semibold text-white">{exchange.details.volume24h}</div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Users className="w-4 h-4 text-blue-400" />
                    <span className="text-sm text-white/70">Holders</span>
                  </div>
                  <div className="text-lg font-semibold text-white">{exchange.holders.length}</div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="w-4 h-4 text-purple-400" />
                    <span className="text-sm text-white/70">Total Balance</span>
                  </div>
                  <div className="text-lg font-semibold text-white">
                    {formatAbbrev(exchange.totalBalance)} ALPH
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Activity className="w-4 h-4 text-cyan-400" />
                    <span className="text-sm text-white/70">Total Activity</span>
                  </div>
                  <div className="text-lg font-semibold text-white">
                    {exchange.totalActivity.toLocaleString()} txs
                  </div>
                </div>
              </div>

              {exchange.details.tradingPairs.length > 0 && (
                <div className="mb-4">
                  <div className="text-sm text-white/70 mb-2">Trading Pairs</div>
                  <div className="flex flex-wrap gap-2">
                    {exchange.details.tradingPairs.map((pair: string) => (
                      <Badge key={pair} variant="outline" className="text-xs">
                        {pair}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {exchange.details.features.length > 0 && (
                <div className="mb-4">
                  <div className="text-sm text-white/70 mb-2">Features</div>
                  <div className="flex flex-wrap gap-2">
                    {exchange.details.features.map((feature: string) => (
                      <Badge key={feature} variant="secondary" className="text-xs">
                        {feature}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <div className="text-sm text-white/70">
                {exchange.details.description}
              </div>

              {/* Individual holder details */}
              <div className="mt-4 pt-4 border-t border-white/10">
                <div className="text-sm text-white/70 mb-2">Addresses ({exchange.holders.length})</div>
                <div className="space-y-2">
                  {exchange.holders.map((holder: AdvancedHolderInfo, idx: number) => (
                    <div key={holder.address} className="flex items-center justify-between bg-white/5 rounded p-2">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-white/60">#{index + idx + 1}</span>
                        <span className="font-mono text-xs text-white/90">{holder.short}</span>
                        {holder.name && (
                          <span className="text-xs text-white/60">({holder.name})</span>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-white/70">
                          {formatAbbrev(holder.balance)} ALPH
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => window.open(`https://explorer.alephium.org/addresses/${holder.address}`, '_blank')}
                          className="h-6 w-6 p-0"
                        >
                          <ExternalLink className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
