import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'

interface UserStreak {
  address: string
  current_streak: number
  last_login_date: string
  updated_at: string
}

interface UserStreakStatus {
  streak: UserStreak | null
  isLoading: boolean
  error: string | null
}

export function useUserStreak(address?: string) {
  const [status, setStatus] = useState<UserStreakStatus>({
    streak: null,
    isLoading: false,
    error: null
  })

  const fetchStreak = async (userAddress: string) => {
    try {
      setStatus(prev => ({ ...prev, isLoading: true, error: null }))
      
      const { data, error } = await supabase
        .from('user_streaks')
        .select('*')
        .eq('address', userAddress)
        .single()

      if (error && error.code !== 'PGRST116') {
        throw error
      }

      setStatus({
        streak: data || null,
        isLoading: false,
        error: null
      })
    } catch (error) {
      console.error('Error fetching user streak:', error)
      setStatus({
        streak: null,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to fetch streak'
      })
    }
  }

  useEffect(() => {
    if (address) {
      fetchStreak(address)
    } else {
      setStatus({
        streak: null,
        isLoading: false,
        error: null
      })
    }
  }, [address])

  return status
}
