// components/EnhancedHoldersTable.tsx
'use client'

import { AdvancedHolderInfo } from '@/hooks/useAdvancedTokenDistribution'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
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
  Lock,
  Search,
  Filter,
  Download,
  ChevronLeft,
  ChevronRight,
  RefreshCw
} from 'lucide-react'
import { useState, useMemo } from 'react'

type EnhancedHoldersTableProps = {
  holders: AdvancedHolderInfo[]
  isLoading?: boolean
  onRetry?: () => void
  errorDetails?: string[]
}

type SortField = 'balance' | 'activity' | 'type' | 'lastActivity'
type SortDirection = 'asc' | 'desc'
type FilterType = 'all' | 'Exchange' | 'Bridge' | 'Uniswap' | 'Individual'
type ActivityFilter = 'all' | 'active' | 'moderate' | 'dormant'

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

function exportToCSV(holders: AdvancedHolderInfo[]) {
  const headers = [
    'Rank',
    'Address',
    'Short Address',
    'Type',
    'Name',
    'Balance (ALPH)',
    'Balance %',
    'Locked Balance (ALPH)',
    'In Transactions',
    'Out Transactions',
    'Total Activity',
    'Activity Status',
    'Days Since Last Activity',
    'First TX Received',
    'Last TX Received',
    'First TX Sent',
    'Last TX Sent',
    'Is Genesis',
    'Is Reserved'
  ]

  const csvContent = [
    headers.join(','),
    ...holders.map((holder, index) => [
      index + 1,
      holder.address,
      holder.short,
      holder.type || 'Individual',
      holder.name || '',
      holder.balance,
      holder.pct,
      holder.lockedBalance,
      holder.ins,
      holder.outs,
      holder.ins + holder.outs,
      holder.activityStatus,
      holder.daysSinceLastActivity,
      holder.firstTxRecv || '',
      holder.lastTxRecv || '',
      holder.firstTxSend || '',
      holder.lastTxSend || '',
      holder.isGenesis,
      holder.isReserved
    ].join(','))
  ].join('\n')

  const blob = new Blob([csvContent], { type: 'text/csv' })
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `alephium-holders-${new Date().toISOString().split('T')[0]}.csv`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  window.URL.revokeObjectURL(url)
}

export function EnhancedHoldersTable({ holders, isLoading, onRetry, errorDetails }: EnhancedHoldersTableProps) {
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [sortField, setSortField] = useState<SortField>('balance')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')
  const [filterType, setFilterType] = useState<FilterType>('all')
  const [activityFilter, setActivityFilter] = useState<ActivityFilter>('all')
  const [searchQuery, setSearchQuery] = useState('')

  const filteredAndSortedHolders = useMemo(() => {
    let filtered = holders.filter(holder => {
      // Type filter
      if (filterType !== 'all' && holder.type !== filterType) return false
      
      // Activity filter
      if (activityFilter !== 'all' && holder.activityStatus !== activityFilter) return false
      
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        return (
          holder.address.toLowerCase().includes(query) ||
          holder.short.toLowerCase().includes(query) ||
          (holder.name && holder.name.toLowerCase().includes(query))
        )
      }
      
      return true
    })

    // Sort
    filtered.sort((a, b) => {
      let aValue: any, bValue: any
      
      switch (sortField) {
        case 'balance':
          aValue = a.balance
          bValue = b.balance
          break
        case 'activity':
          aValue = a.ins + a.outs
          bValue = b.ins + b.outs
          break
        case 'type':
          aValue = a.type || 'Z'
          bValue = b.type || 'Z'
          break
        case 'lastActivity':
          aValue = a.daysSinceLastActivity
          bValue = b.daysSinceLastActivity
          break
        default:
          return 0
      }
      
      if (sortDirection === 'asc') {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })

    return filtered
  }, [holders, filterType, activityFilter, searchQuery, sortField, sortDirection])

  const totalPages = Math.ceil(filteredAndSortedHolders.length / pageSize)
  const startIndex = (currentPage - 1) * pageSize
  const endIndex = startIndex + pageSize
  const paginatedHolders = filteredAndSortedHolders.slice(startIndex, endIndex)

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('desc')
    }
  }

  const typeCounts = holders.reduce((acc, holder) => {
    const type = holder.type || 'Individual'
    acc[type] = (acc[type] || 0) + 1
    return acc
  }, {} as Record<string, number>)

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

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Top 50 Holders</CardTitle>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onRetry}
              className="flex items-center space-x-1"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Refresh</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => exportToCSV(filteredAndSortedHolders)}
              className="flex items-center space-x-1"
            >
              <Download className="w-4 h-4" />
              <span>Export</span>
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        {/* Enhanced Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search addresses..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select value={filterType} onValueChange={(value) => setFilterType(value as FilterType)}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types ({holders.length})</SelectItem>
              {Object.entries(typeCounts).map(([type, count]) => (
                <SelectItem key={type} value={type}>
                  {type} ({count})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={activityFilter} onValueChange={(value) => setActivityFilter(value as ActivityFilter)}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by activity" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Activity</SelectItem>
              <SelectItem value="active">Active (≤7 days)</SelectItem>
              <SelectItem value="moderate">Moderate (8-30 days)</SelectItem>
              <SelectItem value="dormant">Dormant (&gt;30 days)</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={pageSize.toString()} onValueChange={(value) => setPageSize(Number(value))}>
            <SelectTrigger>
              <SelectValue placeholder="Page size" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10 per page</SelectItem>
              <SelectItem value="25">25 per page</SelectItem>
              <SelectItem value="50">50 per page</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Results Summary */}
        <div className="flex items-center justify-between mb-4 text-sm text-white/70">
          <div>
            Showing {startIndex + 1}-{Math.min(endIndex, filteredAndSortedHolders.length)} of {filteredAndSortedHolders.length} holders
          </div>
          <div className="flex items-center space-x-4">
            <div>Sort by:</div>
            <div className="flex space-x-2">
              {(['balance', 'activity', 'type', 'lastActivity'] as SortField[]).map(field => (
                <Button
                  key={field}
                  variant={sortField === field ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => handleSort(field)}
                  className="text-xs"
                >
                  {field === 'lastActivity' ? 'Last Activity' : field}
                  {sortField === field && (
                    <span className="ml-1">
                      {sortDirection === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </Button>
              ))}
            </div>
          </div>
        </div>

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
              {paginatedHolders.map((holder, index) => (
                <TableRow key={holder.address} className="border-white/10 hover:bg-white/5">
                  <TableCell className="font-medium text-white/90">
                    #{startIndex + index + 1}
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

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-6">
            <div className="text-sm text-white/70">
              Page {currentPage} of {totalPages}
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="flex items-center space-x-1"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Previous</span>
              </Button>
              
              <div className="flex items-center space-x-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const pageNum = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i
                  if (pageNum > totalPages) return null
                  
                  return (
                    <Button
                      key={pageNum}
                      variant={currentPage === pageNum ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setCurrentPage(pageNum)}
                      className="w-8 h-8 p-0"
                    >
                      {pageNum}
                    </Button>
                  )
                })}
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="flex items-center space-x-1"
              >
                <span>Next</span>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
