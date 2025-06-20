// components/ScoreHistoryChart.tsx
'use client'

import { useState, useEffect } from 'react'
import { useWallet } from '@alephium/web3-react'
import { supabase } from '@/lib/supabaseClient'
import {
  ResponsiveContainer,
  AreaChart,
  XAxis,
  YAxis,
  Tooltip,
  Area
} from 'recharts'
import { Loader2 } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'

type HistoryRow = {
  snapshot_date: string // ISO date string
  score: number
}

type ChartPoint = {
  month: string
  score: number
}

export function ScoreHistoryChart() {
  const { account } = useWallet()
  const address = typeof account === 'string' ? account : account?.address

  const [data, setData] = useState<ChartPoint[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!address) return

    setLoading(true)
    setError(null)

    supabase
      .from<HistoryRow>('user_score_history')
      .select('snapshot_date,score')
      .eq('address', address)
      .order('snapshot_date', { ascending: true })
      .then(({ data: rows, error: e }) => {
        if (e) {
          console.error('[ScoreHistoryChart] fetch:', e)
          setError('Failed to load history')
        } else if (rows) {
          // group by month
          const byMonth = new Map<string, number>()
          rows.forEach(({ snapshot_date, score }) => {
            const m = new Date(snapshot_date)
              .toLocaleDateString(undefined, { month: 'short' })
            byMonth.set(m, score)
          })
          setData(
            Array.from(byMonth.entries()).map(([month, score]) => ({ month, score }))
          )
        }
      })
      .catch((e) => {
        console.error('[ScoreHistoryChart] unexpected:', e)
        setError('Unexpected error')
      })
      .finally(() => setLoading(false))
  }, [address])

  if (!address) return null

  return (
    <Card className="bg-card/50 border-white/10 backdrop-blur-sm">
      <CardHeader>
        <CardTitle>Score History</CardTitle>
      </CardHeader>
      <CardContent className="h-[300px] flex items-center justify-center">
        {loading && <Loader2 className="animate-spin w-8 h-8 text-neutral/50" />}
        {error && <p className="text-red-400">{error}</p>}
        {!loading && !error && data.length === 0 && (
          <p className="text-neutral/60">No history yet</p>
        )}
        {!loading && !error && data.length > 0 && (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00E6B0" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#00E6B0" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="month"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: '#E0E0E0' }}
              />
              <YAxis
                allowDecimals={false}
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: '#E0E0E0' }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#2A2A2E',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px',
                  color: '#E0E0E0'
                }}
                formatter={(value: number) => [`${value}`, 'Score']}
              />
              <Area
                type="monotone"
                dataKey="score"
                stroke="#00E6B0"
                strokeWidth={3}
                fill="url(#scoreGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  )
}
