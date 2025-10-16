// app/page.tsx
'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useWallet } from '@alephium/web3-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { LiveStats } from '@/components/LiveStats'
import { WalletProfiler } from '@/components/WalletProfiler'
import { ContractDecoder } from '@/components/ContractDecoder'
import { CompactTokenDistributionCard } from '@/components/CompactTokenDistributionCard'
import { BlogFeed } from '@/components/BlogFeed'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { AnimatedGauge } from '@/components/animated-gauge'
import { OnchainScoreCard } from '@/components/OnchainScoreCard'
import { OnchainAIAnalyzer } from '@/components/OnchainAIAnalyzer'
import { QuestOfDay } from '@/components/QuestOfDay'
import { ScoreBreakdown } from '@/components/ScoreBreakdown'
import { PersonalizedWelcome } from '@/components/PersonalizedWelcome'
import { ProfileView } from '@/components/ProfileView'
import { useUserProfile } from '@/hooks/useUserProfile'

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
  const { account: acctObj } = useWallet()
  const address = typeof acctObj === 'string' ? acctObj : acctObj?.address
  const { userId } = useUserProfile(address)

  return (
    <div className="min-h-screen bg-charcoal text-neutral">
      <div className="container mx-auto px-6 py-6">
        <div className="space-y-6">
          {/* Main Dashboard Grid */}
          <div className="grid grid-cols-12 gap-6">
            {/* Left Panel */}
            <div className="col-span-12 lg:col-span-3 space-y-6">
              <LiveStats />
              <WalletProfiler />
              <CompactTokenDistributionCard />
            </div>

            {/* Center Panel */}
            <div className="col-span-12 lg:col-span-6 space-y-6">
              {/* Personalized Welcome */}
              {address && <PersonalizedWelcome />}

              {/* Contract Decoder */}
              <ContractDecoder />

              {/* Onchain AI Analyzer */}
              <OnchainAIAnalyzer />

              {/* Quest of the Day */}
              <QuestOfDay />
            </div>

            {/* Right Panel */}
            <div className="col-span-12 lg:col-span-3 space-y-6">
              {/* BlogFeed */}
              <BlogFeed />
              
              {/* Onchain Score */}
              <OnchainScoreCard />

              {/* Profile View */}
              {address && userId && <ProfileView address={address} userId={userId} />}

              {/* Score Breakdown */}
              {address && <ScoreBreakdown address={address} />}

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
    </div>
  )
}
