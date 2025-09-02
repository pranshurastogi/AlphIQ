'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Crown, Sparkles, Info } from 'lucide-react'

export function XPLeaderboardSkeleton() {
  return (
    <Card className="bg-gradient-to-br from-charcoal/95 via-charcoal/90 to-charcoal/95 border-amber/30 backdrop-blur-xl shadow-2xl w-full">
      <CardHeader className="pb-4">
        <div className="space-y-3">
          {/* Header */}
          <div className="flex items-center space-x-3">
            <div className="relative">
              <Crown className="w-7 h-7 text-amber drop-shadow-lg" />
              <Sparkles className="w-4 h-4 text-mint absolute -top-1 -right-1 animate-pulse" />
            </div>
            <div className="flex-1">
              <CardTitle className="text-2xl font-bold text-neutral">
                Elite Rankings
              </CardTitle>
              <p className="text-sm text-neutral/70">Top performers by XP</p>
            </div>
            <div className="w-5 h-5 bg-charcoal/50 rounded animate-pulse" />
          </div>
          
          {/* Filter Skeleton */}
          <div className="flex items-center space-x-3">
            <div className="text-right flex-1">
              <p className="text-xs text-neutral/70 mb-1">Filter by</p>
              <div className="w-full h-10 bg-charcoal/80 border border-amber/50 rounded-md animate-pulse" />
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Current User Position Skeleton */}
        <div className="p-4 bg-gradient-to-r from-mint/20 via-mint/20 to-mint/20 border border-mint/40 rounded-xl backdrop-blur-sm">
          <div className="text-center space-y-2">
            <div className="flex items-center justify-center space-x-2">
              <div className="w-6 h-6 bg-gradient-to-r from-mint to-mint rounded-full animate-pulse" />
              <div className="h-4 bg-mint/20 rounded w-20" />
            </div>
            <div className="h-3 bg-mint/20 rounded w-24" />
            <div className="h-5 bg-mint/20 rounded w-16" />
          </div>
        </div>

        {/* Leaderboard Items Skeleton */}
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="p-3 rounded-lg bg-gradient-to-r from-charcoal/80 via-charcoal/70 to-charcoal/80 border border-amber/30 animate-pulse">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-charcoal/50 rounded-full" />
                <div className="flex-1 space-y-2">
                  <div className="flex items-center space-x-2">
                    <div className="h-4 bg-charcoal/50 rounded w-24" />
                    <div className="h-5 bg-charcoal/50 rounded w-16" />
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-charcoal/50 rounded" />
                    <div className="h-3 bg-charcoal/50 rounded w-16" />
                  </div>
                </div>
                <div className="text-right space-y-1">
                  <div className="h-5 bg-charcoal/50 rounded w-16" />
                  <div className="h-3 bg-charcoal/50 rounded w-8" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
