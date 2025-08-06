// components/StreakCard.tsx
'use client'

import { useState, useEffect } from 'react'
import { useWallet } from '@alephium/web3-react'
import { supabase } from '@/lib/supabaseClient'
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent
} from '@/components/ui/card'
import { Calendar, CheckCircle2 } from 'lucide-react'

// Helper function to check if we're in development
const isDevelopment = () => process.env.NODE_ENV === 'development'

// Safe logging function that only logs in development
const safeLog = (level: 'log' | 'warn' | 'error', ...args: any[]) => {
  if (isDevelopment()) {
    console[level](...args)
  }
}

type StreakRow = {
  current_streak: number
  last_login_date: string // "YYYY-MM-DD"
}

export function StreakCard() {
  const { account } = useWallet()
  const address = typeof account === 'string' ? account : account?.address

  const [streak, setStreak] = useState<StreakRow | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!address) return
    setLoading(true)
    setError(null)

    supabase
      .from<StreakRow>('user_streaks')
      .select('current_streak,last_login_date')
      .eq('address', address)
      .single()
      .then(({ data, error: e }) => {
        if (e && e.code !== 'PGRST116') {
          safeLog('error', '[StreakCard] fetch:', e)
          setError('Could not load streak')
        } else {
          setStreak({
            current_streak: data?.current_streak ?? 0,
            last_login_date: data?.last_login_date ?? ''
          })
        }
      })
      .catch((e) => {
        safeLog('error', '[StreakCard] unexpected:', e)
        setError('Unexpected error')
      })
      .finally(() => setLoading(false))
  }, [address])

  // nothing to show before connect
  if (!address) return null

  // loading state
  if (loading) {
    return (
      <Card className="bg-card/50 border-white/10 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-amber">
            <Calendar className="w-5 h-5" /><span>Streak</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-neutral/70">Loading…</p>
        </CardContent>
      </Card>
    )
  }

  // error state
  if (error || !streak) {
    return (
      <Card className="bg-card/50 border-red-400 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-red-400">
            <Calendar className="w-5 h-5" /><span>Streak</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-red-400">{error ?? 'Unknown error'}</p>
        </CardContent>
      </Card>
    )
  }

  const { current_streak, last_login_date } = streak
  const today = new Date()
  // build 15-day window (oldest first)
  const days = Array.from({ length: 15 }).map((_, i) => {
    const d = new Date(today)
    d.setDate(today.getDate() - (14 - i))
    const iso = d.toISOString().slice(0, 10)
    return { date: iso }
  })

  // compute the start of this consecutive run
  const startDate = new Date(last_login_date)
  startDate.setDate(startDate.getDate() - (current_streak - 1))
  const startISO = startDate.toISOString().slice(0, 10)

  return (
    <Card className="bg-card/50 border-white/10 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2 text-amber">
          <Calendar className="w-5 h-5" />
          <span>🔥 Streak</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-baseline space-x-2">
          <span className="text-4xl font-bold text-amber">
            {current_streak}
          </span>
          <span className="text-neutral/70">days</span>
        </div>
        <div className="flex space-x-1">
          {days.map(({ date }, idx) => {
            // highlight if date is in [startISO .. last_login_date]
            const hit =
              current_streak > 0 &&
              date >= startISO &&
              date <= last_login_date

            return (
              <div
                key={idx}
                title={new Date(date).toLocaleDateString()}
                className={`
                  w-6 h-6 rounded-full flex items-center justify-center
                  ${hit ? 'bg-amber' : 'bg-white/10'}
                  transition-colors
                `}
              >
                {hit && (
                  <CheckCircle2
                    className="w-4 h-4 text-charcoal"
                    aria-hidden="true"
                  />
                )}
              </div>
            )
          })}
        </div>
        <p className="text-xs text-neutral/60">
          Dates in <span className="font-semibold">amber</span> are your last{' '}
          {current_streak} days of activity.
        </p>
      </CardContent>
    </Card>
  )
}
