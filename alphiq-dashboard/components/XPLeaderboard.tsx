'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { TrendingUp, Crown, Sparkles, Info } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useXPLeaderboard } from '@/hooks/useXPLeaderboard'
import { XPLeaderboardItem } from './XPLeaderboardItem'
import { XPLeaderboardSkeleton } from './XPLeaderboardSkeleton'
import { XPLeaderboardError } from './XPLeaderboardError'

export function XPLeaderboard() {
  const {
    users,
    months,
    selectedMonth,
    setSelectedMonth,
    isLoading,
    error,
    refreshData,
    currentUserRank,
    currentUserXP,
    connectedWallet
  } = useXPLeaderboard()

  if (isLoading) {
    return <XPLeaderboardSkeleton />
  }

  if (error) {
    return <XPLeaderboardError error={error} onRetry={refreshData} />
  }

  return (
    <Card className="bg-gradient-to-br from-charcoal/95 via-charcoal/90 to-charcoal/95 border-amber/30 backdrop-blur-xl shadow-2xl w-full">
      <CardHeader className="pb-4">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="space-y-3"
        >
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
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="cursor-help">
                    <Info className="w-5 h-5 text-mint hover:text-amber transition-colors" />
                  </div>
                </TooltipTrigger>
                <TooltipContent 
                  className="max-w-xs bg-charcoal border-amber/30 text-neutral z-50" 
                  side="left"
                  sideOffset={10}
                >
                  <p className="text-sm">
                    These rankings are calculated by total XP earned through quests, achievements, and activities. 
                    Higher XP means better rewards and exclusive perks!
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          
          {/* Filter */}
          <div className="flex items-center space-x-3">
            <div className="text-right flex-1">
              <p className="text-xs text-neutral/70 mb-1">Filter by</p>
              <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger className="w-full bg-charcoal/80 border-amber/50 hover:bg-charcoal/70 transition-all duration-200 text-neutral">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-charcoal border-amber text-neutral">
                  {months.map((month) => (
                    <SelectItem key={month.value} value={month.value}>
                      {month.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </motion.div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Top 10 Leaderboard */}
        <div className="space-y-3">
          <AnimatePresence>
            {users.map((user, index) => (
              <XPLeaderboardItem 
                key={user.address} 
                user={user} 
                index={index}
                isCurrentUser={!!(connectedWallet && user.address.toLowerCase() === connectedWallet.toLowerCase())}
              />
            ))}
          </AnimatePresence>
        </div>
        
        {users.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-8"
          >
            <div className="w-12 h-12 mx-auto mb-3 bg-charcoal/50 rounded-full flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-neutral/50" />
            </div>
            <p className="text-neutral/70 text-sm">No rankings available</p>
            <p className="text-neutral/50 text-xs mt-1">Try selecting a different time period</p>
          </motion.div>
        )}

        {/* Current User Position - Show if connected and not in top 10 */}
        {connectedWallet && currentUserRank && currentUserRank > 10 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="p-4 bg-gradient-to-r from-mint/20 via-mint/20 to-mint/20 border border-mint/40 rounded-xl backdrop-blur-sm"
          >
            <div className="text-center space-y-2">
              <div className="flex items-center justify-center space-x-2">
                <div className="w-6 h-6 bg-gradient-to-r from-mint to-mint rounded-full flex items-center justify-center">
                  <span className="text-charcoal font-bold text-xs">{currentUserRank}</span>
                </div>
                <span className="text-mint font-medium text-sm">Your Position</span>
              </div>
              <p className="text-xs text-mint/80">Rank #{currentUserRank} globally</p>
              <div className="text-lg font-bold text-mint">
                {currentUserXP?.toLocaleString()} XP
              </div>
              <div className="text-xs text-neutral/60">
                {connectedWallet.slice(0, 6)}...{connectedWallet.slice(-4)}
              </div>
            </div>
          </motion.div>
        )}

        {/* No Wallet Connected Message */}
        {!connectedWallet && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-4"
          >
            <div className="p-3 bg-charcoal/50 rounded-lg border border-amber/30">
              <p className="text-xs text-neutral/50">
                Connect your wallet to see your ranking position
              </p>
            </div>
          </motion.div>
        )}
      </CardContent>
    </Card>
  )
}
