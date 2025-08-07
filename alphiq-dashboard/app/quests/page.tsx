// app/quests/page.tsx
'use client'

import React from 'react'
import Link from 'next/link'
import { useQuests } from '@/hooks/useQuest'
import QuestCard from '@/components/QuestCard'
import {
  Flame,
  Loader2,
} from 'lucide-react'

export default function AllChallengesPage() {
  const { quests, submissions, loading, error } = useQuests()

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
        {quests.map(q => (
          <QuestCard 
            key={q.id} 
            quest={q} 
            submission={submissions[q.id]} 
          />
        ))}
      </div>
    </section>
  )
}
