// components/QuestOfDay.tsx
'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useWallet } from '@alephium/web3-react'
import { supabase } from '@/lib/supabaseClient'
import {
  Card, CardHeader, CardTitle, CardContent,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Flame, Calendar, Users, ArrowRight,
  CheckCircle2, Clock, XCircle, Loader2,
  Trophy, Zap, Target, Star, Activity, Wallet, Layers, Award, Code,
  ExternalLink, Info, AlertCircle, CheckCircle, Eye, EyeOff, Plus, Minus,
  Share2, Twitter, Copy, Check
} from 'lucide-react'

interface Quest {
  id: number
  title: string
  description: string
  xp_reward: number
  partner_name: string
  start_at: string
  end_at?: string | null
}

interface Submission {
  id: number
  quest_id: number
  proof_url: string
  proof_data: any
  status: 'pending' | 'approved' | 'rejected'
  review_notes?: string | null
  submitted_at: string
}

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

// Returns a Lucide icon component based on quest title
function getQuestIcon(title: string) {
  const t = title.toLowerCase()
  if (t.includes('contract')) return <Code className="w-5 h-5 text-amber" />
  if (t.includes('transaction')) return <Activity className="w-5 h-5 text-amber" />
  if (t.includes('hold') || t.includes('wallet')) return <Wallet className="w-5 h-5 text-amber" />
  if (t.includes('defi') || t.includes('protocol')) return <Layers className="w-5 h-5 text-amber" />
  if (t.includes('governance')) return <Award className="w-5 h-5 text-amber" />
  if (t.includes('refer') || t.includes('community')) return <Users className="w-5 h-5 text-amber" />
  if (t.includes('score') || t.includes('leaderboard')) return <Trophy className="w-5 h-5 text-amber" />
  if (t.includes('speed') || t.includes('fast')) return <Zap className="w-5 h-5 text-amber" />
  if (t.includes('star')) return <Star className="w-5 h-5 text-amber" />
  return <Flame className="w-5 h-5 text-amber" />
}

// Status badge component
function StatusBadge({ status, reviewNotes }: { status: string, reviewNotes?: string | null }) {
  const statusConfig = {
    pending: { color: 'bg-amber/20 text-amber border-amber/30', icon: Clock },
    approved: { color: 'bg-green/20 text-green border-green/30', icon: CheckCircle2 },
    rejected: { color: 'bg-red/20 text-red border-red/30', icon: XCircle }
  }
  
  const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending
  const Icon = config.icon

  return (
    <div className="flex items-center gap-2">
      <Badge className={`${config.color} border`}>
        <Icon className="w-3 h-3 mr-1" />
        {status}
      </Badge>
      {status === 'rejected' && reviewNotes && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <Info className="w-4 h-4 text-red/70 cursor-help" />
            </TooltipTrigger>
            <TooltipContent className="max-w-xs">
              <p className="text-sm">{reviewNotes}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </div>
  )
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

// Share functionality component
function ShareQuest({ quest }: { quest: Quest }) {
  const [showShareOptions, setShowShareOptions] = useState(false)
  const [copied, setCopied] = useState(false)

  const questUrl = `${window.location.origin}/quests/${quest.id}`
  
  const shareText = `🔥 New Quest Alert! 🚀\n\n${quest.title}\n${quest.description}\n\n💰 XP Reward: ${quest.xp_reward} XP\n🏢 Partner: ${quest.partner_name}\n\nJoin the challenge: ${questUrl}\n\n#AlphIQ #Quest #Web3 #Alephium`

  const shareToTwitter = () => {
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`
    window.open(twitterUrl, '_blank', 'width=600,height=400')
    setShowShareOptions(false)
  }

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareText)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy: ', err)
    }
  }

  const shareToSocial = (platform: string) => {
    let shareUrl = ''
    
    switch (platform) {
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`
        break
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(questUrl)}&title=${encodeURIComponent(quest.title)}&summary=${encodeURIComponent(quest.description)}`
        break
      case 'telegram':
        shareUrl = `https://t.me/share/url?url=${encodeURIComponent(questUrl)}&text=${encodeURIComponent(shareText)}`
        break
      case 'discord':
        // Discord doesn't have a direct share URL, so we'll copy the text
        copyToClipboard()
        return
      default:
        return
    }
    
    window.open(shareUrl, '_blank', 'width=600,height=400')
    setShowShareOptions(false)
  }

  return (
    <div className="relative">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowShareOptions(!showShareOptions)}
              className="h-8 w-8 p-0 hover:bg-amber/10"
            >
              <Share2 className="w-4 h-4 text-neutral/60 hover:text-amber" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p className="text-sm">Share this quest</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      {showShareOptions && (
        <div className="absolute top-full right-0 mt-2 bg-card/95 border border-white/20 rounded-lg shadow-lg backdrop-blur-sm z-10 min-w-[200px]">
          <div className="p-3 space-y-2">
            <div className="text-xs font-medium text-neutral/80 mb-2">Share Quest</div>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => shareToSocial('twitter')}
              className="w-full justify-start text-xs hover:bg-blue/10"
            >
              <Twitter className="w-4 h-4 mr-2 text-blue/70" />
              Share on X (Twitter)
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => shareToSocial('telegram')}
              className="w-full justify-start text-xs hover:bg-blue/10"
            >
              <ExternalLink className="w-4 h-4 mr-2 text-blue/70" />
              Share on Telegram
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => shareToSocial('discord')}
              className="w-full justify-start text-xs hover:bg-purple/10"
            >
              <ExternalLink className="w-4 h-4 mr-2 text-purple/70" />
              Copy for Discord
            </Button>
            
            <Separator className="bg-white/10" />
            
            <Button
              variant="ghost"
              size="sm"
              onClick={copyToClipboard}
              className="w-full justify-start text-xs hover:bg-green/10"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 mr-2 text-green/70" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 mr-2 text-neutral/60" />
                  Copy Text
                </>
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

export function QuestOfDay() {
  const { account } = useWallet()
  const userAddress = typeof account === 'string' ? account : account?.address || null

  const [quests, setQuests] = useState<Quest[]>([])
  const [subs, setSubs] = useState<Record<number, Submission>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [openForm, setOpenForm] = useState<number | null>(null)
  const [proofUrl, setProofUrl] = useState('')
  const [participationData, setParticipationData] = useState<ParticipationData>({})
  const [submitting, setSubmitting] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [activeTab, setActiveTab] = useState('transaction')

  useEffect(() => {
    async function init() {
      setLoading(true)
      setError(null)

      // 1) load active quests
      const { data: qData, error: qErr } = await supabase
        .from('admin_quests')
        .select(`
          id, title, description, xp_reward, start_at, end_at,
          admin_user_profiles(partner_name)
        `)
        .eq('is_active', true)
        .order('start_at', { ascending: true })

      if (qErr) {
        setError('Failed to load challenges.')
        setLoading(false)
        return
      }
      setQuests(qData!.map(q => ({
        id: q.id,
        title: q.title,
        description: q.description,
        xp_reward: q.xp_reward,
        start_at: q.start_at,
        end_at: q.end_at,
        partner_name: q.admin_user_profiles?.partner_name || 'Unknown',
      })))

      // 2) load user submissions
      if (userAddress) {
        const { data: sData } = await supabase
          .from('admin_quest_submissions')
          .select('id, quest_id, proof_url, proof_data, status, review_notes, submitted_at')
          .eq('user_address', userAddress)
        setSubs(Object.fromEntries(sData!.map(s => [s.quest_id, s])))
      }

      setLoading(false)
    }
    init()
  }, [userAddress])

  const handleSubmit = async (questId: number) => {
    if (!proofUrl.trim()) {
      setError('Proof URL is required.')
      return
    }

    if (!isValidUrl(proofUrl.trim())) {
      setError('Please provide a valid URL for proof.')
      return
    }
    
    setSubmitting(true)
    setError(null)

    try {
      const submissionData: any = {
        quest_id: questId,
        user_address: userAddress,
        proof_url: proofUrl.trim(),
      }

      // Only include proof_data if there's actual data
      const hasData = Object.values(participationData).some(section => 
        section && typeof section === 'object' && Object.keys(section).length > 0
      )

      if (hasData) {
        submissionData.proof_data = participationData
      }

      const { data: newSub, error: subErr } = await supabase
        .from('admin_quest_submissions')
        .insert(submissionData)
        .select('id, quest_id, proof_url, proof_data, status, review_notes, submitted_at')
        .single()

      if (subErr) throw subErr
      setSubs(prev => ({ ...prev, [questId]: newSub! }))
      setOpenForm(null)
      setProofUrl('')
      setParticipationData({})
      setActiveTab('transaction')
    } catch (e: any) {
      setError(e.message || 'Submission failed.')
    } finally {
      setSubmitting(false)
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
    setOpenForm(null)
    setError(null)
    setProofUrl('')
    setParticipationData({})
    setActiveTab('transaction')
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-3 animate-pulse">
          <div className="w-8 h-8 bg-amber/20 rounded-lg" />
          <div className="h-8 bg-white/20 rounded w-48" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2].map(i => (
            <Card key={i} className="bg-card/20 border-white/10 backdrop-blur-sm p-6 animate-pulse">
              <div className="space-y-4">
                <div className="h-6 bg-white/20 rounded w-3/4" />
                <div className="h-4 bg-white/20 rounded w-full" />
                <div className="h-4 bg-white/20 rounded w-2/3" />
                <div className="h-10 bg-white/20 rounded w-1/3" />
              </div>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (!quests.length) {
    return (
      <Card className="bg-card/20 border-white/10 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-neutral/80 flex items-center gap-2">
            <Flame className="w-5 h-5" />
            No Live Challenges
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-neutral/70">Stay tuned for upcoming quests!</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <section className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-amber/10 rounded-lg">
            <Flame className="w-6 h-6 text-amber" />
          </div>
          <div>
            <h2 className="text-2xl font-semibold text-neutral">Live Challenges</h2>
            <p className="text-sm text-neutral/60">Complete quests to earn XP and rewards</p>
          </div>
        </div>
        <Link href="/quests">
          <Button variant="ghost" size="sm" className="flex items-center space-x-2 hover:bg-amber/10">
            <span>View All</span>
            <ArrowRight className="w-4 h-4" />
          </Button>
        </Link>
      </div>

      {/* Quest Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {quests.map(quest => {
          const sub = subs[quest.id]
          const start = new Date(quest.start_at).toLocaleDateString(undefined, {
            month: 'short', day: 'numeric', year: 'numeric'
          })
          const end = quest.end_at
            ? new Date(quest.end_at).toLocaleDateString(undefined, {
                month: 'short', day: 'numeric', year: 'numeric'
              })
            : 'Ongoing'

          return (
            <Card
              key={quest.id}
              className="bg-card/20 border-white/10 backdrop-blur-sm hover:bg-card/30 transition-all duration-200 group"
            >
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-amber/10 rounded-lg group-hover:bg-amber/20 transition-colors">
                      {getQuestIcon(quest.title)}
                    </div>
                    <div>
                      <CardTitle className="text-lg text-neutral">{quest.title}</CardTitle>
                      <p className="text-sm text-neutral/60 mt-1">{quest.partner_name}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className="bg-amber/20 text-amber border-amber/30">
                      +{quest.xp_reward} XP
                    </Badge>
                    <ShareQuest quest={quest} />
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Description */}
                <p className="text-sm text-neutral/70 leading-relaxed">{quest.description}</p>

                {/* Meta Info */}
                <div className="flex items-center justify-between text-xs text-neutral/50">
                  <div className="flex items-center space-x-1">
                    <Calendar className="w-4 h-4" />
                    <span>{start} – {end}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Users className="w-4 h-4" />
                    <span>{quest.partner_name}</span>
                  </div>
                </div>

                <Separator className="bg-white/10" />

                {/* Submission Status or Form */}
                {sub ? (
                  <div className="space-y-3">
                    <StatusBadge status={sub.status} reviewNotes={sub.review_notes} />
                    <div className="text-xs text-neutral/50">
                      Submitted: {new Date(sub.submitted_at).toLocaleDateString()}
                    </div>
                    {sub.proof_data && (
                      <div className="text-xs">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowPreview(!showPreview)}
                          className="h-6 px-2 text-xs"
                        >
                          {showPreview ? <EyeOff className="w-3 h-3 mr-1" /> : <Eye className="w-3 h-3 mr-1" />}
                          {showPreview ? 'Hide' : 'Show'} Additional Data
                        </Button>
                        {showPreview && (
                          <pre className="mt-2 p-2 bg-background/50 rounded text-xs overflow-auto max-h-32">
                            {JSON.stringify(sub.proof_data, null, 2)}
                          </pre>
                        )}
                      </div>
                    )}
                  </div>
                ) : openForm === quest.id ? (
                  <div className="space-y-4">
                    {error && (
                      <Alert className="border-red/20 bg-red/10">
                        <AlertCircle className="h-4 w-4 text-red" />
                        <AlertDescription className="text-red/80">{error}</AlertDescription>
                      </Alert>
                    )}

                    {/* Proof URL Input */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-neutral flex items-center gap-2">
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
                      </label>
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
                              <XCircle className="w-3 h-3 text-red/70" />
                              <span className="text-red/70">Invalid URL format</span>
                            </>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Additional Data Tabs */}
                    <div className="space-y-3">
                      <label className="text-sm font-medium text-neutral flex items-center gap-2">
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
                      </label>
                      
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
                        onClick={() => handleSubmit(quest.id)}
                        disabled={submitting || !proofUrl.trim() || !isValidUrl(proofUrl.trim())}
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
                ) : (
                  <Button
                    onClick={() => {
                      setOpenForm(quest.id)
                      setError(null)
                    }}
                    className="w-full bg-amber hover:bg-amber/80 text-charcoal font-medium"
                  >
                    <Target className="w-4 h-4 mr-2" />
                    Participate Now
                  </Button>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>
    </section>
  )
}
