// components/ScoreBreakdown.tsx
'use client'

import { useEffect, useState } from 'react'
import { computeScoreBreakdown, ScoreBreakdownPayload } from '@/lib/score'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ProgressBar } from '@/components/progress-bar'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Lightbulb,
  TrendingUp,
  Target,
  Sparkles,
  Clock,
  Coins,
  Activity,
} from 'lucide-react'

interface ScoreBreakdownProps {
  address: string
}

type Priority = 'high' | 'medium' | 'low'
interface ImprovementHint {
  category: string
  hint: string
  priority: Priority
  potentialGain: number
}

const clamp = (x: number, min: number, max: number) =>
  Math.min(max, Math.max(min, x))

export function ScoreBreakdown({ address }: ScoreBreakdownProps) {
  const [data, setData] = useState<ScoreBreakdownPayload | null>(null)
  const [hints, setHints] = useState<ImprovementHint[]>([])
  const [loading, setLoading] = useState(true)

  // Weights (must match lib/score.ts)
  const W_BALANCE = 260
  const W_TENURE = 190
  const W_LIFETIME = 180
  const W_RECENT = 210
  const W_CONSIST = 110
  const W_HEALTH = 50
  const TOTAL_MAX = 1000
  const W_MISC = 50 // UI comfort for reconciliation

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        setLoading(true)
        const res = await computeScoreBreakdown(address) // ← direct import from lib
        if (!cancelled) {
          setData(res)
          setHints(buildHints(res))
        }
      } catch (e) {
        console.error('[ScoreBreakdown] compute failed:', e)
        if (!cancelled) setData(null)
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => { cancelled = true }
  }, [address])

  /** Hints tuned to the new model */
  const buildHints = (d: ScoreBreakdownPayload): ImprovementHint[] => {
    const out: ImprovementHint[] = []

    if (d.balanceALPH < 1) {
      out.push({
        category: 'Balance',
        hint: 'Hold at least 1 ALPH to activate your balance component.',
        priority: 'high',
        potentialGain: 60,
      })
    } else if (d.balanceALPH < 200) {
      out.push({
        category: 'Balance',
        hint: 'Cross 200+ ALPH for smoother balance gains.',
        priority: 'medium',
        potentialGain: 80,
      })
    }

    if (d.txNumber < 10) {
      out.push({
        category: 'Activity',
        hint: 'Perform a few meaningful transactions to lift your base.',
        priority: 'high',
        potentialGain: 90,
      })
    }
    if (d.last30 < 3) {
      out.push({
        category: 'Recency',
        hint: 'Complete 3+ transactions this month for an immediate boost.',
        priority: 'high',
        potentialGain: 120,
      })
    }
    if (d.last7 === 0) {
      out.push({
        category: 'Recency',
        hint: 'A small weekly burst (+1–2 tx) strengthens your recent score.',
        priority: 'medium',
        potentialGain: 40,
      })
    }

    const activeMonths = d.activeMonths12 ?? d.monthsActive
    if (activeMonths < 6) {
      out.push({
        category: 'Consistency',
        hint: 'Spread activity across more months to raise your streak factor.',
        priority: 'medium',
        potentialGain: 55,
      })
    }
    if (d.evenness < 0.5 && activeMonths >= 3) {
      out.push({
        category: 'Consistency',
        hint: 'Balance your monthly activity to gain a dispersion bonus.',
        priority: 'low',
        potentialGain: 25,
      })
    }

    if (d.daysSinceLast > 90) {
      out.push({
        category: 'Health',
        hint: 'One fresh interaction reduces inactivity decay right away.',
        priority: 'high',
        potentialGain: 30,
      })
    }

    if (d.balanceALPH > 10000 && d.txNumber < 10) {
      out.push({
        category: 'Balance',
        hint: 'Large idle balances are damped—pair with some activity.',
        priority: 'high',
        potentialGain: 60,
      })
    }

    const rank: Record<Priority, number> = { high: 3, medium: 2, low: 1 }
    return out.sort((a, b) => rank[b.priority] - rank[a.priority])
  }

  // ---------- UI STATES ----------
  if (loading) {
    return (
      <Card className="glass-effect border-emerald-500/30">
        <CardHeader className="pb-3">
          <CardTitle className="text-neutral/90 text-sm flex items-center gap-2">
            <Target className="w-4 h-4 text-mint" />
            Score Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 animate-pulse">
            <div className="h-4 rounded bg-white/10" />
            <div className="h-4 rounded bg-white/10" />
            <div className="h-4 rounded bg-white/10" />
            <div className="h-4 rounded bg-white/10" />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!data) {
    return (
      <Card className="glass-effect border-red-500/30">
        <CardHeader className="pb-3">
          <CardTitle className="text-neutral/90 text-sm flex items-center gap-2">
            <Target className="w-4 h-4 text-mint" />
            Score Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert className="bg-red-500/10 border-red-500/20">
            <AlertDescription className="text-red-300">
              Unable to load score data. Please try again later.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  // ----- Exact values from scorer (defensive caps for UI) -----
  let pBalance = clamp(data.balance, 0, W_BALANCE)
  let pTenure = clamp(data.tenure, 0, W_TENURE)
  let pLifetime = clamp(data.lifetime, 0, W_LIFETIME)
  let pRecent = clamp(data.recent, 0, W_RECENT)
  let pConsist = clamp(data.consist, 0, W_CONSIST)
  let pHealth = clamp(data.health, 0, W_HEALTH)

  let sumParts = pBalance + pTenure + pLifetime + pRecent + pConsist + pHealth
  const serverTotal = clamp(data.totalScore, 0, TOTAL_MAX)

  // Reconcile: ensure the stacked bars equal the scorer's total
  let misc = 0
  if (sumParts === 0) {
    misc = serverTotal
  } else if (sumParts < serverTotal) {
    misc = serverTotal - sumParts
  } else if (sumParts > serverTotal) {
    const factor = serverTotal / sumParts
    pBalance = Math.round(pBalance * factor)
    pTenure = Math.round(pTenure * factor)
    pLifetime = Math.round(pLifetime * factor)
    pRecent = Math.round(pRecent * factor)
    pConsist = Math.round(pConsist * factor)
    pHealth = Math.round(pHealth * factor)
    sumParts = pBalance + pTenure + pLifetime + pRecent + pConsist + pHealth
    misc = Math.max(0, serverTotal - sumParts) // tiny remainder
  }
  const miscDisplay = clamp(misc, 0, W_MISC)

  return (
    <div className="space-y-6">
      <Card className="glass-effect border-emerald-500/30">
        <CardHeader className="pb-4">
          <CardTitle className="text-neutral/90 text-sm flex items-center gap-2">
            <Target className="w-4 h-4 text-mint" />
            Score Breakdown
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-5">
          <ProgressBar value={pBalance} maxValue={W_BALANCE} label="💰 Balance Quality" color="mint" />
          <ProgressBar value={pTenure} maxValue={W_TENURE} label="📆 Tenure (Account Age)" color="lavender" />
          <ProgressBar value={pLifetime} maxValue={W_LIFETIME} label="📈 Lifetime Activity" color="amber" />
          <ProgressBar value={pRecent} maxValue={W_RECENT} label="⚡ Recent Activity" color="mint" />
          <ProgressBar value={pConsist} maxValue={W_CONSIST} label="🧭 Consistency" color="lavender" />
          <ProgressBar value={pHealth} maxValue={W_HEALTH} label="🛡️ Account Health" color="amber" />

          {miscDisplay > 0 && (
            <ProgressBar
              value={miscDisplay}
              maxValue={W_MISC}
              label="🧩 Misc (Rounding & Tie-breakers)"
              color="mint"
            />
          )}

          <div className="pt-2">
            <ProgressBar value={serverTotal} maxValue={TOTAL_MAX} label="🏆 Total Score" color="lavender" />
          </div>

          {/* Quick facts */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4">
            <div className="text-center p-3 glass-card rounded-lg glass-hover min-w-0 border-emerald-500/20">
              <Coins className="w-5 h-5 mx-auto mb-2 text-mint" />
              <div className="text-xs text-neutral/60 mb-1">Balance</div>
              <div className="text-sm font-semibold text-neutral/90">
                {data.balanceALPH.toFixed(2)} ALPH
              </div>
            </div>

            <div className="text-center p-3 glass-card rounded-lg glass-hover min-w-0 border-amber-500/20">
              <Activity className="w-5 h-5 mx-auto mb-2 text-amber" />
              <div className="text-xs text-neutral/60 mb-1">Lifetime TXs</div>
              <div className="text-sm font-semibold text-neutral/90">
                {data.txNumber}
              </div>
            </div>

            <div className="text-center p-3 glass-card rounded-lg glass-hover min-w-0 border-purple-500/20">
              <Clock className="w-5 h-5 mx-auto mb-2 text-lavender" />
              <div className="text-xs text-neutral/60 mb-1">Active Months (12m)</div>
              <div className="text-sm font-semibold text-neutral/90">
                {data.activeMonths12}
              </div>
            </div>
          </div>

          {/* Recency chips */}
          <div className="flex flex-wrap gap-2 pt-1">
            <Badge variant="outline" className="text-xs">7d: {data.last7}</Badge>
            <Badge variant="outline" className="text-xs">30d: {data.last30}</Badge>
            <Badge variant="outline" className="text-xs">90d: {data.last90}</Badge>
            <Badge variant="secondary" className="text-xs">Evenness: {Math.round(data.evenness * 100)}%</Badge>
            <Badge variant="destructive" className="text-xs">Last TX: {data.daysSinceLast}d ago</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Hints */}
      {hints.length > 0 && (
        <Card className="glass-effect border-orange-500/30">
          <CardHeader className="pb-4">
            <CardTitle className="text-neutral/90 text-sm flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-amber" />
              Improvement Hints
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {hints.map((hint, i) => (
              <div key={i} className="flex items-start gap-4 p-4 glass-card rounded-xl glass-hover border-amber-500/15">
                <div className="p-2 bg-gradient-to-br from-amber-500/20 to-orange-500/20 rounded-lg border border-amber-500/30">
                  <TrendingUp className="w-4 h-4 text-amber-400" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <Badge
                      variant={hint.priority === 'high' ? 'destructive' : hint.priority === 'medium' ? 'secondary' : 'outline'}
                      className="text-xs font-medium"
                    >
                      {hint.priority}
                    </Badge>
                    <span className="text-xs text-amber-400 font-medium bg-amber-500/10 px-2 py-1 rounded-full">
                      +{hint.potentialGain} potential
                    </span>
                  </div>
                  <p className="text-sm text-neutral/80 leading-relaxed">{hint.hint}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
