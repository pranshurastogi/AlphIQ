'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useXPData } from "@/hooks/useXPData"
import { TrendingUp, Users, Clock, Gift, Sparkles, Wallet } from "lucide-react"
import { useEffect, useMemo } from "react"

interface XPBreakdownProps {
  address?: string
}

export function XPBreakdown({ address }: XPBreakdownProps) {
  const { xpHistory, isLoading } = useXPData(address)

  // Calculate recent XP gains (last 7 days)
  const recentXP = useMemo(() => {
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    
    return xpHistory
      .filter(item => new Date(item.created_at) >= sevenDaysAgo)
      .reduce((sum, item) => sum + item.change, 0)
  }, [xpHistory])

  // Group XP by partner for the mini graph
  const partnerXPData = useMemo(() => {
    const partnerMap = new Map<string, number>()
    
    xpHistory.slice(0, 10).forEach(item => {
      const partner = item.partner_name || 'System'
      partnerMap.set(partner, (partnerMap.get(partner) || 0) + item.change)
    })
    
    const maxXP = Math.max(...partnerMap.values(), 1) // Prevent division by zero
    
    return Array.from(partnerMap.entries()).map(([partner, xp]) => ({
      partner,
      xp,
      percentage: (xp / maxXP) * 100
    }))
  }, [xpHistory])

  // Get partner color based on name
  const getPartnerColor = (partner: string) => {
    const colors = [
      'from-mint to-amber',
      'from-lavender to-mint',
      'from-amber to-lavender',
      'from-blue-400 to-purple-400',
      'from-green-400 to-blue-400',
      'from-red-400 to-orange-400'
    ]
    const index = partner.charCodeAt(0) % colors.length
    return colors[index]
  }

  // Handle no wallet connected
  if (!address) {
    return (
      <Card className="bg-card/50 border-white/10 backdrop-blur-sm">
        <CardContent className="p-6 text-center">
          <div className="text-neutral/60 mb-4">
            <Wallet className="w-12 h-12 mx-auto mb-3 text-neutral/40" />
            <div className="text-lg font-medium">Connect Your Wallet</div>
            <div className="text-sm">Connect your wallet to view XP breakdown</div>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Handle loading state
  if (isLoading) {
    return (
      <Card className="bg-card/50 border-white/10 backdrop-blur-sm animate-pulse">
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="h-4 bg-white/10 rounded"></div>
            <div className="h-20 bg-white/10 rounded"></div>
            <div className="h-32 bg-white/10 rounded"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Handle empty history
  if (xpHistory.length === 0) {
    return (
      <Card className="bg-card/50 border-white/10 backdrop-blur-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-lavender flex items-center">
            <TrendingUp className="w-5 h-5 mr-2" />
            <span>XP Breakdown</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center py-8">
          <div className="text-neutral/60">No XP history available yet</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-card/50 border-white/10 backdrop-blur-sm">
      <CardHeader className="pb-4">
        <CardTitle className="text-lavender flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <TrendingUp className="w-5 h-5" />
            <span>XP Breakdown</span>
          </div>
          <Badge className="bg-mint/20 text-mint">
            +{recentXP} this week
          </Badge>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Recent XP Summary */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-white/5 rounded-lg">
            <div className="text-2xl font-bold text-mint">
              +{recentXP}
            </div>
            <div className="text-xs text-neutral/60">This Week</div>
          </div>
          <div className="text-center p-3 bg-white/5 rounded-lg">
            <div className="text-2xl font-bold text-lavender">
              {xpHistory.length}
            </div>
            <div className="text-xs text-neutral/60">Recent Activities</div>
          </div>
        </div>

        {/* Partner XP Distribution Graph */}
        <div className="space-y-3">
          <div className="flex items-center space-x-2 text-sm text-neutral/70">
            <Users className="w-4 h-4" />
            <span>XP by Partner</span>
          </div>
          <div className="space-y-2">
            {partnerXPData.map((item, index) => (
              <div key={index} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-neutral/80 truncate max-w-[120px]">
                    {item.partner}
                  </span>
                  <span className="text-mint font-medium">
                    +{item.xp}
                  </span>
                </div>
                <div className="relative">
                  <div className="w-full bg-white/10 rounded-full h-2">
                    <div
                      className={`h-2 bg-gradient-to-r ${getPartnerColor(item.partner)} rounded-full transition-all duration-1000 relative overflow-hidden`}
                      style={{ width: `${item.percentage}%` }}
                    >
                      {/* Animated shine effect */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent XP Activities */}
        <div className="space-y-3">
          <div className="flex items-center space-x-2 text-sm text-neutral/70">
            <Clock className="w-4 h-4" />
            <span>Recent Activities</span>
          </div>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {xpHistory.slice(0, 5).map((item, index) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-2 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-mint to-amber flex items-center justify-center">
                    <Gift className="w-4 h-4 text-charcoal" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-neutral truncate">
                      {item.reason}
                    </div>
                    <div className="text-xs text-neutral/60 flex items-center space-x-1">
                      <span>{item.partner_name || 'System'}</span>
                      <span>•</span>
                      <span>
                        {new Date(item.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-1">
                  <Sparkles className="w-3 h-3 text-amber" />
                  <span className={`text-sm font-bold ${item.change > 0 ? 'text-mint' : 'text-red-400'}`}>
                    {item.change > 0 ? '+' : ''}{item.change}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-2 pt-2">
          <div className="text-center p-2 bg-white/5 rounded">
            <div className="text-lg font-bold text-mint">
              {xpHistory.filter(item => item.change > 0).length}
            </div>
            <div className="text-xs text-neutral/60">Gains</div>
          </div>
          <div className="text-center p-2 bg-white/5 rounded">
            <div className="text-lg font-bold text-lavender">
              {new Set(xpHistory.map(item => item.partner_name)).size}
            </div>
            <div className="text-xs text-neutral/60">Partners</div>
          </div>
          <div className="text-center p-2 bg-white/5 rounded">
            <div className="text-lg font-bold text-amber">
              {xpHistory.length > 0 ? Math.max(...xpHistory.map(item => item.change), 0) : 0}
            </div>
            <div className="text-xs text-neutral/60">Best Gain</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 