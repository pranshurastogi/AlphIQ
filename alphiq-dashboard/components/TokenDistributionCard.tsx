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
  XAxis,
  YAxis,
  PieChart,
  Pie,
  Sector,
} from 'recharts'
import { Trophy, AlertCircle, BarChart3, PieChart as PieChartIcon } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'

// Extended color palette for 50 bars
const BAR_COLORS = [
  '#A285FF', '#FF8A65', '#00E6B0', '#FFD54F', '#4BC0C0', '#FF6384', '#36A2EB',
  '#FF9F40', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8',
  '#F7DC6F', '#BB8FCE', '#85C1E9', '#F8C471', '#82E0AA', '#F1948A', '#85C1E9',
  '#D7BDE2', '#A9CCE3', '#FAD7A0', '#D5A6BD', '#A2D9CE', '#F9E79F', '#D7BDE2',
  '#A9CCE3', '#FAD7A0', '#D5A6BD', '#A2D9CE', '#F9E79F', '#D7BDE2', '#A9CCE3',
  '#FAD7A0', '#D5A6BD', '#A2D9CE', '#F9E79F', '#D7BDE2', '#A9CCE3', '#FAD7A0',
  '#D5A6BD', '#A2D9CE', '#F9E79F', '#D7BDE2', '#A9CCE3', '#FAD7A0', '#D5A6BD',
  '#A2D9CE', '#F9E79F', '#D7BDE2', '#A9CCE3', '#FAD7A0', '#D5A6BD', '#A2D9CE'
]

function formatAbbrev(value: number): string {
  if (value >= 1e9) return `${(value / 1e9).toFixed(2)}B`
  if (value >= 1e6) return `${(value / 1e6).toFixed(2)}M`
  if (value >= 1e3) return `${(value / 1e3).toFixed(2)}K`
  return value.toFixed(2)
}

type TooltipProps = {
  active?: boolean
  payload?: Array<{ payload: { short: string; balance: number; pct: number; address: string } }>
}
function DistributionTooltip({ active, payload }: TooltipProps) {
  if (!active || !payload?.length) return null
  const { short, balance, pct, address } = payload[0].payload
  return (
    <div className="bg-card/90 text-white text-xs p-3 rounded-lg shadow-xl border border-white/20">
      <div className="font-medium mb-2">{short}</div>
      <div className="space-y-1">
        <div>Balance: <span className="font-semibold">{formatAbbrev(balance)} ALPH</span></div>
        <div>% of supply: <span className="font-semibold">{pct.toFixed(2)}%</span></div>
        <div className="text-xs text-gray-300 break-all">{address}</div>
      </div>
    </div>
  )
}

type PieTooltipProps = {
  active?: boolean
  payload?: Array<{ payload: { name: string; value: number; balance: number; pct: number; address: string } }>
}
function PieTooltip({ active, payload }: PieTooltipProps) {
  if (!active || !payload?.length) return null
  const { name, balance, pct, address } = payload[0].payload
  return (
    <div className="bg-card/90 text-white text-xs p-3 rounded-lg shadow-xl border border-white/20">
      <div className="font-medium mb-2">{name}</div>
      <div className="space-y-1">
        <div>Balance: <span className="font-semibold">{formatAbbrev(balance)} ALPH</span></div>
        <div>% of supply: <span className="font-semibold">{pct.toFixed(2)}%</span></div>
        <div className="text-xs text-gray-300 break-all">{address}</div>
      </div>
    </div>
  )
}

const renderCustomizedLabel = (props: any) => {
  const { cx, cy, midAngle, innerRadius, outerRadius, percent, name } = props
  const RADIAN = Math.PI / 180
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5
  const x = cx + radius * Math.cos(-midAngle * RADIAN)
  const y = cy + radius * Math.sin(-midAngle * RADIAN)

  // Only show label if slice is big enough
  if (percent < 0.02) return null

  return (
    <text 
      x={x} 
      y={y} 
      fill="white" 
      textAnchor={x > cx ? 'start' : 'end'} 
      dominantBaseline="central"
      className="text-xs font-medium"
    >
      {`${(percent * 100).toFixed(1)}%`}
    </text>
  )
}

export function TokenDistributionCard() {
  const { holders, isLoading, isError } = useTokenDistribution()
  const [chartType, setChartType] = useState<'bar' | 'pie'>('bar')
  const [activeIndex, setActiveIndex] = useState(0)

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

  // Prepare data for pie chart (show top 15 for better visibility)
  const pieData = holders.slice(0, 15).map((holder, index) => ({
    name: holder.short,
    value: holder.balance,
    balance: holder.balance,
    pct: holder.pct,
    address: holder.address,
    fill: BAR_COLORS[index % BAR_COLORS.length]
  }))

  const onPieEnter = (_: any, index: number) => {
    setActiveIndex(index)
  }

  return (
    <Card className="bg-card/50 border-white/10">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Trophy className="w-5 h-5 text-lavender" />
            <span>Top 50 Token Holders</span>
          </CardTitle>
          <div className="flex space-x-2">
            <Button
              variant={chartType === 'bar' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setChartType('bar')}
              className="flex items-center space-x-1"
            >
              <BarChart3 className="w-4 h-4" />
              <span className="hidden sm:inline">Bar</span>
            </Button>
            <Button
              variant={chartType === 'pie' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setChartType('pie')}
              className="flex items-center space-x-1"
            >
              <PieChartIcon className="w-4 h-4" />
              <span className="hidden sm:inline">Pie</span>
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Disclaimer */}
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3">
          <div className="flex items-start space-x-2">
            <AlertCircle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
            <div className="text-xs text-amber-200">
              <strong>Disclaimer:</strong> Top holders may include exchanges, bridges, and ecosystem funds. 
              The ALPH in these addresses belongs to many people, not one entity per address.
            </div>
          </div>
        </div>

        {/* chart */}
        <div style={{ height: 300 }}>
          <ResponsiveContainer width="100%" height="100%">
            {chartType === 'bar' ? (
              <BarChart data={holders} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <XAxis 
                  dataKey="short" 
                  angle={-45}
                  textAnchor="end"
                  height={80}
                  tick={{ fontSize: 10 }}
                  interval="preserveStartEnd"
                />
                <YAxis 
                  tickFormatter={(value) => formatAbbrev(value)}
                  tick={{ fontSize: 10 }}
                />
                <Tooltip
                  content={<DistributionTooltip />}
                  cursor={{ fill: 'rgba(255,255,255,0.1)' }}
                />
                <Bar dataKey="balance" barSize={8} radius={[2, 2, 0, 0]}>
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
            ) : (
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={renderCustomizedLabel}
                  outerRadius={120}
                  fill="#8884d8"
                  dataKey="value"
                  activeIndex={activeIndex}
                  onMouseEnter={onPieEnter}
                >
                  {pieData.map((entry, index) => (
                    <Sector
                      key={`sector-${index}`}
                      fill={entry.fill}
                      stroke="#fff"
                      strokeWidth={2}
                      cursor="pointer"
                      onClick={() =>
                        window.open(
                          `https://explorer.alephium.org/addresses/${entry.address}`,
                          '_blank'
                        )
                      }
                    />
                  ))}
                </Pie>
                <Tooltip content={<PieTooltip />} />
              </PieChart>
            )}
          </ResponsiveContainer>
        </div>

        {/* insights */}
        <ul className="space-y-1 text-sm">
          <li>
            ⚖️ Top 50 holders hold{' '}
            <strong>{totalPct.toFixed(2)}%</strong> of total supply
          </li>
          <li>
            🥇 Largest holder ({holders[0].short}) holds{' '}
            <strong>{holders[0].pct.toFixed(2)}%</strong>
          </li>
          <li>
            👥 Average of top 50: <strong>{formatAbbrev(avgBal)} ALPH</strong>
          </li>
          <li>
            📊 Showing <strong>{chartType === 'pie' ? 'top 15' : holders.length}</strong> of top holders
          </li>
        </ul>
      </CardContent>
    </Card>
  )
}
