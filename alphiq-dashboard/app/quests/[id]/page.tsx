'use client'

import React from 'react'
import { useParams } from 'next/navigation'
import QuestDetail from '@/components/QuestDetail'
import ErrorPage from '@/components/ErrorPage'

export default function QuestDetailPage() {
  const params = useParams()
  const questId = params?.id

  if (!questId || typeof questId !== 'string') {
    return <ErrorPage message="Invalid quest ID" />
  }

  return <QuestDetail questId={parseInt(questId)} />
}
