'use client'

import { useState, useEffect } from 'react'
import { useWallet } from '@alephium/web3-react'
import { AlephiumConnectButton } from '@alephium/web3-react'
import { ANSDisplay } from './ANSDisplay'
import { useANS } from '@/hooks/useANS'
import { useUserProfile } from '@/hooks/useUserProfile'
import { UserProfileUpdateModal } from './UserProfileUpdateModal'
import { ProfileDropdown } from './ProfileDropdown'
import { UserPlus } from 'lucide-react'

interface WalletConnectWithANSProps {
  variant?: 'desktop' | 'mobile'
}

export function WalletConnectWithANS({ variant = 'desktop' }: WalletConnectWithANSProps) {
  const { account } = useWallet()
  const address = typeof account === 'string' ? account : account?.address
  const { ansName, hasANS } = useANS(address)
  const { needsUpdate, userId, isLoading, error, profile, hasProfile } = useUserProfile(address)
  const [showProfileModal, setShowProfileModal] = useState(false)

  // Check if user has a username
  const hasUsername = hasProfile && profile?.username

  // Show profile update modal when user connects and needs to update profile
  useEffect(() => {
    if (address && needsUpdate && !isLoading && userId) {
      // Check if we've already shown the modal for this user in this session
      const modalShownKey = `profile-modal-shown-${address}`
      const hasShownThisSession = sessionStorage.getItem(modalShownKey)
      
      // Also check if user has dismissed it permanently (localStorage)
      const dismissedKey = `profile-modal-dismissed-${address}`
      const hasDismissedPermanently = localStorage.getItem(dismissedKey)
      
      if (!hasShownThisSession && !hasDismissedPermanently) {
        // Small delay to ensure wallet connection is complete
        const timer = setTimeout(() => {
          setShowProfileModal(true)
          // Mark as shown for this session
          sessionStorage.setItem(modalShownKey, 'true')
        }, 1000)
        
        return () => clearTimeout(timer)
      }
    }
  }, [address, needsUpdate, isLoading, userId])

  const handleProfileSuccess = () => {
    setShowProfileModal(false)
    // Clear the session storage so it can show again if needed
    const modalShownKey = `profile-modal-shown-${address}`
    sessionStorage.removeItem(modalShownKey)
    // Refresh profile status after successful update
    window.location.reload() // Simple refresh to update the UI
  }

  const handleProfileClose = () => {
    setShowProfileModal(false)
    // Don't clear session storage on close - user can manually open it later
  }

  const handleDismissPermanently = () => {
    if (address) {
      const dismissedKey = `profile-modal-dismissed-${address}`
      localStorage.setItem(dismissedKey, 'true')
    }
    setShowProfileModal(false)
  }

  // Function to manually trigger the modal (for testing or manual opening)
  const handleManualOpen = () => {
    setShowProfileModal(true)
  }

  if (variant === 'mobile') {
    return (
      <>
        <div className="flex items-center justify-between w-full">
          {address && userId ? (
            // Mobile: Show profile dropdown with wallet connection
            <div className="w-full space-y-3">
              {hasUsername ? (
                <div className="glass-effect px-4 py-3 rounded-lg border border-amber/30">
                  <ProfileDropdown 
                    address={address} 
                    userId={userId} 
                    variant="mobile" 
                  />
                </div>
              ) : (
                // Show small icon for users without username
                <div className="glass-effect px-4 py-3 rounded-lg border border-amber/30 flex items-center justify-center">
                  <button
                    onClick={() => setShowProfileModal(true)}
                    className="flex items-center space-x-2 text-neutral/60 hover:text-amber transition-colors"
                  >
                    <UserPlus className="w-5 h-5" />
                    <span className="text-sm">Get Username</span>
                  </button>
                </div>
              )}
              <div className="glass-effect px-4 py-2 rounded-lg border border-amber/30">
                <AlephiumConnectButton />
              </div>
            </div>
          ) : (
            // Mobile: Show just wallet connect button when no profile
            <div className="w-full">
              <div className="glass-effect px-4 py-2 rounded-lg border border-amber/30">
                <AlephiumConnectButton />
              </div>
            </div>
          )}
        </div>
        
        {/* Profile Update Modal */}
        {showProfileModal && userId && (
          <UserProfileUpdateModal
            isOpen={showProfileModal}
            onClose={handleProfileClose}
            onSuccess={handleProfileSuccess}
            address={address!}
            userId={userId}
            onDismissPermanently={handleDismissPermanently}
          />
        )}
      </>
    )
  }

  return (
    <>
      <div className="flex items-center">
        {address && userId ? (
          // Desktop: Show profile dropdown with wallet connection integrated
          <div className="glass-effect hover:glass-hover text-neutral font-medium flex items-center px-4 py-2 rounded-lg border border-amber/30 transition-all duration-300">
            <div className="flex items-center space-x-3">
              {hasUsername ? (
                <ProfileDropdown 
                  address={address} 
                  userId={userId} 
                  variant="desktop" 
                />
              ) : (
                // Show small icon for users without username
                <button
                  onClick={() => setShowProfileModal(true)}
                  className="flex items-center space-x-2 text-neutral/60 hover:text-amber transition-colors px-2 py-1 rounded"
                >
                  <UserPlus className="w-4 h-4" />
                  <span className="text-sm">Get Username</span>
                </button>
              )}
              <div className="w-px h-6 bg-amber/30" />
              <AlephiumConnectButton />
            </div>
          </div>
        ) : (
          // Desktop: Show just wallet connect button when no profile
          <div className="glass-effect hover:glass-hover text-neutral font-medium flex items-center px-4 py-2 rounded-lg border border-amber/30 transition-all duration-300">
            <AlephiumConnectButton />
          </div>
        )}
      </div>
      
      {/* Profile Update Modal */}
      {showProfileModal && userId && (
        <UserProfileUpdateModal
          isOpen={showProfileModal}
          onClose={handleProfileClose}
          onSuccess={handleProfileSuccess}
          address={address!}
          userId={userId}
          onDismissPermanently={handleDismissPermanently}
        />
      )}
    </>
  )
}
