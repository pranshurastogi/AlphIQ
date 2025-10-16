// components/MobileOptimizedDashboard.tsx
'use client'

import { useAdvancedTokenDistribution } from '@/hooks/useAdvancedTokenDistribution'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
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
  Menu,
  X,
  ChevronDown,
  ChevronUp
} from 'lucide-react'
import { useState } from 'react'

export function MobileOptimizedDashboard() {
  const { holders, analytics, isLoading, isError, errorDetails, retryAll, lastUpdated } = useAdvancedTokenDistribution()
  const [activeSection, setActiveSection] = useState('overview')
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set())

  const toggleCard = (cardId: string) => {
    const newExpanded = new Set(expandedCards)
    if (newExpanded.has(cardId)) {
      newExpanded.delete(cardId)
    } else {
      newExpanded.add(cardId)
    }
    setExpandedCards(newExpanded)
  }

  if (isError) {
    return (
      <Card className="bg-card/50 border-red-500 m-4">
        <CardHeader>
          <CardTitle className="text-red-500 flex items-center space-x-2">
            <AlertCircle className="w-5 h-5" />
            <span>Token Analytics</span>
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
          <Button onClick={retryAll} variant="outline" size="sm" className="w-full">
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry
          </Button>
        </CardContent>
      </Card>
    )
  }

  if (isLoading) {
    return (
      <Card className="bg-card/50 m-4">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Trophy className="w-5 h-5 text-lavender" />
            <span>Token Analytics</span>
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
      <Card className="bg-card/50 m-4">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Trophy className="w-5 h-5 text-lavender" />
            <span>Token Analytics</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-neutral/70">No data available.</p>
        </CardContent>
      </Card>
    )
  }

  const totalBalance = holders.reduce((sum, h) => sum + h.balance, 0)
  const totalValueUSD = totalBalance * analytics.alphPrice
  const healthScore = Math.min(100, Math.max(0, 
    100 - (analytics.concentrationRatio * 50) - 
    (analytics.exchangeDominance > 60 ? 20 : 0) - 
    (analytics.averageActivity < 100 ? 10 : 0)
  ))

  const sections = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'metrics', label: 'Metrics', icon: Activity },
    { id: 'exchanges', label: 'Exchanges', icon: Building2 },
    { id: 'health', label: 'Health', icon: Shield }
  ]

  return (
    <div className="min-h-screen bg-charcoal text-neutral p-4">
      {/* Mobile Header */}
      <div className="sticky top-0 z-50 bg-charcoal/95 backdrop-blur-sm border-b border-white/10 mb-4">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-2">
            <Trophy className="w-5 h-5 text-lavender" />
            <span className="font-semibold text-white">Token Analytics</span>
            <Badge variant="outline" className="text-xs">
              <Clock className="w-3 h-3 mr-1" />
              Live
            </Badge>
          </div>
          <div className="flex items-center space-x-2">
            <Button onClick={retryAll} variant="ghost" size="sm">
              <RefreshCw className="w-4 h-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="border-t border-white/10 p-4">
            <div className="grid grid-cols-2 gap-2">
              {sections.map((section) => {
                const Icon = section.icon
                return (
                  <Button
                    key={section.id}
                    variant={activeSection === section.id ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => {
                      setActiveSection(section.id)
                      setIsMenuOpen(false)
                    }}
                    className="flex items-center space-x-2 justify-start"
                  >
                    <Icon className="w-4 h-4" />
                    <span>{section.label}</span>
                  </Button>
                )
              })}
            </div>
          </div>
        )}
      </div>

      {/* Mobile Content */}
      <div className="space-y-4">
        {/* Status Banner */}
        <Card className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-white/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Shield className="w-4 h-4 text-green-400" />
                <span className="text-sm font-medium text-white">Network Health</span>
                <Badge variant="outline" className="text-green-400">
                  {healthScore.toFixed(0)}/100
                </Badge>
              </div>
              <div className="text-xs text-white/70">
                {analytics.totalActiveAddresses.toLocaleString()} addresses
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Overview Section */}
        {activeSection === 'overview' && (
          <div className="space-y-4">
            {/* Key Metrics Cards */}
            <div className="grid grid-cols-2 gap-3">
              <Card className="bg-white/5">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Trophy className="w-4 h-4 text-yellow-400" />
                    <span className="text-xs text-white/70">Total Value</span>
                  </div>
                  <div className="text-lg font-bold text-white">
                    ${(totalValueUSD / 1e6).toFixed(1)}M
                  </div>
                  <div className="text-xs text-white/60">
                    {(totalBalance / 1e6).toFixed(1)}M ALPH
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/5">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Building2 className="w-4 h-4 text-blue-400" />
                    <span className="text-xs text-white/70">Exchanges</span>
                  </div>
                  <div className="text-lg font-bold text-white">
                    {analytics.exchangeDominance.toFixed(1)}%
                  </div>
                  <div className="text-xs text-white/60">
                    of top 50
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/5">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Link className="w-4 h-4 text-cyan-400" />
                    <span className="text-xs text-white/70">Bridges</span>
                  </div>
                  <div className="text-lg font-bold text-white">
                    {analytics.bridgeActivity.toFixed(1)}%
                  </div>
                  <div className="text-xs text-white/60">
                    of top 50
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/5">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Activity className="w-4 h-4 text-green-400" />
                    <span className="text-xs text-white/70">Activity</span>
                  </div>
                  <div className="text-lg font-bold text-white">
                    {analytics.averageActivity.toFixed(0)}
                  </div>
                  <div className="text-xs text-white/60">
                    avg txs
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Type Distribution */}
            <Card>
              <CardHeader 
                className="cursor-pointer"
                onClick={() => toggleCard('type-distribution')}
              >
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm">Type Distribution</CardTitle>
                  {expandedCards.has('type-distribution') ? 
                    <ChevronUp className="w-4 h-4" /> : 
                    <ChevronDown className="w-4 h-4" />
                }
              </div>
              </CardHeader>
              {expandedCards.has('type-distribution') && (
                <CardContent>
                  <div className="space-y-3">
                    {analytics.typeDistribution.map((type, index) => (
                      <div key={type.type} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: type.color }}
                          />
                          <span className="text-sm font-medium text-white">{type.type}</span>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-semibold text-white">{type.count}</div>
                          <div className="text-xs text-white/60">{type.percentage.toFixed(1)}%</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              )}
            </Card>
          </div>
        )}

        {/* Metrics Section */}
        {activeSection === 'metrics' && (
          <div className="space-y-4">
            {/* Top Holders */}
            <Card>
              <CardHeader 
                className="cursor-pointer"
                onClick={() => toggleCard('top-holders')}
              >
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm">Top Holders</CardTitle>
                  {expandedCards.has('top-holders') ? 
                    <ChevronUp className="w-4 h-4" /> : 
                    <ChevronDown className="w-4 h-4" />
                  }
                </div>
              </CardHeader>
              {expandedCards.has('top-holders') && (
                <CardContent>
                  <div className="space-y-3">
                    {holders.slice(0, 10).map((holder, index) => (
                      <div key={holder.address} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <span className="text-xs text-white/60">#{index + 1}</span>
                          <div>
                            <div className="text-sm font-medium text-white">{holder.short}</div>
                            {holder.name && (
                              <div className="text-xs text-white/60">{holder.name}</div>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-semibold text-white">
                            {(holder.balance / 1e6).toFixed(1)}M ALPH
                          </div>
                          <div className="text-xs text-white/60">{holder.pct.toFixed(2)}%</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              )}
            </Card>
          </div>
        )}

        {/* Exchanges Section */}
        {activeSection === 'exchanges' && (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Exchange Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="bg-white/5 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <Building2 className="w-4 h-4 text-blue-400" />
                        <span className="font-medium text-white">Exchange Dominance</span>
                      </div>
                      <Badge variant="outline">
                        {analytics.exchangeDominance.toFixed(1)}%
                      </Badge>
                    </div>
                    <div className="text-sm text-white/70">
                      {analytics.exchangeDominance > 60 
                        ? 'High exchange concentration detected' 
                        : 'Balanced distribution across exchanges'
                      }
                    </div>
                  </div>

                  <div className="bg-white/5 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <Link className="w-4 h-4 text-cyan-400" />
                        <span className="font-medium text-white">Bridge Activity</span>
                      </div>
                      <Badge variant="outline">
                        {analytics.bridgeActivity.toFixed(1)}%
                      </Badge>
                    </div>
                    <div className="text-sm text-white/70">
                      Cross-chain bridge activity and volume
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Health Section */}
        {activeSection === 'health' && (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Network Health</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-white mb-2">
                      {healthScore.toFixed(0)}/100
                    </div>
                    <Progress value={healthScore} className="w-full mb-4" />
                    <div className={`text-sm font-medium ${
                      healthScore >= 80 ? 'text-green-400' : 
                      healthScore >= 60 ? 'text-yellow-400' : 'text-red-400'
                    }`}>
                      {healthScore >= 80 ? 'Excellent' : 
                       healthScore >= 60 ? 'Good' : 
                       healthScore >= 40 ? 'Fair' : 'Poor'} Network Health
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                      <span className="text-sm text-white/70">Concentration Risk</span>
                      <Badge variant={analytics.concentrationRatio > 0.5 ? 'destructive' : 'default'}>
                        {analytics.concentrationRatio > 0.5 ? 'High' : 'Low'}
                      </Badge>
                    </div>
                    
                    <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                      <span className="text-sm text-white/70">Exchange Dominance</span>
                      <Badge variant={analytics.exchangeDominance > 60 ? 'secondary' : 'default'}>
                        {analytics.exchangeDominance.toFixed(1)}%
                      </Badge>
                    </div>
                    
                    <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                      <span className="text-sm text-white/70">Activity Level</span>
                      <Badge variant={analytics.averageActivity > 1000 ? 'default' : 'secondary'}>
                        {analytics.averageActivity > 1000 ? 'High' : 'Moderate'}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Mobile Footer */}
      <div className="mt-8 p-4 text-center text-xs text-white/60">
        Last updated: {new Date(lastUpdated).toLocaleTimeString()}
      </div>
    </div>
  )
}
