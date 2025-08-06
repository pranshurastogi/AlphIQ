"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ProgressBar } from "@/components/progress-bar"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Lightbulb, TrendingUp, Target } from "lucide-react"

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
          setScoreData(data)
          generateHints(data)
        }
      } catch (error) {
        console.error('Failed to fetch score data:', error)
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
      <Card className="bg-card/50 border-white/10 backdrop-blur-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-neutral/80 text-sm">Score Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="animate-pulse space-y-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-8 bg-white/10 rounded"></div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!scoreData) {
    return (
      <Card className="bg-card/50 border-white/10 backdrop-blur-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-neutral/80 text-sm">Score Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertDescription>
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

  return (
    <div className="space-y-4">
      <Card className="bg-card/50 border-white/10 backdrop-blur-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-neutral/80 text-sm flex items-center gap-2">
            <Target className="w-4 h-4" />
            Score Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <ProgressBar 
            value={scoreData.balanceScore} 
            maxValue={maxBalanceScore} 
            label="💰 Balance Score" 
            color="mint" 
          />
          <ProgressBar 
            value={scoreData.ageScore} 
            maxValue={maxAgeScore} 
            label="⏰ Age Bonus" 
            color="amber" 
          />
          <ProgressBar 
            value={scoreData.totalScore} 
            maxValue={maxTotalScore} 
            label="🏆 Total Score" 
            color="lavender" 
          />
          
          <div className="grid grid-cols-3 gap-2 pt-2">
            <div className="text-center">
              <div className="text-xs text-neutral/60">Balance</div>
              <div className="text-sm font-medium">{scoreData.balance.toFixed(2)} ALPH</div>
            </div>
            <div className="text-center">
              <div className="text-xs text-neutral/60">Transactions</div>
              <div className="text-sm font-medium">{scoreData.txNumber}</div>
            </div>
            <div className="text-center">
              <div className="text-xs text-neutral/60">Months Active</div>
              <div className="text-sm font-medium">{scoreData.monthsActive}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {hints.length > 0 && (
        <Card className="bg-card/50 border-white/10 backdrop-blur-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-neutral/80 text-sm flex items-center gap-2">
              <Lightbulb className="w-4 h-4" />
              Improvement Hints
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {hints.map((hint, index) => (
              <div key={index} className="flex items-start gap-3 p-3 bg-white/5 rounded-lg">
                <TrendingUp className="w-4 h-4 mt-0.5 text-mint" />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge 
                      variant={hint.priority === 'high' ? 'destructive' : hint.priority === 'medium' ? 'secondary' : 'outline'}
                      className="text-xs"
                    >
                      {hint.priority}
                    </Badge>
                    <span className="text-xs text-neutral/60">+{hint.potentialGain} potential</span>
                  </div>
                  <p className="text-sm text-neutral/80">{hint.hint}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  )
} 