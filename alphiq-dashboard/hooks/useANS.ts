import { useState, useEffect } from 'react'

interface ANSProfile {
  name: string
  imgUri?: string
}

interface ANSRecord {
  owner: string
  manager: string
  ttl: number
}

export function useANS(address?: string) {
  const [ansName, setAnsName] = useState<string | null>(null)
  const [ansUri, setAnsUri] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchANSProfile = async (targetAddress: string) => {
    if (!targetAddress || targetAddress.trim() === '') {
      setError('Invalid address provided')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      // Dynamic import to avoid SSR issues
      const { ANS } = await import('@alph-name-service/ans-sdk')
      const ans = new ANS('mainnet')
      const profile = await ans.getProfile(targetAddress)

      if (profile?.name) {
        setAnsName(profile.name)
      } else {
        setAnsName(null)
      }

      if (profile?.imgUri) {
        setAnsUri(profile.imgUri)
      } else {
        setAnsUri(null)
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred'
      setError(`Failed to fetch ANS profile: ${errorMessage}`)
      
      // Reset state on error
      setAnsName(null)
      setAnsUri(null)
      
      // Only log in development
      if (process.env.NODE_ENV === 'development') {
        console.error('Error fetching ANS profile:', err)
      }
    } finally {
      setIsLoading(false)
    }
  }

  const resolveName = async (name: string): Promise<string | null> => {
    if (!name || name.trim() === '') {
      return null
    }

    try {
      const { ANS } = await import('@alph-name-service/ans-sdk')
      const ans = new ANS('mainnet')
      const resolvedAddress = await ans.resolveName(name)
      return resolvedAddress || null
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred'
      setError(`Failed to resolve ANS name: ${errorMessage}`)
      
      // Only log in development
      if (process.env.NODE_ENV === 'development') {
        console.error('Error resolving ANS name:', err)
      }
      return null
    }
  }

  const getRecord = async (name: string): Promise<ANSRecord | null> => {
    if (!name || name.trim() === '') {
      return null
    }

    try {
      const { ANS } = await import('@alph-name-service/ans-sdk')
      const ans = new ANS('mainnet')
      const record = await ans.getRecord(name)
      return record || null
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred'
      setError(`Failed to get ANS record: ${errorMessage}`)
      
      // Only log in development
      if (process.env.NODE_ENV === 'development') {
        console.error('Error getting ANS record:', err)
      }
      return null
    }
  }

  // Auto-fetch profile when address changes
  useEffect(() => {
    if (address) {
      fetchANSProfile(address)
    } else {
      // Reset state when no address
      setAnsName(null)
      setAnsUri(null)
      setError(null)
      setIsLoading(false)
    }
  }, [address])

  return {
    ansName,
    ansUri,
    isLoading,
    error,
    fetchANSProfile,
    resolveName,
    getRecord,
    hasANS: !!ansName
  }
}
