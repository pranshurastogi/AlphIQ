// components/EnhancedAnalyticsCharts.tsx
'use client'

import { AnalyticsData, AdvancedHolderInfo } from '@/hooks/useAdvancedTokenDistribution'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip,
  ScatterChart,
  Scatter,
  LineChart,
  Line,
  Area,
  AreaChart,
  CartesianGrid,
  Legend
} from 'recharts'
import { 
  PieChart as PieChartIcon, 
  BarChart3, 
  TrendingUp,
  Building2,
  Link,
  Activity,
  Users,
  DollarSign,
  Shield,
  AlertTriangle,
  CheckCircle,
  Clock,
  Zap
} from 'lucide-react'

type EnhancedAnalyticsChartsProps = {
  analytics: AnalyticsData
  holders: AdvancedHolderInfo[]
}

function formatAbbrev(value: number): string {
  if (value >= 1e9) return `${(value / 1e9).toFixed(2)}B`
  if (value >= 1e6) return `${(value / 1e6).toFixed(2)}M`
  if (value >= 1e3) return `${(value / 1e3).toFixed(2)}K`
  return value.toFixed(2)
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

function CustomPieTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null
  const data = payload[0].payload
  return (
    <div className="bg-card/90 text-white text-xs p-3 rounded-lg shadow-xl border border-white/20">
      <div className="font-medium mb-2">{data.type}</div>
      <div className="space-y-1">
        <div>Count: <span className="font-semibold">{data.count}</span></div>
        <div>Balance: <span className="font-semibold">{formatAbbrev(data.totalBalance)} ALPH</span></div>
        <div>% of top 50: <span className="font-semibold">{data.percentage.toFixed(2)}%</span></div>
        <div>Value: <span className="font-semibold">{formatCurrency(data.totalBalance * data.alphPrice)}</span></div>
      </div>
    </div>
  )
}

function CustomBarTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null
  const data = payload[0].payload
  return (
    <div className="bg-card/90 text-white text-xs p-3 rounded-lg shadow-xl border border-white/20">
      <div className="font-medium mb-2">{data.type}</div>
      <div className="space-y-1">
        <div>Count: <span className="font-semibold">{data.count}</span></div>
        <div>Balance: <span className="font-semibold">{formatAbbrev(data.totalBalance)} ALPH</span></div>
        <div>Avg Balance: <span className="font-semibold">{formatAbbrev(data.avgBalance)} ALPH</span></div>
      </div>
    </div>
  )
}

function CustomScatterTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null
  const data = payload[0].payload
  return (
    <div className="bg-card/90 text-white text-xs p-3 rounded-lg shadow-xl border border-white/20">
      <div className="font-medium mb-2">{data.short}</div>
      <div className="space-y-1">
        <div>Balance: <span className="font-semibold">{formatAbbrev(data.balance)} ALPH</span></div>
        <div>Activity: <span className="font-semibold">{data.activity} txs</span></div>
        <div>Type: <span className="font-semibold">{data.type || 'Individual'}</span></div>
        <div>Status: <span className="font-semibold">{data.activityStatus}</span></div>
      </div>
    </div>
  )
}

export function EnhancedAnalyticsCharts({ analytics, holders }: EnhancedAnalyticsChartsProps) {
  // Enhanced data processing
  const scatterData = holders.map(holder => ({
    balance: holder.balance,
    activity: holder.ins + holder.outs,
    short: holder.short,
    type: holder.type,
    activityStatus: holder.activityStatus,
    fill: holder.type === 'Exchange' ? '#FF6384' : 
          holder.type === 'Bridge' ? '#4BC0C0' : 
          holder.type === 'Uniswap' ? '#36A2EB' : '#A285FF'
  }))

  // Calculate additional metrics
  const totalBalance = holders.reduce((sum, h) => sum + h.balance, 0)
  const totalValueUSD = totalBalance * analytics.alphPrice
  
  // Network health score calculation
  const healthScore = Math.min(100, Math.max(0, 
    100 - (analytics.concentrationRatio * 50) - 
    (analytics.exchangeDominance > 60 ? 20 : 0) - 
    (analytics.averageActivity < 100 ? 10 : 0)
  ))

  // Whale analysis
  const whales = holders.filter(h => h.balance > totalBalance * 0.01) // >1% of total
  const megaWhales = holders.filter(h => h.balance > totalBalance * 0.05) // >5% of total

  // Activity distribution
  const activityDistribution = [
    { range: '0-10', count: holders.filter(h => (h.ins + h.outs) <= 10).length },
    { range: '11-100', count: holders.filter(h => (h.ins + h.outs) > 10 && (h.ins + h.outs) <= 100).length },
    { range: '101-1000', count: holders.filter(h => (h.ins + h.outs) > 100 && (h.ins + h.outs) <= 1000).length },
    { range: '1000+', count: holders.filter(h => (h.ins + h.outs) > 1000).length }
  ]

  // Enhanced type distribution with additional metrics
  const enhancedTypeDistribution = analytics.typeDistribution.map(type => ({
    ...type,
    avgBalance: type.totalBalance / type.count,
    alphPrice: analytics.alphPrice,
    valueUSD: type.totalBalance * analytics.alphPrice
  }))

  return (
    <div className="space-y-6">
      {/* Network Health Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Shield className="w-5 h-5 text-lavender" />
              <span>Network Health</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-white mb-2">
                  {healthScore.toFixed(0)}/100
                </div>
                <Progress value={healthScore} className="w-full" />
                <div className="text-sm text-white/70 mt-2">
                  {healthScore >= 80 ? 'Excellent' : 
                   healthScore >= 60 ? 'Good' : 
                   healthScore >= 40 ? 'Fair' : 'Poor'} Network Health
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Concentration Risk</span>
                  <span className={analytics.concentrationRatio > 0.5 ? 'text-red-400' : 'text-green-400'}>
                    {analytics.concentrationRatio > 0.5 ? 'High' : 'Low'}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Exchange Dominance</span>
                  <span className={analytics.exchangeDominance > 60 ? 'text-yellow-400' : 'text-green-400'}>
                    {analytics.exchangeDominance.toFixed(1)}%
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Activity Level</span>
                  <span className={analytics.averageActivity > 1000 ? 'text-green-400' : 'text-yellow-400'}>
                    {analytics.averageActivity > 1000 ? 'High' : 'Moderate'}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <DollarSign className="w-5 h-5 text-lavender" />
              <span>Market Value</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-white">
                  {formatCurrency(totalValueUSD)}
                </div>
                <div className="text-sm text-white/70">
                  Top 50 Holders Value
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>ALPH Price</span>
                  <span className="text-white">${analytics.alphPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Total Balance</span>
                  <span className="text-white">{formatAbbrev(totalBalance)} ALPH</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Supply %</span>
                  <span className="text-white">
                    {holders.reduce((sum, h) => sum + h.pct, 0).toFixed(2)}%
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="w-5 h-5 text-lavender" />
              <span>Whale Analysis</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-xl font-bold text-white">{whales.length}</div>
                  <div className="text-xs text-white/70">Whales (>1%)</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold text-white">{megaWhales.length}</div>
                  <div className="text-xs text-white/70">Mega Whales (>5%)</div>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Whale Dominance</span>
                  <span className="text-white">
                    {(whales.reduce((sum, w) => sum + w.balance, 0) / totalBalance * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Mega Whale Control</span>
                  <span className="text-white">
                    {(megaWhales.reduce((sum, w) => sum + w.balance, 0) / totalBalance * 100).toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Enhanced Type Distribution Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <PieChartIcon className="w-5 h-5 text-lavender" />
              <span>Distribution by Type</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div style={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={enhancedTypeDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(entry: any) => `${entry.type}: ${entry.percentage.toFixed(1)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="totalBalance"
                  >
                    {enhancedTypeDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomPieTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Activity Distribution Bar Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="w-5 h-5 text-lavender" />
              <span>Activity Distribution</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div style={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={activityDistribution} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <XAxis 
                    dataKey="range" 
                    tick={{ fontSize: 10 }}
                  />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip 
                    content={({ active, payload }) => {
                      if (!active || !payload?.length) return null
                      const data = payload[0].payload
                      return (
                        <div className="bg-card/90 text-white text-xs p-3 rounded-lg shadow-xl border border-white/20">
                          <div className="font-medium mb-2">Activity Range: {data.range} transactions</div>
                          <div>Holders: <span className="font-semibold">{data.count}</span></div>
                        </div>
                      )
                    }}
                  />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]} fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Enhanced Balance vs Activity Scatter Plot */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-lavender" />
              <span>Balance vs Activity Analysis</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div style={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart data={scatterData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <XAxis 
                    type="number" 
                    dataKey="balance" 
                    name="Balance (ALPH)"
                    tickFormatter={(value) => formatAbbrev(value)}
                  />
                  <YAxis 
                    type="number" 
                    dataKey="activity" 
                    name="Activity (txs)"
                  />
                  <Tooltip content={<CustomScatterTooltip />} />
                  <Scatter dataKey="activity" fill="#8884d8" />
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Advanced Network Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Activity className="w-5 h-5 text-lavender" />
            <span>Advanced Network Metrics</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white/5 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Building2 className="w-4 h-4 text-blue-400" />
                <span className="text-sm font-medium text-white/70">Exchange Dominance</span>
              </div>
              <div className="text-2xl font-bold text-white">
                {analytics.exchangeDominance.toFixed(1)}%
              </div>
              <div className="text-xs text-white/60">
                of top 50 balance
              </div>
            </div>

            <div className="bg-white/5 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Link className="w-4 h-4 text-cyan-400" />
                <span className="text-sm font-medium text-white/70">Bridge Activity</span>
              </div>
              <div className="text-2xl font-bold text-white">
                {analytics.bridgeActivity.toFixed(1)}%
              </div>
              <div className="text-xs text-white/60">
                of top 50 balance
              </div>
            </div>

            <div className="bg-white/5 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Users className="w-4 h-4 text-green-400" />
                <span className="text-sm font-medium text-white/70">Individual Holders</span>
              </div>
              <div className="text-2xl font-bold text-white">
                {analytics.individualHolders.toFixed(1)}%
              </div>
              <div className="text-xs text-white/60">
                of top 50 balance
              </div>
            </div>

            <div className="bg-white/5 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Activity className="w-4 h-4 text-purple-400" />
                <span className="text-sm font-medium text-white/70">Avg Activity</span>
              </div>
              <div className="text-2xl font-bold text-white">
                {analytics.averageActivity.toFixed(0)}
              </div>
              <div className="text-xs text-white/60">
                transactions per holder
              </div>
            </div>
          </div>

          <div className="mt-6 p-4 bg-white/5 rounded-lg">
            <div className="text-sm text-white/70 mb-2">Concentration Analysis</div>
            <div className="text-lg font-semibold text-white">
              Top 10 holders control {analytics.concentrationRatio.toFixed(1)}% of top 50 balance
            </div>
            <div className="text-xs text-white/60 mt-1">
              Total active addresses: {analytics.totalActiveAddresses.toLocaleString()}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
