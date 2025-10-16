'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Loader2, User, Smile, Globe, Github, Twitter, MessageCircle, Hash, Check, X, Sparkles, Star, Zap, UserPlus, Edit3, Link2, AtSign, Coins, AlertTriangle } from 'lucide-react'
import { validateProfile, type ProfileValidationResult } from '@/lib/profileValidation'
import { useUsernameValidation } from '@/hooks/useUsernameValidation'
import { EmojiPicker } from './EmojiPicker'

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

interface UserProfileUpdateModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  address: string
  userId: string
  onDismissPermanently?: () => void
}

interface XPValidationResult {
  success: boolean
  canProceed: boolean
  xpCost: number
  currentXP: number
  error?: string
  details?: string
  requiredXP?: number
  shortfall?: number
  message?: string
}

export function UserProfileUpdateModal({ 
  isOpen, 
  onClose, 
  onSuccess, 
  address, 
  userId,
  onDismissPermanently
}: UserProfileUpdateModalProps) {
  const [profile, setProfile] = useState<UserProfile>({})
  const [originalProfile, setOriginalProfile] = useState<UserProfile>({})
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [validationErrors, setValidationErrors] = useState<string[]>([])
  const [currentStep, setCurrentStep] = useState(1)
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [xpValidation, setXpValidation] = useState<XPValidationResult | null>(null)
  const [isValidatingXP, setIsValidatingXP] = useState(false)
  const [showXPConfirmation, setShowXPConfirmation] = useState(false)
  const [currentXP, setCurrentXP] = useState(0)
  
  // Username validation
  const usernameValidation = useUsernameValidation(profile.username || '', userId)

  // Load existing profile data and XP
  useEffect(() => {
    if (isOpen && userId) {
      loadProfile()
      loadCurrentXP()
    }
  }, [isOpen, userId, address])

  const loadProfile = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      const response = await fetch(`/api/user-profile?userId=${userId}`)
      if (!response.ok) {
        throw new Error('Failed to load profile')
      }
      
      const data = await response.json()
      const profileData = data.profile || {}
      setProfile(profileData)
      setOriginalProfile(profileData)
    } catch (err) {
      console.error('Error loading profile:', err)
      setError('Failed to load profile data')
    } finally {
      setIsLoading(false)
    }
  }

  // Load current XP
  const loadCurrentXP = async () => {
    try {
      const response = await fetch(`/api/user-profile/xp-validation?address=${address}`)
      if (response.ok) {
        const data = await response.json()
        setCurrentXP(data.currentXP || 0)
      }
    } catch (err) {
      console.error('Error loading current XP:', err)
    }
  }

  // Validate XP cost for changes
  const validateXP = async () => {
    try {
      setIsValidatingXP(true)
      setXpValidation(null)
      
      const response = await fetch('/api/user-profile/xp-validation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userAddress: address,
          currentUsername: originalProfile.username,
          currentEmoji: originalProfile.emoji,
          newUsername: profile.username,
          newEmoji: profile.emoji
        }),
      })

      const data = await response.json()
      setXpValidation(data)
      
      if (data.success && data.canProceed) {
        if (data.xpCost > 0) {
          setShowXPConfirmation(true)
        } else {
          // No XP cost, proceed directly
          handleSave()
        }
      }
    } catch (err) {
      console.error('Error validating XP:', err)
      setError('Failed to validate XP cost')
    } finally {
      setIsValidatingXP(false)
    }
  }

  const handleSave = async () => {
    try {
      setIsSaving(true)
      setError(null)
      setSuccess(false)
      setValidationErrors([])

      // Validate profile data
      const validation = validateProfile(profile)
      if (!validation.isValid) {
        setValidationErrors(validation.errors)
        return
      }

      const response = await fetch('/api/user-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          address,
          ...profile
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error('API Error:', errorData)
        throw new Error(errorData.details || errorData.error || 'Failed to save profile')
      }

      setSuccess(true)
      setTimeout(() => {
        onSuccess()
        onClose()
      }, 1500)
    } catch (err) {
      console.error('Error saving profile:', err)
      setError(err instanceof Error ? err.message : 'Failed to save profile')
    } finally {
      setIsSaving(false)
    }
  }

  const handleSaveClick = () => {
    // Check if username or emoji has changed
    const usernameChanged = profile.username !== originalProfile.username
    const emojiChanged = profile.emoji !== originalProfile.emoji
    
    if (usernameChanged || emojiChanged) {
      // Validate XP before saving
      validateXP()
    } else {
      // No username/emoji changes, save directly
      handleSave()
    }
  }

  const handleXPConfirmation = () => {
    setShowXPConfirmation(false)
    handleSave()
  }

  const handleInputChange = (field: keyof UserProfile, value: string) => {
    setProfile(prev => ({
      ...prev,
      [field]: value || null
    }))
  }

  const handleSkip = () => {
    onClose()
  }

  const handleDismissPermanently = () => {
    if (onDismissPermanently) {
      onDismissPermanently()
    }
    onClose()
  }

  if (success) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md glass-effect">
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="relative mb-4">
              <div className="w-16 h-16 bg-amber/20 rounded-full flex items-center justify-center pulse-glow">
                <Check className="w-8 h-8 text-amber" />
              </div>
            </div>
            <h3 className="text-xl font-semibold text-neutral mb-2">
              Profile Updated!
            </h3>
            <p className="text-muted-foreground mb-4">Your profile has been saved successfully.</p>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Zap className="w-4 h-4" />
              <span>You're all set to go!</span>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto glass-effect">
        <DialogHeader className="text-center pb-4">
          <div className="relative mb-3">
            <div className="w-12 h-12 bg-amber/20 rounded-full flex items-center justify-center mx-auto pulse-glow">
              <UserPlus className="w-6 h-6 text-amber" />
            </div>
          </div>
          <DialogTitle className="text-2xl font-semibold text-neutral">
            Complete Your Profile
          </DialogTitle>
          <DialogDescription className="text-muted-foreground mt-1">
            Add a username, emoji, and social links to personalize your experience.
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <Loader2 className="w-6 h-6 animate-spin mx-auto mb-3 text-amber" />
              <p className="text-muted-foreground">Loading your profile...</p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {error && (
              <Alert variant="destructive" className="glass-card border-red-500/30">
                <AlertDescription className="text-red-400">{error}</AlertDescription>
              </Alert>
            )}

            {validationErrors.length > 0 && (
              <Alert variant="destructive" className="glass-card border-red-500/30">
                <AlertDescription>
                  <ul className="list-disc list-inside space-y-1 text-red-400">
                    {validationErrors.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}

            {/* Essential Profile Section */}
            <div className="glass-card rounded-xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-amber/20 rounded-lg flex items-center justify-center">
                  <User className="w-4 h-4 text-amber" />
                </div>
                <h3 className="text-lg font-semibold text-neutral">Essential Info</h3>
                <Badge variant="secondary" className="bg-amber/20 text-amber border-amber/30">Required</Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Username with real-time validation */}
                <div className="space-y-2">
                  <Label htmlFor="username" className="text-sm font-medium text-neutral flex items-center gap-2">
                    <AtSign className="w-4 h-4 text-amber" />
                    Username
                  </Label>
                  <div className="relative">
                    <Input
                      id="username"
                      placeholder="Choose a unique username"
                      value={profile.username || ''}
                      onChange={(e) => handleInputChange('username', e.target.value)}
                      className={`pr-10 ${usernameValidation.isValid ? 'border-amber/50 focus:border-amber' : usernameValidation.error ? 'border-red-500/50 focus:border-red-500' : ''}`}
                    />
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      {usernameValidation.isChecking ? (
                        <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                      ) : usernameValidation.isValid ? (
                        <Check className="w-4 h-4 text-amber" />
                      ) : usernameValidation.error ? (
                        <X className="w-4 h-4 text-red-500" />
                      ) : null}
                    </div>
                  </div>
                  {usernameValidation.error && (
                    <p className="text-sm text-red-400">{usernameValidation.error}</p>
                  )}
                  {usernameValidation.isValid && (
                    <p className="text-sm text-amber flex items-center gap-1">
                      <Check className="w-3 h-3" />
                      Username is available!
                    </p>
                  )}
                </div>

                {/* Emoji Picker */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-neutral flex items-center gap-2">
                    <Smile className="w-4 h-4 text-amber" />
                    Emoji
                  </Label>
                  <EmojiPicker
                    value={profile.emoji || ''}
                    onChange={(emoji) => handleInputChange('emoji', emoji)}
                    placeholder="Pick your emoji"
                  />
                </div>
              </div>
            </div>

            {/* About Section */}
            <div className="glass-card rounded-xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-mint/20 rounded-lg flex items-center justify-center">
                  <Edit3 className="w-4 h-4 text-mint" />
                </div>
                <h3 className="text-lg font-semibold text-neutral">About You</h3>
                <Badge variant="outline" className="text-muted-foreground border-muted">Optional</Badge>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description" className="text-sm font-medium text-neutral">
                  Tell us about yourself
                </Label>
                <Textarea
                  id="description"
                  placeholder="Share your story, interests, or what you're passionate about..."
                  value={profile.description || ''}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={3}
                  className="resize-none"
                />
                <p className="text-xs text-muted-foreground">
                  {profile.description?.length || 0}/500 characters
                </p>
              </div>
            </div>

            {/* Social Links Section */}
            <div className="glass-card rounded-xl p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-lavender/20 rounded-lg flex items-center justify-center">
                    <Link2 className="w-4 h-4 text-lavender" />
                  </div>
                  <h3 className="text-lg font-semibold text-neutral">Social Links</h3>
                </div>
                <Badge variant="outline" className="text-muted-foreground border-muted">Optional</Badge>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* Website */}
                <div className="space-y-2">
                  <Label htmlFor="website" className="text-sm font-medium text-neutral flex items-center gap-2">
                    <Globe className="w-4 h-4 text-amber" />
                    Website
                  </Label>
                  <Input
                    id="website"
                    placeholder="https://yourwebsite.com"
                    value={profile.website || ''}
                    onChange={(e) => handleInputChange('website', e.target.value)}
                    className="focus:ring-2 focus:ring-amber/50"
                  />
                </div>

                {/* GitHub */}
                <div className="space-y-2">
                  <Label htmlFor="github" className="text-sm font-medium text-neutral flex items-center gap-2">
                    <Github className="w-4 h-4 text-amber" />
                    GitHub
                  </Label>
                  <Input
                    id="github"
                    placeholder="your-username"
                    value={profile.github || ''}
                    onChange={(e) => handleInputChange('github', e.target.value)}
                    className="focus:ring-2 focus:ring-amber/50"
                  />
                </div>

                {/* Twitter */}
                <div className="space-y-2">
                  <Label htmlFor="twitter" className="text-sm font-medium text-neutral flex items-center gap-2">
                    <Twitter className="w-4 h-4 text-amber" />
                    Twitter
                  </Label>
                  <Input
                    id="twitter"
                    placeholder="your-username"
                    value={profile.twitter || ''}
                    onChange={(e) => handleInputChange('twitter', e.target.value)}
                    className="focus:ring-2 focus:ring-amber/50"
                  />
                </div>

                {/* Telegram */}
                <div className="space-y-2">
                  <Label htmlFor="telegram" className="text-sm font-medium text-neutral flex items-center gap-2">
                    <MessageCircle className="w-4 h-4 text-amber" />
                    Telegram
                  </Label>
                  <Input
                    id="telegram"
                    placeholder="your-username"
                    value={profile.telegram || ''}
                    onChange={(e) => handleInputChange('telegram', e.target.value)}
                    className="focus:ring-2 focus:ring-amber/50"
                  />
                </div>

                {/* Discord */}
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="discord" className="text-sm font-medium text-neutral flex items-center gap-2">
                    <Hash className="w-4 h-4 text-amber" />
                    Discord
                  </Label>
                  <Input
                    id="discord"
                    placeholder="username#1234"
                    value={profile.discord || ''}
                    onChange={(e) => handleInputChange('discord', e.target.value)}
                    className="focus:ring-2 focus:ring-amber/50"
                  />
                </div>
              </div>
            </div>

            {/* XP Cost Information */}
            {xpValidation && !xpValidation.canProceed && (
              <Alert variant="destructive" className="glass-card border-red-500/30">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription className="text-red-400">
                  <div className="space-y-2">
                    <p className="font-semibold">{xpValidation.error}</p>
                    <p>{xpValidation.details}</p>
                    <div className="flex items-center gap-2 text-sm">
                      <Coins className="w-4 h-4" />
                      <span>Current XP: {currentXP}</span>
                      <span>•</span>
                      <span>Required: {xpValidation.requiredXP}</span>
                      <span>•</span>
                      <span>Shortfall: {xpValidation.shortfall}</span>
                    </div>
                  </div>
                </AlertDescription>
              </Alert>
            )}

            {/* XP Cost Display */}
            {xpValidation && xpValidation.canProceed && xpValidation.xpCost > 0 && (
              <Alert className="glass-card border-amber/30 bg-amber/5">
                <Coins className="h-4 w-4 text-amber" />
                <AlertDescription>
                  <div className="space-y-2">
                    <p className="font-semibold text-amber">
                      Profile Update Cost: {xpValidation.xpCost} XP
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {xpValidation.xpCost === 100 
                        ? "First time setting username/emoji costs 100 XP"
                        : "Updating existing username/emoji costs 500 XP"
                      }
                    </p>
                    <div className="flex items-center gap-2 text-sm">
                      <span>Current XP: {currentXP}</span>
                      <span>•</span>
                      <span>After update: {currentXP - xpValidation.xpCost}</span>
                    </div>
                  </div>
                </AlertDescription>
              </Alert>
            )}

            {/* Action Buttons */}
            <div className="glass-card rounded-xl p-5">
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={handleSaveClick}
                  disabled={isSaving || isValidatingXP || !usernameValidation.isValid}
                  className="flex-1 bg-amber hover:bg-amber/90 text-charcoal font-semibold py-2.5 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : isValidatingXP ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Validating XP...
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      Save Profile
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={handleSkip}
                  disabled={isSaving || isValidatingXP}
                  className="flex-1 border-amber/30 hover:border-amber/50 text-neutral font-semibold py-2.5 rounded-lg hover:bg-amber/10 transition-all duration-200"
                >
                  Skip for Now
                </Button>
              </div>
              <div className="flex items-center justify-between mt-3">
                <p className="text-sm text-muted-foreground">
                  All fields are optional - you can always update your profile later!
                </p>
                {onDismissPermanently && (
                  <button
                    onClick={handleDismissPermanently}
                    className="text-xs text-muted-foreground hover:text-neutral transition-colors underline"
                  >
                    Don't show again
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )

  // XP Confirmation Dialog
  if (showXPConfirmation && xpValidation) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md glass-effect">
          <DialogHeader className="text-center pb-4">
            <div className="relative mb-3">
              <div className="w-12 h-12 bg-amber/20 rounded-full flex items-center justify-center mx-auto pulse-glow">
                <Coins className="w-6 h-6 text-amber" />
              </div>
            </div>
            <DialogTitle className="text-2xl font-semibold text-neutral">
              Confirm XP Spending
            </DialogTitle>
            <DialogDescription className="text-muted-foreground mt-1">
              This profile update will cost you XP
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <Alert className="glass-card border-amber/30 bg-amber/5">
              <Coins className="h-4 w-4 text-amber" />
              <AlertDescription>
                <div className="space-y-2">
                  <p className="font-semibold text-amber">
                    Cost: {xpValidation?.xpCost} XP
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {xpValidation?.xpCost === 100 
                      ? "First time setting username/emoji"
                      : "Updating existing username/emoji"
                    }
                  </p>
                </div>
              </AlertDescription>
            </Alert>

            <div className="glass-card rounded-xl p-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Current XP:</span>
                <span className="font-semibold">{currentXP}</span>
              </div>
              <div className="flex items-center justify-between text-sm mt-2">
                <span className="text-muted-foreground">After update:</span>
                <span className="font-semibold text-amber">
                  {currentXP - (xpValidation?.xpCost || 0)}
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={handleXPConfirmation}
                className="flex-1 bg-amber hover:bg-amber/90 text-charcoal font-semibold py-2.5 rounded-lg transition-all duration-200"
              >
                <Coins className="w-4 h-4 mr-2" />
                Confirm & Spend XP
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowXPConfirmation(false)}
                className="flex-1 border-amber/30 hover:border-amber/50 text-neutral font-semibold py-2.5 rounded-lg hover:bg-amber/10 transition-all duration-200"
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    )
  }
}
