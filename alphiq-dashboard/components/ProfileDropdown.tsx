'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator 
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import { useUserProfile } from '@/hooks/useUserProfile'
import { useANS } from '@/hooks/useANS'
import { UserProfileUpdateModal } from './UserProfileUpdateModal'
import { 
  User, 
  Edit3, 
  Sparkles, 
  ChevronDown,
  UserPlus,
  Smile
} from 'lucide-react'

interface ProfileDropdownProps {
  address: string
  userId: string
  variant?: 'desktop' | 'mobile'
}

export function ProfileDropdown({ address, userId, variant = 'desktop' }: ProfileDropdownProps) {
  const { profile, hasProfile, needsUpdate } = useUserProfile(address)
  const { ansName, hasANS } = useANS(address)
  const [showProfileModal, setShowProfileModal] = useState(false)

  const getDisplayName = () => {
    if (profile?.username) return profile.username
    if (hasANS && ansName) return ansName
    return null // Don't show "Anonymous User"
  }

  const getDisplayEmoji = () => {
    return profile?.emoji || null
  }

  const handleEditProfile = () => {
    setShowProfileModal(true)
  }

  const handleProfileSuccess = () => {
    setShowProfileModal(false)
    // Refresh the page to update all components
    window.location.reload()
  }

  const handleProfileClose = () => {
    setShowProfileModal(false)
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="outline" 
            className={`glass-effect hover:glass-hover text-neutral font-medium border-amber/30 hover:border-amber/50 transition-all duration-300 ${
              variant === 'mobile' ? 'w-full justify-start' : 'px-4 py-2'
            }`}
          >
            <div className="flex items-center space-x-2">
              {getDisplayEmoji() && (
                <span className="text-lg">{getDisplayEmoji()}</span>
              )}
              {getDisplayName() ? (
                <span className="truncate max-w-[120px]">
                  {getDisplayName()}
                </span>
              ) : (
                <UserPlus className="w-4 h-4 text-neutral/60" />
              )}
              <ChevronDown className="w-4 h-4 text-neutral/60" />
            </div>
          </Button>
        </DropdownMenuTrigger>
        
        <DropdownMenuContent 
          className="w-64 glass-effect border-amber/30" 
          align={variant === 'mobile' ? 'start' : 'end'}
        >
          {/* Profile Header */}
          <div className="px-3 py-2 border-b border-amber/20">
            <div className="flex items-center space-x-2">
              {getDisplayEmoji() && (
                <span className="text-xl">{getDisplayEmoji()}</span>
              )}
              <div className="flex-1 min-w-0">
                {getDisplayName() ? (
                  <p className="font-medium text-neutral truncate">
                    {getDisplayName()}
                  </p>
                ) : (
                  <p className="font-medium text-neutral/60 truncate flex items-center">
                    <UserPlus className="w-4 h-4 mr-1" />
                    Get Username
                  </p>
                )}
                <p className="text-xs text-neutral/60 font-mono">
                  {address.slice(0, 6)}...{address.slice(-4)}
                </p>
              </div>
            </div>
            
            {/* Profile Status Badge */}
            <div className="mt-2">
              {hasProfile && profile?.username ? (
                <Badge className="bg-amber/20 text-amber border-amber/30 text-xs">
                  <Sparkles className="w-3 h-3 mr-1" />
                  Profile Complete
                </Badge>
              ) : (
                <Badge variant="outline" className="text-neutral/60 border-neutral/30 text-xs">
                  <UserPlus className="w-3 h-3 mr-1" />
                  Get Username
                </Badge>
              )}
            </div>
          </div>

          <DropdownMenuSeparator className="bg-amber/20" />

          {/* Menu Items */}
          {hasProfile && profile?.username ? (
            <DropdownMenuItem 
              onClick={handleEditProfile}
              className="hover:bg-amber/10 focus:bg-amber/10"
            >
              <Edit3 className="w-4 h-4 mr-2 text-amber" />
              Edit Profile
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem 
              onClick={handleEditProfile}
              className="hover:bg-amber/10 focus:bg-amber/10"
            >
              <Smile className="w-4 h-4 mr-2 text-amber" />
              Get Username & Emoji
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Profile Update Modal */}
      {showProfileModal && (
        <UserProfileUpdateModal
          isOpen={showProfileModal}
          onClose={handleProfileClose}
          onSuccess={handleProfileSuccess}
          address={address}
          userId={userId}
        />
      )}
    </>
  )
}
