'use client'

import React, { useState } from 'react'
import { Quest } from '@/hooks/useQuest'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  X,
  Send,
  Loader2,
  AlertCircle,
  CheckCircle,
  Target,
  Info,
  Minus,
  Eye,
  EyeOff,
} from 'lucide-react'

// Structured participation data interface
interface ParticipationData {
  transaction_details?: {
    hash?: string
    block_number?: number
    gas_used?: string
    timestamp?: string
  }
  social_media?: {
    platform?: string
    post_url?: string
    username?: string
  }
  wallet_info?: {
    address?: string
    balance?: string
    tokens_held?: string[]
  }
  additional_context?: {
    description?: string
    screenshots?: string[]
    notes?: string
  }
}

// URL validation function
function isValidUrl(url: string): boolean {
  try {
    const urlObj = new URL(url)
    return ['http:', 'https:'].includes(urlObj.protocol)
  } catch {
    return false
  }
}

// Get URL preview data
function getUrlPreview(url: string) {
  if (!isValidUrl(url)) return null
  
  try {
    const urlObj = new URL(url)
    return {
      domain: urlObj.hostname,
      path: urlObj.pathname,
      protocol: urlObj.protocol
    }
  } catch {
    return null
  }
}

interface QuestSubmissionProps {
  quest: Quest
  onSubmit: (submissionData: { proofUrl: string; participationData: ParticipationData }) => Promise<boolean>
  onCancel: () => void
  submitting: boolean
}

export default function QuestSubmission({ 
  quest, 
  onSubmit, 
  onCancel, 
  submitting 
}: QuestSubmissionProps) {
  const [proofUrl, setProofUrl] = useState('')
  const [participationData, setParticipationData] = useState<ParticipationData>({})
  const [error, setError] = useState<string | null>(null)
  const [showPreview, setShowPreview] = useState(false)
  const [activeTab, setActiveTab] = useState('transaction')

  const handleSubmit = async () => {
    if (!proofUrl.trim()) {
      setError('Proof URL is required.')
      return
    }

    if (!isValidUrl(proofUrl.trim())) {
      setError('Please provide a valid URL for proof.')
      return
    }
    
    setError(null)
    const success = await onSubmit({
      proofUrl: proofUrl.trim(),
      participationData
    })
    
    if (success) {
      setProofUrl('')
      setParticipationData({})
      setActiveTab('transaction')
    }
  }

  const updateParticipationData = (section: keyof ParticipationData, field: string, value: string) => {
    setParticipationData(prev => {
      const currentSection = prev[section] as Record<string, any> || {}
      return {
        ...prev,
        [section]: {
          ...currentSection,
          [field]: value
        }
      }
    })
  }

  const removeParticipationData = (section: keyof ParticipationData, field: string) => {
    setParticipationData(prev => {
      const currentSection = prev[section] as Record<string, any> || {}
      const newSection = { ...currentSection }
      delete newSection[field]
      
      if (Object.keys(newSection).length === 0) {
        const newData = { ...prev }
        delete newData[section]
        return newData
      }
      
      return {
        ...prev,
        [section]: newSection
      }
    })
  }

  const resetForm = () => {
    setError(null)
    setProofUrl('')
    setParticipationData({})
    setActiveTab('transaction')
  }

  const isSubmitDisabled = !proofUrl.trim() || !isValidUrl(proofUrl.trim()) || submitting

  return (
    <Dialog open={true} onOpenChange={() => onCancel()}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-bold text-neutral">
              Submit Quest Entry
            </DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={onCancel}
              className="text-neutral/50 hover:text-neutral"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Quest Summary */}
          <div className="bg-card/50 p-4 rounded-lg border border-white/10">
            <div className="flex items-start justify-between mb-3">
              <h3 className="font-semibold text-neutral">{quest.title}</h3>
              <Badge className="bg-amber text-charcoal">
                💎 {quest.xp_reward} XP
              </Badge>
            </div>
            <p className="text-sm text-neutral/70 mb-3">{quest.description}</p>
            <div className="flex items-center space-x-4 text-xs text-neutral/50">
              <span>📅 {new Date(quest.start_at).toLocaleDateString()} – {quest.end_at ? new Date(quest.end_at).toLocaleDateString() : 'Ongoing'}</span>
              <span>👥 {quest.partner_name}</span>
              {quest.multiplier > 1 && (
                <span>🚀 ×{quest.multiplier}</span>
              )}
            </div>
          </div>

          <Separator />

          {/* Error Message */}
          {error && (
            <Alert className="border-red/20 bg-red/10">
              <AlertCircle className="h-4 w-4 text-red" />
              <AlertDescription className="text-red/80">{error}</AlertDescription>
            </Alert>
          )}

          {/* Proof URL Input */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-neutral flex items-center gap-2">
              Proof URL <span className="text-red">*</span>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="w-4 h-4 text-neutral/50" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-sm">Provide a direct link to your proof (screenshot, transaction, etc.)</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </Label>
            <Input
              placeholder="https://example.com/proof.png"
              value={proofUrl}
              onChange={e => setProofUrl(e.target.value)}
              className={`bg-background/50 border-white/20 focus:border-amber/50 focus:ring-amber/20 ${
                proofUrl && !isValidUrl(proofUrl) ? 'border-red/50' : ''
              }`}
            />
            {proofUrl && (
              <div className="flex items-center space-x-2 text-xs">
                {isValidUrl(proofUrl) ? (
                  <>
                    <CheckCircle className="w-3 h-3 text-green/70" />
                    <span className="text-green/70">Valid URL</span>
                    {getUrlPreview(proofUrl) && (
                      <>
                        <span className="text-neutral/40">•</span>
                        <span className="text-neutral/60">{getUrlPreview(proofUrl)?.domain}</span>
                        <span className="text-neutral/40">•</span>
                        <span className="text-neutral/60">{getUrlPreview(proofUrl)?.path}</span>
                      </>
                    )}
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-3 h-3 text-red/70" />
                    <span className="text-red/70">Invalid URL format</span>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Additional Data Tabs */}
          <div className="space-y-3">
            <Label className="text-sm font-medium text-neutral flex items-center gap-2">
              Additional Data (Optional)
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="w-4 h-4 text-neutral/50" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-sm">Add structured data to provide more context for your submission</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </Label>
            
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-4 bg-background/30">
                <TabsTrigger value="transaction" className="text-xs">Transaction</TabsTrigger>
                <TabsTrigger value="social" className="text-xs">Social</TabsTrigger>
                <TabsTrigger value="wallet" className="text-xs">Wallet</TabsTrigger>
                <TabsTrigger value="context" className="text-xs">Context</TabsTrigger>
              </TabsList>
              
              <TabsContent value="transaction" className="space-y-3 mt-3">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs text-neutral/70">Transaction Hash</label>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeParticipationData('transaction_details', 'hash')}
                      className="h-4 w-4 p-0 text-neutral/50 hover:text-red/70"
                    >
                      <Minus className="w-3 h-3" />
                    </Button>
                  </div>
                  <Input
                    placeholder="0x..."
                    value={participationData.transaction_details?.hash || ''}
                    onChange={e => updateParticipationData('transaction_details', 'hash', e.target.value)}
                    className="bg-background/30 border-white/10 text-xs"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-xs text-neutral/70">Block Number</label>
                    <Input
                      placeholder="12345"
                      value={participationData.transaction_details?.block_number || ''}
                      onChange={e => updateParticipationData('transaction_details', 'block_number', e.target.value)}
                      className="bg-background/30 border-white/10 text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-neutral/70">Gas Used</label>
                    <Input
                      placeholder="21000"
                      value={participationData.transaction_details?.gas_used || ''}
                      onChange={e => updateParticipationData('transaction_details', 'gas_used', e.target.value)}
                      className="bg-background/30 border-white/10 text-xs"
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="social" className="space-y-3 mt-3">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs text-neutral/70">Platform</label>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeParticipationData('social_media', 'platform')}
                      className="h-4 w-4 p-0 text-neutral/50 hover:text-red/70"
                    >
                      <Minus className="w-3 h-3" />
                    </Button>
                  </div>
                  <Input
                    placeholder="Twitter, Discord, etc."
                    value={participationData.social_media?.platform || ''}
                    onChange={e => updateParticipationData('social_media', 'platform', e.target.value)}
                    className="bg-background/30 border-white/10 text-xs"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-xs text-neutral/70">Post URL</label>
                  <Input
                    placeholder="https://twitter.com/user/status/..."
                    value={participationData.social_media?.post_url || ''}
                    onChange={e => updateParticipationData('social_media', 'post_url', e.target.value)}
                    className="bg-background/30 border-white/10 text-xs"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-xs text-neutral/70">Username</label>
                  <Input
                    placeholder="@username"
                    value={participationData.social_media?.username || ''}
                    onChange={e => updateParticipationData('social_media', 'username', e.target.value)}
                    className="bg-background/30 border-white/10 text-xs"
                  />
                </div>
              </TabsContent>

              <TabsContent value="wallet" className="space-y-3 mt-3">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs text-neutral/70">Wallet Address</label>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeParticipationData('wallet_info', 'address')}
                      className="h-4 w-4 p-0 text-neutral/50 hover:text-red/70"
                    >
                      <Minus className="w-3 h-3" />
                    </Button>
                  </div>
                  <Input
                    placeholder="0x..."
                    value={participationData.wallet_info?.address || ''}
                    onChange={e => updateParticipationData('wallet_info', 'address', e.target.value)}
                    className="bg-background/30 border-white/10 text-xs"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-xs text-neutral/70">Balance</label>
                  <Input
                    placeholder="1.5 ALPH"
                    value={participationData.wallet_info?.balance || ''}
                    onChange={e => updateParticipationData('wallet_info', 'balance', e.target.value)}
                    className="bg-background/30 border-white/10 text-xs"
                  />
                </div>
              </TabsContent>

              <TabsContent value="context" className="space-y-3 mt-3">
                <div className="space-y-2">
                  <label className="text-xs text-neutral/70">Description</label>
                  <Textarea
                    placeholder="Additional context about your participation..."
                    value={participationData.additional_context?.description || ''}
                    onChange={e => updateParticipationData('additional_context', 'description', e.target.value)}
                    rows={3}
                    className="bg-background/30 border-white/10 text-xs"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-xs text-neutral/70">Notes</label>
                  <Textarea
                    placeholder="Any additional notes or observations..."
                    value={participationData.additional_context?.notes || ''}
                    onChange={e => updateParticipationData('additional_context', 'notes', e.target.value)}
                    rows={2}
                    className="bg-background/30 border-white/10 text-xs"
                  />
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-2 pt-2">
            <Button
              onClick={handleSubmit}
              disabled={isSubmitDisabled}
              className="flex-1 bg-amber hover:bg-amber/80 text-charcoal"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Target className="w-4 h-4 mr-2" />
                  Submit Proof
                </>
              )}
            </Button>
            <Button
              variant="outline"
              onClick={resetForm}
              className="border-white/20 hover:bg-white/10"
            >
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
