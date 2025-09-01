'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AlertCircle, RefreshCw, Crown, Sparkles } from 'lucide-react'

interface XPLeaderboardErrorProps {
  error: string
  onRetry: () => void
}

export function XPLeaderboardError({ error, onRetry }: XPLeaderboardErrorProps) {
  return (
    <Card className="bg-gradient-to-br from-charcoal/95 via-charcoal/90 to-charcoal/95 border-amber/30 backdrop-blur-xl shadow-2xl w-full">
      <CardHeader className="pb-4">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <Crown className="w-7 h-7 text-amber drop-shadow-lg" />
            <Sparkles className="w-4 h-4 text-mint absolute -top-1 -right-1 animate-pulse" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold text-neutral">
              Elite Rankings
            </CardTitle>
            <p className="text-sm text-neutral/70">Top performers by XP</p>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="text-center py-8">
          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-red-600/30 to-red-700/30 rounded-full flex items-center justify-center border border-red-500/50">
            <AlertCircle className="w-8 h-8 text-red-400" />
          </div>
          
          <h3 className="text-lg font-semibold text-red-300 mb-3">Failed to load rankings</h3>
          <p className="text-neutral/70 mb-4 text-sm leading-relaxed">
            {error}
          </p>
          
          <Button
            onClick={onRetry}
            variant="outline"
            size="sm"
            className="bg-gradient-to-r from-red-600/20 to-red-700/20 border-red-500/50 hover:from-red-600/30 hover:to-red-700/30 hover:border-red-500/70 text-red-300 hover:text-red-200 transition-all duration-200"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
          
          <p className="text-xs text-neutral/50 mt-3">
            If the problem persists, please check your connection
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
