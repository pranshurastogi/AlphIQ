import { useState, useEffect, useCallback } from 'react'

interface UsernameValidationState {
  isValid: boolean
  isChecking: boolean
  isAvailable: boolean | null
  error: string | null
}

export function useUsernameValidation(username: string, currentUserId?: string) {
  const [state, setState] = useState<UsernameValidationState>({
    isValid: false,
    isChecking: false,
    isAvailable: null,
    error: null
  })

  const checkUsernameAvailability = useCallback(async (usernameToCheck: string) => {
    if (!usernameToCheck || usernameToCheck.trim().length < 4) {
      setState({
        isValid: false,
        isChecking: false,
        isAvailable: null,
        error: usernameToCheck.trim().length === 0 ? null : 'Username must be at least 4 characters'
      })
      return
    }

    setState(prev => ({ ...prev, isChecking: true, error: null }))

    try {
      const response = await fetch(`/api/user-profile/check-username?username=${encodeURIComponent(usernameToCheck)}&userId=${currentUserId || ''}`)
      const data = await response.json()

      if (response.ok) {
        setState({
          isValid: true,
          isChecking: false,
          isAvailable: data.available,
          error: data.available ? null : 'Username is already taken'
        })
      } else {
        setState({
          isValid: false,
          isChecking: false,
          isAvailable: false,
          error: data.error || 'Failed to check username'
        })
      }
    } catch (error) {
      setState({
        isValid: false,
        isChecking: false,
        isAvailable: false,
        error: 'Network error while checking username'
      })
    }
  }, [currentUserId])

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (username.trim().length >= 4) {
        checkUsernameAvailability(username)
      } else {
        setState({
          isValid: false,
          isChecking: false,
          isAvailable: null,
          error: username.trim().length === 0 ? null : 'Username must be at least 4 characters'
        })
      }
    }, 500) // Debounce for 500ms

    return () => clearTimeout(timeoutId)
  }, [username, checkUsernameAvailability])

  return state
}
