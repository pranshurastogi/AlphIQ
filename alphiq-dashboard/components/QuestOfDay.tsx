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
import {
  Flame, Calendar, Users, ArrowRight,
  CheckCircle2, Clock, XCircle, Loader2,
  Trophy, Zap, Target, Star, Activity, Wallet, Layers, Award, Code
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
  status: 'pending' | 'approved' | 'rejected'
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

export function QuestOfDay() {
  const { account } = useWallet()
  const userAddress = typeof account === 'string' ? account : account?.address || null

  const [quests, setQuests] = useState<Quest[]>([])
  const [subs, setSubs] = useState<Record<number, Submission>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [openForm, setOpenForm] = useState<number | null>(null)
  const [proofUrl, setProofUrl] = useState('')
  const [proofData, setProofData] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => setProofData(reader.result as string)
    reader.readAsDataURL(file)
  }

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
          .select('id, quest_id, proof_url, status')
          .eq('user_address', userAddress)
        setSubs(Object.fromEntries(sData!.map(s => [s.quest_id, s])))
      }

      setLoading(false)
    }
    init()
  }, [userAddress])

  const handleSubmit = async (questId: number) => {
    if (!proofUrl && !proofData) {
      setError('Please provide either a proof URL or upload a file.')
      return
    }
    setSubmitting(true)
    setError(null)

    try {
      const { data: newSub, error: subErr } = await supabase
        .from('admin_quest_submissions')
        .insert({
          quest_id: questId,
          user_address: userAddress,
          proof_url: proofUrl || null,
          proof_data: proofData,
        })
        .select('id, quest_id, proof_url, status')
        .single()

      if (subErr) throw subErr
      setSubs(prev => ({ ...prev, [questId]: newSub! }))
      setOpenForm(null)
      setProofUrl('')
      setProofData(null)
    } catch (e: any) {
      setError(e.message || 'Submission failed.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center space-x-2 animate-pulse">
          <Loader2 className="w-6 h-6 text-amber" />
          <h2 className="text-2xl font-bold text-neutral">Live Challenges</h2>
        </div>
        <Card className="bg-card/10 border-white/10 backdrop-blur-sm p-4 animate-pulse">
          <div className="h-4 bg-white/20 rounded w-2/3 mb-2" />
          <div className="h-4 bg-white/20 rounded w-1/2" />
        </Card>
      </div>
    )
  }

  if (!quests.length) {
    return (
      <Card className="bg-card/50 border-white/10 backdrop-blur-sm p-4">
        <CardHeader>
          <CardTitle className="text-neutral/80">No Live Challenges</CardTitle>
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
        <div className="flex items-center space-x-2">
          <Flame className="w-6 h-6 text-amber" />
          <h2 className="text-2xl font-semibold text-neutral">Live Challenges</h2>
        </div>
        <Link href="/quests">
          <Button variant="ghost" size="sm" className="flex items-center space-x-1">
            <span>All Challenges</span>
            <ArrowRight className="w-4 h-4 text-neutral/70" />
          </Button>
        </Link>
      </div>

      {/* Quest Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              className="bg-card/50 border-white/10 backdrop-blur-sm p-4 flex flex-col hover:shadow-lg transition"
            >
              {/* Title & XP */}
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center space-x-1">
                  {getQuestIcon(quest.title)}
                  <span className="text-lg font-medium text-neutral">{quest.title}</span>
                </div>
                <Badge className="bg-amber text-charcoal">+{quest.xp_reward}</Badge>
              </div>

              {/* Description */}
              <p className="text-sm text-neutral/70 mb-4 flex-1">{quest.description}</p>

              {/* Meta */}
              <div className="flex items-center justify-between text-xs text-neutral/50 mb-4">
                <div className="flex items-center space-x-1">
                  <Calendar className="w-4 h-4" />
                  <span>{start} – {end}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Users className="w-4 h-4" />
                  <span>{quest.partner_name}</span>
                </div>
              </div>

              {/* Submission Status or Form */}
              {sub ? (
                <div className="flex items-center space-x-2 text-sm capitalize">
                  {sub.status === 'approved' && <CheckCircle2 className="w-5 h-5 text-mint" />}
                  {sub.status === 'rejected' && <XCircle className="w-5 h-5 text-red-500" />}
                  {sub.status === 'pending' && <Clock className="w-5 h-5 text-amber" />}
                  <span>{sub.status}</span>
                </div>
              ) : openForm === quest.id ? (
                <div className="space-y-2">
                  {error && <p className="text-sm text-red/70">{error}</p>}
                  <Input
                    placeholder="Proof URL (e.g. IPFS link)"
                    value={proofUrl}
                    onChange={e => setProofUrl(e.target.value)}
                  />
                  <Input type="file" onChange={handleFileChange} />
                  <Textarea
                    placeholder="Additional notes (optional)"
                    rows={2}
                    value={proofData || ''}
                    onChange={e => setProofData(e.target.value)}
                  />
                  <Separator />
                  <Button
                    onClick={() => handleSubmit(quest.id)}
                    disabled={submitting}
                    className="w-full"
                  >
                    {submitting ? 'Submitting…' : 'Submit Proof'}
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setOpenForm(null)
                      setError(null)
                    }}
                    className="w-full"
                  >
                    Cancel
                  </Button>
                </div>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-auto"
                  onClick={() => {
                    setOpenForm(quest.id)
                    setError(null)
                  }}
                >
                  Participate
                </Button>
              )}
            </Card>
          )
        })}
      </div>
    </section>
  )
}
