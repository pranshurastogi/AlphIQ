'use client'

import { useEffect, useState } from 'react'
import { supabase, testSupabaseConnection } from '@/lib/supabaseClient'
import { config } from '@/lib/config'

// Helper function to check if we're in development
const isDevelopment = () => process.env.NODE_ENV === 'development'

// Safe logging function that only logs in development
const safeLog = (level: 'log' | 'warn' | 'error', ...args: any[]) => {
  if (isDevelopment()) {
    console[level](...args)
  }
}

export interface XPHistory {
  id: number
  user_address: string
  change: number
  reason: string
  submission_id?: number
  created_at: string
  partner_name?: string
}

export interface UserXP {
  address: string
  admin_total_xp: number
  title: string
  level?: number
  levelName?: string
  levelColor?: string
}

// Helper function to get partner name from quest submission
async function getPartnerFromSubmission(supabase: any, submissionId: number): Promise<string> {
  try {
    const { data, error } = await supabase
      .from('admin_quest_submissions')
      .select(`
        admin_quests!inner(
          admin_user_profiles!inner(partner_name)
        )
      `)
      .eq('id', submissionId)
      .single()

    if (error || !data) return 'System'
    return data.admin_quests?.admin_user_profiles?.partner_name || 'System'
  } catch (err) {
    return 'System'
  }
}

export function useXPData(address?: string) {
  const [userXP, setUserXP] = useState<UserXP | null>(null)
  const [xpHistory, setXpHistory] = useState<XPHistory[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!address) {
      setIsLoading(false)
      return
    }

    const fetchXPData = async () => {
      try {
        setIsLoading(true)
        setError(null)

        // Test Supabase connection first
        safeLog('log', '🔍 Testing Supabase connection...')
        const connectionTest = await testSupabaseConnection()
        
        if (!connectionTest) {
          safeLog('error', '❌ Supabase connection failed, using mock data')
          // Use mock data when connection fails
          const mockUserData = {
            address: address,
            admin_total_xp: 2847,
            title: "DeFi Master",
            level: 4,
            levelName: "Veteran",
            levelColor: "text-orange-400"
          }
          
          const mockHistoryData = [
            {
              id: 1,
              user_address: address,
              change: 150,
              reason: "DeFi Protocol Integration",
              submission_id: 1,
              created_at: new Date().toISOString(),
              partner_name: "AlphIQ"
            },
            {
              id: 2,
              user_address: address,
              change: 200,
              reason: "Smart Contract Deployment",
              submission_id: 2,
              created_at: new Date(Date.now() - 86400000).toISOString(),
              partner_name: "Alephium Labs"
            },
            {
              id: 3,
              user_address: address,
              change: 100,
              reason: "Community Contribution",
              submission_id: 3,
              created_at: new Date(Date.now() - 172800000).toISOString(),
              partner_name: "DeFi Protocol"
            },
            {
              id: 4,
              user_address: address,
              change: 300,
              reason: "Trading Competition",
              submission_id: 4,
              created_at: new Date(Date.now() - 259200000).toISOString(),
              partner_name: "Trading Partner"
            },
            {
              id: 5,
              user_address: address,
              change: 75,
              reason: "Weekly Streak Bonus",
              submission_id: 5,
              created_at: new Date(Date.now() - 345600000).toISOString(),
              partner_name: "System"
            }
          ]
          
          setUserXP(mockUserData)
          setXpHistory(mockHistoryData)
          setIsLoading(false)
          return
        }
        
        safeLog('log', '✅ Supabase connection successful, fetching real data...')

        // Fetch user's total XP
        safeLog('log', '🔍 Attempting to fetch user data for address:', address)
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('address, admin_total_xp, title')
          .eq('address', address)
          .maybeSingle()

        safeLog('log', 'User data:', userData, 'Error:', userError)
        
        if (!userData) {
          safeLog('log', '⚠️  User not found in database, using mock data')
        }

        // Fetch XP levels to calculate user's current level
        safeLog('log', '🔍 Fetching XP levels from database...')
        const { data: levelsData, error: levelsError } = await supabase
          .from('admin_xp_levels')
          .select('*')
          .order('level', { ascending: true })

        safeLog('log', 'Levels data:', levelsData, 'Error:', levelsError)
        if (levelsData && levelsData.length > 0) {
          safeLog('log', '📊 Available XP levels:', levelsData.map(l => `${l.name} (${l.xp_min}-${l.xp_max} XP)`))
        } else {
          safeLog('log', '⚠️  No XP levels found in database')
        }

        // Calculate user's level based on total XP using database levels
        const calculateUserLevel = (totalXP: number) => {
          if (!levelsData || levelsData.length === 0) {
            safeLog('warn', '⚠️  No XP levels found in database, using fallback')
            return { level: 1, name: "Novice", color: "text-blue-400" }
          }
          
          // Sort levels by xp_min to ensure proper order
          const sortedLevels = levelsData.sort((a, b) => a.xp_min - b.xp_min)
          
          // Find the appropriate level for the user's XP
          const userLevel = sortedLevels.find(level => 
            totalXP >= level.xp_min && totalXP <= level.xp_max
          )
          
          if (userLevel) {
            safeLog('log', `🎯 User level calculated: ${userLevel.name} (Level ${userLevel.level})`)
            return {
              level: userLevel.level,
              name: userLevel.name,
              color: `text-[${userLevel.color_hex}]`
            }
          }
          
          // If user XP is below the minimum level, return the first level
          if (totalXP < sortedLevels[0].xp_min) {
            const firstLevel = sortedLevels[0]
            return {
              level: firstLevel.level,
              name: firstLevel.name,
              color: `text-[${firstLevel.color_hex}]`
            }
          }
          
          // If user XP is above all levels, return the highest level
          const highestLevel = sortedLevels[sortedLevels.length - 1]
          safeLog('log', `🏆 User exceeds max level, using: ${highestLevel.name}`)
          return {
            level: highestLevel.level,
            name: highestLevel.name,
            color: `text-[${highestLevel.color_hex}]`
          }
        }

        // Fetch approved quest submissions for this user
        safeLog('log', '🔍 Attempting to fetch submissions data for address:', address)
        const { data: submissionsData, error: submissionsError } = await supabase
          .from('admin_quest_submissions')
          .select(`
            id,
            submitted_at,
            admin_quests!inner(
              title,
              xp_reward,
              admin_user_profiles!inner(partner_name)
            )
          `)
          .eq('user_address', address)
          .eq('status', 'approved')
          .order('submitted_at', { ascending: false })
          .limit(10)

        safeLog('log', 'Submissions data:', submissionsData, 'Error:', submissionsError)
        if (submissionsData && submissionsData.length > 0) {
          safeLog('log', '📊 Found submissions:', submissionsData.length)
        } else {
          safeLog('log', '⚠️  No approved submissions found for this user')
        }
        if (submissionsError) throw submissionsError

        // Transform the data to match our interface
        const transformedHistory = submissionsData?.map((item: any) => ({
          id: item.id,
          user_address: address,
          change: item.admin_quests?.xp_reward || 0,
          reason: item.admin_quests?.title || 'Unknown Quest',
          submission_id: item.id,
          created_at: item.submitted_at,
          partner_name: item.admin_quests?.admin_user_profiles?.partner_name || 'System'
        })) || []

        // Use real data or fallback to mock data if no user found
        const baseUserData = userData || {
          address: address,
          admin_total_xp: 2847,
          title: "DeFi Master"
        }

        // Calculate user level
        const levelInfo = calculateUserLevel(baseUserData.admin_total_xp)
        const finalUserData = {
          ...baseUserData,
          level: levelInfo.level,
          levelName: levelInfo.name,
          levelColor: levelInfo.color
        }

        safeLog('log', 'Final user data:', finalUserData)

        safeLog('log', 'Final history data:', transformedHistory)
        setUserXP(finalUserData)
        setXpHistory(transformedHistory)
      } catch (err) {
        safeLog('error', 'Error fetching XP data:', err)
        setError(err instanceof Error ? err.message : 'Failed to fetch XP data')
      } finally {
        setIsLoading(false)
      }
    }

    fetchXPData()
  }, [address])

  return {
    userXP,
    xpHistory,
    isLoading,
    error
  }
} 