'use client'

import { useState, useEffect, useCallback } from 'react'
import { useWallet } from '@alephium/web3-react'
import { supabase } from '@/lib/supabaseClient'

export interface LeaderboardUser {
  address: string
  title: string
  admin_total_xp: number
  level: number
  levelName: string
  levelColor: string
  rank: number
}

export interface XPLevel {
  level: number
  name: string
  xp_min: number
  xp_max: number
  color_hex: string
}

export interface MonthlyFilter {
  value: string
  label: string
}

export function useXPLeaderboard() {
  const [users, setUsers] = useState<LeaderboardUser[]>([])
  const [levels, setLevels] = useState<XPLevel[]>([])
  const [selectedMonth, setSelectedMonth] = useState<string>('all')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentUserRank, setCurrentUserRank] = useState<number | null>(null)
  const [currentUserXP, setCurrentUserXP] = useState<number | null>(null)
  const [connectedWallet, setConnectedWallet] = useState<string | null>(null)
  
  // Use the proper wallet hook
  const { account } = useWallet()

  // Generate intelligent month filter based on current date
  const generateMonths = useCallback((): MonthlyFilter[] => {
    const currentDate = new Date()
    const currentYear = currentDate.getFullYear()
    const currentMonth = currentDate.getMonth() + 1 // 1-12
    
    const months: MonthlyFilter[] = [
      { value: 'all', label: 'All Time' }
    ]
    
    // Add current year months, starting from current month and going backwards
    for (let month = currentMonth; month >= 1; month--) {
      const monthName = new Date(currentYear, month - 1, 1).toLocaleDateString('en-US', { month: 'long' })
      months.push({ value: month.toString(), label: monthName })
    }
    
    // Add previous year months if we're in early months of the year
    if (currentMonth <= 6) {
      for (let month = 12; month >= 7; month--) {
        const monthName = new Date(currentYear - 1, month - 1, 1).toLocaleDateString('en-US', { month: 'long' })
        months.push({ value: `${month}-${currentYear - 1}`, label: `${monthName} ${currentYear - 1}` })
      }
    }
    
    return months
  }, [])

  const months = generateMonths()

  // Function to detect connected wallet using the proper hook
  const detectConnectedWallet = useCallback(() => {
    if (account) {
      const address = typeof account === 'string' ? account : account?.address
      return address || null
    }
    return null
  }, [account])

  const calculateUserLevel = useCallback((totalXP: number, levels: XPLevel[]) => {
    if (!levels || levels.length === 0) {
      return { level: 1, name: "Novice", color_hex: "#00E6B0" }
    }

    const sortedLevels = levels.sort((a, b) => a.xp_min - b.xp_min)
    const userLevel = sortedLevels.find(level => 
      totalXP >= level.xp_min && totalXP <= level.xp_max
    )

    if (userLevel) {
      return userLevel
    }

    if (totalXP < sortedLevels[0].xp_min) {
      return sortedLevels[0]
    }

    return sortedLevels[sortedLevels.length - 1]
  }, [])

  const fetchXPLevels = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('admin_xp_levels')
        .select('*')
        .order('level', { ascending: true })

      if (error) throw error
      return data || []
    } catch (err) {
      console.error('Error fetching XP levels:', err)
      return []
    }
  }, [])

  const fetchMonthlyXPData = useCallback(async (month: string) => {
    if (month === 'all') return null

    try {
      let startDate: string
      let endDate: string
      
      if (month.includes('-')) {
        // Handle previous year months (e.g., "12-2023")
        const [monthNum, year] = month.split('-')
        const yearNum = parseInt(year)
        startDate = new Date(yearNum, parseInt(monthNum) - 1, 1).toISOString()
        endDate = new Date(yearNum, parseInt(monthNum), 0, 23, 59, 59).toISOString()
      } else {
        // Handle current year months
        const currentYear = new Date().getFullYear()
        startDate = new Date(currentYear, parseInt(month) - 1, 1).toISOString()
        endDate = new Date(currentYear, parseInt(month), 0, 23, 59, 59).toISOString()
      }

      const { data, error } = await supabase
        .from('admin_user_xp_history')
        .select('user_address, change')
        .gte('created_at', startDate)
        .lte('created_at', endDate)

      if (error) throw error
      return data
    } catch (err) {
      console.error('Error fetching monthly XP data:', err)
      return null
    }
  }, [])

  const fetchLeaderboardData = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)

      // Detect connected wallet using the proper hook
      const wallet = detectConnectedWallet()
      setConnectedWallet(wallet)

      // Fetch XP levels first
      const levelsData = await fetchXPLevels()
      setLevels(levelsData)

      // Fetch ALL users with XP data for ranking calculation
      const { data: allUsersData, error: allUsersError } = await supabase
        .from('users')
        .select('address, title, admin_total_xp')
        .eq('exists_flag', true)
        .order('admin_total_xp', { ascending: false })

      if (allUsersError) throw allUsersError

      // Calculate global rankings for all users
      const allUsersWithRanks = (allUsersData || []).map((user, index) => {
        const levelInfo = calculateUserLevel(user.admin_total_xp, levelsData)
        return {
          ...user,
          level: levelInfo.level,
          levelName: levelInfo.name,
          levelColor: levelInfo.color_hex,
          rank: index + 1
        }
      })

      // Get top 10 users
      const top10Users = allUsersWithRanks.slice(0, 10)

      // If month filter is selected, apply it to top 10
      if (selectedMonth !== 'all') {
        const monthlyXPData = await fetchMonthlyXPData(selectedMonth)
        
        if (monthlyXPData && monthlyXPData.length > 0) {
          // Calculate monthly XP for each user
          const monthlyXP: { [key: string]: number } = {}
          monthlyXPData.forEach(record => {
            monthlyXP[record.user_address] = (monthlyXP[record.user_address] || 0) + record.change
          })

          // Filter top 10 users who have XP activity in the selected month
          const activeTop10Users = top10Users.filter(user => 
            monthlyXP[user.address] !== undefined
          )

          if (activeTop10Users.length > 0) {
            setUsers(activeTop10Users)
          } else {
            setUsers([])
          }
        } else {
          setUsers([])
        }
      } else {
        setUsers(top10Users)
      }

      // Find current user's position if wallet is connected
      if (wallet) {
        const currentUser = allUsersWithRanks.find(user => 
          user.address.toLowerCase() === wallet.toLowerCase()
        )
        
        if (currentUser) {
          setCurrentUserRank(currentUser.rank)
          setCurrentUserXP(currentUser.admin_total_xp)
        } else {
          // User not found in database, set as unranked
          setCurrentUserRank(null)
          setCurrentUserXP(null)
        }
      } else {
        // No wallet connected
        setCurrentUserRank(null)
        setCurrentUserXP(null)
      }

    } catch (err) {
      console.error('Error fetching leaderboard data:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch leaderboard data')
    } finally {
      setIsLoading(false)
    }
  }, [selectedMonth, fetchXPLevels, fetchMonthlyXPData, calculateUserLevel, detectConnectedWallet])

  const refreshData = useCallback(() => {
    fetchLeaderboardData()
  }, [fetchLeaderboardData])

  useEffect(() => {
    fetchLeaderboardData()
  }, [fetchLeaderboardData])

  // Listen for wallet connection changes without polling
  useEffect(() => {
    const handleWalletChange = () => {
      fetchLeaderboardData()
    }

    // Only listen for storage changes (wallet connections)
    window.addEventListener('storage', handleWalletChange)

    return () => {
      window.removeEventListener('storage', handleWalletChange)
    }
  }, [fetchLeaderboardData])

  return {
    users,
    levels,
    months,
    selectedMonth,
    setSelectedMonth,
    isLoading,
    error,
    refreshData,
    currentUserRank,
    currentUserXP,
    connectedWallet
  }
}
