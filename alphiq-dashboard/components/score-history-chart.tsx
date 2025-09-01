// components/ScoreHistoryChart.tsx
'use client'

import { useState, useEffect, useMemo } from 'react'
import { useWallet } from '@alephium/web3-react'
import { supabase } from '@/lib/supabaseClient'
import {
  ResponsiveContainer,
  AreaChart,
  LineChart,
  BarChart,
  XAxis,
  YAxis,
  Tooltip,
  Area,
  Line,
  Bar,
  CartesianGrid
} from 'recharts'
import { Loader2, TrendingUp, BarChart3, Activity, Calendar, Info } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Tooltip as TooltipComponent, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

// Helper function to check if we're in development
const isDevelopment = () => process.env.NODE_ENV === 'development'

// Safe logging function that only logs in development
const safeLog = (level: 'log' | 'warn' | 'error', ...args: any[]) => {
  if (isDevelopment()) {
    console[level](...args)
  }
}

type HistoryRow = {
  snapshot_date: string // ISO date string
  score: number
  title?: string
}

type ChartPoint = {
  date: string
  score: number
  month: string
  year: string
  formattedDate: string
  change?: number
  changePercent?: number
}

type TimeRange = '1m' | '3m' | '6m' | '1y' | 'all'
type ChartType = 'area' | 'line' | 'bar'

const TIME_RANGES: { value: TimeRange; label: string; months: number }[] = [
  { value: '1m', label: '1 Month', months: 1 },
  { value: '3m', label: '3 Months', months: 3 },
  { value: '6m', label: '6 Months', months: 6 },
  { value: '1y', label: '1 Year', months: 12 },
  { value: 'all', label: 'All Time', months: 0 }
]

const CHART_TYPES: { value: ChartType; label: string; icon: React.ReactNode }[] = [
  { value: 'area', label: 'Area', icon: <Activity className="w-4 h-4" /> },
  { value: 'line', label: 'Line', icon: <TrendingUp className="w-4 h-4" /> },
  { value: 'bar', label: 'Bar', icon: <BarChart3 className="w-4 h-4" /> }
]

export function ScoreHistoryChart({ 
  showHeader = true, 
  className = "" 
}: { 
  showHeader?: boolean; 
  className?: string; 
} = {}) {
  const { account } = useWallet()
  const address = typeof account === 'string' ? account : account?.address

  const [rawData, setRawData] = useState<HistoryRow[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedTimeRange, setSelectedTimeRange] = useState<TimeRange>('6m')
  const [selectedChartType, setSelectedChartType] = useState<ChartType>('area')

  useEffect(() => {
    if (!address) return

    setLoading(true)
    setError(null)

    supabase
      .from<HistoryRow>('user_score_history')
      .select('snapshot_date,score,title')
      .eq('address', address)
      .order('snapshot_date', { ascending: true })
      .then(({ data: rows, error: e }) => {
        if (e) {
          safeLog('error', '[ScoreHistoryChart] fetch:', e)
          setError('Failed to load history')
        } else if (rows) {
          setRawData(rows)
        }
      })
      .catch((e) => {
        safeLog('error', '[ScoreHistoryChart] unexpected:', e)
        setError('Unexpected error')
      })
      .finally(() => setLoading(false))
  }, [address])

  // Process and filter data based on selected time range
  const processedData = useMemo(() => {
    if (!rawData.length) return []

    const now = new Date()
    const cutoffDate = new Date()
    
    if (selectedTimeRange !== 'all') {
      const months = TIME_RANGES.find(r => r.value === selectedTimeRange)?.months || 6
      cutoffDate.setMonth(now.getMonth() - months)
    } else {
      cutoffDate.setFullYear(2000) // Very old date to include all data
    }

    // Filter data by date range
    const filteredData = rawData.filter(row => {
      const rowDate = new Date(row.snapshot_date)
      return rowDate >= cutoffDate
    })

    // Sort by date and calculate changes
    const sortedData = filteredData
      .sort((a, b) => new Date(a.snapshot_date).getTime() - new Date(b.snapshot_date).getTime())
      .map((row, index, array) => {
        const date = new Date(row.snapshot_date)
        const month = date.toLocaleDateString(undefined, { month: 'short' })
        const year = date.getFullYear().toString()
        
        // Better date formatting based on time range
        let formattedDate: string
        if (selectedTimeRange === '1m') {
          formattedDate = date.toLocaleDateString(undefined, { 
            month: 'short', 
            day: 'numeric'
          })
        } else if (selectedTimeRange === '3m') {
          formattedDate = date.toLocaleDateString(undefined, { 
            month: 'short', 
            day: 'numeric'
          })
        } else if (selectedTimeRange === '6m') {
          formattedDate = date.toLocaleDateString(undefined, { 
            month: 'short', 
            year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
          })
        } else if (selectedTimeRange === '1y') {
          formattedDate = date.toLocaleDateString(undefined, { 
            month: 'short', 
            year: 'numeric'
          })
        } else {
          // All time - show month and year
          formattedDate = date.toLocaleDateString(undefined, { 
            month: 'short', 
            year: 'numeric'
          })
        }

        let change = 0
        let changePercent = 0

        if (index > 0) {
          const prevScore = array[index - 1].score
          change = row.score - prevScore
          changePercent = prevScore > 0 ? (change / prevScore) * 100 : 0
        }

        return {
          date: row.snapshot_date,
          score: row.score,
          month,
          year,
          formattedDate,
          change,
          changePercent
        }
      })

    // Filter data points to prevent overcrowding on X-axis
    let finalData = sortedData
    if (sortedData.length > 20) {
      const step = Math.ceil(sortedData.length / 20)
      finalData = sortedData.filter((_, index) => index % step === 0 || index === sortedData.length - 1)
    }

    return finalData
  }, [rawData, selectedTimeRange])

  // Calculate statistics
  const stats = useMemo(() => {
    if (!processedData.length) return null

    const scores = processedData.map(d => d.score)
    const currentScore = scores[scores.length - 1]
    const previousScore = scores.length > 1 ? scores[scores.length - 2] : currentScore
    const change = currentScore - previousScore
    const changePercent = previousScore > 0 ? (change / previousScore) * 100 : 0
    const highestScore = Math.max(...scores)
    const lowestScore = Math.min(...scores)
    const averageScore = scores.reduce((a, b) => a + b, 0) / scores.length

    return {
      currentScore,
      change,
      changePercent,
      highestScore,
      lowestScore,
      averageScore: Math.round(averageScore)
    }
  }, [processedData])

  // Custom tooltip component
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-background/95 border border-border/50 rounded-lg p-4 shadow-xl backdrop-blur-sm">
          <div className="space-y-2">
            <p className="font-semibold text-foreground text-base">{data.formattedDate}</p>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Score:</span>
              <span className="font-bold text-primary text-lg">{data.score}</span>
            </div>
            {data.change !== undefined && data.change !== 0 && (
              <div className={`flex items-center gap-1 text-sm ${data.change > 0 ? 'text-green-500' : 'text-red-500'}`}>
                <span className="font-medium">
                  {data.change > 0 ? '+' : ''}{data.change}
                </span>
                <span className="text-muted-foreground">
                  ({data.changePercent?.toFixed(1)}%)
                </span>
              </div>
            )}
          </div>
        </div>
      )
    }
    return null
  }

  // Render chart based on selected type
  const renderChart = (): React.ReactElement => {
    const commonProps = {
      data: processedData,
      margin: { top: 20, right: 40, left: 30, bottom: 20 }
    }

    const commonAxisProps = {
      axisLine: false,
      tickLine: false,
      tick: { fontSize: 13, fill: 'hsl(var(--muted-foreground))', fontWeight: 500 }
    }

    const xAxisProps = {
      ...commonAxisProps,
      dataKey: "formattedDate",
      interval: "preserveStartEnd" as const,
      minTickGap: 30,
      tick: { 
        fontSize: 12, 
        fill: 'hsl(var(--muted-foreground))', 
        fontWeight: 500,
        transform: 'translate(0, 8)'
      }
    }

    const commonTooltipProps = {
      content: <CustomTooltip />,
      cursor: { stroke: 'hsl(var(--border))', strokeWidth: 1 }
    }

    switch (selectedChartType) {
      case 'area':
        return (
          <AreaChart {...commonProps}>
            <defs>
              <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
            <XAxis {...xAxisProps} />
            <YAxis allowDecimals={false} {...commonAxisProps} />
            <Tooltip {...commonTooltipProps} />
            <Area
              type="monotone"
              dataKey="score"
              stroke="hsl(var(--primary))"
              strokeWidth={3}
              fill="url(#scoreGradient)"
            />
          </AreaChart>
        )

      case 'line':
        return (
          <LineChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
            <XAxis {...xAxisProps} />
            <YAxis allowDecimals={false} {...commonAxisProps} />
            <Tooltip {...commonTooltipProps} />
            <Line
              type="monotone"
              dataKey="score"
              stroke="hsl(var(--primary))"
              strokeWidth={3}
              dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: 'hsl(var(--background))', strokeWidth: 2 }}
            />
          </LineChart>
        )

      case 'bar':
        return (
          <BarChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
            <XAxis {...xAxisProps} />
            <YAxis allowDecimals={false} {...commonAxisProps} />
            <Tooltip {...commonTooltipProps} />
            <Bar
              dataKey="score"
              fill="hsl(var(--primary))"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        )

      default:
        // This should never happen, but return area chart as fallback
        return (
          <AreaChart {...commonProps}>
            <defs>
              <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
            <XAxis {...xAxisProps} />
            <YAxis allowDecimals={false} {...commonAxisProps} />
            <Tooltip {...commonTooltipProps} />
            <Area
              type="monotone"
              dataKey="score"
              stroke="hsl(var(--primary))"
              strokeWidth={3}
              fill="url(#scoreGradient)"
            />
          </AreaChart>
        )
    }
  }

  if (!address) return null

  return (
    <Card className={`bg-card/50 border-white/10 backdrop-blur-sm ${className}`}>
      {showHeader && (
        <CardHeader className="pb-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <CardTitle className="text-2xl font-semibold">Score History</CardTitle>
              <TooltipProvider>
                <TooltipComponent>
                  <TooltipTrigger asChild>
                    <Info className="w-5 h-5 text-muted-foreground cursor-help hover:text-foreground transition-colors" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-sm">Track your score progression over time</p>
                  </TooltipContent>
                </TooltipComponent>
              </TooltipProvider>
            </div>
            
            {/* Statistics Badges */}
            {stats && (
              <div className="flex items-center gap-3">
                <Badge variant="secondary" className="text-xs px-3 py-1.5 font-medium">
                  High: {stats.highestScore}
                </Badge>
                <Badge variant="secondary" className="text-xs px-3 py-1.5 font-medium">
                  Low: {stats.lowestScore}
                </Badge>
                <Badge 
                  variant={stats.change >= 0 ? "default" : "destructive"} 
                  className="text-xs px-3 py-1.5 font-medium"
                >
                  {stats.change >= 0 ? '+' : ''}{stats.change}
                </Badge>
              </div>
            )}
          </div>

          {/* Controls */}
          <div className="flex items-center gap-6">
            {/* Time Range Selector */}
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-muted-foreground" />
              <Select value={selectedTimeRange} onValueChange={(value: TimeRange) => setSelectedTimeRange(value)}>
                <SelectTrigger className="w-36 h-10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TIME_RANGES.map((range) => (
                    <SelectItem key={range.value} value={range.value}>
                      {range.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Chart Type Selector */}
            <div className="flex items-center gap-3">
              <Select value={selectedChartType} onValueChange={(value: ChartType) => setSelectedChartType(value)}>
                <SelectTrigger className="w-36 h-10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CHART_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      <div className="flex items-center gap-2">
                        {type.icon}
                        {type.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
      )}

      <CardContent className="h-[450px] px-6 py-4">
        {loading && (
          <div className="flex flex-col items-center justify-center h-full gap-4 text-muted-foreground">
            <Loader2 className="animate-spin w-10 h-10" />
            <p className="text-lg font-medium">Loading score history...</p>
          </div>
        )}
        
        {error && (
          <div className="flex flex-col items-center justify-center h-full gap-4 text-destructive">
            <p className="text-lg font-medium">Failed to load history</p>
            <p className="text-sm text-muted-foreground max-w-md text-center">{error}</p>
          </div>
        )}
        
        {!loading && !error && processedData.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full gap-4 text-muted-foreground">
            <Activity className="w-16 h-16 opacity-50" />
            <p className="text-lg font-medium">No score history available</p>
            <p className="text-sm text-center max-w-md">Complete quests to start building your score history</p>
          </div>
        )}
        
        {!loading && !error && processedData.length > 0 && (
          <ResponsiveContainer width="100%" height="100%">
            {renderChart()}
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  )
}
