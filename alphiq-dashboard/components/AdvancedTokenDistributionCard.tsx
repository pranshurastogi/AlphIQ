// components/AdvancedTokenDistributionCard.tsx
'use client'

import { useAdvancedTokenDistribution } from '@/hooks/useAdvancedTokenDistribution'
import { AdvancedHoldersTable } from '@/components/AdvancedHoldersTable'
import { AdvancedAnalyticsCharts } from '@/components/AdvancedAnalyticsCharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Trophy, 
  AlertCircle, 
  BarChart3, 
  Table, 
  Activity,
  Building2,
  Link,
  Users,
  TrendingUp
} from 'lucide-react'
import { useState } from 'react'

export function AdvancedTokenDistributionCard() {
  const { holders, analytics, isLoading, isError } = useAdvancedTokenDistribution()
  const [activeTab, setActiveTab] = useState('overview')

  if (isError) {
    return (
      <Card className="bg-card/50 border-red-500">
        <CardHeader>
          <CardTitle className="text-red-500 flex items-center space-x-2">
            <AlertCircle className="w-5 h-5" />
            <span>Token Analytics Dashboard</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-red-500">Failed to load advanced distribution data.</p>
        </CardContent>
      </Card>
    )
  }

  if (isLoading) {
    return (
      <Card className="bg-card/50">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Trophy className="w-5 h-5 text-lavender" />
            <span>Token Analytics Dashboard</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="h-4 bg-gray-200/20 rounded animate-pulse" />
            <div className="h-4 bg-gray-200/20 rounded animate-pulse w-3/4" />
            <div className="h-4 bg-gray-200/20 rounded animate-pulse w-1/2" />
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
            <Trophy className="w-5 h-5 text-lavender" />
            <span>Token Analytics Dashboard</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-neutral/70">No advanced distribution data available.</p>
        </CardContent>
      </Card>
    )
  }

  const totalBalance = holders.reduce((sum, h) => sum + h.balance, 0)
  const totalPct = holders.reduce((sum, h) => sum + h.pct, 0)
  const avgBalance = totalBalance / holders.length

  return (
    <Card className="bg-card/50 border-white/10">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Trophy className="w-5 h-5 text-lavender" />
            <span>Token Analytics Dashboard</span>
          </CardTitle>
          <div className="text-sm text-white/60">
            {analytics.totalActiveAddresses.toLocaleString()} total addresses
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Enhanced Disclaimer */}
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4">
          <div className="flex items-start space-x-2">
            <AlertCircle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
            <div className="text-xs text-amber-200">
              <strong>Advanced Analytics:</strong> This dashboard provides detailed insights into the top 50 ALPH holders, 
              including address types (exchanges, bridges, DeFi protocols), activity patterns, and network concentration. 
              Data includes transaction history, activity status, and ecosystem distribution.
            </div>
          </div>
        </div>

        {/* Key Metrics Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white/5 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Trophy className="w-4 h-4 text-yellow-400" />
              <span className="text-sm font-medium text-white/70">Total Balance</span>
            </div>
            <div className="text-xl font-bold text-white">
              {(totalBalance / 1e6).toFixed(1)}M ALPH
            </div>
            <div className="text-xs text-white/60">
              {totalPct.toFixed(2)}% of supply
            </div>
          </div>

          <div className="bg-white/5 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Building2 className="w-4 h-4 text-blue-400" />
              <span className="text-sm font-medium text-white/70">Exchanges</span>
            </div>
            <div className="text-xl font-bold text-white">
              {analytics.exchangeDominance.toFixed(1)}%
            </div>
            <div className="text-xs text-white/60">
              of top 50 balance
            </div>
          </div>

          <div className="bg-white/5 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Link className="w-4 h-4 text-cyan-400" />
              <span className="text-sm font-medium text-white/70">Bridges</span>
            </div>
            <div className="text-xl font-bold text-white">
              {analytics.bridgeActivity.toFixed(1)}%
            </div>
            <div className="text-xs text-white/60">
              of top 50 balance
            </div>
          </div>

          <div className="bg-white/5 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Activity className="w-4 h-4 text-green-400" />
              <span className="text-sm font-medium text-white/70">Avg Activity</span>
            </div>
            <div className="text-xl font-bold text-white">
              {analytics.averageActivity.toFixed(0)}
            </div>
            <div className="text-xs text-white/60">
              txs per holder
            </div>
          </div>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview" className="flex items-center space-x-2 text-xs">
              <BarChart3 className="w-4 h-4" />
              <span className="hidden sm:inline">Analytics</span>
            </TabsTrigger>
            <TabsTrigger value="table" className="flex items-center space-x-2 text-xs">
              <Table className="w-4 h-4" />
              <span className="hidden sm:inline">Holders</span>
            </TabsTrigger>
            <TabsTrigger value="insights" className="flex items-center space-x-2 text-xs">
              <TrendingUp className="w-4 h-4" />
              <span className="hidden sm:inline">Insights</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6">
            <AdvancedAnalyticsCharts analytics={analytics} holders={holders} />
          </TabsContent>

          <TabsContent value="table" className="mt-6">
            <AdvancedHoldersTable holders={holders} isLoading={isLoading} />
          </TabsContent>

          <TabsContent value="insights" className="mt-6">
            <div className="space-y-6">
              {/* Network Health Insights */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <TrendingUp className="w-5 h-5 text-lavender" />
                    <span>Network Health Insights</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white/5 rounded-lg p-4">
                      <h4 className="font-semibold text-white mb-2">Concentration Analysis</h4>
                      <p className="text-sm text-white/70">
                        The top 10 holders control {analytics.concentrationRatio.toFixed(1)}% of the top 50 balance, 
                        indicating {analytics.concentrationRatio > 0.5 ? 'high' : 'moderate'} concentration.
                      </p>
                    </div>
                    
                    <div className="bg-white/5 rounded-lg p-4">
                      <h4 className="font-semibold text-white mb-2">Ecosystem Distribution</h4>
                      <p className="text-sm text-white/70">
                        {analytics.exchangeDominance.toFixed(1)}% held by exchanges, {analytics.bridgeActivity.toFixed(1)}% by bridges, 
                        and {analytics.individualHolders.toFixed(1)}% by individual holders.
                      </p>
                    </div>
                  </div>

                  <div className="bg-white/5 rounded-lg p-4">
                    <h4 className="font-semibold text-white mb-2">Activity Patterns</h4>
                    <p className="text-sm text-white/70">
                      Average activity of {analytics.averageActivity.toFixed(0)} transactions per holder suggests 
                      {analytics.averageActivity > 1000 ? ' high' : analytics.averageActivity > 100 ? ' moderate' : ' low'} 
                      network activity among top holders.
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Type Breakdown */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Users className="w-5 h-5 text-lavender" />
                    <span>Address Type Breakdown</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {analytics.typeDistribution.map((type, index) => (
                      <div key={type.type} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div 
                            className="w-4 h-4 rounded-full" 
                            style={{ backgroundColor: type.color }}
                          />
                          <span className="font-medium text-white">{type.type}</span>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-white">{type.count} holders</div>
                          <div className="text-sm text-white/60">{type.percentage.toFixed(1)}% of balance</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
