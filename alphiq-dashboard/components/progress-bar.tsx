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

  const percentage = (animatedValue / maxValue) * 100

  const colorClasses = {
    mint: "bg-mint",
    amber: "bg-amber",
    lavender: "bg-lavender",
  }

  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span className="text-neutral/80">{label}</span>
        <span className="text-neutral font-medium">
          {animatedValue}/{maxValue}
        </span>
      </div>
      <div className="w-full bg-white/10 rounded-full h-2">
        <div
          className={`h-2 rounded-full transition-all duration-1000 ease-out ${colorClasses[color]}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}
