// components/OnchainScoreCard.tsx
'use client'

import { useWallet } from '@alephium/web3-react'
import useSWR from 'swr'
import { computeAndStoreScore } from '@/lib/score'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Trophy, Star, Loader2 } from 'lucide-react'
import { AnimatedGauge } from '@/components/animated-gauge'

type ScoreResult = { score: number; title: string }

export function OnchainScoreCard() {
  const { account } = useWallet()
  const address = typeof account === 'string' ? account : account?.address || ''

  const { data, error, isValidating } = useSWR<ScoreResult>(
    address ? ['onchainScore', address] : null,
    () => computeAndStoreScore(address),
    { revalidateOnFocus: false }
  )

  return (
    <Card className="bg-card/50 border-white/10 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-mint flex items-center">
          <Trophy className="w-5 h-5 mr-2" />
          Onchain Score
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center space-y-4">
        {!address && (
          <div className="text-sm text-neutral/60">
            Connect your wallet to see your score
          </div>
        )}

        {address && isValidating && !data && !error && (
          <div className="flex flex-col items-center space-y-2">
            <div className="relative">
              <AnimatedGauge value={0} maxValue={1000} size={120} />
              <div className="absolute inset-0 flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-neutral/50 animate-spin" />
              </div>
            </div>
            <div className="text-neutral/60">Calculating…</div>
          </div>
        )}

        {error && (
          <div className="text-sm text-red-400">Failed to load score.</div>
        )}

        {data && (
          <>
            <AnimatedGauge value={data.score} maxValue={1000} size={140} />
            <Badge className="bg-mint/20 text-mint border-mint/30 text-lg px-4 py-1 flex items-center">
              <Star className="w-4 h-4 mr-1" />
              {data.title}
            </Badge>
          </>
        )}
      </CardContent>
    </Card>
  )
}
