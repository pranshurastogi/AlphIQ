"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Zap, Clock, Flame } from "lucide-react"

const multipliers = [
  {
    type: "Streak Bonus",
    icon: <Flame className="w-4 h-4" />,
    multiplier: "2.5x",
    description: "7-day transaction streak",
    active: true,
    timeLeft: "2h 15m",
  },
  {
    type: "Weekend Boost",
    icon: <Zap className="w-4 h-4" />,
    multiplier: "1.5x",
    description: "Weekend activity bonus",
    active: true,
    timeLeft: "1d 8h",
  },
  {
    type: "Contract Deployer",
    icon: <Clock className="w-4 h-4" />,
    multiplier: "3.0x",
    description: "Deploy 3+ contracts this week",
    active: false,
    progress: "2/3",
  },
]

export function ScoreMultiplier() {
  return (
    <Card className="bg-card/50 border-white/10 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-lavender flex items-center">
          <Zap className="w-5 h-5 mr-2" />
          Active Multipliers
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {multipliers.map((multiplier, index) => (
          <div
            key={index}
            className={`p-3 rounded-lg border transition-all ${
              multiplier.active ? "bg-mint/10 border-mint/20" : "bg-white/5 border-white/10"
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <div className={`${multiplier.active ? "text-mint" : "text-neutral/60"}`}>{multiplier.icon}</div>
                <span className={`font-medium ${multiplier.active ? "text-mint" : "text-neutral/60"}`}>
                  {multiplier.type}
                </span>
              </div>
              <Badge className={`${multiplier.active ? "bg-mint text-charcoal" : "bg-neutral/20 text-neutral/60"}`}>
                {multiplier.multiplier}
              </Badge>
            </div>

            <p className={`text-sm ${multiplier.active ? "text-neutral/80" : "text-neutral/50"}`}>
              {multiplier.description}
            </p>

            {multiplier.timeLeft && <div className="text-xs text-mint mt-1">Expires in {multiplier.timeLeft}</div>}

            {multiplier.progress && <div className="text-xs text-neutral/60 mt-1">Progress: {multiplier.progress}</div>}
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
