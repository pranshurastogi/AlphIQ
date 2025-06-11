"use client"

import { useEffect, useState } from "react"

interface AnimatedGaugeProps {
  value: number
  maxValue: number
  size?: number
  strokeWidth?: number
}

export function AnimatedGauge({ value, maxValue, size = 120, strokeWidth = 8 }: AnimatedGaugeProps) {
  const [animatedValue, setAnimatedValue] = useState(0)

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedValue(value)
    }, 500)
    return () => clearTimeout(timer)
  }, [value])

  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const progress = (animatedValue / maxValue) * circumference

  return (
    <div className="relative flex items-center justify-center">
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="rgba(255, 255, 255, 0.1)"
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="url(#gaugeGradient)"
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference - progress}
          className="transition-all duration-2000 ease-out"
          style={{
            filter: "drop-shadow(0 0 8px rgba(0, 230, 176, 0.6))",
          }}
        />
        <defs>
          <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#00E6B0" />
            <stop offset="100%" stopColor="#FF8A65" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-bold text-mint">{animatedValue}</span>
        <span className="text-xs text-neutral/70">pts</span>
      </div>
    </div>
  )
}
