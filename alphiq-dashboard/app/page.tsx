// app/page.tsx
'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { LiveStats } from '@/components/LiveStats'
import { WalletProfiler } from '@/components/WalletProfiler'
import { ContractDecoder } from '@/components/ContractDecoder'
import { TokenDistributionCard } from '@/components/TokenDistributionCard'
import { BlogFeed } from '@/components/BlogFeed'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { AnimatedGauge } from '@/components/animated-gauge'
import { ProgressBar } from '@/components/progress-bar'
import {
  Activity,
  Wallet,
  TrendingUp,
  AlertTriangle,
  Trophy,
  Zap,
  Target,
  Flame,
  Star,
  CheckCircle2,
} from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts'

const alerts = [
  { message: 'Large transfer detected: 10,000 ALPH', time: '3 min ago', severity: 'high' },
  { message: 'New contract deployed',          time: '8 min ago', severity: 'medium' },
  { message: 'Unusual transaction pattern',     time: '15 min ago', severity: 'high' },
]

const missions = [
  { id: 1, title: 'Complete 5 transactions',          progress: 3,  total: 5,  completed: false },
  { id: 2, title: 'Interact with 2 smart contracts',  progress: 2,  total: 2,  completed: true  },
  { id: 3, title: 'Hold ALPH for 24h',                progress: 18, total: 24, completed: false },
]

export default function AlphIQDashboard() {
  const [contractId, setContractId] = useState('')

  return (
    <div className="min-h-screen bg-charcoal text-neutral">
      <div className="container mx-auto px-6 py-6">
        <div className="grid grid-cols-12 gap-6">
          {/* Left Panel */}
          <div className="col-span-12 lg:col-span-3 space-y-6">
            <LiveStats />
            <WalletProfiler />
            {/* ← New Token Distribution (“Gini”) */}
            <TokenDistributionCard />
          </div>

          {/* Center Panel */}
          <div className="col-span-12 lg:col-span-6 space-y-6">
            {/* Contract Decoder */}
            <ContractDecoder />

            {/* Onchain Alerts */}
            <Card className="bg-card/50 border-white/10 backdrop-blur-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-amber flex items-center">
                  <AlertTriangle className="w-5 h-5 mr-2" />
                  Onchain Alerts Feed
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {alerts.map((a, i) => (
                  <div key={i} className="flex items-start space-x-3 p-3 bg-white/5 rounded-lg">
                    <div className={`w-2 h-2 rounded-full mt-2 ${a.severity === 'high' ? 'bg-red-400' : 'bg-amber'}`} />
                    <div className="flex-1">
                      <div className="text-neutral font-medium">{a.message}</div>
                      <div className="text-xs text-neutral/50 mt-1">{a.time}</div>
                    </div>
                    <Badge variant={a.severity === 'high' ? 'destructive' : 'secondary'} className="text-xs">
                      {a.severity}
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

       

          {/* Right Panel */}
          <div className="col-span-12 lg:col-span-3 space-y-6">

            {/* ← BlogFeed goes at top of right column */}
            <BlogFeed />
            
            {/* Onchain Score */}
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
                  <Star className="w-3 h-3 mr-1" /> Onchain Strategist
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

            {/* Progress & Missions */}
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
                    <div
                      className="h-2 bg-amber rounded-full transition-all duration-1000"
                      style={{ width: '78%' }}
                    />
                  </div>
                </div>

                <Separator className="bg-white/10" />

                {/* Daily Missions */}
                <div className="space-y-3">
                  <div className="text-sm font-medium text-neutral/80">Daily Missions</div>
                  {missions.map((m) => (
                    <div key={m.id} className="flex items-center space-x-3">
                      <div
                        className={`w-5 h-5 rounded-full flex items-center justify-center ${
                          m.completed ? 'bg-mint' : 'bg-white/10'
                        }`}
                      >
                        {m.completed && <CheckCircle2 className="w-3 h-3 text-charcoal" />}
                      </div>
                      <div className="flex-1">
                        <div className={`text-sm ${m.completed ? 'text-mint' : 'text-neutral/70'}`}>
                          {m.title}
                        </div>
                        <div className="text-xs text-neutral/50">
                          {m.progress}/{m.total}
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
