// app/quests/page.tsx
'use client'

import React, { useMemo, useState } from 'react'
import Link from 'next/link'
import { useQuests } from '@/hooks/useQuest'
import QuestCard from '@/components/QuestCard'
import {
  Rocket,
  Loader2,
  SlidersHorizontal,
  Search,
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export default function AllChallengesPage() {
  const { quests, submissions, loading, error } = useQuests()
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('all')
  const [partner, setPartner] = useState('all')
  const [status, setStatus] = useState('all')
  const [sortBy, setSortBy] = useState('start_newest')

  const filtered = useMemo(() => {
    return quests
      .filter(q => {
        const sub = submissions[q.id]
        const matchText = (q.title + ' ' + q.description).toLowerCase().includes(query.toLowerCase())
        const matchCategory = category === 'all' || q.category_name === category
        const matchPartner = partner === 'all' || q.partner_name === partner
        const matchStatus = (() => {
          if (status === 'all') return true
          if (status === 'not_submitted') return !sub
          if (status === 'submitted') return !!sub
          if (status === 'approved') return sub?.status === 'approved'
          if (status === 'pending') return sub?.status === 'pending'
          if (status === 'rejected') return sub?.status === 'rejected'
          return true
        })()
        return matchText && matchCategory && matchPartner && matchStatus
      })
      .sort((a, b) => {
        if (sortBy === 'xp_high') return b.xp_reward - a.xp_reward
        if (sortBy === 'xp_low') return a.xp_reward - b.xp_reward
        if (sortBy === 'ending_soon') {
          const aTime = a.end_at ? new Date(a.end_at).getTime() : Number.POSITIVE_INFINITY
          const bTime = b.end_at ? new Date(b.end_at).getTime() : Number.POSITIVE_INFINITY
          return aTime - bTime
        }
        if (sortBy === 'start_oldest') return new Date(a.start_at).getTime() - new Date(b.start_at).getTime()
        return new Date(b.start_at).getTime() - new Date(a.start_at).getTime()
      })
  }, [quests, submissions, query, category, partner, status, sortBy])

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
          <Rocket className="w-8 h-8 text-amber animate-pulse" />
          <span>All Challenges</span>
        </h1>
        <div />
      </div>

      {/* Filters - Hero Movie Theme */}
      <div className="bg-gradient-to-r from-card/30 via-card/20 to-card/30 border border-white/10 rounded-xl p-4 backdrop-blur-sm">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-center gap-2 text-neutral/70 text-sm">
            <SlidersHorizontal className="w-4 h-4" />
            <span className="font-medium">Filter Challenges</span>
          </div>
          
          {/* Search Bar - Hero Style */}
          <div className="relative">
            <Search className="w-4 h-4 text-neutral/50 absolute left-4 top-1/2 -translate-y-1/2" />
            <Input
              placeholder="Search for quests..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-10 pr-4 bg-background/50 border-white/20 focus:border-amber/50 focus:ring-amber/20 h-12 text-base"
            />
          </div>
          
          {/* Filter Controls */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="bg-background/50 border-white/20">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent className="bg-card/95 border-white/10">
                <SelectItem value="all">All Categories</SelectItem>
                {Array.from(new Set(quests.map(q => q.category_name).filter(Boolean))).map((name) => (
                  <SelectItem key={name as string} value={name as string}>{name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={partner} onValueChange={setPartner}>
              <SelectTrigger className="bg-background/50 border-white/20">
                <SelectValue placeholder="Partner" />
              </SelectTrigger>
              <SelectContent className="bg-card/95 border-white/10">
                <SelectItem value="all">All Partners</SelectItem>
                {Array.from(new Set(quests.map(q => q.partner_name))).map((name) => (
                  <SelectItem key={name} value={name}>{name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="bg-background/50 border-white/20">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent className="bg-card/95 border-white/10">
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="not_submitted">Not Submitted</SelectItem>
                <SelectItem value="submitted">Submitted</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="bg-background/50 border-white/20">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent className="bg-card/95 border-white/10">
                <SelectItem value="start_newest">Newest</SelectItem>
                <SelectItem value="start_oldest">Oldest</SelectItem>
                <SelectItem value="xp_high">XP: High → Low</SelectItem>
                <SelectItem value="xp_low">XP: Low → High</SelectItem>
                <SelectItem value="ending_soon">Ending Soon</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map(q => (
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
