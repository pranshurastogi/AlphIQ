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
import {
  Flame, Calendar, Users, ArrowRight,
  CheckCircle2, Clock, XCircle, Loader2,
  Trophy, Zap, Target, Star, Activity, Wallet, Layers, Award, Code,
  ExternalLink, Info, AlertCircle, CheckCircle, Eye, EyeOff
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

export function QuestOfDay() {
  const { account } = useWallet()
  const userAddress = typeof account === 'string' ? account : account?.address || null

  const [quests, setQuests] = useState<Quest[]>([])
  const [subs, setSubs] = useState<Record<number, Submission>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [openForm, setOpenForm] = useState<number | null>(null)
  const [proofUrl, setProofUrl] = useState('')
  const [proofData, setProofData] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [showPreview, setShowPreview] = useState(false)

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
        partner_name: q.admin_user_profiles.partner_name,
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
    
    setSubmitting(true)
    setError(null)

    try {
      const submissionData: any = {
        quest_id: questId,
        user_address: userAddress,
        proof_url: proofUrl.trim(),
      }

      // Only include proof_data if it's valid JSON
      if (proofData.trim()) {
        try {
          const parsedData = JSON.parse(proofData.trim())
          submissionData.proof_data = parsedData
        } catch (e) {
          setError('Invalid JSON format in additional data.')
          setSubmitting(false)
          return
        }
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
      setProofData('')
    } catch (e: any) {
      setError(e.message || 'Submission failed.')
    } finally {
      setSubmitting(false)
    }
  }

  const validateUrl = (url: string) => {
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  }

  const getUrlPreview = (url: string) => {
    if (!validateUrl(url)) return null
    
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
                  <Badge className="bg-amber/20 text-amber border-amber/30">
                    +{quest.xp_reward} XP
                  </Badge>
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
                        className="bg-background/50 border-white/20 focus:border-amber/50 focus:ring-amber/20"
                      />
                      {proofUrl && getUrlPreview(proofUrl) && (
                        <div className="flex items-center space-x-2 text-xs text-neutral/60 bg-background/30 rounded p-2">
                          <ExternalLink className="w-3 h-3" />
                          <span>{getUrlPreview(proofUrl)?.domain}</span>
                          <span className="text-neutral/40">•</span>
                          <span>{getUrlPreview(proofUrl)?.path}</span>
                        </div>
                      )}
                    </div>

                    {/* Additional Data Input */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-neutral flex items-center gap-2">
                        Additional Data (Optional)
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger>
                              <Info className="w-4 h-4 text-neutral/50" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="text-sm">Add extra context in JSON format (e.g., transaction details, metadata)</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </label>
                      <Textarea
                        placeholder='{"transaction_hash": "0x...", "block_number": 12345, "notes": "Additional context"}'
                        value={proofData}
                        onChange={e => setProofData(e.target.value)}
                        rows={4}
                        className="bg-background/50 border-white/20 focus:border-amber/50 focus:ring-amber/20 font-mono text-xs"
                      />
                      {proofData && (
                        <div className="text-xs text-neutral/60">
                          {(() => {
                            try {
                              JSON.parse(proofData)
                              return <span className="text-green/70">✓ Valid JSON</span>
                            } catch {
                              return <span className="text-red/70">✗ Invalid JSON</span>
                            }
                          })()}
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex space-x-2 pt-2">
                      <Button
                        onClick={() => handleSubmit(quest.id)}
                        disabled={submitting || !proofUrl.trim()}
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
                        onClick={() => {
                          setOpenForm(null)
                          setError(null)
                          setProofUrl('')
                          setProofData('')
                        }}
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
