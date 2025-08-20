'use client'

import React from 'react'
import Link from 'next/link'
import { Quest, Submission } from '@/hooks/useQuest'
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import {
  Calendar,
  Users,
  CheckCircle2,
  Clock,
  XCircle,
  ArrowRight,
  Info,
} from 'lucide-react'

interface QuestCardProps {
  quest: Quest
  submission?: Submission
}

export default function QuestCard({ quest, submission }: QuestCardProps) {
  const start = new Date(quest.start_at).toLocaleDateString(undefined, {
    month: 'short', day: 'numeric', year: 'numeric'
  })
  const end = quest.end_at
    ? new Date(quest.end_at).toLocaleDateString(undefined, {
        month: 'short', day: 'numeric', year: 'numeric'
      })
    : 'Ongoing'
  const msStart = quest.multiplier_start
    ? new Date(quest.multiplier_start).toLocaleDateString(undefined, { month:'short',day:'numeric',year:'numeric' })
    : null
  const msEnd = quest.multiplier_end
    ? new Date(quest.multiplier_end).toLocaleDateString(undefined, { month:'short',day:'numeric',year:'numeric' })
    : null

  return (
    <div className="transform transition-transform hover:scale-105">
      <Card className="flex flex-col h-full bg-card/70 border-white/10 backdrop-blur-sm p-5 shadow-lg">
        {/* Header */}
        <CardHeader className="flex justify-between items-start pb-2">
          <div className="space-y-1">
            <CardTitle className="text-xl text-neutral">{quest.title}</CardTitle>
            <p className="text-sm text-neutral/50">
              📂 {quest.category_name}
            </p>
          </div>
          <Badge className="bg-orange-500/20 backdrop-blur-sm border border-orange-400/30 text-orange-300 shadow-lg px-3 py-1.5">
            💎 +{quest.xp_reward} XP
          </Badge>
        </CardHeader>

        {/* Body */}
        <CardContent className="flex-1 space-y-4">
          <div className="prose prose-sm prose-neutral max-w-none">
            <p className="text-sm text-neutral/70 line-clamp-3 whitespace-pre-wrap">
              {quest.description}
            </p>
          </div>

          <div className="flex flex-wrap items-center text-xs text-neutral/50 gap-3">
            <span className="flex items-center space-x-1">
              <Calendar className="w-4 h-4" />
              <span>{start} – {end}</span>
            </span>
            <span className="flex items-center space-x-1">
              <Users className="w-4 h-4" />
              <span>{quest.partner_name}</span>
            </span>
          </div>

          {quest.multiplier > 1 && (
            <div className="flex items-center space-x-2">
              <Badge className="bg-mint text-charcoal px-2">
                🚀 ×{quest.multiplier}
              </Badge>
              {msStart && msEnd && (
                <span className="text-xs text-neutral/50">
                  {msStart} → {msEnd}
                </span>
              )}
            </div>
          )}

          {quest.comments && (
            <>
              <Separator />
              <p className="text-xs text-neutral/50 italic">
                📝 {quest.comments}
              </p>
            </>
          )}
        </CardContent>

        {/* Footer */}
        <div className="pt-4">
          {submission ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span
                  className={`inline-flex items-center space-x-1 text-sm ${
                    submission.status === 'approved'
                      ? 'text-mint'
                      : submission.status === 'rejected'
                      ? 'text-red-500'
                      : 'text-amber'
                  }`}
                >
                  {submission.status === 'approved' && <CheckCircle2 />}
                  {submission.status === 'rejected' && <XCircle />}
                  {submission.status === 'pending'  && <Clock />}
                  <span className="capitalize">{submission.status}</span>
                </span>
                {submission.review_notes && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <Info className="w-4 h-4 text-neutral/50" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="text-sm">{submission.review_notes}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </div>
              {submission.proof_url && (
                <div className="text-xs text-neutral/50">
                  Proof: {submission.proof_url.length > 30 ? submission.proof_url.substring(0, 30) + '...' : submission.proof_url}
                </div>
              )}
            </div>
          ) : (
            <Link href={`/quests/${quest.id}`} className="block">
              <Button className="w-full mt-auto bg-amber hover:bg-amber/90 text-charcoal">
                <span>✍️ Participate</span>
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          )}
        </div>
      </Card>
    </div>
  )
}
