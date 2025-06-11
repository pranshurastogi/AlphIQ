"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlephiumConnectButton } from "@alephium/web3-react"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { AnimatedGauge } from "@/components/animated-gauge"
import { ProgressBar } from "@/components/progress-bar"
import {
  Activity,
  Wallet,
  TrendingUp,
  Code,
  AlertTriangle,
  Trophy,
  Zap,
  Target,
  ArrowUpRight,
  ArrowDownLeft,
  Flame,
  Star,
  CheckCircle2,
} from "lucide-react"
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts"

const tokenFlowData = [
  { name: "Top Wallets", value: 2400, color: "#FF8A65" },
  { name: "DEX Transfers", value: 1800, color: "#A285FF" },
  { name: "Contract Calls", value: 3200, color: "#00E6B0" },
  { name: "Mining Rewards", value: 1600, color: "#FF8A65" },
]

const recentTransactions = [
  { type: "out", amount: "125.5", timestamp: "2 min ago", address: "0x7a2...f8c" },
  { type: "in", amount: "50.0", timestamp: "5 min ago", address: "0x9b1...2de" },
  { type: "out", amount: "75.2", timestamp: "12 min ago", address: "0x4c8...a91" },
  { type: "in", amount: "200.0", timestamp: "18 min ago", address: "0x1f5...6b7" },
]

const alerts = [
  { type: "whale", message: "Large transfer detected: 10,000 ALPH", time: "3 min ago", severity: "high" },
  { type: "contract", message: "New contract deployed", time: "8 min ago", severity: "medium" },
  { type: "suspicious", message: "Unusual transaction pattern", time: "15 min ago", severity: "high" },
]

const missions = [
  { id: 1, title: "Complete 5 transactions", progress: 3, total: 5, completed: false },
  { id: 2, title: "Interact with 2 smart contracts", progress: 2, total: 2, completed: true },
  { id: 3, title: "Hold ALPH for 24h", progress: 18, total: 24, completed: false },
]

export default function AlphIQDashboard() {
  const [viewMode, setViewMode] = useState<"analytics" | "score">("analytics")
  const [contractId, setContractId] = useState("")

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
              <Button
                variant={viewMode === "analytics" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("analytics")}
                className={`${viewMode === "analytics" ? "bg-amber text-charcoal" : "text-neutral hover:text-amber"}`}
              >
                <Activity className="w-4 h-4 mr-2" />
                Analytics View
              </Button>
              <Button
                variant={viewMode === "score" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("score")}
                className={`${viewMode === "score" ? "bg-amber text-charcoal" : "text-neutral hover:text-amber"}`}
              >
                <Trophy className="w-4 h-4 mr-2" />
                Onchain Score View
              </Button>
            </div>

            {/* Wallet Connect */}
           
            <AlephiumConnectButton className="bg-amber hover:bg-amber/90 text-charcoal font-medium flex items-center px-4 py-2 rounded" />
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-6">
        <div className="grid grid-cols-12 gap-6">
          {/* Left Panel - Analytics Core */}
          <div className="col-span-12 lg:col-span-3 space-y-6">
            {/* Live Network Stats */}
            <Card className="bg-card/50 border-white/10 backdrop-blur-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-mint flex items-center">
                  <Activity className="w-5 h-5 mr-2" />
                  Live Network Stats
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-neutral/70 text-sm">TPS</span>
                    <span className="text-mint text-xl font-bold animate-pulse-glow">1,247</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-neutral/70 text-sm">Gas Usage</span>
                    <span className="text-mint text-xl font-bold">78%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-neutral/70 text-sm">Block Time</span>
                    <span className="text-mint text-xl font-bold">16s</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Wallet Profiler */}
            <Card className="bg-card/50 border-white/10 backdrop-blur-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-amber flex items-center">
                  <Wallet className="w-5 h-5 mr-2" />
                  Wallet Profiler
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="text-sm text-neutral/70">Balance</div>
                  <div className="text-2xl font-bold text-amber">1,847.32 ALPH</div>
                </div>
                <Separator className="bg-white/10" />
                <div className="space-y-3">
                  <div className="text-sm font-medium text-neutral/80">Recent Transactions</div>
                  {recentTransactions.map((tx, index) => (
                    <div key={index} className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-2">
                        {tx.type === "out" ? (
                          <ArrowUpRight className="w-4 h-4 text-red-400" />
                        ) : (
                          <ArrowDownLeft className="w-4 h-4 text-mint" />
                        )}
                        <span className="text-neutral/70">{tx.address}</span>
                      </div>
                      <div className="text-right">
                        <div className={`font-medium ${tx.type === "out" ? "text-red-400" : "text-mint"}`}>
                          {tx.type === "out" ? "-" : "+"}
                          {tx.amount} ALPH
                        </div>
                        <div className="text-xs text-neutral/50">{tx.timestamp}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Token Flow Analyzer */}
            <Card className="bg-card/50 border-white/10 backdrop-blur-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-lavender flex items-center">
                  <TrendingUp className="w-5 h-5 mr-2" />
                  Token Flow Analyzer
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={tokenFlowData}>
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "#E0E0E0" }} />
                    <YAxis hide />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#2A2A2E",
                        border: "1px solid rgba(255,255,255,0.1)",
                        borderRadius: "8px",
                        color: "#E0E0E0",
                      }}
                    />
                    <Bar dataKey="value" fill="#FF8A65" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Center Panel - Dynamic Intelligence */}
          <div className="col-span-12 lg:col-span-6 space-y-6">
            {/* Contract Search & Decoder */}
            <Card className="bg-card/50 border-white/10 backdrop-blur-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-lavender flex items-center">
                  <Code className="w-5 h-5 mr-2" />
                  Contract Search & Decoder
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex space-x-2">
                  <Input
                    placeholder="Enter contract ID..."
                    value={contractId}
                    onChange={(e) => setContractId(e.target.value)}
                    className="bg-white/5 border-white/10 text-neutral placeholder:text-neutral/50"
                  />
                  <Button className="bg-lavender hover:bg-lavender/90 text-charcoal">Decode</Button>
                </div>
                <div className="bg-black/20 rounded-lg p-4 font-mono text-sm">
                  <div className="text-lavender">// Ralph Contract Code</div>
                  <div className="text-mint">Contract</div> <div className="text-amber">TokenSwap</div>
                  <div className="text-neutral">(</div>
                  <div className="ml-4 text-neutral/70">tokenA: ByteVec,</div>
                  <div className="ml-4 text-neutral/70">tokenB: ByteVec,</div>
                  <div className="ml-4 text-neutral/70">rate: U256</div>
                  <div className="text-neutral">)</div> <div className="text-neutral">{"{"}</div>
                  <div className="ml-4 text-mint">pub fn</div> <div className="text-amber">swap</div>
                  <div className="text-neutral">(amount: U256) -{">"} ()</div>
                  <div className="text-neutral">{"}"}</div>
                </div>
              </CardContent>
            </Card>

            {/* Onchain Alerts Feed */}
            <Card className="bg-card/50 border-white/10 backdrop-blur-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-amber flex items-center">
                  <AlertTriangle className="w-5 h-5 mr-2" />
                  Onchain Alerts Feed
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {alerts.map((alert, index) => (
                  <div key={index} className="flex items-start space-x-3 p-3 bg-white/5 rounded-lg">
                    <div
                      className={`w-2 h-2 rounded-full mt-2 ${alert.severity === "high" ? "bg-red-400" : "bg-amber"}`}
                    />
                    <div className="flex-1">
                      <div className="text-neutral font-medium">{alert.message}</div>
                      <div className="text-xs text-neutral/50 mt-1">{alert.time}</div>
                    </div>
                    <Badge variant={alert.severity === "high" ? "destructive" : "secondary"} className="text-xs">
                      {alert.severity}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Quest of the Day */}
            <Card className="bg-gradient-to-r from-amber/10 to-mint/10 border-amber/20 backdrop-blur-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-amber flex items-center">
                  <Target className="w-5 h-5 mr-2" />
                  Quest of the Day
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-amber/20 rounded-lg flex items-center justify-center">
                    <Flame className="w-6 h-6 text-amber" />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-neutral">Deploy a Smart Contract</div>
                    <div className="text-sm text-neutral/70">Deploy any contract to earn 100 bonus points</div>
                  </div>
                  <Badge className="bg-amber text-charcoal">+100 pts</Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Panel - Onchain Score Engine */}
          <div className="col-span-12 lg:col-span-3 space-y-6">
            {/* Animated Score Gauge */}
            <Card className="bg-card/50 border-white/10 backdrop-blur-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-mint flex items-center">
                  <Trophy className="w-5 h-5 mr-2" />
                  Onchain Score
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col items-center space-y-4">
                <AnimatedGauge value={840} maxValue={1000} />
                <Badge className="bg-mint/20 text-mint border-mint/30">
                  <Star className="w-3 h-3 mr-1" />
                  Onchain Strategist
                </Badge>
              </CardContent>
            </Card>

            {/* Score Breakdown */}
            <Card className="bg-card/50 border-white/10 backdrop-blur-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-neutral/80 text-sm">Score Breakdown</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <ProgressBar value={180} maxValue={250} label="📦 Transaction Activity" color="mint" />
                <ProgressBar value={220} maxValue={300} label="🧠 Smart Contract Interactions" color="amber" />
                <ProgressBar value={150} maxValue={200} label="🧑‍💻 Developer Contributions" color="lavender" />
                <ProgressBar value={290} maxValue={350} label="🧭 Community & Quests" color="mint" />
              </CardContent>
            </Card>

            {/* Gamified Layer */}
            <Card className="bg-card/50 border-white/10 backdrop-blur-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-amber flex items-center">
                  <Zap className="w-5 h-5 mr-2" />
                  Progress & Missions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* XP Bar */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-neutral/70">XP to next level</span>
                    <span className="text-amber font-medium">2,340 / 3,000</span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-2">
                    <div className="h-2 bg-amber rounded-full transition-all duration-1000" style={{ width: "78%" }} />
                  </div>
                </div>

                <Separator className="bg-white/10" />

                {/* Daily Missions */}
                <div className="space-y-3">
                  <div className="text-sm font-medium text-neutral/80">Daily Missions</div>
                  {missions.map((mission) => (
                    <div key={mission.id} className="flex items-center space-x-3">
                      <div
                        className={`w-5 h-5 rounded-full flex items-center justify-center ${
                          mission.completed ? "bg-mint" : "bg-white/10"
                        }`}
                      >
                        {mission.completed && <CheckCircle2 className="w-3 h-3 text-charcoal" />}
                      </div>
                      <div className="flex-1">
                        <div className={`text-sm ${mission.completed ? "text-mint" : "text-neutral/70"}`}>
                          {mission.title}
                        </div>
                        <div className="text-xs text-neutral/50">
                          {mission.progress}/{mission.total}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
