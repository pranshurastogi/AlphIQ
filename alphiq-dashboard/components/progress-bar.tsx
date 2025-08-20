"use client"

import { useEffect, useState } from "react"

interface ProgressBarProps {
  value: number
  maxValue: number
  label: string
  color?: "mint" | "amber" | "lavender"
}

export function ProgressBar({ value, maxValue, label, color = "mint" }: ProgressBarProps) {
  const [animatedValue, setAnimatedValue] = useState(0)

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedValue(value)
    }, 300)
    return () => clearTimeout(timer)
  }, [value])

  // Handle values that exceed maxValue gracefully
  const clampedValue = Math.min(animatedValue, maxValue)
  const percentage = Math.max(0, Math.min(100, (clampedValue / maxValue) * 100))
  const isOverflow = animatedValue > maxValue

  // Temporary debug logging
  console.log('ProgressBar Debug:', {
    value,
    maxValue,
    animatedValue,
    clampedValue,
    percentage,
    isOverflow,
    label
  })

  const colorClasses = {
    mint: "bg-emerald-500",
    amber: "bg-amber-500", 
    lavender: "bg-purple-500",
  }

  const glowClasses = {
    mint: "shadow-lg shadow-emerald-500/25",
    amber: "shadow-lg shadow-amber-500/25",
    lavender: "shadow-lg shadow-purple-500/25",
  }

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center text-sm">
        <span className="text-neutral/80 font-medium truncate">{label}</span>
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="text-neutral font-semibold">
            {animatedValue.toLocaleString()}
          </span>
          {isOverflow && (
            <span className="text-xs text-amber-400 font-medium bg-amber-500/10 px-1.5 py-0.5 rounded">
              MAX
            </span>
          )}
          <span className="text-neutral/60 text-xs">
            / {maxValue.toLocaleString()}
          </span>
        </div>
      </div>
      <div className="relative">
        <div className="w-full bg-white/5 backdrop-blur-sm rounded-full h-3 border border-white/10 overflow-hidden">
          <div
            className={`h-3 rounded-full transition-all duration-1000 ease-out ${colorClasses[color]} ${glowClasses[color]}`}
            style={{ 
              width: `${percentage}%`,
              minWidth: animatedValue > 0 ? '4px' : '0px',
              opacity: animatedValue > 0 ? 1 : 0,
              backgroundColor: color === 'mint' ? '#10b981' : color === 'amber' ? '#f59e0b' : '#8b5cf6'
            }}
          />
        </div>
        {isOverflow && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="bg-amber-500/20 backdrop-blur-sm px-2 py-1 rounded-full border border-amber-500/30">
              <span className="text-xs text-amber-300 font-medium">MAXED</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
