'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useXPData } from "@/hooks/useXPData"
import { Trophy, Zap, Star, Crown, Sparkles, Wallet } from "lucide-react"
import { useEffect, useState } from "react"

interface XPDisplayProps {
  address?: string
}

export function XPDisplay({ address }: XPDisplayProps) {
  const { userXP, isLoading } = useXPData(address)
  const [displayXP, setDisplayXP] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)

  useEffect(() => {
    if (userXP?.admin_total_xp !== undefined) {
      setIsAnimating(true)
      const targetXP = userXP.admin_total_xp
      const startXP = displayXP
      const duration = 2000 // 2 seconds
      const startTime = Date.now()

      const animate = () => {
        const elapsed = Date.now() - startTime
        const progress = Math.min(elapsed / duration, 1)
        
        // Easing function for smooth animation
        const easeOutQuart = 1 - Math.pow(1 - progress, 4)
        const currentXP = Math.floor(startXP + (targetXP - startXP) * easeOutQuart)
        
        setDisplayXP(currentXP)

        if (progress < 1) {
          requestAnimationFrame(animate)
        } else {
          setIsAnimating(false)
        }
      }

      requestAnimationFrame(animate)
    }
  }, [userXP?.admin_total_xp])

  // Fallback level calculation (used when database levels are not available)
  const getLevel = (xp: number) => {
    if (xp < 100) return { level: 1, name: "Novice", color: "text-blue-400" }
    if (xp < 500) return { level: 2, name: "Explorer", color: "text-green-400" }
    if (xp < 1000) return { level: 3, name: "Adventurer", color: "text-yellow-400" }
    if (xp < 2500) return { level: 4, name: "Veteran", color: "text-orange-400" }
    if (xp < 5000) return { level: 5, name: "Master", color: "text-red-400" }
    return { level: 6, name: "Legend", color: "text-purple-400" }
  }

  // Use level info from the database if available, otherwise fallback to calculated
  const levelInfo = userXP?.levelName ? {
    level: userXP.level || 1,
    name: userXP.levelName,
    color: userXP.levelColor || "text-blue-400"
  } : getLevel(displayXP)

  // Calculate progress to next level (this will need to be updated when we have real level data)
  const getNextLevelXP = (currentLevel: number) => {
    const thresholds = [0, 100, 500, 1000, 2500, 5000]
    return thresholds[currentLevel] || 10000
  }

  const nextLevelXP = getNextLevelXP(levelInfo.level)
  const currentLevelXP = getNextLevelXP(levelInfo.level - 1)
  const progressToNext = Math.max(0, Math.min(100, ((displayXP - currentLevelXP) / (nextLevelXP - currentLevelXP)) * 100))

  if (!address) {
    return (
      <Card className="bg-card/50 border-white/10 backdrop-blur-sm">
        <CardContent className="p-6 text-center">
          <div className="text-neutral/60 mb-4">
            <Wallet className="w-12 h-12 mx-auto mb-3 text-neutral/40" />
            <div className="text-lg font-medium">Connect Your Wallet</div>
            <div className="text-sm">Connect your wallet to view your XP</div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (isLoading) {
    return (
      <Card className="bg-card/50 border-white/10 backdrop-blur-sm animate-pulse">
        <CardContent className="p-6">
          <div className="h-32 bg-white/10 rounded-lg"></div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-card/50 border-white/10 backdrop-blur-sm relative overflow-hidden">
      {/* Animated background particles */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-gradient-to-r from-amber to-mint rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${i * 0.5}s`,
              animationDuration: `${2 + Math.random() * 2}s`
            }}
          />
        ))}
      </div>

      <CardHeader className="pb-4 relative z-10">
        <CardTitle className="text-amber flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Trophy className="w-6 h-6" />
            <span>Experience Points</span>
            {isAnimating && <Sparkles className="w-4 h-4 animate-spin text-mint" />}
          </div>
          <Badge className={`${levelInfo.color} bg-white/10`}>
            Level {levelInfo.level}
          </Badge>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6 relative z-10">
        {/* Main XP Display */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center space-x-2">
            <Zap className="w-8 h-8 text-amber" />
            <span className="text-4xl font-bold text-amber">
              {displayXP.toLocaleString()}
            </span>
            <Star className="w-6 h-6 text-mint" />
          </div>
          <div className={`text-lg font-semibold ${levelInfo.color}`}>
            {levelInfo.name}
          </div>
        </div>

        {/* Level Progress */}
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-neutral/70">Progress to Next Level</span>
            <span className="text-amber font-medium">
              {Math.floor(progressToNext)}%
            </span>
          </div>
          <div className="relative">
            <div className="w-full bg-white/10 rounded-full h-3 overflow-hidden">
              <div
                className="h-3 bg-gradient-to-r from-mint via-amber to-lavender rounded-full transition-all duration-1000 relative"
                style={{ width: `${progressToNext}%` }}
              >
                {/* Animated shine effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />
              </div>
            </div>
            {/* XP needed indicator */}
            <div className="text-center mt-2 text-xs text-neutral/60">
              {Math.max(0, nextLevelXP - displayXP)} XP to Level {levelInfo.level + 1}
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4 pt-4">
          <div className="text-center p-3 bg-white/5 rounded-lg">
            <div className="text-2xl font-bold text-mint">{levelInfo.level}</div>
            <div className="text-xs text-neutral/60">Current Level</div>
          </div>
          <div className="text-center p-3 bg-white/5 rounded-lg">
            <div className="text-2xl font-bold text-lavender">
              {Math.floor(displayXP / 100)}
            </div>
            <div className="text-xs text-neutral/60">Achievements</div>
          </div>
        </div>

        {/* Special effects for high levels */}
        {levelInfo.level >= 5 && (
          <div className="flex items-center justify-center space-x-2 text-amber">
            <Crown className="w-5 h-5" />
            <span className="text-sm font-medium">Elite Status</span>
            <Crown className="w-5 h-5" />
          </div>
        )}
      </CardContent>
    </Card>
  )
} 