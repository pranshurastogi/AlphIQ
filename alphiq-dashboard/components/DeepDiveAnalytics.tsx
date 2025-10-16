// components/DeepDiveAnalytics.tsx
'use client'

import { useAdvancedTokenDistribution } from '@/hooks/useAdvancedTokenDistribution'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip,
  PieChart,
  Pie,
  Cell,
  ScatterChart,
  Scatter,
  CartesianGrid,
  Legend
} from 'recharts'
import { 
  TrendingUp,
  TrendingDown,
  Activity,
  Building2,
  Link,
  Users,
  DollarSign,
  Shield,
  AlertTriangle,
  CheckCircle,
  Clock,
  Zap,
  BarChart3,
  PieChart as PieChartIcon,
  Target,
  Flame,
  Star,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Info,
  Download,
  RefreshCw,
  Eye,
  EyeOff
} from 'lucide-react'
import { useState, useMemo } from 'react'

export function DeepDiveAnalytics() {
  const { holders, analytics, isLoading, isError, errorDetails, retryAll, lastUpdated } = useAdvancedTokenDistribution()
  const [activeTab, setActiveTab] = useState('overview')
  const [showSensitiveData, setShowSensitiveData] = useState(false)

  if (isError) {
    return (
      <Card className="bg-card/50 border-red-500">
        <CardHeader>
          <CardTitle className="text-red-500 flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5" />
            <span>Deep Dive Analytics</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
              <div className="text-sm text-red-200 mb-2">
                <strong>Error Details:</strong>
              </div>
              <ul className="text-xs text-red-300 space-y-1">
                {errorDetails?.map((error, index) => (
                  <li key={index}>• {error}</li>
                ))}
              </ul>
            </div>
            <Button onClick={retryAll} variant="outline" size="sm">
              <RefreshCw className="w-4 h-4 mr-2" />
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (isLoading) {
    return (
      <Card className="bg-card/50">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="w-5 h-5 text-lavender" />
            <span>Deep Dive Analytics</span>
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
            <TrendingUp className="w-5 h-5 text-lavender" />
            <span>Deep Dive Analytics</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-neutral/70">No data available for deep dive analysis.</p>
        </CardContent>
      </Card>
    )
  }

  // Advanced calculations
  const totalBalance = holders.reduce((sum, h) => sum + h.balance, 0)
  const totalValueUSD = totalBalance * analytics.alphPrice
  
  // Whale analysis
  const whales = holders.filter(h => h.balance > totalBalance * 0.01) // >1%
  const megaWhales = holders.filter(h => h.balance > totalBalance * 0.05) // >5%
  const superWhales = holders.filter(h => h.balance > totalBalance * 0.1) // >10%
  
  // Activity analysis
  const activeHolders = holders.filter(h => h.activityStatus === 'active')
  const moderateHolders = holders.filter(h => h.activityStatus === 'moderate')
  const dormantHolders = holders.filter(h => h.activityStatus === 'dormant')
  
  // Exchange analysis
  const exchanges = holders.filter(h => h.type === 'Exchange')
  const bridges = holders.filter(h => h.type === 'Bridge')
  const defi = holders.filter(h => h.type === 'Uniswap')
  const individuals = holders.filter(h => !h.type)
  
  // Concentration metrics
  const giniCoefficient = calculateGiniCoefficient(holders.map(h => h.balance))
  const herfindahlIndex = calculateHerfindahlIndex(holders.map(h => h.balance))
  
  // Network health score
  const healthScore = Math.min(100, Math.max(0, 
    100 - (analytics.concentrationRatio * 50) - 
    (analytics.exchangeDominance > 60 ? 20 : 0) - 
    (analytics.averageActivity < 100 ? 10 : 0) +
    (activeHolders.length / holders.length * 20) -
    (giniCoefficient * 30)
  ))

  // Prepare chart data
  const balanceDistribution = prepareBalanceDistribution(holders)
  const activityDistribution = prepareActivityDistribution(holders)
  const typeDistribution = prepareTypeDistribution(holders)
  const whaleMovementData = prepareWhaleMovementData(holders)

  return (
    <Card className="bg-card/50 border-white/10">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="w-5 h-5 text-lavender" />
            <span>Deep Dive Analytics</span>
            <Badge variant="outline" className="ml-2">
              <Clock className="w-3 h-3 mr-1" />
              Live
            </Badge>
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowSensitiveData(!showSensitiveData)}
              className="flex items-center space-x-1"
            >
              {showSensitiveData ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              <span>{showSensitiveData ? 'Hide' : 'Show'} Sensitive</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={retryAll}
              className="flex items-center space-x-1"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Refresh</span>
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Network Health Overview */}
        <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-white/20 rounded-lg p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-2">
                {healthScore.toFixed(0)}/100
              </div>
              <div className="text-sm text-white/70 mb-3">Network Health</div>
              <Progress value={healthScore} className="w-full" />
              <div className={`text-xs mt-2 ${
                healthScore >= 80 ? 'text-green-400' : 
                healthScore >= 60 ? 'text-yellow-400' : 'text-red-400'
              }`}>
                {healthScore >= 80 ? 'Excellent' : 
                 healthScore >= 60 ? 'Good' : 
                 healthScore >= 40 ? 'Fair' : 'Poor'}
              </div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-white mb-2">
                {giniCoefficient.toFixed(3)}
              </div>
              <div className="text-sm text-white/70 mb-3">Gini Coefficient</div>
              <div className="text-xs text-white/60">
                {giniCoefficient > 0.8 ? 'High Inequality' : 
                 giniCoefficient > 0.5 ? 'Moderate Inequality' : 'Low Inequality'}
              </div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-white mb-2">
                {herfindahlIndex.toFixed(3)}
              </div>
              <div className="text-sm text-white/70 mb-3">Herfindahl Index</div>
              <div className="text-xs text-white/60">
                {herfindahlIndex > 0.25 ? 'High Concentration' : 
                 herfindahlIndex > 0.15 ? 'Moderate Concentration' : 'Low Concentration'}
              </div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-white mb-2">
                {whales.length}
              </div>
              <div className="text-sm text-white/70 mb-3">Whales (&gt;1%)</div>
              <div className="text-xs text-white/60">
                {megaWhales.length} mega • {superWhales.length} super
              </div>
            </div>
          </div>
        </div>

        {/* Deep Dive Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview" className="flex items-center space-x-2 text-xs">
              <BarChart3 className="w-4 h-4" />
              <span className="hidden sm:inline">Overview</span>
            </TabsTrigger>
            <TabsTrigger value="whales" className="flex items-center space-x-2 text-xs">
              <Target className="w-4 h-4" />
              <span className="hidden sm:inline">Whales</span>
            </TabsTrigger>
            <TabsTrigger value="activity" className="flex items-center space-x-2 text-xs">
              <Activity className="w-4 h-4" />
              <span className="hidden sm:inline">Activity</span>
            </TabsTrigger>
            <TabsTrigger value="concentration" className="flex items-center space-x-2 text-xs">
              <Shield className="w-4 h-4" />
              <span className="hidden sm:inline">Risk</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Balance Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Balance Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div style={{ height: 300 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={balanceDistribution}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                        <XAxis dataKey="range" tick={{ fontSize: 10 }} />
                        <YAxis tick={{ fontSize: 10 }} />
                        <Tooltip 
                          content={({ active, payload }) => {
                            if (!active || !payload?.length) return null
                            const data = payload[0].payload
                            return (
                              <div className="bg-card/90 text-white text-xs p-3 rounded-lg shadow-xl border border-white/20">
                                <div className="font-medium mb-2">{data.range}</div>
                                <div>Holders: <span className="font-semibold">{data.count}</span></div>
                                <div>Balance: <span className="font-semibold">{data.totalBalance.toFixed(2)}M ALPH</span></div>
                              </div>
                            )
                          }}
                        />
                        <Area type="monotone" dataKey="count" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Type Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Type Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div style={{ height: 300 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={typeDistribution}
                          cx="50%"
                          cy="50%"
                          outerRadius={100}
                          fill="#8884d8"
                          dataKey="totalBalance"
                          label={(entry: any) => `${entry.type}: ${entry.percentage.toFixed(1)}%`}
                        >
                          {typeDistribution.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="whales" className="mt-6">
            <div className="space-y-6">
              {/* Whale Analysis */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-white/5">
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <Target className="w-4 h-4 text-yellow-400" />
                      <span className="text-sm font-medium text-white/70">Regular Whales</span>
                    </div>
                    <div className="text-2xl font-bold text-white">{whales.length}</div>
                    <div className="text-xs text-white/60">Holders with &gt;1% of supply</div>
                  </CardContent>
                </Card>

                <Card className="bg-white/5">
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <Flame className="w-4 h-4 text-orange-400" />
                      <span className="text-sm font-medium text-white/70">Mega Whales</span>
                    </div>
                    <div className="text-2xl font-bold text-white">{megaWhales.length}</div>
                    <div className="text-xs text-white/60">Holders with &gt;5% of supply</div>
                  </CardContent>
                </Card>

                <Card className="bg-white/5">
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <Star className="w-4 h-4 text-red-400" />
                      <span className="text-sm font-medium text-white/70">Super Whales</span>
                    </div>
                    <div className="text-2xl font-bold text-white">{superWhales.length}</div>
                    <div className="text-xs text-white/60">Holders with &gt;10% of supply</div>
                  </CardContent>
                </Card>
              </div>

              {/* Whale Details */}
              {showSensitiveData && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Whale Details</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {whales.slice(0, 10).map((whale, index) => (
                        <div key={whale.address} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <span className="text-xs text-white/60">#{index + 1}</span>
                            <div>
                              <div className="text-sm font-medium text-white">{whale.short}</div>
                              {whale.name && (
                                <div className="text-xs text-white/60">{whale.name}</div>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-semibold text-white">
                              {(whale.balance / 1e6).toFixed(1)}M ALPH
                            </div>
                            <div className="text-xs text-white/60">{whale.pct.toFixed(2)}%</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="activity" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Activity Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Activity Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div style={{ height: 300 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={activityDistribution}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                        <XAxis dataKey="range" tick={{ fontSize: 10 }} />
                        <YAxis tick={{ fontSize: 10 }} />
                        <Tooltip />
                        <Bar dataKey="count" fill="#8884d8" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Activity Status */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Activity Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4 text-green-400" />
                        <span className="text-sm text-white">Active</span>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-semibold text-white">{activeHolders.length}</div>
                        <div className="text-xs text-white/60">
                          {((activeHolders.length / holders.length) * 100).toFixed(1)}%
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <Clock className="w-4 h-4 text-yellow-400" />
                        <span className="text-sm text-white">Moderate</span>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-semibold text-white">{moderateHolders.length}</div>
                        <div className="text-xs text-white/60">
                          {((moderateHolders.length / holders.length) * 100).toFixed(1)}%
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <AlertTriangle className="w-4 h-4 text-red-400" />
                        <span className="text-sm text-white">Dormant</span>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-semibold text-white">{dormantHolders.length}</div>
                        <div className="text-xs text-white/60">
                          {((dormantHolders.length / holders.length) * 100).toFixed(1)}%
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="concentration" className="mt-6">
            <div className="space-y-6">
              {/* Risk Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Concentration Risk</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-white/70">Gini Coefficient</span>
                        <Badge variant={giniCoefficient > 0.8 ? 'destructive' : giniCoefficient > 0.5 ? 'secondary' : 'default'}>
                          {giniCoefficient.toFixed(3)}
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-white/70">Herfindahl Index</span>
                        <Badge variant={herfindahlIndex > 0.25 ? 'destructive' : herfindahlIndex > 0.15 ? 'secondary' : 'default'}>
                          {herfindahlIndex.toFixed(3)}
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-white/70">Top 10 Concentration</span>
                        <Badge variant={analytics.concentrationRatio > 0.5 ? 'destructive' : 'default'}>
                          {(analytics.concentrationRatio * 100).toFixed(1)}%
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Risk Assessment</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="p-3 bg-white/5 rounded-lg">
                        <div className="text-sm font-medium text-white mb-1">Exchange Risk</div>
                        <div className={`text-xs ${
                          analytics.exchangeDominance > 60 ? 'text-red-400' : 
                          analytics.exchangeDominance > 40 ? 'text-yellow-400' : 'text-green-400'
                        }`}>
                          {analytics.exchangeDominance > 60 ? 'High' : 
                           analytics.exchangeDominance > 40 ? 'Moderate' : 'Low'} risk
                        </div>
                      </div>
                      
                      <div className="p-3 bg-white/5 rounded-lg">
                        <div className="text-sm font-medium text-white mb-1">Whale Risk</div>
                        <div className={`text-xs ${
                          whales.length > 10 ? 'text-red-400' : 
                          whales.length > 5 ? 'text-yellow-400' : 'text-green-400'
                        }`}>
                          {whales.length > 10 ? 'High' : 
                           whales.length > 5 ? 'Moderate' : 'Low'} whale concentration
                        </div>
                      </div>
                      
                      <div className="p-3 bg-white/5 rounded-lg">
                        <div className="text-sm font-medium text-white mb-1">Activity Risk</div>
                        <div className={`text-xs ${
                          analytics.averageActivity < 50 ? 'text-red-400' : 
                          analytics.averageActivity < 100 ? 'text-yellow-400' : 'text-green-400'
                        }`}>
                          {analytics.averageActivity < 50 ? 'High' : 
                           analytics.averageActivity < 100 ? 'Moderate' : 'Low'} activity risk
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

// Helper functions
function calculateGiniCoefficient(values: number[]): number {
  const sorted = [...values].sort((a, b) => a - b)
  const n = sorted.length
  const sum = sorted.reduce((a, b) => a + b, 0)
  
  let gini = 0
  for (let i = 0; i < n; i++) {
    gini += (2 * (i + 1) - n - 1) * sorted[i]
  }
  
  return gini / (n * sum)
}

function calculateHerfindahlIndex(values: number[]): number {
  const sum = values.reduce((a, b) => a + b, 0)
  const squaredShares = values.map(value => Math.pow(value / sum, 2))
  return squaredShares.reduce((a, b) => a + b, 0)
}

function prepareBalanceDistribution(holders: any[]) {
  const ranges = [
    { range: '0-1M', min: 0, max: 1e6 },
    { range: '1M-10M', min: 1e6, max: 10e6 },
    { range: '10M-100M', min: 10e6, max: 100e6 },
    { range: '100M-1B', min: 100e6, max: 1e9 },
    { range: '1B+', min: 1e9, max: Infinity }
  ]
  
  return ranges.map(range => {
    const count = holders.filter(h => h.balance >= range.min && h.balance < range.max).length
    const totalBalance = holders
      .filter(h => h.balance >= range.min && h.balance < range.max)
      .reduce((sum, h) => sum + h.balance, 0)
    
    return {
      range: range.range,
      count,
      totalBalance: totalBalance / 1e6
    }
  })
}

function prepareActivityDistribution(holders: any[]) {
  const ranges = [
    { range: '0-10', min: 0, max: 10 },
    { range: '11-100', min: 11, max: 100 },
    { range: '101-1000', min: 101, max: 1000 },
    { range: '1000+', min: 1001, max: Infinity }
  ]
  
  return ranges.map(range => {
    const count = holders.filter(h => {
      const activity = h.ins + h.outs
      return activity >= range.min && activity < range.max
    }).length
    
    return {
      range: range.range,
      count
    }
  })
}

function prepareTypeDistribution(holders: any[]) {
  const typeMap = new Map()
  
  holders.forEach(holder => {
    const type = holder.type || 'Individual'
    const existing = typeMap.get(type) || { count: 0, totalBalance: 0 }
    typeMap.set(type, {
      count: existing.count + 1,
      totalBalance: existing.totalBalance + holder.balance
    })
  })
  
  const totalBalance = holders.reduce((sum, h) => sum + h.balance, 0)
  
  return Array.from(typeMap.entries()).map(([type, data], index) => ({
    type,
    count: data.count,
    totalBalance: data.totalBalance,
    percentage: (data.totalBalance / totalBalance) * 100,
    color: getTypeColor(type, index)
  }))
}

function prepareWhaleMovementData(holders: any[]) {
  // This would typically come from historical data
  // For now, we'll create mock data based on current activity
  return holders.slice(0, 10).map((holder, index) => ({
    name: holder.short,
    balance: holder.balance / 1e6,
    activity: holder.ins + holder.outs,
    type: holder.type || 'Individual'
  }))
}

function getTypeColor(type: string, index: number): string {
  const colors = [
    '#A285FF', '#FF8A65', '#00E6B0', '#FFD54F', '#4BC0C0', '#FF6384', '#36A2EB',
    '#FF9F40', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8'
  ]
  
  if (type === 'Exchange') return '#FF6384'
  if (type === 'Bridge') return '#4BC0C0'
  if (type === 'Uniswap') return '#36A2EB'
  if (type === 'Treasury') return '#FFD54F'
  
  return colors[index % colors.length]
}
