"use client"

import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { AnimatedGauge } from "@/components/animated-gauge"
import { ScoreHistoryChart } from "@/components/score-history-chart"
import { AchievementCard } from "@/components/achievement-card"
import { Leaderboard } from "@/components/leaderboard"
import { ScoreMultiplier } from "@/components/score-multiplier"
import {
  Activity,
  Wallet,
  Trophy,
  Zap,
  Target,
  Star,
  CheckCircle2,
  TrendingUp,
  Award,
  Calendar,
  Users,
  Flame,
  Code,
  Coins,
  Shield,
} from "lucide-react"

const achievements = [
  {
    id: "1",
    title: "First Steps",
    description: "Complete your first transaction",
    icon: "🚀",
    points: 50,
    unlocked: true,
    rarity: "common" as const,
  },
  {
    id: "2",
    title: "Contract Master",
    description: "Deploy 10 smart contracts",
    icon: "⚡",
    points: 500,
    unlocked: true,
    rarity: "epic" as const,
  },
  {
    id: "3",
    title: "Whale Watcher",
    description: "Hold 10,000+ ALPH for 30 days",
    icon: "🐋",
    points: 1000,
    unlocked: false,
    progress: 15,
    maxProgress: 30,
    rarity: "legendary" as const,
  },
  {
    id: "4",
    title: "DeFi Explorer",
    description: "Interact with 5 different DeFi protocols",
    icon: "🌊",
    points: 300,
    unlocked: false,
    progress: 3,
    maxProgress: 5,
    rarity: "rare" as const,
  },
  {
    id: "5",
    title: "Community Builder",
    description: "Refer 10 new users to AlphIQ",
    icon: "👥",
    points: 750,
    unlocked: false,
    progress: 7,
    maxProgress: 10,
    rarity: "epic" as const,
  },
  {
    id: "6",
    title: "Speed Demon",
    description: "Complete 100 transactions in 24h",
    icon: "💨",
    points: 200,
    unlocked: true,
    rarity: "rare" as const,
  },
]

const weeklyQuests = [
  { id: 1, title: "Make 20 transactions", progress: 15, total: 20, reward: 150, completed: false },
  { id: 2, title: "Interact with 3 new contracts", progress: 3, total: 3, reward: 200, completed: true },
  { id: 3, title: "Hold position for 7 days", progress: 5, total: 7, reward: 100, completed: false },
  { id: 4, title: "Participate in governance", progress: 0, total: 1, reward: 300, completed: false },
]

const scoreBreakdown = [
  { category: "Transaction Volume", points: 245, maxPoints: 300, icon: <Coins className="w-4 h-4" /> },
  { category: "Smart Contract Usage", points: 180, maxPoints: 250, icon: <Code className="w-4 h-4" /> },
  { category: "DeFi Participation", points: 160, maxPoints: 200, icon: <TrendingUp className="w-4 h-4" /> },
  { category: "Community Engagement", points: 120, maxPoints: 150, icon: <Users className="w-4 h-4" /> },
  { category: "Security Score", points: 95, maxPoints: 100, icon: <Shield className="w-4 h-4" /> },
  { category: "Consistency Bonus", points: 40, maxPoints: 50, icon: <Calendar className="w-4 h-4" /> },
]

export default function OnchainScorePage() {
  const totalScore = scoreBreakdown.reduce((sum, item) => sum + item.points, 0)
  const maxTotalScore = scoreBreakdown.reduce((sum, item) => sum + item.maxPoints, 0)

  return (
    <div className="min-h-screen bg-charcoal text-neutral">
      {/* Top Bar */}
      <header className="border-b border-white/10 bg-charcoal/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-mint to-amber rounded-lg flex items-center justify-center">
                <Zap className="w-5 h-5 text-charcoal" />
              </div>
              <h1 className="text-xl font-bold text-neutral">AlphIQ</h1>
            </div>

            {/* Toggle Switch */}
            <div className="flex items-center space-x-4 bg-white/5 rounded-lg p-1">
              <Link href="/">
                <Button variant="ghost" size="sm" className="text-neutral hover:text-amber">
                  <Activity className="w-4 h-4 mr-2" />
                  Analytics View
                </Button>
              </Link>
              <Button variant="default" size="sm" className="bg-amber text-charcoal">
                <Trophy className="w-4 h-4 mr-2" />
                Onchain Score View
              </Button>
            </div>

            {/* Wallet Connect */}
            <Button className="bg-amber hover:bg-amber/90 text-charcoal font-medium">
              <Wallet className="w-4 h-4 mr-2" />
              0x123...abc
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-6">
        <div className="grid grid-cols-12 gap-6">
          {/* Left Panel - Score Overview */}
          <div className="col-span-12 lg:col-span-4 space-y-6">
            {/* Main Score Display */}
            <Card className="bg-gradient-to-br from-mint/10 to-amber/10 border-mint/20 backdrop-blur-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-mint flex items-center">
                  <Trophy className="w-5 h-5 mr-2" />
                  Your Onchain Score
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col items-center space-y-4">
                <AnimatedGauge value={totalScore} maxValue={maxTotalScore} size={140} />
                <div className="text-center space-y-2">
                  <Badge className="bg-mint/20 text-mint border-mint/30 text-lg px-4 py-1">
                    <Star className="w-4 h-4 mr-2" />
                    Onchain Strategist
                  </Badge>
                  <div className="text-sm text-neutral/70">Rank #6 globally • Top 15%</div>
                </div>
              </CardContent>
            </Card>

            {/* Score History */}
            <Card className="bg-card/50 border-white/10 backdrop-blur-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-amber flex items-center">
                  <TrendingUp className="w-5 h-5 mr-2" />
                  Score History
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScoreHistoryChart />
              </CardContent>
            </Card>

            {/* Score Multipliers */}
            <ScoreMultiplier />
          </div>

          {/* Center Panel - Detailed Breakdown */}
          <div className="col-span-12 lg:col-span-5 space-y-6">
            {/* Score Breakdown */}
            <Card className="bg-card/50 border-white/10 backdrop-blur-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-lavender flex items-center">
                  <Award className="w-5 h-5 mr-2" />
                  Score Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {scoreBreakdown.map((item, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="text-neutral/70">{item.icon}</div>
                        <span className="text-sm text-neutral/80">{item.category}</span>
                      </div>
                      <span className="text-neutral font-medium">
                        {item.points}/{item.maxPoints}
                      </span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-2">
                      <div
                        className="h-2 bg-gradient-to-r from-mint to-amber rounded-full transition-all duration-1000"
                        style={{ width: `${(item.points / item.maxPoints) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Weekly Quests */}
            <Card className="bg-card/50 border-white/10 backdrop-blur-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-amber flex items-center">
                  <Target className="w-5 h-5 mr-2" />
                  Weekly Quests
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {weeklyQuests.map((quest) => (
                  <div key={quest.id} className="p-3 bg-white/5 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-3">
                        <div
                          className={`w-5 h-5 rounded-full flex items-center justify-center ${
                            quest.completed ? "bg-mint" : "bg-white/10"
                          }`}
                        >
                          {quest.completed && <CheckCircle2 className="w-3 h-3 text-charcoal" />}
                        </div>
                        <span className={`font-medium ${quest.completed ? "text-mint" : "text-neutral"}`}>
                          {quest.title}
                        </span>
                      </div>
                      <Badge className="bg-amber/20 text-amber">+{quest.reward} pts</Badge>
                    </div>
                    <div className="ml-8">
                      <div className="flex justify-between text-xs text-neutral/60 mb-1">
                        <span>Progress</span>
                        <span>
                          {quest.progress}/{quest.total}
                        </span>
                      </div>
                      <div className="w-full bg-white/10 rounded-full h-1.5">
                        <div
                          className={`h-1.5 rounded-full transition-all duration-500 ${
                            quest.completed ? "bg-mint" : "bg-amber"
                          }`}
                          style={{ width: `${(quest.progress / quest.total) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Achievements Grid */}
            <Card className="bg-card/50 border-white/10 backdrop-blur-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-mint flex items-center">
                  <Award className="w-5 h-5 mr-2" />
                  Achievements
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  {achievements.map((achievement) => (
                    <AchievementCard key={achievement.id} achievement={achievement} />
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Panel - Leaderboard & Social */}
          <div className="col-span-12 lg:col-span-3 space-y-6">
            {/* Leaderboard */}
            <Leaderboard />

            {/* Next Level Progress */}
            <Card className="bg-card/50 border-white/10 backdrop-blur-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-lavender flex items-center">
                  <Flame className="w-5 h-5 mr-2" />
                  Next Level
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-amber">DeFi Master</div>
                  <div className="text-sm text-neutral/70">Unlock at 1,200 points</div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-neutral/70">Progress</span>
                    <span className="text-amber font-medium">840 / 1,200</span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-3">
                    <div
                      className="h-3 bg-gradient-to-r from-mint to-amber rounded-full transition-all duration-1000"
                      style={{ width: "70%" }}
                    />
                  </div>
                  <div className="text-center text-sm text-neutral/60">360 points to go</div>
                </div>

                <Separator className="bg-white/10" />

                <div className="space-y-2">
                  <div className="text-sm font-medium text-neutral/80">Unlock Benefits:</div>
                  <ul className="text-xs text-neutral/60 space-y-1">
                    <li>• 2x multiplier on DeFi activities</li>
                    <li>• Exclusive badge and profile frame</li>
                    <li>• Access to premium analytics</li>
                    <li>• Priority support</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card className="bg-card/50 border-white/10 backdrop-blur-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-neutral/80 text-sm">Quick Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-neutral/70 text-sm">Total Achievements</span>
                  <span className="text-mint font-bold">3/6</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-neutral/70 text-sm">Weekly Rank</span>
                  <span className="text-amber font-bold">#4</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-neutral/70 text-sm">Streak Days</span>
                  <span className="text-lavender font-bold">7</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-neutral/70 text-sm">Points This Week</span>
                  <span className="text-mint font-bold">+180</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
