'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
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
  Sparkles,
  Star,
  Zap,
  Rocket,
  Satellite,
  Zap as Comet,
} from 'lucide-react'

interface QuestDetailProps {
  questId: number
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.8,
      staggerChildren: 0.15
    }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.25, 0.46, 0.45, 0.94]
    }
  }
}

const cardVariants = {
  hidden: { opacity: 0, scale: 0.98 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.8,
      ease: [0.25, 0.46, 0.45, 0.94]
    }
  }
}

// Function to detect and format text
const formatText = (text: string) => {
  // Detect URLs and make them clickable
  const urlRegex = /(https?:\/\/[^\s]+)/g
  const parts = text.split(urlRegex)
  
  return parts.map((part, index) => {
    if (urlRegex.test(part)) {
      return (
        <a
          key={index}
          href={part}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#A285FF] hover:text-[#B399FF] underline decoration-[#A285FF]/30 hover:decoration-[#A285FF] transition-all duration-200"
        >
          {part}
        </a>
      )
    }
    
    // Detect numbers and make them bold
    const numberRegex = /\b(\d+)\b/g
    const numberParts = part.split(numberRegex)
    
    return numberParts.map((numberPart, numberIndex) => {
      if (numberRegex.test(numberPart)) {
        return (
          <span key={`${index}-${numberIndex}`} className="font-semibold text-[#00E6B0]">
            {numberPart}
          </span>
        )
      }
      return numberPart
    })
  })
}

export default function QuestDetail({ questId }: QuestDetailProps) {
  const { quest, submission, loading, error, submitting, submitQuest, userAddress } = useQuest(questId)
  const [showSubmission, setShowSubmission] = useState(false)
  const [showProofData, setShowProofData] = useState(false)

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-8">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="relative"
        >
          <div className="w-16 h-16 border-2 border-[#FF8A65]/20 border-t-[#FF8A65] rounded-full"></div>
          <div className="absolute inset-0 w-16 h-16 border-2 border-transparent border-t-[#00E6B0] rounded-full animate-spin" style={{ animationDelay: '-0.5s' }}></div>
        </motion.div>
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-[#E0E0E0] text-lg font-medium tracking-wide"
        >
          Initializing quest systems...
        </motion.p>
        <div className="flex space-x-2">
          <div className="w-2 h-2 bg-[#FF8A65] rounded-full animate-bounce"></div>
          <div className="w-2 h-2 bg-[#00E6B0] rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
          <div className="w-2 h-2 bg-[#A285FF] rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
        </div>
      </div>
    )
  }

  if (error || !quest) {
    return (
      <div className="container mx-auto px-6 py-12">
        <div className="text-center space-y-8 max-w-md mx-auto">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="w-20 h-20 mx-auto bg-[#FF8A65]/10 rounded-full flex items-center justify-center"
          >
            <XCircle className="w-10 h-10 text-[#FF8A65]" />
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-3xl font-bold text-[#E0E0E0]"
          >
            Mission Not Found
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-[#7A7A7A] leading-relaxed"
          >
            The quest you're looking for doesn't exist or has been decommissioned.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Link href="/quests">
              <Button variant="outline" className="group hover:bg-[#FF8A65]/10 hover:border-[#FF8A65]/50 transition-all duration-300 border-[#7A7A7A]/30">
                <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform duration-300" />
                Return to Mission Control
              </Button>
            </Link>
          </motion.div>
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
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="container mx-auto px-6 py-8 space-y-8"
      style={{ backgroundColor: '#1B1B1F' }}
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="flex items-center justify-between">
        <Link href="/quests" className="group">
          <motion.div 
            whileHover={{ x: -3 }}
            className="text-[#E0E0E0] hover:text-[#FF8A65] flex items-center space-x-2 transition-colors duration-300"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-300" />
            <span className="font-medium tracking-wide">Return to Mission Control</span>
          </motion.div>
        </Link>
        <motion.div 
          variants={itemVariants}
          className="flex items-center space-x-3"
        >
          {quest.category_name && (
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Badge variant="outline" className="text-xs bg-[#A285FF]/10 border-[#A285FF]/30 text-[#A285FF] hover:bg-[#A285FF]/20 transition-colors duration-300">
                <Satellite className="w-3 h-3 mr-1" />
                {quest.category_name}
              </Badge>
            </motion.div>
          )}
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Badge className={`text-xs font-medium ${isQuestActive ? 'bg-[#00E6B0]/20 text-[#00E6B0] border border-[#00E6B0]/30' : 'bg-[#7A7A7A]/20 text-[#7A7A7A] border border-[#7A7A7A]/30'}`}>
              {isQuestActive ? '🟢 Mission Active' : '🔴 Mission Inactive'}
            </Badge>
          </motion.div>
        </motion.div>
      </motion.div>

      <motion.div variants={cardVariants}>
        <Card className="relative overflow-hidden bg-gradient-to-br from-[#1B1B1F]/80 via-[#1B1B1F]/60 to-[#1B1B1F]/80 border-[#FF8A65]/20 backdrop-blur-xl shadow-2xl">
          {/* Glass gradient background */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#FF8A65]/5 via-transparent to-[#00E6B0]/5"></div>
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-[#FF8A65]/10 to-transparent rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-[#00E6B0]/10 to-transparent rounded-full blur-2xl"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-gradient-to-r from-[#A285FF]/5 to-transparent rounded-full blur-3xl"></div>
          
          <CardHeader className="relative space-y-8 pb-8">
            <motion.div 
              variants={itemVariants}
              className="flex items-start justify-between"
            >
              <div className="space-y-6 flex-1">
                <motion.div
                  variants={itemVariants}
                  className="flex items-center space-x-4"
                >
                  <motion.div
                    animate={{ 
                      scale: [1, 1.05, 1],
                      rotate: [0, 5, -5, 0]
                    }}
                    transition={{ 
                      duration: 4,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                    className="relative"
                  >
                    <div className="w-14 h-14 bg-gradient-to-br from-[#FF8A65] via-[#FF6B4A] to-[#FF8A65] rounded-2xl flex items-center justify-center shadow-lg shadow-[#FF8A65]/25">
                      <Rocket className="w-7 h-7 text-white" />
                    </div>
                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-[#00E6B0] rounded-full animate-ping"></div>
                    <div className="absolute -bottom-1 -left-1 w-3 h-3 bg-[#A285FF] rounded-full animate-pulse"></div>
                  </motion.div>
                  <div>
                    <CardTitle className="text-4xl font-bold text-[#E0E0E0] bg-gradient-to-r from-[#E0E0E0] via-[#FF8A65] to-[#E0E0E0] bg-clip-text">
                      {quest.title}
                    </CardTitle>
                    <motion.div 
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 }}
                      className="flex items-center space-x-2 mt-2"
                    >
                      <Comet className="w-4 h-4 text-[#00E6B0]" />
                      <span className="text-sm text-[#7A7A7A] font-medium tracking-wide">Mission #{quest.id}</span>
                    </motion.div>
                  </div>
                </motion.div>
                
                <motion.div 
                  variants={itemVariants}
                  className="text-[#E0E0E0] text-lg leading-relaxed prose prose-invert max-w-none"
                >
                  <ReactMarkdown
                    components={{
                      p: ({ children }) => <p className="mb-6 last:mb-0 leading-relaxed text-[#E0E0E0]">{children}</p>,
                      h1: ({ children }) => <h1 className="text-2xl font-bold mb-4 text-[#FF8A65]">{children}</h1>,
                      h2: ({ children }) => <h2 className="text-xl font-bold mb-3 text-[#00E6B0]">{children}</h2>,
                      h3: ({ children }) => <h3 className="text-lg font-bold mb-2 text-[#A285FF]">{children}</h3>,
                      ul: ({ children }) => <ul className="list-disc list-inside mb-6 space-y-2 text-[#E0E0E0]">{children}</ul>,
                      ol: ({ children }) => <ol className="list-decimal list-inside mb-6 space-y-2 text-[#E0E0E0]">{children}</ol>,
                      li: ({ children }) => <li className="text-[#E0E0E0] leading-relaxed">{children}</li>,
                      strong: ({ children }) => <strong className="font-bold text-[#FF8A65]">{children}</strong>,
                      em: ({ children }) => <em className="italic text-[#A285FF]">{children}</em>,
                      code: ({ children }) => <code className="bg-[#1B1B1F]/80 px-2 py-1 rounded-md text-sm font-mono text-[#00E6B0] border border-[#00E6B0]/30">{children}</code>,
                      pre: ({ children }) => <pre className="bg-[#1B1B1F]/80 p-4 rounded-lg overflow-x-auto mb-6 border border-[#7A7A7A]/30 shadow-inner">{children}</pre>,
                      blockquote: ({ children }) => <blockquote className="border-l-4 border-[#FF8A65]/50 pl-4 italic text-[#E0E0E0] mb-6 bg-[#FF8A65]/5 rounded-r-lg py-2">{children}</blockquote>,
                      a: ({ href, children }) => (
                        <a href={href} className="text-[#A285FF] hover:text-[#B399FF] underline decoration-[#A285FF]/30 hover:decoration-[#A285FF] transition-all duration-200" target="_blank" rel="noopener noreferrer">
                          {children}
                        </a>
                      ),
                    }}
                  >
                    {quest.description}
                  </ReactMarkdown>
                </motion.div>
              </div>
              
              <motion.div 
                variants={itemVariants}
                className="flex flex-col items-end space-y-4 ml-8"
              >
                <motion.div
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="relative"
                >
                  <div className="bg-gradient-to-br from-[#FF8A65] via-[#FF6B4A] to-[#FF8A65] text-white px-8 py-4 rounded-2xl shadow-lg shadow-[#FF8A65]/25 font-bold text-2xl flex items-center space-x-3">
                    <Trophy className="w-7 h-7" />
                    <span>{quest.xp_reward} XP</span>
                  </div>
                  <div className="absolute -top-3 -right-3 w-8 h-8 bg-[#00E6B0] rounded-full flex items-center justify-center shadow-lg animate-pulse">
                    <Star className="w-4 h-4 text-[#1B1B1F]" />
                  </div>
                </motion.div>
                
                {quest.multiplier > 1 && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Badge className="bg-gradient-to-r from-[#00E6B0] to-[#00D4A0] text-[#1B1B1F] px-5 py-2 font-bold shadow-lg shadow-[#00E6B0]/25">
                      <Zap className="w-5 h-5 mr-1" />
                      ×{quest.multiplier} Boost
                    </Badge>
                  </motion.div>
                )}
              </motion.div>
            </motion.div>
          </CardHeader>

          <CardContent className="relative space-y-8">
            {/* Quest Details */}
            <motion.div 
              variants={itemVariants}
              className="grid grid-cols-1 md:grid-cols-2 gap-8"
            >
              <motion.div 
                variants={itemVariants}
                className="space-y-6"
              >
                <motion.div 
                  whileHover={{ x: 5, scale: 1.02 }}
                  className="flex items-center space-x-4 p-5 bg-gradient-to-r from-[#1B1B1F]/60 to-[#1B1B1F]/40 rounded-2xl border border-[#FF8A65]/20 hover:border-[#FF8A65]/40 transition-all duration-300 backdrop-blur-sm"
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-[#FF8A65] to-[#FF6B4A] rounded-xl flex items-center justify-center shadow-lg">
                    <Calendar className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-[#7A7A7A] font-medium tracking-wide">Mission Duration</p>
                    <p className="text-[#E0E0E0] font-semibold">{startDate} – {endDate}</p>
                  </div>
                </motion.div>

                {quest.partner_name && (
                  <motion.div 
                    whileHover={{ x: 5, scale: 1.02 }}
                    className="flex items-center space-x-4 p-5 bg-gradient-to-r from-[#1B1B1F]/60 to-[#1B1B1F]/40 rounded-2xl border border-[#00E6B0]/20 hover:border-[#00E6B0]/40 transition-all duration-300 backdrop-blur-sm"
                  >
                    <div className="w-12 h-12 bg-gradient-to-br from-[#00E6B0] to-[#00D4A0] rounded-xl flex items-center justify-center shadow-lg">
                      <Users className="w-6 h-6 text-[#1B1B1F]" />
                    </div>
                    <div>
                      <p className="text-sm text-[#7A7A7A] font-medium tracking-wide">Mission Partner</p>
                      <p className="text-[#E0E0E0] font-semibold">{quest.partner_name}</p>
                    </div>
                  </motion.div>
                )}

                {quest.multiplier > 1 && multiplierStart && multiplierEnd && (
                  <motion.div 
                    whileHover={{ x: 5, scale: 1.02 }}
                    className="flex items-center space-x-4 p-5 bg-gradient-to-r from-[#1B1B1F]/60 to-[#1B1B1F]/40 rounded-2xl border border-[#A285FF]/20 hover:border-[#A285FF]/40 transition-all duration-300 backdrop-blur-sm"
                  >
                    <div className="w-12 h-12 bg-gradient-to-br from-[#A285FF] to-[#B399FF] rounded-xl flex items-center justify-center shadow-lg">
                      <Target className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-sm text-[#7A7A7A] font-medium tracking-wide">Boost Period</p>
                      <p className="text-[#E0E0E0] font-semibold">{multiplierStart} → {multiplierEnd}</p>
                    </div>
                  </motion.div>
                )}
              </motion.div>

              <motion.div 
                variants={itemVariants}
                className="space-y-6"
              >
                {quest.comments && quest.comments.trim() && (
                  <motion.div 
                    whileHover={{ scale: 1.02 }}
                    className="flex items-start space-x-4 p-5 bg-gradient-to-r from-[#1B1B1F]/60 to-[#1B1B1F]/40 rounded-2xl border border-[#A285FF]/20 hover:border-[#A285FF]/40 transition-all duration-300 backdrop-blur-sm"
                  >
                    <div className="w-12 h-12 bg-gradient-to-br from-[#A285FF] to-[#B399FF] rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
                      <FileText className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-[#7A7A7A] font-medium tracking-wide mb-3">Mission Briefing</p>
                      <div className="text-[#E0E0E0] prose prose-invert max-w-none">
                        <ReactMarkdown
                          components={{
                            p: ({ children }) => <p className="mb-3 last:mb-0 text-sm leading-relaxed text-[#E0E0E0]">{children}</p>,
                            ul: ({ children }) => <ul className="list-disc list-inside mb-3 space-y-1 text-sm">{children}</ul>,
                            ol: ({ children }) => <ol className="list-decimal list-inside mb-3 space-y-1 text-sm">{children}</ol>,
                            li: ({ children }) => <li className="text-[#E0E0E0]">{children}</li>,
                            strong: ({ children }) => <strong className="font-bold text-[#FF8A65]">{children}</strong>,
                            em: ({ children }) => <em className="italic text-[#A285FF]">{children}</em>,
                            code: ({ children }) => <code className="bg-[#1B1B1F]/80 px-1 py-0.5 rounded text-xs font-mono text-[#00E6B0] border border-[#00E6B0]/30">{children}</code>,
                            a: ({ href, children }) => (
                              <a href={href} className="text-[#A285FF] hover:text-[#B399FF] underline decoration-[#A285FF]/30 hover:decoration-[#A285FF] transition-all duration-200 text-sm" target="_blank" rel="noopener noreferrer">
                                {children}
                              </a>
                            ),
                          }}
                        >
                          {quest.comments}
                        </ReactMarkdown>
                      </div>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Separator className="bg-gradient-to-r from-transparent via-[#FF8A65]/20 to-transparent" />
            </motion.div>

            {/* Submission Status */}
            <AnimatePresence mode="wait">
              {submission ? (
                <motion.div 
                  key="submission"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-6"
                >
                  <motion.div 
                    whileHover={{ scale: 1.02 }}
                    className="flex items-center space-x-4 p-6 bg-gradient-to-r from-[#1B1B1F]/60 to-[#1B1B1F]/40 rounded-2xl border border-[#00E6B0]/20 shadow-lg backdrop-blur-sm"
                  >
                    <motion.div
                      animate={{ 
                        scale: [1, 1.1, 1],
                        rotate: submission.status === 'approved' ? [0, 10, -10, 0] : 0
                      }}
                      transition={{ duration: 0.6 }}
                    >
                      {submission.status === 'approved' && <CheckCircle2 className="w-10 h-10 text-[#00E6B0]" />}
                      {submission.status === 'rejected' && <XCircle className="w-10 h-10 text-[#FF8A65]" />}
                      {submission.status === 'pending' && <Clock className="w-10 h-10 text-[#A285FF]" />}
                    </motion.div>
                    <div>
                      <h3 className="text-2xl font-bold text-[#E0E0E0]">
                        Mission Status: <span className="capitalize bg-gradient-to-r from-[#E0E0E0] to-[#FF8A65] bg-clip-text">{submission.status}</span>
                      </h3>
                      {submission.submitted_at && (
                        <p className="text-sm text-[#7A7A7A] mt-1">
                          Submitted on {new Date(submission.submitted_at).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </motion.div>

                  {submission.proof_url && (
                    <motion.div 
                      whileHover={{ scale: 1.02 }}
                      className="bg-gradient-to-r from-[#1B1B1F]/60 to-[#1B1B1F]/40 p-6 rounded-2xl border border-[#FF8A65]/20 shadow-lg backdrop-blur-sm"
                    >
                      <h4 className="font-bold text-[#E0E0E0] mb-4 flex items-center gap-2">
                        <ExternalLink className="w-6 h-6 text-[#FF8A65]" />
                        Mission Evidence
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger>
                              <Info className="w-4 h-4 text-[#7A7A7A]" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="text-sm">Link to your proof of participation</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </h4>
                      <div className="flex items-center space-x-3">
                        <a 
                          href={submission.proof_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-[#A285FF] hover:text-[#B399FF] text-sm break-all bg-[#1B1B1F]/80 px-4 py-3 rounded-lg border border-[#A285FF]/30 hover:border-[#A285FF]/60 transition-all duration-300"
                        >
                          {submission.proof_url}
                        </a>
                        <ExternalLink className="w-4 h-4 text-[#7A7A7A]" />
                      </div>
                    </motion.div>
                  )}

                  {submission.proof_data && Object.keys(submission.proof_data).length > 0 && (
                    <motion.div 
                      whileHover={{ scale: 1.02 }}
                      className="bg-gradient-to-r from-[#1B1B1F]/60 to-[#1B1B1F]/40 p-6 rounded-2xl border border-[#00E6B0]/20 shadow-lg backdrop-blur-sm"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-bold text-[#E0E0E0] flex items-center gap-2">
                          <Eye className="w-6 h-6 text-[#00E6B0]" />
                          Mission Data
                        </h4>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowProofData(!showProofData)}
                          className="h-8 px-3 text-xs hover:bg-[#1B1B1F]/80 transition-all duration-300"
                        >
                          {showProofData ? <EyeOff className="w-3 h-3 mr-1" /> : <Eye className="w-3 h-3 mr-1" />}
                          {showProofData ? 'Hide' : 'Show'} Data
                        </Button>
                      </div>
                      <AnimatePresence>
                        {showProofData && (
                          <motion.pre 
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mt-4 p-4 bg-[#1B1B1F]/80 rounded-lg text-xs overflow-auto max-h-48 border border-[#00E6B0]/30 shadow-inner"
                          >
                            {JSON.stringify(submission.proof_data, null, 2)}
                          </motion.pre>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  )}

                  {submission.review_notes && submission.review_notes.trim() && (
                    <motion.div 
                      whileHover={{ scale: 1.02 }}
                      className="bg-gradient-to-r from-[#1B1B1F]/60 to-[#1B1B1F]/40 p-6 rounded-2xl border border-[#A285FF]/20 shadow-lg backdrop-blur-sm"
                    >
                      <h4 className="font-bold text-[#E0E0E0] mb-4 flex items-center gap-2">
                        <FileText className="w-6 h-6 text-[#A285FF]" />
                        Mission Debrief
                      </h4>
                      <div className="text-[#E0E0E0] text-sm prose prose-invert max-w-none">
                        <ReactMarkdown
                          components={{
                            p: ({ children }) => <p className="mb-3 last:mb-0 leading-relaxed">{children}</p>,
                            ul: ({ children }) => <ul className="list-disc list-inside mb-3 space-y-1">{children}</ul>,
                            ol: ({ children }) => <ol className="list-decimal list-inside mb-3 space-y-1">{children}</ol>,
                            li: ({ children }) => <li>{children}</li>,
                            strong: ({ children }) => <strong className="font-bold text-[#FF8A65]">{children}</strong>,
                            em: ({ children }) => <em className="italic text-[#A285FF]">{children}</em>,
                            code: ({ children }) => <code className="bg-[#1B1B1F]/80 px-1 py-0.5 rounded text-xs font-mono text-[#00E6B0] border border-[#00E6B0]/30">{children}</code>,
                            a: ({ href, children }) => (
                              <a href={href} className="text-[#A285FF] hover:text-[#B399FF] underline decoration-[#A285FF]/30 hover:decoration-[#A285FF] transition-all duration-200" target="_blank" rel="noopener noreferrer">
                                {children}
                              </a>
                            ),
                          }}
                        >
                          {submission.review_notes}
                        </ReactMarkdown>
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              ) : (
                <motion.div 
                  key="no-submission"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="text-center space-y-8"
                >
                  <motion.div
                    animate={{ 
                      scale: [1, 1.05, 1],
                      rotate: [0, 5, -5, 0]
                    }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                    className="w-24 h-24 mx-auto bg-gradient-to-br from-[#FF8A65]/20 to-[#00E6B0]/20 rounded-full flex items-center justify-center"
                  >
                    <Rocket className="w-12 h-12 text-[#FF8A65]" />
                  </motion.div>
                  <motion.p 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="text-[#E0E0E0] text-lg leading-relaxed"
                  >
                    {!userAddress 
                      ? "Connect your wallet to join this mission."
                      : "Ready to launch? Submit your mission report below."
                    }
                  </motion.p>
                  {userAddress && isQuestActive && (
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Button
                        onClick={() => setShowSubmission(true)}
                        className="bg-gradient-to-r from-[#FF8A65] to-[#FF6B4A] hover:from-[#FF6B4A] hover:to-[#FF8A65] text-white px-10 py-5 text-xl font-bold shadow-lg shadow-[#FF8A65]/25 transition-all duration-300 rounded-2xl"
                      >
                        <Rocket className="w-6 h-6 mr-2" />
                        Launch Mission
                      </Button>
                    </motion.div>
                  )}
                  {!isQuestActive && (
                    <motion.p 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.5 }}
                      className="text-[#FF8A65] font-bold text-lg"
                    >
                      This mission is not currently active.
                    </motion.p>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>
      </motion.div>

      {/* Submission Modal */}
      <AnimatePresence>
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
      </AnimatePresence>
    </motion.div>
  )
}
