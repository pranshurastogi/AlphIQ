'use client'

import { Activity } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { useNetworkStats } from '@/hooks/useNetworkStats'

function formatAbbrev(value: number): string {
  if (value >= 1e9) return `${(value / 1e9).toFixed(2)}B`
  if (value >= 1e6) return `${(value / 1e6).toFixed(2)}M`
  if (value >= 1e3) return `${(value / 1e3).toFixed(2)}K`
  return value.toFixed(2)
}

export function LiveStats() {
  const { stats, isLoading, isError } = useNetworkStats()

  const rows = [
    {
      label: 'Total TX',
      value: isLoading ? '—' : stats!.totalTx.toLocaleString()
    },
    {
      label: 'Hashrate',
      value: isLoading
        ? '—'
        : `${stats!.hashratePh.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })} PH/s`
    },
    {
      label: 'Total ALPH',
      value: isLoading
        ? '—'
        : `${formatAbbrev(stats!.totalAlph)} M ALPH`.replace('M M','M') // ensure no double M
    },
    {
      label: 'Circulating ALPH',
      value: isLoading
        ? '—'
        : `${formatAbbrev(stats!.circulatingAlph)} M ALPH`.replace('M M','M')
    }
  ]

  return (
    <Card className="bg-card/50 border-white/10 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-mint flex items-center">
          <Activity className="w-5 h-5 mr-2" />
          Live Stats
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {isError && !stats ? (
          <div className="text-red-400 text-center">Failed to load stats</div>
        ) : (
          <div className="space-y-3">
            {rows.map(({ label, value }) => (
              <div key={label} className="flex justify-between items-center">
                <span className="text-neutral/70 text-sm">{label}</span>
                <span className="text-mint text-xl font-bold">{value}</span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
