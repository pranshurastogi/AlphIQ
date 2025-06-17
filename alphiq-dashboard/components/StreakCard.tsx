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

type StreakInfo = {
  current_streak: number
  last_login_date: string
}

export function StreakCard() {
  const { account } = useWallet()
  const address = typeof account === 'string' ? account : account?.address

  const [info, setInfo] = useState<StreakInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!address) return

    setLoading(true)
    setError(null)

    ;(async () => {
      const { data, error: fetchErr } = await supabase
        .from('user_streaks')
        .select('current_streak, last_login_date')
        .eq('address', address)
        .single()

      if (fetchErr && fetchErr.code !== 'PGRST116') {
        // real error
        console.error(fetchErr)
        setError('Failed to load streak')
      } else {
        // either got row, or no row (PGRST116)
        setInfo({
          current_streak: data?.current_streak ?? 0,
          last_login_date: data?.last_login_date ?? ''
        })
      }

      setLoading(false)
    })()
  }, [address])

  // if wallet not connected, nothing to show
  if (!address) return null

  // loading placeholder
  if (loading) {
    return (
      <Card className="bg-card/50 border-white/10 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-amber">
            <Calendar className="w-5 h-5" />
            <span>Streak</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-neutral/70">Loading streak…</p>
        </CardContent>
      </Card>
    )
  }

  // error placeholder
  if (error || !info) {
    return (
      <Card className="bg-card/50 border-red-400 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-red-400">
            <Calendar className="w-5 h-5" />
            <span>Streak</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-red-400">{error ?? 'Unknown error'}</p>
        </CardContent>
      </Card>
    )
  }

  // build last 15 days indicator
  const today = new Date()
  const days = Array.from({ length: 15 }).map((_, i) => {
    const d = new Date(today)
    d.setDate(today.getDate() - (14 - i))
    const str = d.toISOString().slice(0, 10)
    return { hit: str === info.last_login_date }
  })

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
            {info.current_streak}
          </span>
          <span className="text-neutral/70">days</span>
        </div>
        <div className="flex space-x-1">
          {days.map((d, idx) => (
            <div
              key={idx}
              className={`w-6 h-6 rounded-full flex items-center justify-center ${
                d.hit ? 'bg-amber' : 'bg-white/10'
              }`}
            >
              {d.hit && <CheckCircle2 className="w-4 h-4 text-charcoal" />}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
