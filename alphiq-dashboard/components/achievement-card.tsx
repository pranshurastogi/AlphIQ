"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, Lock } from "lucide-react"

interface Achievement {
  id: string
  title: string
  description: string
  icon: string
  points: number
  unlocked: boolean
  progress?: number
  maxProgress?: number
  rarity: "common" | "rare" | "epic" | "legendary"
}

interface AchievementCardProps {
  achievement: Achievement
}

export function AchievementCard({ achievement }: AchievementCardProps) {
  const rarityColors = {
    common: "border-gray-400 bg-gray-400/10",
    rare: "border-mint bg-mint/10",
    epic: "border-lavender bg-lavender/10",
    legendary: "border-amber bg-amber/10",
  }

  const rarityTextColors = {
    common: "text-gray-400",
    rare: "text-mint",
    epic: "text-lavender",
    legendary: "text-amber",
  }

  return (
    <Card
      className={`bg-card/50 border-white/10 backdrop-blur-sm ${rarityColors[achievement.rarity]} transition-all hover:scale-105`}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="text-2xl">{achievement.icon}</div>
          {achievement.unlocked ? (
            <CheckCircle2 className="w-5 h-5 text-mint" />
          ) : (
            <Lock className="w-5 h-5 text-neutral/40" />
          )}
        </div>

        <div className="space-y-2">
          <h3 className={`font-semibold ${achievement.unlocked ? "text-neutral" : "text-neutral/60"}`}>
            {achievement.title}
          </h3>
          <p className={`text-sm ${achievement.unlocked ? "text-neutral/70" : "text-neutral/40"}`}>
            {achievement.description}
          </p>

          {achievement.progress !== undefined && achievement.maxProgress && (
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-neutral/60">Progress</span>
                <span className="text-neutral/60">
                  {achievement.progress}/{achievement.maxProgress}
                </span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-1.5">
                <div
                  className="h-1.5 bg-mint rounded-full transition-all duration-500"
                  style={{ width: `${(achievement.progress / achievement.maxProgress) * 100}%` }}
                />
              </div>
            </div>
          )}

          <div className="flex justify-between items-center pt-2">
            <Badge
              className={`${rarityColors[achievement.rarity]} ${rarityTextColors[achievement.rarity]} border-current`}
            >
              {achievement.rarity}
            </Badge>
            <span className="text-amber font-semibold">+{achievement.points} pts</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
