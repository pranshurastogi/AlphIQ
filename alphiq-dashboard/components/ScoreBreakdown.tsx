"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ProgressBar } from "@/components/progress-bar"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Lightbulb, TrendingUp, Target, Sparkles, Clock, Coins } from "lucide-react"

interface ScoreBreakdownProps {
  address: string
}

interface ScoreComponents {
  balanceScore: number
  ageScore: number
  totalScore: number
  balance: number
  txNumber: number
  monthsActive: number
}

interface ImprovementHint {
  category: string
  hint: string
  priority: "high" | "medium" | "low"
  potentialGain: number
}

export function ScoreBreakdown({ address }: ScoreBreakdownProps) {
  const [scoreData, setScoreData] = useState<ScoreComponents | null>(null)
  const [hints, setHints] = useState<ImprovementHint[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchScoreData = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/score-breakdown?address=${address}`)
        if (response.ok) {
          const data = await response.json()
          
          // Validate the data
          if (typeof data.ageScore === 'number' && !isNaN(data.ageScore)) {
            setScoreData(data)
            generateHints(data)
          } else {
            console.error('Invalid age score data:', data.ageScore)
            setScoreData(null)
          }
        } else {
          console.error('API response not ok:', response.status)
          setScoreData(null)
        }
      } catch (error) {
        console.error('Failed to fetch score data:', error)
        setScoreData(null)
      } finally {
        setLoading(false)
      }
    }

    if (address) {
      fetchScoreData()
    }
  }, [address])

  const generateHints = (data: ScoreComponents) => {
    const newHints: ImprovementHint[] = []

    // Balance-based hints
    if (data.balance < 1) {
      newHints.push({
        category: "Balance",
        hint: "Start with at least 1 ALPH to begin earning score points",
        priority: "high",
        potentialGain: 50
      })
    } else if (data.balance < 200) {
      newHints.push({
        category: "Balance",
        hint: "Increase balance to 200+ ALPH for better score multipliers",
        priority: "medium",
        potentialGain: 100
      })
    }

    // Transaction-based hints
    if (data.txNumber < 10) {
      newHints.push({
        category: "Activity",
        hint: "Make more transactions to increase your activity score",
        priority: "high",
        potentialGain: 150
      })
    }

    // Age-based hints
    if (data.monthsActive < 12) {
      newHints.push({
        category: "Longevity",
        hint: "Stay active for 12+ months to maximize age bonus",
        priority: "medium",
        potentialGain: 180
      })
    }

    // High balance penalty hint
    if (data.balance > 10000 && data.txNumber < 10) {
      newHints.push({
        category: "Activity",
        hint: "High balance requires more transactions to avoid penalties",
        priority: "high",
        potentialGain: 200
      })
    }

    setHints(newHints.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 }
      return priorityOrder[b.priority] - priorityOrder[a.priority]
    }))
  }

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
          <div className="space-y-4">
            <div className="animate-pulse space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-12 bg-white/10 rounded-lg shimmer"></div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!scoreData) {
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

  const maxBalanceScore = 800
  const maxAgeScore = 200
  const maxTotalScore = 1000

  // Calculate age score percentage for display (capped at 100%)
  const ageScorePercentage = Math.min((scoreData.ageScore / maxAgeScore) * 100, 100)
  
  // Check if the actual age score exceeds the display limit
  const actualAgeScore = scoreData.ageScore
  const isAgeScoreCapped = actualAgeScore > maxAgeScore
  const displayAgeScore = Math.min(actualAgeScore, maxAgeScore)

  return (
    <div className="space-y-6">
      <Card className="glass-effect border-emerald-500/30">
        <CardHeader className="pb-4">
          <CardTitle className="text-neutral/90 text-sm flex items-center gap-2 text-glow">
            <Target className="w-4 h-4 text-mint" />
            Score Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <ProgressBar 
            value={scoreData.balanceScore} 
            maxValue={maxBalanceScore} 
            label="💰 Balance Score" 
            color="mint" 
          />
          <div className="space-y-2">
            <ProgressBar 
              value={scoreData.ageScore} 
              maxValue={maxAgeScore} 
              label="⏰ Age Bonus" 
              color="amber" 
            />
            {isAgeScoreCapped && (
              <div className="text-xs text-amber-400 bg-amber-500/10 px-3 py-2 rounded-lg border border-amber-500/20">
                💡 Your wallet is {scoreData.monthsActive} months old! The age bonus is capped at {maxAgeScore} points for display, but your actual age contribution is {actualAgeScore} points.
              </div>
            )}
          </div>
          <ProgressBar 
            value={scoreData.totalScore} 
            maxValue={maxTotalScore} 
            label="🏆 Total Score" 
            color="lavender" 
          />
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4">
            <div className="text-center p-3 glass-card rounded-lg glass-hover min-w-0 border-emerald-500/20">
              <Coins className="w-5 h-5 mx-auto mb-2 text-mint" />
              <div className="text-xs text-neutral/60 mb-1">Balance</div>
              <div className="text-sm font-semibold text-neutral/90 break-words" title={`${scoreData.balance.toFixed(2)} ALPH`}>
                {scoreData.balance.toFixed(2)} ALPH
              </div>
            </div>
            <div className="text-center p-3 glass-card rounded-lg glass-hover min-w-0 border-amber-500/20">
              <Sparkles className="w-5 h-5 mx-auto mb-2 text-amber" />
              <div className="text-xs text-neutral/60 mb-1">Txs</div>
              <div className="text-sm font-semibold text-neutral/90 break-words" title={scoreData.txNumber.toString()}>
                {scoreData.txNumber}
              </div>
            </div>
            <div className="text-center p-3 glass-card rounded-lg glass-hover min-w-0 border-purple-500/20">
              <Clock className="w-5 h-5 mx-auto mb-2 text-lavender" />
              <div className="text-xs text-neutral/60 mb-1 leading-tight">
                Months<br />Active
              </div>
              <div className="text-sm font-semibold text-neutral/90 break-words" title={scoreData.monthsActive.toString()}>
                {scoreData.monthsActive}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {hints.length > 0 && (
        <Card className="glass-effect border-orange-500/30">
          <CardHeader className="pb-4">
            <CardTitle className="text-neutral/90 text-sm flex items-center gap-2 text-glow">
              <Lightbulb className="w-4 h-4 text-amber" />
              Improvement Hints
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {hints.map((hint, index) => (
              <div key={index} className="flex items-start gap-4 p-4 glass-card rounded-xl glass-hover border-amber-500/15">
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