'use client'

import { Badge } from '@/components/ui/badge'
import { Trophy, Medal, Star, Crown, Zap } from 'lucide-react'
import { motion } from 'framer-motion'
import { LeaderboardUser } from '@/hooks/useXPLeaderboard'

interface XPLeaderboardItemProps {
  user: LeaderboardUser
  index: number
  isCurrentUser?: boolean
}

export function XPLeaderboardItem({ user, index, isCurrentUser = false }: XPLeaderboardItemProps) {
  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="w-5 h-5 text-amber drop-shadow-lg" />
      case 2:
        return <Trophy className="w-5 h-5 text-neutral/70 drop-shadow-lg" />
      case 3:
        return <Medal className="w-5 h-5 text-mint drop-shadow-lg" />
      default:
        return (
          <div className="w-6 h-6 bg-gradient-to-br from-charcoal to-charcoal rounded-full flex items-center justify-center border border-amber/30">
            <span className="text-sm font-bold text-neutral">{rank}</span>
          </div>
        )
    }
  }

  const getRankBadgeColor = (rank: number) => {
    switch (rank) {
      case 1:
        return 'bg-gradient-to-r from-amber/20 to-amber/30 text-amber border-amber/40'
      case 2:
        return 'bg-gradient-to-r from-neutral/20 to-neutral/30 text-neutral border-neutral/40'
      case 3:
        return 'bg-gradient-to-r from-mint/20 to-mint/30 text-mint border-mint/40'
      default:
        return 'bg-charcoal/50 text-neutral border-amber/30'
    }
  }

  const getRankGlow = (rank: number) => {
    switch (rank) {
      case 1:
        return 'shadow-[0_0_15px_rgba(255,138,101,0.4)]'
      case 2:
        return 'shadow-[0_0_15px_rgba(224,224,224,0.4)]'
      case 3:
        return 'shadow-[0_0_15px_rgba(0,230,176,0.4)]'
      default:
        return 'shadow-[0_0_8px_rgba(255,138,101,0.1)]'
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      transition={{ 
        duration: 0.4, 
        delay: index * 0.1,
        ease: [0.25, 0.46, 0.45, 0.94]
      }}
      whileHover={{ 
        scale: 1.02,
        transition: { duration: 0.2 }
      }}
      className={`relative p-3 rounded-lg transition-all duration-300 ${getRankGlow(user.rank)} ${
        isCurrentUser 
          ? 'bg-gradient-to-r from-mint/20 via-mint/15 to-mint/20 border-2 border-mint/50 shadow-[0_0_20px_rgba(0,230,176,0.3)]' 
          : 'bg-gradient-to-r from-charcoal/80 via-charcoal/70 to-charcoal/80 hover:from-charcoal/90 hover:via-charcoal/60 hover:to-charcoal/90 border border-amber/30 hover:border-amber/50'
      }`}
    >
      {/* Background glow effect for top 3 */}
      {user.rank <= 3 && (
        <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-transparent via-amber/10 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300" />
      )}
      
      {/* Current user indicator */}
      {isCurrentUser && (
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-mint rounded-full border-2 border-charcoal animate-pulse" />
      )}
      
      <div className="relative flex items-center space-x-3">
        {/* Rank Icon */}
        <div className="flex items-center justify-center w-8 h-8 flex-shrink-0">
          {getRankIcon(user.rank)}
        </div>
        
        {/* User Info */}
        <div className="flex-1 min-w-0 space-y-1">
          {/* Title and Level Badge */}
          <div className="flex items-center space-x-2">
            <h3 className={`font-medium text-sm truncate transition-all duration-300 ${
              isCurrentUser ? 'text-mint font-semibold' : 'text-neutral group-hover:text-amber'
            }`}>
              {user.title || 'Anonymous User'}
            </h3>
            <Badge 
              className={`text-xs font-medium px-2 py-0.5 border ${getRankBadgeColor(user.rank)} backdrop-blur-sm`}
              style={{ 
                backgroundColor: `${user.levelColor}20`, 
                color: user.levelColor,
                borderColor: `${user.levelColor}50`
              }}
            >
              {user.levelName}
            </Badge>
          </div>
          
          {/* Wallet Address */}
          <div className="flex items-center space-x-2">
            <Zap className="w-3 h-3 text-neutral/50" />
            <code className={`text-xs font-mono px-2 py-0.5 rounded border ${
              isCurrentUser 
                ? 'text-mint bg-mint/10 border-mint/30' 
                : 'text-neutral/70 bg-charcoal/50 border-amber/30'
            }`}>
              {user.address.slice(0, 3)}...{user.address.slice(-3)}
            </code>
          </div>
        </div>
        
        {/* XP Display */}
        <div className="text-right space-y-1 flex-shrink-0">
          <div className={`text-lg font-bold ${
            isCurrentUser ? 'text-mint' : 'text-mint'
          }`}>
            {user.admin_total_xp.toLocaleString()}
          </div>
          <div className="text-xs text-neutral/50 font-medium tracking-wide uppercase">
            XP
          </div>
        </div>
      </div>
    </motion.div>
  )
}
