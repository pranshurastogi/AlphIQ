'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { useUserProfile } from '@/hooks/useUserProfile'
import { useANS } from '@/hooks/useANS'
import { useUserData } from '@/hooks/useUserData'
import { useUserStreak } from '@/hooks/useUserStreak'
import { UserProfileUpdateModal } from './UserProfileUpdateModal'
import { 
  User, 
  Edit3, 
  Globe, 
  Github, 
  Twitter, 
  MessageCircle, 
  Hash,
  AtSign,
  Smile,
  ExternalLink,
  Copy,
  Check,
  Trophy,
  Zap,
  TrendingUp
} from 'lucide-react'

interface ProfileViewProps {
  address: string
  userId: string
  className?: string
}

export function ProfileView({ address, userId, className = '' }: ProfileViewProps) {
  const { profile, hasProfile, isLoading } = useUserProfile(address)
  const { ansName, hasANS } = useANS(address)
  const { userData, isLoading: userDataLoading } = useUserData(address)
  const { streak, isLoading: streakLoading } = useUserStreak(address)
  const [showEditModal, setShowEditModal] = useState(false)
  const [copiedField, setCopiedField] = useState<string | null>(null)

  const handleEditProfile = () => {
    setShowEditModal(true)
  }

  const handleProfileSuccess = () => {
    setShowEditModal(false)
    window.location.reload()
  }

  const handleProfileClose = () => {
    setShowEditModal(false)
  }

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedField(field)
      setTimeout(() => setCopiedField(null), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const getDisplayName = () => {
    if (profile?.username) return profile.username
    if (hasANS && ansName) return ansName
    return 'Anonymous User'
  }

  if (isLoading) {
    return (
      <Card className={`glass-effect border-amber/30 ${className}`}>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-white/10 rounded w-1/3"></div>
            <div className="h-8 bg-white/10 rounded w-1/2"></div>
            <div className="h-4 bg-white/10 rounded w-2/3"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card className={`glass-effect border-amber/30 hover:border-amber/50 transition-all duration-300 ${className}`}>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-amber flex items-center">
              <User className="w-5 h-5 mr-2" />
              Profile
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={handleEditProfile}
              className="border-amber/30 hover:border-amber/50 text-amber hover:text-amber"
            >
              <Edit3 className="w-4 h-4 mr-2" />
              Edit
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Profile Header */}
          <div className="flex items-center space-x-4">
            {profile?.emoji && (
              <div className="text-4xl">{profile.emoji}</div>
            )}
            <div className="flex-1">
              <h3 className="text-xl font-semibold text-neutral">
                {getDisplayName()}
              </h3>
              <p className="text-sm text-neutral/60 font-mono">
                {address.slice(0, 8)}...{address.slice(-8)}
              </p>
              <div className="flex items-center space-x-2 mt-2">
                {hasProfile && profile?.username ? (
                  <Badge className="bg-amber/20 text-amber border-amber/30">
                    <Smile className="w-3 h-3 mr-1" />
                    Custom Profile
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-neutral/60 border-neutral/30">
                    <AtSign className="w-3 h-3 mr-1" />
                    Anonymous
                  </Badge>
                )}
                {hasANS && (
                  <Badge className="bg-mint/20 text-mint border-mint/30">
                    <Globe className="w-3 h-3 mr-1" />
                    ANS
                  </Badge>
                )}
              </div>
            </div>
          </div>

          <Separator className="bg-amber/20" />

          {/* User Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 glass-card rounded-lg border-amber/20">
              <Trophy className="w-5 h-5 mx-auto mb-2 text-amber" />
              <div className="text-xs text-neutral/60 mb-1">Onchain Score</div>
              <div className="text-lg font-bold text-amber">
                {userDataLoading ? '...' : (userData?.score || 0).toLocaleString()}
              </div>
            </div>
            
            <div className="text-center p-3 glass-card rounded-lg border-mint/20">
              <Zap className="w-5 h-5 mx-auto mb-2 text-mint" />
              <div className="text-xs text-neutral/60 mb-1">Total XP</div>
              <div className="text-lg font-bold text-mint">
                {userDataLoading ? '...' : (userData?.admin_total_xp || 0).toLocaleString()}
              </div>
            </div>
          </div>

          {/* Streak Display */}
          {streak && streak.current_streak > 0 && (
            <div className="text-center p-3 glass-card rounded-lg border-lavender/20">
              <TrendingUp className="w-5 h-5 mx-auto mb-2 text-lavender" />
              <div className="text-xs text-neutral/60 mb-1">Login Streak</div>
              <div className="text-lg font-bold text-lavender">
                {streak.current_streak} day{streak.current_streak !== 1 ? 's' : ''}
              </div>
              <div className="text-xs text-neutral/60 mt-1">Keep it up! 🔥</div>
            </div>
          )}

          <Separator className="bg-amber/20" />

          {/* Description */}
          {profile?.description && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-neutral/80">About</h4>
              <p className="text-sm text-neutral/70 leading-relaxed">
                {profile.description}
              </p>
            </div>
          )}

          {/* Social Links */}
          {(profile?.website || profile?.github || profile?.twitter || profile?.telegram || profile?.discord) && (
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-neutral/80">Social Links</h4>
              <div className="grid grid-cols-1 gap-2">
                {profile.website && (
                  <div className="flex items-center justify-between p-2 glass-card rounded-lg border-amber/20">
                    <div className="flex items-center space-x-2">
                      <Globe className="w-4 h-4 text-amber" />
                      <span className="text-sm text-neutral/70">Website</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <a 
                        href={profile.website.startsWith('http') ? profile.website : `https://${profile.website}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-amber hover:text-amber/80 flex items-center space-x-1"
                      >
                        <span className="truncate max-w-[120px]">{profile.website}</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(profile.website, 'website')}
                        className="h-6 w-6 p-0"
                      >
                        {copiedField === 'website' ? (
                          <Check className="w-3 h-3 text-mint" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </Button>
                    </div>
                  </div>
                )}

                {profile.github && (
                  <div className="flex items-center justify-between p-2 glass-card rounded-lg border-amber/20">
                    <div className="flex items-center space-x-2">
                      <Github className="w-4 h-4 text-amber" />
                      <span className="text-sm text-neutral/70">GitHub</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <a 
                        href={`https://github.com/${profile.github}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-amber hover:text-amber/80 flex items-center space-x-1"
                      >
                        <span>@{profile.github}</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(profile.github, 'github')}
                        className="h-6 w-6 p-0"
                      >
                        {copiedField === 'github' ? (
                          <Check className="w-3 h-3 text-mint" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </Button>
                    </div>
                  </div>
                )}

                {profile.twitter && (
                  <div className="flex items-center justify-between p-2 glass-card rounded-lg border-amber/20">
                    <div className="flex items-center space-x-2">
                      <Twitter className="w-4 h-4 text-amber" />
                      <span className="text-sm text-neutral/70">Twitter</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <a 
                        href={`https://twitter.com/${profile.twitter}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-amber hover:text-amber/80 flex items-center space-x-1"
                      >
                        <span>@{profile.twitter}</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(profile.twitter, 'twitter')}
                        className="h-6 w-6 p-0"
                      >
                        {copiedField === 'twitter' ? (
                          <Check className="w-3 h-3 text-mint" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </Button>
                    </div>
                  </div>
                )}

                {profile.telegram && (
                  <div className="flex items-center justify-between p-2 glass-card rounded-lg border-amber/20">
                    <div className="flex items-center space-x-2">
                      <MessageCircle className="w-4 h-4 text-amber" />
                      <span className="text-sm text-neutral/70">Telegram</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <a 
                        href={`https://t.me/${profile.telegram}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-amber hover:text-amber/80 flex items-center space-x-1"
                      >
                        <span>@{profile.telegram}</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(profile.telegram, 'telegram')}
                        className="h-6 w-6 p-0"
                      >
                        {copiedField === 'telegram' ? (
                          <Check className="w-3 h-3 text-mint" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </Button>
                    </div>
                  </div>
                )}

                {profile.discord && (
                  <div className="flex items-center justify-between p-2 glass-card rounded-lg border-amber/20">
                    <div className="flex items-center space-x-2">
                      <Hash className="w-4 h-4 text-amber" />
                      <span className="text-sm text-neutral/70">Discord</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-amber">{profile.discord}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(profile.discord, 'discord')}
                        className="h-6 w-6 p-0"
                      >
                        {copiedField === 'discord' ? (
                          <Check className="w-3 h-3 text-mint" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Empty State */}
          {!hasProfile && (
            <div className="text-center py-6">
              <Smile className="w-12 h-12 text-neutral/40 mx-auto mb-3" />
              <p className="text-sm text-neutral/60 mb-4">
                No profile information available yet.
              </p>
              <Button
                onClick={handleEditProfile}
                className="bg-amber hover:bg-amber/90 text-charcoal"
              >
                <Edit3 className="w-4 h-4 mr-2" />
                Create Profile
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Profile Modal */}
      {showEditModal && (
        <UserProfileUpdateModal
          isOpen={showEditModal}
          onClose={handleProfileClose}
          onSuccess={handleProfileSuccess}
          address={address}
          userId={userId}
        />
      )}
    </>
  )
}
