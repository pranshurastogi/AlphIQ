'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import ReactMarkdown from 'react-markdown'
import { useQuest } from '@/hooks/useQuest'
import QuestSubmission from './QuestSubmission'
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import {
  Flame,
  Calendar,
  Users,
  CheckCircle2,
  Clock,
  XCircle,
  Loader2,
  ArrowLeft,
  Trophy,
  Target,
  FileText,
  Info,
  Eye,
  EyeOff,
  ExternalLink,
} from 'lucide-react'

interface QuestDetailProps {
  questId: number
}

export default function QuestDetail({ questId }: QuestDetailProps) {
  const { quest, submission, loading, error, submitting, submitQuest, userAddress } = useQuest(questId)
  const [showSubmission, setShowSubmission] = useState(false)
  const [showProofData, setShowProofData] = useState(false)

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 space-y-4">
        <Loader2 className="w-10 h-10 text-amber animate-spin" />
        <p className="text-neutral">Loading quest details…</p>
      </div>
    )
  }

  if (error || !quest) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold text-red-500">Quest Not Found</h1>
          <p className="text-neutral/70">The quest you're looking for doesn't exist or has been removed.</p>
          <Link href="/quests">
            <Button variant="outline" className="mt-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to All Quests
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  const startDate = new Date(quest.start_at).toLocaleDateString(undefined, {
    month: 'long', day: 'numeric', year: 'numeric'
  })
  const endDate = quest.end_at
    ? new Date(quest.end_at).toLocaleDateString(undefined, {
        month: 'long', day: 'numeric', year: 'numeric'
      })
    : 'Ongoing'
  
  const multiplierStart = quest.multiplier_start
    ? new Date(quest.multiplier_start).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
    : null
  const multiplierEnd = quest.multiplier_end
    ? new Date(quest.multiplier_end).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
    : null

  const isQuestActive = new Date() >= new Date(quest.start_at) && 
    (!quest.end_at || new Date() <= new Date(quest.end_at))

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Link href="/quests" className="text-neutral hover:text-amber flex items-center space-x-2">
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Quests</span>
        </Link>
        <div className="flex items-center space-x-2">
          {quest.category_name && (
            <Badge variant="outline" className="text-xs">
              📂 {quest.category_name}
            </Badge>
          )}
          <Badge className={`text-xs ${isQuestActive ? 'bg-green-500' : 'bg-gray-500'}`}>
            {isQuestActive ? '🟢 Active' : '🔴 Inactive'}
          </Badge>
        </div>
      </div>

      <div
        className="animate-in fade-in slide-in-from-bottom-4 duration-500"
      >
        <Card className="bg-card/70 border-white/10 backdrop-blur-sm shadow-lg">
          <CardHeader className="space-y-4">
            <div className="flex items-start justify-between">
              <div className="space-y-2 flex-1">
                <CardTitle className="text-3xl text-neutral flex items-center space-x-3">
                  <Flame className="w-8 h-8 text-amber" />
                  <span>{quest.title}</span>
                </CardTitle>
                <div className="text-neutral/70 text-lg prose prose-invert max-w-none">
                  <ReactMarkdown
                    components={{
                      p: ({ children }) => <p className="mb-4 last:mb-0">{children}</p>,
                      h1: ({ children }) => <h1 className="text-2xl font-bold mb-4 text-neutral">{children}</h1>,
                      h2: ({ children }) => <h2 className="text-xl font-bold mb-3 text-neutral">{children}</h2>,
                      h3: ({ children }) => <h3 className="text-lg font-bold mb-2 text-neutral">{children}</h3>,
                      ul: ({ children }) => <ul className="list-disc list-inside mb-4 space-y-1">{children}</ul>,
                      ol: ({ children }) => <ol className="list-decimal list-inside mb-4 space-y-1">{children}</ol>,
                      li: ({ children }) => <li className="text-neutral/70">{children}</li>,
                      strong: ({ children }) => <strong className="font-semibold text-neutral">{children}</strong>,
                      em: ({ children }) => <em className="italic text-neutral/80">{children}</em>,
                      code: ({ children }) => <code className="bg-background/50 px-1 py-0.5 rounded text-sm font-mono text-amber">{children}</code>,
                      pre: ({ children }) => <pre className="bg-background/50 p-3 rounded-lg overflow-x-auto mb-4">{children}</pre>,
                      blockquote: ({ children }) => <blockquote className="border-l-4 border-amber/50 pl-4 italic text-neutral/80 mb-4">{children}</blockquote>,
                      a: ({ href, children }) => (
                        <a href={href} className="text-amber hover:text-amber/80 underline" target="_blank" rel="noopener noreferrer">
                          {children}
                        </a>
                      ),
                    }}
                  >
                    {quest.description}
                  </ReactMarkdown>
                </div>
              </div>
              <div className="flex flex-col items-end space-y-2">
                <Badge className="bg-amber text-charcoal px-4 py-2 text-lg">
                  <Trophy className="w-5 h-5 mr-2" />
                  {quest.xp_reward} XP
                </Badge>
                {quest.multiplier > 1 && (
                  <Badge className="bg-mint text-charcoal px-3">
                    🚀 ×{quest.multiplier} Multiplier
                  </Badge>
                )}
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Quest Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Calendar className="w-5 h-5 text-neutral/50" />
                  <div>
                    <p className="text-sm text-neutral/50">Duration</p>
                    <p className="text-neutral font-medium">{startDate} – {endDate}</p>
                  </div>
                </div>

                {quest.partner_name && (
                  <div className="flex items-center space-x-3">
                    <Users className="w-5 h-5 text-neutral/50" />
                    <div>
                      <p className="text-sm text-neutral/50">Partner</p>
                      <p className="text-neutral font-medium">{quest.partner_name}</p>
                    </div>
                  </div>
                )}

                {quest.multiplier > 1 && multiplierStart && multiplierEnd && (
                  <div className="flex items-center space-x-3">
                    <Target className="w-5 h-5 text-neutral/50" />
                    <div>
                      <p className="text-sm text-neutral/50">Multiplier Period</p>
                      <p className="text-neutral font-medium">{multiplierStart} → {multiplierEnd}</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                {quest.comments && quest.comments.trim() && (
                  <div className="flex items-start space-x-3">
                    <FileText className="w-5 h-5 text-neutral/50 mt-1" />
                    <div className="flex-1">
                      <p className="text-sm text-neutral/50 mb-2">Additional Notes</p>
                      <div className="text-neutral/70 prose prose-invert max-w-none">
                        <ReactMarkdown
                          components={{
                            p: ({ children }) => <p className="mb-2 last:mb-0 text-sm">{children}</p>,
                            ul: ({ children }) => <ul className="list-disc list-inside mb-2 space-y-1 text-sm">{children}</ul>,
                            ol: ({ children }) => <ol className="list-decimal list-inside mb-2 space-y-1 text-sm">{children}</ol>,
                            li: ({ children }) => <li className="text-neutral/70">{children}</li>,
                            strong: ({ children }) => <strong className="font-semibold text-neutral">{children}</strong>,
                            em: ({ children }) => <em className="italic text-neutral/80">{children}</em>,
                            code: ({ children }) => <code className="bg-background/50 px-1 py-0.5 rounded text-xs font-mono text-amber">{children}</code>,
                            a: ({ href, children }) => (
                              <a href={href} className="text-amber hover:text-amber/80 underline text-sm" target="_blank" rel="noopener noreferrer">
                                {children}
                              </a>
                            ),
                          }}
                        >
                          {quest.comments}
                        </ReactMarkdown>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <Separator />

            {/* Submission Status */}
            {submission ? (
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  {submission.status === 'approved' && <CheckCircle2 className="w-6 h-6 text-green-500" />}
                  {submission.status === 'rejected' && <XCircle className="w-6 h-6 text-red-500" />}
                  {submission.status === 'pending' && <Clock className="w-6 h-6 text-amber" />}
                  <div>
                    <h3 className="text-lg font-semibold text-neutral">
                      Submission Status: <span className="capitalize">{submission.status}</span>
                    </h3>
                    {submission.submitted_at && (
                      <p className="text-sm text-neutral/50">
                        Submitted on {new Date(submission.submitted_at).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>

                {submission.proof_url && (
                  <div className="bg-card/50 p-4 rounded-lg border border-white/10">
                    <h4 className="font-medium text-neutral mb-2 flex items-center gap-2">
                      Proof URL
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <Info className="w-4 h-4 text-neutral/50" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="text-sm">Link to your proof of participation</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </h4>
                    <div className="flex items-center space-x-2">
                      <a 
                        href={submission.proof_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-amber hover:text-amber/80 text-sm break-all"
                      >
                        {submission.proof_url}
                      </a>
                      <ExternalLink className="w-4 h-4 text-neutral/50" />
                    </div>
                  </div>
                )}

                {submission.proof_data && Object.keys(submission.proof_data).length > 0 && (
                  <div className="bg-card/50 p-4 rounded-lg border border-white/10">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-neutral">Additional Data</h4>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowProofData(!showProofData)}
                        className="h-6 px-2 text-xs"
                      >
                        {showProofData ? <EyeOff className="w-3 h-3 mr-1" /> : <Eye className="w-3 h-3 mr-1" />}
                        {showProofData ? 'Hide' : 'Show'} Data
                      </Button>
                    </div>
                    {showProofData && (
                      <pre className="mt-2 p-2 bg-background/50 rounded text-xs overflow-auto max-h-32">
                        {JSON.stringify(submission.proof_data, null, 2)}
                      </pre>
                    )}
                  </div>
                )}

                {submission.review_notes && submission.review_notes.trim() && (
                  <div className="bg-card/50 p-4 rounded-lg border border-white/10">
                    <h4 className="font-medium text-neutral mb-2">Review Notes:</h4>
                    <div className="text-neutral/70 text-sm prose prose-invert max-w-none">
                      <ReactMarkdown
                        components={{
                          p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                          ul: ({ children }) => <ul className="list-disc list-inside mb-2 space-y-1">{children}</ul>,
                          ol: ({ children }) => <ol className="list-decimal list-inside mb-2 space-y-1">{children}</ol>,
                          li: ({ children }) => <li>{children}</li>,
                          strong: ({ children }) => <strong className="font-semibold text-neutral">{children}</strong>,
                          em: ({ children }) => <em className="italic">{children}</em>,
                          code: ({ children }) => <code className="bg-background/50 px-1 py-0.5 rounded text-xs font-mono text-amber">{children}</code>,
                          a: ({ href, children }) => (
                            <a href={href} className="text-amber hover:text-amber/80 underline" target="_blank" rel="noopener noreferrer">
                              {children}
                            </a>
                          ),
                        }}
                      >
                        {submission.review_notes}
                      </ReactMarkdown>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center space-y-4">
                <p className="text-neutral/70">
                  {!userAddress 
                    ? "Connect your wallet to participate in this quest."
                    : "Ready to participate? Submit your entry below."
                  }
                </p>
                {userAddress && isQuestActive && (
                  <Button
                    onClick={() => setShowSubmission(true)}
                    className="bg-amber hover:bg-amber/90 text-charcoal px-8 py-3"
                  >
                    ✍️ Submit Entry
                  </Button>
                )}
                {!isQuestActive && (
                  <p className="text-amber font-medium">This quest is not currently active.</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Submission Modal */}
      {showSubmission && (
        <QuestSubmission
          quest={quest}
          onSubmit={async (submissionData) => {
            const success = await submitQuest(submissionData)
            if (success) {
              setShowSubmission(false)
            }
            return success
          }}
          onCancel={() => setShowSubmission(false)}
          submitting={submitting}
        />
      )}
    </div>
  )
}
