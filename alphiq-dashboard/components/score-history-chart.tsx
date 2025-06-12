"use client"

import { XAxis, YAxis, ResponsiveContainer, Tooltip, Area, AreaChart } from "recharts"

const scoreHistoryData = [
  { date: "Jan", score: 420, transactions: 45, contracts: 12 },
  { date: "Feb", score: 520, transactions: 62, contracts: 18 },
  { date: "Mar", score: 680, transactions: 78, contracts: 25 },
  { date: "Apr", score: 750, transactions: 89, contracts: 32 },
  { date: "May", score: 840, transactions: 95, contracts: 38 },
]

export function ScoreHistoryChart() {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={scoreHistoryData}>
        <defs>
          <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#00E6B0" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#00E6B0" stopOpacity={0} />
          </linearGradient>
        </defs>
        <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#E0E0E0" }} />
        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#E0E0E0" }} />
        <Tooltip
          contentStyle={{
            backgroundColor: "#2A2A2E",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: "8px",
            color: "#E0E0E0",
          }}
        />
        <Area type="monotone" dataKey="score" stroke="#00E6B0" strokeWidth={3} fill="url(#scoreGradient)" />
      </AreaChart>
    </ResponsiveContainer>
  )
}
