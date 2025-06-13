// components/TokenDistributionCard.tsx
'use client'

import { useTokenDistribution } from '@/hooks/useTokenDistribution'
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from '@/components/ui/card'
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  Tooltip,
} from 'recharts'
import { Trophy } from 'lucide-react'

// A 7-color palette
const BAR_COLORS = [
  '#A285FF',
  '#FF8A65',
  '#00E6B0',
  '#FFD54F',
  '#4BC0C0',
  '#FF6384',
  '#36A2EB',
]

function formatAbbrev(value: number): string {
  if (value >= 1e9) return `${(value / 1e9).toFixed(2)}B`
  if (value >= 1e6) return `${(value / 1e6).toFixed(2)}M`
  if (value >= 1e3) return `${(value / 1e3).toFixed(2)}K`
  return value.toFixed(2)
}

type TooltipProps = {
  active?: boolean
  payload?: Array<{ payload: { short: string; balance: number; pct: number } }>
}
function DistributionTooltip({ active, payload }: TooltipProps) {
  if (!active || !payload?.length) return null
  const { short, balance, pct } = payload[0].payload
  return (
    <div className="bg-card/80 text-white text-xs p-2 rounded shadow-lg">
      <div className="font-medium mb-1">{short}</div>
      <div>Balance: {formatAbbrev(balance)} ALPH</div>
      <div>% of supply: {pct.toFixed(2)}%</div>
    </div>
  )
}

export function TokenDistributionCard() {
  const { holders, isLoading, isError } = useTokenDistribution()

  if (isError) {
    return (
      <Card className="bg-card/50 border-red-500">
        <CardHeader>
          <CardTitle className="text-red-500">Token Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-red-500">Failed to load distribution data.</p>
        </CardContent>
      </Card>
    )
  }

  if (isLoading) {
    return (
      <Card className="bg-card/50">
        <CardHeader>
          <CardTitle>Token Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-neutral/70">Loading…</p>
        </CardContent>
      </Card>
    )
  }

  if (holders.length === 0) {
    return (
      <Card className="bg-card/50">
        <CardHeader>
          <CardTitle>Token Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-neutral/70">No holders data available.</p>
        </CardContent>
      </Card>
    )
  }

  const totalPct = holders.reduce((sum, h) => sum + h.pct, 0)
  const avgBal = holders.reduce((sum, h) => sum + h.balance, 0) / holders.length

  return (
    <Card className="bg-card/50 border-white/10">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Trophy className="w-5 h-5 text-lavender" />
          <span>Token Distribution</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* chart */}
        <div style={{ height: 220 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={holders}>
              <Tooltip
                content={<DistributionTooltip />}
                cursor={{ fill: 'rgba(0,0,0,0.1)' }}
              />
              <Bar dataKey="balance" barSize={24} radius={[6, 6, 0, 0]}>
                {holders.map((h, i) => (
                  <Cell
                    key={h.address}
                    fill={BAR_COLORS[i % BAR_COLORS.length]}
                    cursor="pointer"
                    onClick={() =>
                      window.open(
                        `https://explorer.alephium.org/addresses/${h.address}`,
                        '_blank'
                      )
                    }
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* insights */}
        <ul className="space-y-1 text-sm">
          <li>
            ⚖️ Top 7 holders hold{' '}
            <strong>{totalPct.toFixed(2)}%</strong> of total supply
          </li>
          <li>
            🥇 Largest holder ({holders[0].short}) holds{' '}
            <strong>{holders[0].pct.toFixed(2)}%</strong>
          </li>
          <li>
            👥 Average of those 7: <strong>{formatAbbrev(avgBal)} ALPH</strong>
          </li>
        </ul>
      </CardContent>
    </Card>
  )
}
