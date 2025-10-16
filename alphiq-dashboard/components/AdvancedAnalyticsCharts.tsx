// components/AdvancedAnalyticsCharts.tsx
'use client'

import { AnalyticsData } from '@/hooks/useAdvancedTokenDistribution'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
  Scatter
} from 'recharts'
import { 
  PieChart as PieChartIcon, 
  BarChart3, 
  TrendingUp,
  Building2,
  Link,
  Activity,
  Users
} from 'lucide-react'

type AdvancedAnalyticsChartsProps = {
  analytics: AnalyticsData
  holders: any[]
}

function formatAbbrev(value: number): string {
  if (value >= 1e9) return `${(value / 1e9).toFixed(2)}B`
  if (value >= 1e6) return `${(value / 1e6).toFixed(2)}M`
  if (value >= 1e3) return `${(value / 1e3).toFixed(2)}K`
  return value.toFixed(2)
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
      </div>
    </div>
  )
}

export function AdvancedAnalyticsCharts({ analytics, holders }: AdvancedAnalyticsChartsProps) {
  // Prepare data for scatter plot (balance vs activity)
  const scatterData = holders.map(holder => ({
    balance: holder.balance,
    activity: holder.ins + holder.outs,
    short: holder.short,
    type: holder.type,
    fill: holder.type === 'Exchange' ? '#FF6384' : 
          holder.type === 'Bridge' ? '#4BC0C0' : 
          holder.type === 'Uniswap' ? '#36A2EB' : '#A285FF'
  }))

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Type Distribution Pie Chart */}
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
                  data={analytics.typeDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry: any) => `${entry.type}: ${entry.percentage.toFixed(1)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="totalBalance"
                >
                  {analytics.typeDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomPieTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Type Count Bar Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BarChart3 className="w-5 h-5 text-lavender" />
            <span>Holders by Type</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div style={{ height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics.typeDistribution} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <XAxis 
                  dataKey="type" 
                  angle={-45}
                  textAnchor="end"
                  height={80}
                  tick={{ fontSize: 10 }}
                />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip content={<CustomBarTooltip />} />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {analytics.typeDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Balance vs Activity Scatter Plot */}
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

      {/* Key Metrics */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Activity className="w-5 h-5 text-lavender" />
            <span>Network Analytics</span>
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
