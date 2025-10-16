// components/EnhancedTokenAnalyticsDashboard.tsx
'use client'

import { useAdvancedTokenDistribution } from '@/hooks/useAdvancedTokenDistribution'
import { EnhancedHoldersTable } from '@/components/EnhancedHoldersTable'
import { EnhancedAnalyticsCharts } from '@/components/EnhancedAnalyticsCharts'
import { ExchangeDetailsCard } from '@/components/ExchangeDetailsCard'
import { DeepDiveAnalytics } from '@/components/DeepDiveAnalytics'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Trophy, 
  AlertCircle, 
  BarChart3, 
  Table, 
  Activity,
  Building2,
  Link,
  Users,
  TrendingUp,
  RefreshCw,
  Download,
  Clock,
  Zap,
  Shield,
  AlertTriangle,
  CheckCircle,
  Info,
  Star
} from 'lucide-react'
import { useState } from 'react'

export function EnhancedTokenAnalyticsDashboard() {
  const { holders, analytics, isLoading, isError, errorDetails, retryAll, lastUpdated } = useAdvancedTokenDistribution()
  const [activeTab, setActiveTab] = useState('overview')
  const [showDeepDive, setShowDeepDive] = useState(false)

  if (isError) {
    return (
      <Card className="bg-card/50 border-red-500">
        <CardHeader>
          <CardTitle className="text-red-500 flex items-center space-x-2">
            <AlertCircle className="w-5 h-5" />
            <span>Enhanced Token Analytics Dashboard</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
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
          <div className="flex items-center space-x-2">
            <Button onClick={retryAll} variant="outline" size="sm">
              <RefreshCw className="w-4 h-4 mr-2" />
              Retry
            </Button>
            <div className="text-xs text-white/60">
              Last attempted: {new Date().toLocaleString()}
            </div>
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
            <Trophy className="w-5 h-5 text-lavender" />
            <span>Enhanced Token Analytics Dashboard</span>
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
            <span>Enhanced Token Analytics Dashboard</span>
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
  const totalValueUSD = totalBalance * analytics.alphPrice

  // Calculate network health indicators
  const healthScore = Math.min(100, Math.max(0, 
    100 - (analytics.concentrationRatio * 50) - 
    (analytics.exchangeDominance > 60 ? 20 : 0) - 
    (analytics.averageActivity < 100 ? 10 : 0)
  ))

  const getHealthStatus = () => {
    if (healthScore >= 80) return { status: 'Excellent', color: 'text-green-400', icon: CheckCircle }
    if (healthScore >= 60) return { status: 'Good', color: 'text-blue-400', icon: Shield }
    if (healthScore >= 40) return { status: 'Fair', color: 'text-yellow-400', icon: AlertTriangle }
    return { status: 'Poor', color: 'text-red-400', icon: AlertCircle }
  }

  const healthStatus = getHealthStatus()
  const HealthIcon = healthStatus.icon

  return (
    <Card className="bg-card/50 border-white/10">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Trophy className="w-5 h-5 text-lavender" />
            <CardTitle>Enhanced Token Analytics Dashboard</CardTitle>
            <Badge variant="outline" className="ml-2">
              <Clock className="w-3 h-3 mr-1" />
              Live
            </Badge>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-sm text-white/60">
              Updated: {new Date(lastUpdated).toLocaleTimeString()}
            </div>
            <Button 
              onClick={() => setShowDeepDive(!showDeepDive)} 
              variant={showDeepDive ? "default" : "outline"} 
              size="sm"
              className={`relative flex items-center space-x-2 transition-all duration-500 transform hover:scale-105 ${
                showDeepDive 
                  ? 'bg-gradient-to-r from-purple-600 via-pink-600 to-red-500 hover:from-purple-700 hover:via-pink-700 hover:to-red-600 text-white shadow-lg hover:shadow-2xl ring-2 ring-purple-400/50 hover:ring-purple-300/70' 
                  : 'bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-600 hover:via-blue-700 hover:to-indigo-700 text-white shadow-md hover:shadow-xl border-0 hover:border-cyan-300/50 hover:ring-2 hover:ring-cyan-400/50'
              } overflow-hidden`}
            >
              {/* Animated background effect */}
              <div className={`absolute inset-0 bg-gradient-to-r from-white/20 to-transparent transition-all duration-500 ${
                showDeepDive ? 'translate-x-full' : '-translate-x-full'
              }`} />
              
              <div className={`transition-all duration-500 ${showDeepDive ? 'rotate-180 scale-110' : 'rotate-0 scale-100'}`}>
                <Zap className="w-4 h-4" />
              </div>
              <span className="font-bold text-sm relative z-10">
                {showDeepDive ? 'Hide Super Powers' : 'Unlock Super Powers'}
              </span>
              {!showDeepDive && (
                <div className="ml-1 animate-bounce">
                  <Star className="w-3 h-3" />
                </div>
              )}
              {showDeepDive && (
                <div className="ml-1 animate-spin">
                  <Activity className="w-3 h-3" />
                </div>
              )}
            </Button>
            <Button onClick={retryAll} variant="outline" size="sm">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Deep Dive Analytics */}
        {showDeepDive && (
          <div className="mb-6">
            <DeepDiveAnalytics />
          </div>
        )}

        {/* Enhanced Status Banner */}
        <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-white/20 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <HealthIcon className={`w-5 h-5 ${healthStatus.color}`} />
                <span className="font-semibold text-white">Network Health: {healthStatus.status}</span>
                <Badge variant="outline" className={healthStatus.color}>
                  {healthScore.toFixed(0)}/100
                </Badge>
              </div>
              <div className="text-sm text-white/70">
                {analytics.totalActiveAddresses.toLocaleString()} total addresses
              </div>
            </div>
            <div className="flex items-center space-x-2 text-sm text-white/70">
              <Zap className="w-4 h-4" />
              <span>Real-time data</span>
            </div>
          </div>
        </div>

        {/* Enhanced Disclaimer */}
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4">
          <div className="flex items-start space-x-2">
            <Info className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
            <div className="text-xs text-amber-200">
              <strong>Enhanced Analytics:</strong> This dashboard provides comprehensive insights into the top 50 ALPH holders, 
              including detailed exchange information, whale analysis, network health metrics, activity patterns, and concentration 
              analysis. Data includes real-time updates, export functionality, and advanced filtering capabilities.
            </div>
          </div>
        </div>

        {/* Enhanced Key Metrics Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white/5 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Trophy className="w-4 h-4 text-yellow-400" />
              <span className="text-sm font-medium text-white/70">Total Value</span>
            </div>
            <div className="text-xl font-bold text-white">
              ${(totalValueUSD / 1e6).toFixed(1)}M
            </div>
            <div className="text-xs text-white/60">
              {(totalBalance / 1e6).toFixed(1)}M ALPH
            </div>
          </div>

          <div className="bg-white/5 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Building2 className="w-4 h-4 text-blue-400" />
              <span className="text-sm font-medium text-white/70">Exchange Dominance</span>
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
              <span className="text-sm font-medium text-white/70">Bridge Activity</span>
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

        {/* Enhanced Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview" className="flex items-center space-x-2 text-xs">
              <BarChart3 className="w-4 h-4" />
              <span className="hidden sm:inline">Analytics</span>
            </TabsTrigger>
            <TabsTrigger value="table" className="flex items-center space-x-2 text-xs">
              <Table className="w-4 h-4" />
              <span className="hidden sm:inline">Holders</span>
            </TabsTrigger>
            <TabsTrigger value="exchanges" className="flex items-center space-x-2 text-xs">
              <Building2 className="w-4 h-4" />
              <span className="hidden sm:inline">Exchanges</span>
            </TabsTrigger>
            <TabsTrigger value="insights" className="flex items-center space-x-2 text-xs">
              <TrendingUp className="w-4 h-4" />
              <span className="hidden sm:inline">Insights</span>
            </TabsTrigger>
            <TabsTrigger value="health" className="flex items-center space-x-2 text-xs">
              <Shield className="w-4 h-4" />
              <span className="hidden sm:inline">Health</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6">
            <EnhancedAnalyticsCharts analytics={analytics} holders={holders} />
          </TabsContent>

          <TabsContent value="table" className="mt-6">
            <EnhancedHoldersTable 
              holders={holders} 
              isLoading={isLoading} 
              onRetry={retryAll}
              errorDetails={errorDetails}
            />
          </TabsContent>

          <TabsContent value="exchanges" className="mt-6">
            <ExchangeDetailsCard holders={holders} analytics={analytics} />
          </TabsContent>

          <TabsContent value="insights" className="mt-6">
            <div className="space-y-6">
              {/* Network Health Insights */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <TrendingUp className="w-5 h-5 text-lavender" />
                    <span>Advanced Network Insights</span>
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

          <TabsContent value="health" className="mt-6">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Shield className="w-5 h-5 text-lavender" />
                    <span>Network Health Assessment</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-center">
                      <div className="text-4xl font-bold text-white mb-2">
                        {healthScore.toFixed(0)}/100
                      </div>
                      <div className={`text-lg font-semibold ${healthStatus.color}`}>
                        {healthStatus.status} Network Health
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-white/5 rounded-lg p-4 text-center">
                        <div className="text-2xl font-bold text-white">
                          {analytics.concentrationRatio.toFixed(1)}%
                        </div>
                        <div className="text-sm text-white/70">Concentration Risk</div>
                        <div className={`text-xs ${analytics.concentrationRatio > 0.5 ? 'text-red-400' : 'text-green-400'}`}>
                          {analytics.concentrationRatio > 0.5 ? 'High Risk' : 'Low Risk'}
                        </div>
                      </div>
                      
                      <div className="bg-white/5 rounded-lg p-4 text-center">
                        <div className="text-2xl font-bold text-white">
                          {analytics.exchangeDominance.toFixed(1)}%
                        </div>
                        <div className="text-sm text-white/70">Exchange Dominance</div>
                        <div className={`text-xs ${analytics.exchangeDominance > 60 ? 'text-yellow-400' : 'text-green-400'}`}>
                          {analytics.exchangeDominance > 60 ? 'High' : 'Balanced'}
                        </div>
                      </div>
                      
                      <div className="bg-white/5 rounded-lg p-4 text-center">
                        <div className="text-2xl font-bold text-white">
                          {analytics.averageActivity.toFixed(0)}
                        </div>
                        <div className="text-sm text-white/70">Avg Activity</div>
                        <div className={`text-xs ${analytics.averageActivity > 1000 ? 'text-green-400' : 'text-yellow-400'}`}>
                          {analytics.averageActivity > 1000 ? 'High Activity' : 'Moderate Activity'}
                        </div>
                      </div>
                    </div>
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
