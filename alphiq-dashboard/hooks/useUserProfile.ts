import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'

// Helper function for safe logging
const safeLog = (level: 'log' | 'warn' | 'error', ...args: any[]) => {
  if (process.env.NODE_ENV === 'development') {
    console[level](...args)
  }
}

interface UserProfile {
  id?: string
  user_id?: string
  username?: string | null
  emoji?: string | null
  description?: string | null
  website?: string | null
  github?: string | null
  twitter?: string | null
  telegram?: string | null
  discord?: string | null
}

interface UserProfileStatus {
  hasProfile: boolean
  needsUpdate: boolean
  profile: UserProfile | null
  userId: string | null
  isLoading: boolean
  error: string | null
}

export function useUserProfile(address?: string) {
  const [status, setStatus] = useState<UserProfileStatus>({
    hasProfile: false,
    needsUpdate: false,
    profile: null,
    userId: null,
    isLoading: false,
    error: null
  })

  const checkProfileStatus = async (userAddress: string) => {
    try {
      setStatus(prev => ({ ...prev, isLoading: true, error: null }))
      
      safeLog('log', '🔍 Checking profile status for address:', userAddress)

      // First, get the user by address
      const { data: user, error: userError } = await supabase
        .from('users')
        .select('id, address')
        .eq('address', userAddress)
        .single()

      if (userError) {
        safeLog('error', '❌ Error fetching user:', userError)
        setStatus(prev => ({ 
          ...prev, 
          isLoading: false, 
          error: 'User not found' 
        }))
        return
      }

      if (!user) {
        setStatus(prev => ({ 
          ...prev, 
          isLoading: false, 
          error: 'User not found' 
        }))
        return
      }

      // Check if user has profile information
      const { data: profile, error: profileError } = await supabase
        .from('user_info')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (profileError && profileError.code !== 'PGRST116') {
        safeLog('error', '❌ Error fetching user profile:', profileError)
        setStatus(prev => ({ 
          ...prev, 
          isLoading: false, 
          error: 'Failed to fetch profile' 
        }))
        return
      }

      // Determine if profile needs update
      const hasProfile = !!profile
      const needsUpdate = !hasProfile || !profile?.username || !profile?.emoji

      safeLog('log', '✅ Profile status checked:', { 
        hasProfile, 
        needsUpdate, 
        userId: user.id 
      })

      setStatus({
        hasProfile,
        needsUpdate,
        profile: profile || null,
        userId: user.id,
        isLoading: false,
        error: null
      })

    } catch (error) {
      safeLog('error', '❌ Unexpected error in checkProfileStatus:', error)
      setStatus(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: 'Failed to check profile status' 
      }))
    }
  }

  const refreshProfile = async () => {
    if (address) {
      await checkProfileStatus(address)
    }
  }

  useEffect(() => {
    if (address) {
      checkProfileStatus(address)
    } else {
      setStatus({
        hasProfile: false,
        needsUpdate: false,
        profile: null,
        userId: null,
        isLoading: false,
        error: null
      })
    }
  }, [address])

  return {
    ...status,
    refreshProfile,
    checkProfileStatus
  }
}
