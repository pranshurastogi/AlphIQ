import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'

interface UserData {
  id: string
  address: string
  title: string
  score: number
  admin_total_xp: number
  joined_at: string
  updated_at: string
}

interface UserDataStatus {
  userData: UserData | null
  isLoading: boolean
  error: string | null
}

export function useUserData(address?: string) {
  const [status, setStatus] = useState<UserDataStatus>({
    userData: null,
    isLoading: false,
    error: null
  })

  const fetchUserData = async (userAddress: string) => {
    try {
      setStatus(prev => ({ ...prev, isLoading: true, error: null }))
      
      const { data, error } = await supabase
        .from('users')
        .select('id, address, title, score, admin_total_xp, joined_at, updated_at')
        .eq('address', userAddress)
        .single()

      if (error && error.code !== 'PGRST116') {
        throw error
      }

      setStatus({
        userData: data || null,
        isLoading: false,
        error: null
      })
    } catch (error) {
      console.error('Error fetching user data:', error)
      setStatus({
        userData: null,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to fetch user data'
      })
    }
  }

  useEffect(() => {
    if (address) {
      fetchUserData(address)
    } else {
      setStatus({
        userData: null,
        isLoading: false,
        error: null
      })
    }
  }, [address])

  return status
}
