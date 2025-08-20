// components/LiveStats.tsx
'use client'

import { Activity, X } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { useNetworkStats } from '@/hooks/useNetworkStats'
import { useState } from 'react'

function formatAbbrev(value: number): string {
  if (value >= 1e9) return `${(value / 1e9).toFixed(2)}B`
  if (value >= 1e6) return `${(value / 1e6).toFixed(2)}M`
  if (value >= 1e3) return `${(value / 1e3).toFixed(2)}K`
  return value.toFixed(2)
}

export function LiveStats() {
  const { stats, isLoading, isError } = useNetworkStats()
  const [selectedStat, setSelectedStat] = useState<{ label: string; value: string; color: string } | null>(null)

  const statsData = [
    {
      label: 'Total TX',
      value: isLoading ? '—' : stats!.totalTx.toLocaleString(),
      color: 'text-mint'
    },
    {
      label: 'Hashrate',
      value: isLoading
        ? '—'
        : `${stats!.hashratePh.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
          })} PH/s`,
      color: 'text-cyan-400'
    },
    {
      label: 'Total ALPH',
      value: isLoading
        ? '—'
        : `${formatAbbrev(stats!.totalAlph)} ALPH`,
      color: 'text-amber-400'
    },
    {
      label: 'Circulating ALPH',
      value: isLoading
        ? '—'
        : `${formatAbbrev(stats!.circulatingAlph)} ALPH`,
      color: 'text-purple-400'
    }
  ]

  const handleStatClick = (stat: { label: string; value: string; color: string }) => {
    setSelectedStat(stat)
  }

  const closePopup = () => {
    setSelectedStat(null)
  }

  return (
    <>
      <Card className="bg-card/50 border-white/10 backdrop-blur-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-mint flex items-center text-base">
            <Activity className="w-4 h-4 mr-2" />
            Live Network Stats
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isError && !stats ? (
            <div className="text-red-400 text-center py-4 text-sm">Failed to load stats</div>
          ) : (
            <div className="space-y-2">
              {statsData.map(({ label, value, color }) => (
                <div
                  key={label}
                  className="relative h-12 rounded-md border border-white/10 bg-white/5 hover:border-white/20 transition-all duration-200 group"
                >
                  {/* Minimal spaceship accent */}
                  <div className="absolute left-0 top-0 w-1 h-full bg-gradient-to-b from-white/20 to-transparent"></div>
                  
                  <div className="flex items-center justify-between h-full px-3">
                    <div className="flex items-center min-w-0 flex-1">
                      <div className="min-w-0 flex-1">
                        <div className="text-neutral/70 text-xs font-medium">
                          {label}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2 flex-shrink-0">
                      <button
                        onClick={() => handleStatClick({ label, value, color })}
                        className={`text-sm font-semibold ${color} text-right hover:scale-105 transition-transform duration-200 cursor-pointer`}
                        title={value}
                      >
                        {value}
                      </button>
                      <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></div>
                    </div>
                  </div>
                  
                  {/* Subtle hover effect */}
                  <div className="absolute inset-0 rounded-md opacity-0 group-hover:opacity-5 transition-opacity duration-200 bg-white"></div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Popup Modal */}
      {selectedStat && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-200">
          <div className="bg-card/95 border border-white/20 rounded-lg p-6 max-w-md w-full mx-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">{selectedStat.label}</h3>
              <button
                onClick={closePopup}
                className="p-1 rounded-full hover:bg-white/10 transition-colors duration-200"
              >
                <X className="w-4 h-4 text-white/70" />
              </button>
            </div>
            
            <div className={`text-2xl font-bold ${selectedStat.color} mb-4 break-words`}>
              {selectedStat.value}
            </div>
            
            <div className="text-sm text-white/60">
              Click outside or press ESC to close
            </div>
          </div>
        </div>
      )}
    </>
  )
}
