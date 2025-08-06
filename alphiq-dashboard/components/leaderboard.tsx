// components/Leaderboard.tsx
'use client'

import { useWallet } from '@alephium/web3-react'
import useSWR from 'swr'
import { supabase } from '@/lib/supabaseClient'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Crown, Medal, Award, TrendingUp } from 'lucide-react'

// Helper function to check if we're in development
const isDevelopment = () => process.env.NODE_ENV === 'development'

// Safe logging function that only logs in development
const safeLog = (level: 'log' | 'warn' | 'error', ...args: any[]) => {
  if (isDevelopment()) {
    console[level](...args)
  }
}

type User = {
  address: string
  score: number
  title: string
  joined_at: string
}

const fetchLeaderboard = async (): Promise<User[]> => {
  try {
    const { data, error } = await supabase
      .from<User>('users')
      .select('address,score,title,joined_at')
      .order('score', { ascending: false })    // highest first
      .order('joined_at', { ascending: true }) // tiebreaker: earliest join
    
    if (error) throw error
    return data ?? []
  } catch (error) {
    safeLog('error', '[Leaderboard] fetch error', error)
    throw error
  }
}

export function Leaderboard() {
  const { account } = useWallet()
  const currentAddress = typeof account === 'string' ? account : account?.address
  const { data: users, error } = useSWR('leaderboard', fetchLeaderboard)

  if (error) {
    return (
      <Card className="bg-card/50 border-red-400 backdrop-blur-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-red-400 flex items-center">
            <TrendingUp className="w-5 h-5 mr-2" />
            Global Leaderboard
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-400 text-sm">Failed to load leaderboard.</p>
        </CardContent>
      </Card>
    )
  }
  
  if (!users) {
    return (
      <Card className="bg-card/50 border-white/10 backdrop-blur-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-amber flex items-center">
            <TrendingUp className="w-5 h-5 mr-2" />
            Global Leaderboard
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-neutral/60 text-sm">Loading leaderboard…</p>
        </CardContent>
      </Card>
    )
  }

  const topUsers = users.slice(0, 10)

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="w-5 h-5 text-amber" />
      case 2:
        return <Medal className="w-5 h-5 text-gray-400" />
      case 3:
        return <Award className="w-5 h-5 text-amber/70" />
      default:
        return (
          <span className="w-5 h-5 flex items-center justify-center text-neutral/60 font-bold">
            {rank}
          </span>
        )
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
        {topUsers.map((user, idx) => {
          const rank = idx + 1
          const isMe =
            currentAddress &&
            user.address.toLowerCase() === currentAddress.toLowerCase()

          return (
            <div
              key={user.address}
              className={`flex items-center justify-between p-3 rounded-lg transition-colors ${
                isMe
                  ? 'bg-amber/10 border border-amber/20'
                  : 'bg-white/5 hover:bg-white/10'
              }`}
            >
              <div className="flex items-center space-x-3">
                {getRankIcon(rank)}
                <div>
                  <div
                    className={`font-medium ${
                      isMe ? 'text-amber' : 'text-neutral'
                    }`}
                  >
                    {user.address.slice(0, 6)}…{user.address.slice(-6)}
                    {isMe && (
                      <span className="text-xs ml-2 text-amber/70">(You)</span>
                    )}
                  </div>
                  <Badge
                    className={`text-xs mt-1 ${
                      isMe
                        ? 'bg-amber/20 text-amber border-amber/30'
                        : 'bg-white/10 text-neutral border-white/20'
                    }`}
                  >
                    {user.title}
                  </Badge>
                </div>
              </div>

              <div
                className={`font-bold ${
                  isMe ? 'text-amber' : 'text-mint'
                }`}
              >
                {user.score.toLocaleString()}
              </div>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
