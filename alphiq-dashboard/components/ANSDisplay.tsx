import { useState } from 'react'
import Image from 'next/image'
import { User } from 'lucide-react'
import { useANS } from '@/hooks/useANS'

interface ANSDisplayProps {
  address?: string
  showAddress?: boolean
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function ANSDisplay({ 
  address, 
  showAddress = true, 
  size = 'md',
  className = '' 
}: ANSDisplayProps) {
  const { ansName, ansUri, isLoading, error, hasANS } = useANS(address)
  const [imageError, setImageError] = useState(false)





  if (!address) {
    return null
  }

  const sizeClasses = {
    sm: {
      container: 'space-x-2',
      avatar: 'w-6 h-6',
      name: 'text-sm',
      address: 'text-xs'
    },
    md: {
      container: 'space-x-3',
      avatar: 'w-8 h-8',
      name: 'text-base',
      address: 'text-sm'
    },
    lg: {
      container: 'space-x-4',
      avatar: 'w-12 h-12',
      name: 'text-lg',
      address: 'text-base'
    }
  }

  const currentSize = sizeClasses[size]

  return (
    <div className={`flex items-center ${currentSize.container} ${className}`}>
      {/* Avatar */}
      <div className="flex-shrink-0">
        {ansUri && !imageError ? (
          <Image
            src={ansUri}
            alt={`${ansName || 'User'} avatar`}
            width={parseInt(currentSize.avatar.split(' ')[0].slice(2))}
            height={parseInt(currentSize.avatar.split(' ')[0].slice(2))}
            className={`${currentSize.avatar} rounded-full object-cover`}
            onError={() => setImageError(true)}
          />
        ) : (
          <div className={`${currentSize.avatar} rounded-full bg-neutral/10 flex items-center justify-center`}>
            <User className="w-1/2 h-1/2 text-neutral/60" />
          </div>
        )}
      </div>

      {/* Name and Address */}
      <div className="flex flex-col min-w-0">
        {ansName ? (
          <span className={`font-medium text-amber truncate ${currentSize.name}`}>
            {ansName}
          </span>
        ) : isLoading ? (
          <span className={`text-neutral/60 ${currentSize.name}`}>
            Loading...
          </span>
        ) : error ? (
          <span className={`text-red-400 ${currentSize.name}`}>
            Error loading ANS
          </span>
        ) : (
          <span className={`text-neutral/60 ${currentSize.name}`}>
            No ANS Profile
          </span>
        )}
        
        {showAddress && (
          <span className={`text-neutral/40 font-mono truncate ${currentSize.address}`}>
            {address.slice(0, 6)}...{address.slice(-4)}
          </span>
        )}
      </div>
    </div>
  )
}
