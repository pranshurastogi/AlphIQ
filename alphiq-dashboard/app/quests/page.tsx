// app/quests/page.tsx
'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { useWallet } from '@alephium/web3-react'
import { supabase } from '@/lib/supabaseClient'
import { motion } from 'framer-motion'
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import {
  Flame,
  Calendar,
  Users,
  Layers,
  CheckCircle2,
  Clock,
  XCircle,
  Loader2,
} from 'lucide-react'

interface Quest {
  id: number
  title: string
  description: string
  xp_reward: number
  multiplier: number
  multiplier_start: string | null
  multiplier_end: string | null
  comments: string | null
  partner_name: string
  category_name: string | null
  start_at: string
  end_at: string | null
}

interface Submission {
  quest_id: number
  status: 'pending' | 'approved' | 'rejected'
}

export default function AllChallengesPage() {
  const { account } = useWallet()
  const userAddress = typeof account === 'string' ? account : account?.address || null

  const [quests, setQuests] = useState<Quest[]>([])
  const [subs, setSubs] = useState<Record<number, Submission>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      setLoading(true)
      setError(null)

      // Fetch all active quests with joins
      const { data: qData, error: qErr } = await supabase
        .from('admin_quests')
        .select(`
          id, title, description, xp_reward, multiplier,
          multiplier_start, multiplier_end, comments,
          start_at, end_at,
          admin_user_profiles(partner_name),
          admin_quest_categories(name)
        `)
        .eq('is_active', true)
        .order('start_at', { ascending: true })

      if (qErr) {
        setError('Could not load challenges.')
        setLoading(false)
        return
      }

      setQuests(
        qData!.map(q => ({
          id: q.id,
          title: q.title,
          description: q.description,
          xp_reward: q.xp_reward,
          multiplier: q.multiplier,
          multiplier_start: q.multiplier_start,
          multiplier_end: q.multiplier_end,
          comments: q.comments,
          start_at: q.start_at,
          end_at: q.end_at,
          partner_name: q.admin_user_profiles.partner_name,
          category_name: q.admin_quest_categories.name,
        }))
      )

      // Fetch the user's submissions if wallet is connected
      if (userAddress) {
        const { data: sData } = await supabase
          .from('admin_quest_submissions')
          .select('quest_id, status')
          .eq('user_address', userAddress)
        setSubs(Object.fromEntries(sData!.map(s => [s.quest_id, { quest_id: s.quest_id, status: s.status }])))
      }

      setLoading(false)
    }
    load()
  }, [userAddress])

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 space-y-4">
        <Loader2 className="w-10 h-10 text-amber animate-spin" />
        <p className="text-neutral">Loading all challenges…</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="px-4 py-8">
        <p className="text-center text-red-500">{error}</p>
      </div>
    )
  }

  return (
    <section className="container mx-auto px-4 py-8 space-y-6">
      {/* Back & Heading */}
      <div className="flex items-center justify-between">
        <Link href="/" className="text-neutral hover:text-amber">
          ← Back to Dashboard
        </Link>
        <h1 className="text-3xl font-bold text-neutral flex items-center space-x-2">
          <Flame className="w-8 h-8 text-amber animate-pulse" />
          <span>All Challenges</span>
        </h1>
        <div />
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {quests.map(q => {
          const sub = subs[q.id]
          const start = new Date(q.start_at).toLocaleDateString(undefined, {
            month: 'short', day: 'numeric', year: 'numeric'
          })
          const end = q.end_at
            ? new Date(q.end_at).toLocaleDateString(undefined, {
                month: 'short', day: 'numeric', year: 'numeric'
              })
            : 'Ongoing'
          const msStart = q.multiplier_start
            ? new Date(q.multiplier_start).toLocaleDateString(undefined, { month:'short',day:'numeric',year:'numeric' })
            : null
          const msEnd = q.multiplier_end
            ? new Date(q.multiplier_end).toLocaleDateString(undefined, { month:'short',day:'numeric',year:'numeric' })
            : null

          return (
            <motion.div
              key={q.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Card className="flex flex-col h-full bg-card/70 border-white/10 backdrop-blur-sm p-5 shadow-lg">
                {/* Header */}
                <CardHeader className="flex justify-between items-start pb-2">
                  <div className="space-y-1">
                    <CardTitle className="text-xl text-neutral">{q.title}</CardTitle>
                    <p className="text-sm text-neutral/50">
                      📂 {q.category_name}
                    </p>
                  </div>
                  <Badge className="bg-amber text-charcoal px-3">
                    💎 {q.xp_reward}
                  </Badge>
                </CardHeader>

                {/* Body */}
                <CardContent className="flex-1 space-y-4">
                  <p className="text-sm text-neutral/70 line-clamp-3">
                    {q.description}
                  </p>

                  <div className="flex flex-wrap items-center text-xs text-neutral/50 gap-3">
                    <span className="flex items-center space-x-1">
                      <Calendar className="w-4 h-4" />
                      <span>{start} – {end}</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <Users className="w-4 h-4" />
                      <span>{q.partner_name}</span>
                    </span>
                  </div>

                  {q.multiplier > 1 && (
                    <div className="flex items-center space-x-2">
                      <Badge className="bg-mint text-charcoal px-2">
                        🚀 ×{q.multiplier}
                      </Badge>
                      {msStart && msEnd && (
                        <span className="text-xs text-neutral/50">
                          {msStart} → {msEnd}
                        </span>
                      )}
                    </div>
                  )}

                  {q.comments && (
                    <>
                      <Separator />
                      <p className="text-xs text-neutral/50 italic">
                        📝 {q.comments}
                      </p>
                    </>
                  )}
                </CardContent>

                {/* Footer */}
                <div className="pt-4">
                  {sub ? (
                    <span
                      className={`inline-flex items-center space-x-1 text-sm ${
                        sub.status === 'approved'
                          ? 'text-mint'
                          : sub.status === 'rejected'
                          ? 'text-red-500'
                          : 'text-amber'
                      }`}
                    >
                      {sub.status === 'approved' && <CheckCircle2 />}
                      {sub.status === 'rejected' && <XCircle />}
                      {sub.status === 'pending'  && <Clock />}
                      <span className="capitalize">{sub.status}</span>
                    </span>
                  ) : (
                    <Link href="/" className="block">
                      <Button
                        variant="solid"
                        className="w-full mt-auto bg-amber hover:bg-amber/90 text-charcoal"
                      >
                        ✍️ Participate
                      </Button>
                    </Link>
                  )}
                </div>
              </Card>
            </motion.div>
          )
        })}
      </div>
    </section>
  )
}
