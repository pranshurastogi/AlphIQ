// components/AdvancedHoldersTable.tsx
'use client'

import { AdvancedHolderInfo } from '@/hooks/useAdvancedTokenDistribution'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table'
import { 
  ExternalLink, 
  Building2, 
  Link, 
  Wallet, 
  Activity,
  Clock,
  TrendingUp,
  Lock
} from 'lucide-react'
import { useState } from 'react'

type AdvancedHoldersTableProps = {
  holders: AdvancedHolderInfo[]
  isLoading?: boolean
}

function formatAbbrev(value: number): string {
  if (value >= 1e9) return `${(value / 1e9).toFixed(2)}B`
  if (value >= 1e6) return `${(value / 1e6).toFixed(2)}M`
  if (value >= 1e3) return `${(value / 1e3).toFixed(2)}K`
  return value.toFixed(2)
}

function getTypeIcon(type: string | null) {
  switch (type) {
    case 'Exchange':
      return <Building2 className="w-4 h-4 text-blue-400" />
    case 'Bridge':
      return <Link className="w-4 h-4 text-cyan-400" />
    case 'Uniswap':
      return <TrendingUp className="w-4 h-4 text-green-400" />
    default:
      return <Wallet className="w-4 h-4 text-gray-400" />
  }
}

function getTypeBadgeVariant(type: string | null) {
  switch (type) {
    case 'Exchange':
      return 'default'
    case 'Bridge':
      return 'secondary'
    case 'Uniswap':
      return 'outline'
    default:
      return 'destructive'
  }
}

function getActivityBadgeVariant(status: 'active' | 'moderate' | 'dormant') {
  switch (status) {
    case 'active':
      return 'default'
    case 'moderate':
      return 'secondary'
    case 'dormant':
      return 'destructive'
  }
}

function getActivityIcon(status: 'active' | 'moderate' | 'dormant') {
  switch (status) {
    case 'active':
      return <Activity className="w-3 h-3 text-green-400" />
    case 'moderate':
      return <Clock className="w-3 h-3 text-yellow-400" />
    case 'dormant':
      return <Clock className="w-3 h-3 text-red-400" />
  }
}

export function AdvancedHoldersTable({ holders, isLoading }: AdvancedHoldersTableProps) {
  const [sortBy, setSortBy] = useState<'balance' | 'activity' | 'type'>('balance')
  const [filterType, setFilterType] = useState<string | null>(null)

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Top 50 Holders</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 bg-gray-200/20 rounded animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  const filteredHolders = filterType 
    ? holders.filter(h => h.type === filterType)
    : holders

  const sortedHolders = [...filteredHolders].sort((a, b) => {
    switch (sortBy) {
      case 'balance':
        return b.balance - a.balance
      case 'activity':
        return (b.ins + b.outs) - (a.ins + a.outs)
      case 'type':
        return (a.type || 'Z').localeCompare(b.type || 'Z')
      default:
        return 0
    }
  })

  const typeCounts = holders.reduce((acc, holder) => {
    const type = holder.type || 'Individual'
    acc[type] = (acc[type] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Top 50 Holders</CardTitle>
          <div className="flex items-center space-x-2">
            <select 
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-card border border-white/20 rounded px-2 py-1 text-sm"
            >
              <option value="balance">Sort by Balance</option>
              <option value="activity">Sort by Activity</option>
              <option value="type">Sort by Type</option>
            </select>
            <select 
              value={filterType || ''} 
              onChange={(e) => setFilterType(e.target.value || null)}
              className="bg-card border border-white/20 rounded px-2 py-1 text-sm"
            >
              <option value="">All Types</option>
              {Object.keys(typeCounts).map(type => (
                <option key={type} value={type}>
                  {type} ({typeCounts[type]})
                </option>
              ))}
            </select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border border-white/10">
          <Table>
            <TableHeader>
              <TableRow className="border-white/10">
                <TableHead className="text-white/70">Rank</TableHead>
                <TableHead className="text-white/70">Address</TableHead>
                <TableHead className="text-white/70">Type</TableHead>
                <TableHead className="text-white/70">Balance</TableHead>
                <TableHead className="text-white/70">Activity</TableHead>
                <TableHead className="text-white/70">Status</TableHead>
                <TableHead className="text-white/70">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedHolders.map((holder, index) => (
                <TableRow key={holder.address} className="border-white/10 hover:bg-white/5">
                  <TableCell className="font-medium text-white/90">
                    #{index + 1}
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="font-mono text-sm text-white/90">
                        {holder.short}
                      </div>
                      {holder.name && (
                        <div className="text-xs text-white/60">
                          {holder.name}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      {getTypeIcon(holder.type)}
                      <Badge variant={getTypeBadgeVariant(holder.type)}>
                        {holder.type || 'Individual'}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="font-semibold text-white/90">
                        {holder.balanceHint} ALPH
                      </div>
                      <div className="text-xs text-white/60">
                        {holder.pct.toFixed(2)}% of supply
                      </div>
                      {holder.lockedBalance > 0 && (
                        <div className="flex items-center space-x-1 text-xs text-yellow-400">
                          <Lock className="w-3 h-3" />
                          <span>{holder.lockedHint} locked</span>
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="text-sm text-white/90">
                        {holder.ins + holder.outs} total txs
                      </div>
                      <div className="text-xs text-white/60">
                        {holder.ins} in • {holder.outs} out
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      {getActivityIcon(holder.activityStatus)}
                      <Badge variant={getActivityBadgeVariant(holder.activityStatus)}>
                        {holder.activityStatus}
                      </Badge>
                    </div>
                    <div className="text-xs text-white/60 mt-1">
                      {holder.daysSinceLastActivity === 999 
                        ? 'No activity' 
                        : `${holder.daysSinceLastActivity}d ago`
                      }
                    </div>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => window.open(`https://explorer.alephium.org/addresses/${holder.address}`, '_blank')}
                      className="h-8 w-8 p-0"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
