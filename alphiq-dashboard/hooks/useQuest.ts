import { useState, useEffect } from 'react'
import { useWallet } from '@alephium/web3-react'
import { supabase } from '@/lib/supabaseClient'

export interface Quest {
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
  is_active: boolean
}

export interface Submission {
  quest_id: number
  status: 'pending' | 'approved' | 'rejected'
  proof_url?: string
  proof_data?: any
  review_notes?: string | null
  submitted_at?: string
}

export interface QuestSubmission {
  quest_id: number
  user_address: string
  proof_url: string
  proof_data?: any
  status: 'pending' | 'approved' | 'rejected'
}

export function useQuest(questId?: number) {
  const { account } = useWallet()
  const userAddress = typeof account === 'string' ? account : account?.address || null

  const [quest, setQuest] = useState<Quest | null>(null)
  const [submission, setSubmission] = useState<Submission | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!questId) return

    async function loadQuest() {
      setLoading(true)
      setError(null)

      try {
        // Fetch specific quest
        const { data: questData, error: questError } = await supabase
          .from('admin_quests')
          .select(`
            id, title, description, xp_reward, multiplier,
            multiplier_start, multiplier_end, comments,
            start_at, end_at, is_active,
            admin_user_profiles(partner_name),
            admin_quest_categories(name)
          `)
          .eq('id', questId)
          .single()

        if (questError) {
          setError('Quest not found')
          setLoading(false)
          return
        }

        if (!questData) {
          setError('Quest not found')
          setLoading(false)
          return
        }

        const formattedQuest: Quest = {
          id: questData.id,
          title: questData.title,
          description: questData.description,
          xp_reward: questData.xp_reward,
          multiplier: questData.multiplier,
          multiplier_start: questData.multiplier_start,
          multiplier_end: questData.multiplier_end,
          comments: questData.comments,
          start_at: questData.start_at,
          end_at: questData.end_at,
          is_active: questData.is_active,
          partner_name: questData.admin_user_profiles?.partner_name || 'Unknown',
          category_name: questData.admin_quest_categories?.name || null,
        }

        setQuest(formattedQuest)

        // Fetch user's submission if wallet is connected
        if (userAddress) {
          const { data: submissionData } = await supabase
            .from('admin_quest_submissions')
            .select('quest_id, status, proof_url, proof_data, review_notes, submitted_at')
            .eq('quest_id', questId)
            .eq('user_address', userAddress)
            .single()

          if (submissionData) {
            setSubmission({
              quest_id: submissionData.quest_id,
              status: submissionData.status,
              proof_url: submissionData.proof_url,
              proof_data: submissionData.proof_data,
              review_notes: submissionData.review_notes,
              submitted_at: submissionData.submitted_at,
            })
          }
        }

        setLoading(false)
      } catch (err) {
        setError('Failed to load quest')
        setLoading(false)
      }
    }

    loadQuest()
  }, [questId, userAddress])

  const submitQuest = async (submissionData: { proofUrl: string; participationData: any }): Promise<boolean> => {
    if (!userAddress || !questId) {
      setError('Wallet not connected')
      return false
    }

    setSubmitting(true)
    setError(null)

    try {
      const submissionPayload: any = {
        quest_id: questId,
        user_address: userAddress,
        proof_url: submissionData.proofUrl,
        status: 'pending',
      }

      // Only include proof_data if there's actual data
      const hasData = Object.values(submissionData.participationData).some(section => 
        section && typeof section === 'object' && Object.keys(section).length > 0
      )

      if (hasData) {
        submissionPayload.proof_data = submissionData.participationData
      }

      const { data: newSub, error: submissionError } = await supabase
        .from('admin_quest_submissions')
        .insert(submissionPayload)
        .select('quest_id, status, proof_url, proof_data, review_notes, submitted_at')
        .single()

      if (submissionError) {
        setError('Failed to submit quest')
        setSubmitting(false)
        return false
      }

      // Update local state
      setSubmission({
        quest_id: questId,
        status: 'pending',
        proof_url: newSub!.proof_url,
        proof_data: newSub!.proof_data,
        review_notes: newSub!.review_notes,
        submitted_at: newSub!.submitted_at,
      })

      setSubmitting(false)
      return true
    } catch (err) {
      setError('Failed to submit quest')
      setSubmitting(false)
      return false
    }
  }

  return {
    quest,
    submission,
    loading,
    error,
    submitting,
    submitQuest,
    userAddress,
  }
}

export function useQuests() {
  const { account } = useWallet()
  const userAddress = typeof account === 'string' ? account : account?.address || null

  const [quests, setQuests] = useState<Quest[]>([])
  const [submissions, setSubmissions] = useState<Record<number, Submission>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadQuests() {
      setLoading(true)
      setError(null)

      try {
        // Fetch all active quests
        const { data: questsData, error: questsError } = await supabase
          .from('admin_quests')
          .select(`
            id, title, description, xp_reward, multiplier,
            multiplier_start, multiplier_end, comments,
            start_at, end_at, is_active,
            admin_user_profiles(partner_name),
            admin_quest_categories(name)
          `)
          .eq('is_active', true)
          .order('start_at', { ascending: true })

        if (questsError) {
          setError('Could not load challenges.')
          setLoading(false)
          return
        }

        const formattedQuests: Quest[] = questsData!.map(q => ({
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
          is_active: q.is_active,
          partner_name: q.admin_user_profiles?.partner_name || 'Unknown',
          category_name: q.admin_quest_categories?.name || null,
        }))

        setQuests(formattedQuests)

        // Fetch user's submissions if wallet is connected
        if (userAddress) {
          const { data: submissionsData } = await supabase
            .from('admin_quest_submissions')
            .select('quest_id, status, proof_url, proof_data, review_notes, submitted_at')
            .eq('user_address', userAddress)

          const submissionsMap: Record<number, Submission> = {}
          submissionsData?.forEach(s => {
            submissionsMap[s.quest_id] = {
              quest_id: s.quest_id,
              status: s.status,
              proof_url: s.proof_url,
              proof_data: s.proof_data,
              review_notes: s.review_notes,
              submitted_at: s.submitted_at,
            }
          })

          setSubmissions(submissionsMap)
        }

        setLoading(false)
      } catch (err) {
        setError('Failed to load quests')
        setLoading(false)
      }
    }

    loadQuests()
  }, [userAddress])

  return {
    quests,
    submissions,
    loading,
    error,
    userAddress,
  }
}
