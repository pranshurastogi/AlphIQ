"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Crown, Medal, Award, TrendingUp } from "lucide-react"

const leaderboardData = [
  { rank: 1, address: "0x7a2...f8c", score: 2450, change: "+12", badge: "Onchain Legend" },
  { rank: 2, address: "0x9b1...2de", score: 2380, change: "+8", badge: "DeFi Master" },
  { rank: 3, address: "0x4c8...a91", score: 2290, change: "-3", badge: "Smart Trader" },
  { rank: 4, address: "0x1f5...6b7", score: 2180, change: "+15", badge: "Contract Wizard" },
  { rank: 5, address: "0x8d3...c4e", score: 2050, change: "+5", badge: "Onchain Explorer" },
  { rank: 6, address: "0x123...abc", score: 1840, change: "+22", badge: "Onchain Strategist", isCurrentUser: true },
]

export function Leaderboard() {
  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="w-5 h-5 text-amber" />
      case 2:
        return <Medal className="w-5 h-5 text-gray-400" />
      case 3:
        return <Award className="w-5 h-5 text-amber/70" />
      default:
        return <span className="w-5 h-5 flex items-center justify-center text-neutral/60 font-bold">{rank}</span>
    }
  }

  return (
    <Card className="bg-card/50 border-white/10 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-amber flex items-center">
          <TrendingUp className="w-5 h-5 mr-2" />
          Global Leaderboard
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {leaderboardData.map((user) => (
          <div
            key={user.rank}
            className={`flex items-center justify-between p-3 rounded-lg transition-all ${
              user.isCurrentUser ? "bg-amber/10 border border-amber/20" : "bg-white/5 hover:bg-white/10"
            }`}
          >
            <div className="flex items-center space-x-3">
              {getRankIcon(user.rank)}
              <div>
                <div className={`font-medium ${user.isCurrentUser ? "text-amber" : "text-neutral"}`}>
                  {user.address}
                  {user.isCurrentUser && <span className="text-xs ml-2 text-amber/70">(You)</span>}
                </div>
                <Badge variant="secondary" className="text-xs mt-1">
                  {user.badge}
                </Badge>
              </div>
            </div>

            <div className="text-right">
              <div className={`font-bold ${user.isCurrentUser ? "text-amber" : "text-mint"}`}>
                {user.score.toLocaleString()}
              </div>
              <div className={`text-xs ${user.change.startsWith("+") ? "text-mint" : "text-red-400"}`}>
                {user.change}
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
