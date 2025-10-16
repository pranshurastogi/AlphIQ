// components/CompactTokenDistributionCard.tsx
'use client'

import { useAdvancedTokenDistribution } from '@/hooks/useAdvancedTokenDistribution'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { EnhancedTokenAnalyticsDashboard } from './EnhancedTokenAnalyticsDashboard'
import { 
  Trophy, 
  AlertCircle, 
  Building2,
  Link,
  Users,
  TrendingUp,
  ExternalLink,
  Activity,
  BarChart3
} from 'lucide-react'
import { useState } from 'react'

export function CompactTokenDistributionCard() {
  const { holders, analytics, isLoading, isError } = useAdvancedTokenDistribution()
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  if (isError) {
    return (
      <Card className="bg-card/50 border-red-500">
        <CardHeader>
          <CardTitle className="text-red-500 flex items-center space-x-2">
            <AlertCircle className="w-4 h-4" />
            <span className="text-sm">Token Distribution</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-red-500">Failed to load data.</p>
        </CardContent>
      </Card>
    )
  }

  if (isLoading) {
    return (
      <Card className="bg-card/50">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Trophy className="w-4 h-4 text-lavender" />
            <span className="text-sm">Token Distribution</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="h-3 bg-gray-200/20 rounded animate-pulse" />
            <div className="h-3 bg-gray-200/20 rounded animate-pulse w-3/4" />
            <div className="h-3 bg-gray-200/20 rounded animate-pulse w-1/2" />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!holders.length || !analytics) {
    return (
      <Card className="bg-card/50">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Trophy className="w-4 h-4 text-lavender" />
            <span className="text-sm">Token Distribution</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-neutral/70">No data available.</p>
        </CardContent>
      </Card>
    )
  }

  const topHolders = holders.slice(0, 3)
  const totalBalance = holders.reduce((sum, h) => sum + h.balance, 0)

  return (
    <Card className="bg-card/50 border-white/10">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Trophy className="w-5 h-5 text-lavender" />
            <span className="text-base font-semibold">Token Analytics</span>
          </CardTitle>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button 
                variant="default" 
                size="sm" 
                className="h-8 px-3 text-sm font-semibold bg-gradient-to-r from-amber-500 via-yellow-500 to-orange-500 hover:from-amber-600 hover:via-yellow-600 hover:to-orange-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 border border-amber-400/20 hover:border-amber-300/40"
              >
                <BarChart3 className="w-4 h-4 mr-2" />
                Deep Dive
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-7xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center space-x-2">
                  <Trophy className="w-5 h-5 text-lavender" />
                  <span>Enhanced Token Analytics Dashboard</span>
                </DialogTitle>
              </DialogHeader>
              <EnhancedTokenAnalyticsDashboard />
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Price and Value Info */}
        <div className="bg-gradient-to-r from-lavender/10 to-purple-600/10 rounded-lg p-3 border border-lavender/20">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs text-white/70">ALPH Price</div>
              <div className="text-lg font-bold text-white">${analytics.alphPrice.toFixed(4)}</div>
            </div>
            <div className="text-right">
              <div className="text-xs text-white/70">Top 50 Value</div>
              <div className="text-lg font-bold text-lavender">${(analytics.totalValueUSD / 1e6).toFixed(1)}M</div>
            </div>
          </div>
        </div>

        {/* Key Metrics - Enhanced Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white/5 rounded-lg p-3 border border-white/10">
            <div className="flex items-center space-x-2 mb-2">
              <Building2 className="w-4 h-4 text-blue-400" />
              <span className="text-sm font-medium text-white/70">Exchanges</span>
            </div>
            <div className="text-lg font-bold text-white">
              {analytics.exchangeDominance.toFixed(1)}%
            </div>
          </div>

          <div className="bg-white/5 rounded-lg p-3 border border-white/10">
            <div className="flex items-center space-x-2 mb-2">
              <Link className="w-4 h-4 text-cyan-400" />
              <span className="text-sm font-medium text-white/70">Bridges</span>
            </div>
            <div className="text-lg font-bold text-white">
              {analytics.bridgeActivity.toFixed(1)}%
            </div>
          </div>

          <div className="bg-white/5 rounded-lg p-3 border border-white/10">
            <div className="flex items-center space-x-2 mb-2">
              <Users className="w-4 h-4 text-green-400" />
              <span className="text-sm font-medium text-white/70">Individuals</span>
            </div>
            <div className="text-lg font-bold text-white">
              {analytics.individualHolders.toFixed(1)}%
            </div>
          </div>

          <div className="bg-white/5 rounded-lg p-3 border border-white/10">
            <div className="flex items-center space-x-2 mb-2">
              <Activity className="w-4 h-4 text-purple-400" />
              <span className="text-sm font-medium text-white/70">Activity</span>
            </div>
            <div className="text-lg font-bold text-white">
              {analytics.averageActivity.toFixed(0)}
            </div>
          </div>
        </div>

        {/* Top 3 Holders - Enhanced */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-white/80">Top 3 Holders</h4>
          {topHolders.map((holder, index) => (
            <div key={holder.address} className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10">
              <div className="flex items-center space-x-3">
                <div className="text-sm font-bold text-lavender">#{index + 1}</div>
                <div className="flex items-center space-x-2">
                  {holder.type === 'Exchange' && <Building2 className="w-4 h-4 text-blue-400" />}
                  {holder.type === 'Bridge' && <Link className="w-4 h-4 text-cyan-400" />}
                  {holder.type === 'Uniswap' && <TrendingUp className="w-4 h-4 text-green-400" />}
                  {!holder.type && <Users className="w-4 h-4 text-gray-400" />}
                  <span className="text-sm text-white/90 font-medium">{holder.short}</span>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-bold text-white">
                  {holder.balanceHint}
                </span>
                <Badge variant="outline" className="text-xs px-2 py-1">
                  {holder.pct.toFixed(1)}%
                </Badge>
              </div>
            </div>
          ))}
        </div>

        {/* Network Health Summary - Enhanced */}
        <div className="bg-gradient-to-r from-white/5 to-white/10 rounded-lg p-3 border border-white/10">
          <div className="text-sm font-medium text-white/80 mb-2">Network Health</div>
          <div className="text-sm text-white/70">
            Top 10 control <strong className="text-lavender">{analytics.concentrationRatio.toFixed(1)}%</strong> • 
            <strong className="text-lavender"> {analytics.totalActiveAddresses.toLocaleString()}</strong> total addresses
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
