'use client'

import { useState } from 'react'
import { useWallet } from '@alephium/web3-react'
import ReactMarkdown from 'react-markdown'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AlertTriangle, Loader2 } from 'lucide-react'

// Helper function to check if we're in development
const isDevelopment = () => process.env.NODE_ENV === 'development'

// Safe logging function that only logs in development
const safeLog = (level: 'log' | 'warn' | 'error', ...args: any[]) => {
  if (isDevelopment()) {
    console[level](...args)
  }
}

const EXPLORER_API = 'https://backend.mainnet.alephium.org'
const AIML_API_URL = 'https://api.aimlapi.com/v1/chat/completions'
const AIML_MODEL   = 'google/gemma-3n-e4b-it'
const AIML_API_KEY = process.env.AIML_API_KEY

// Debug API key status
if (isDevelopment()) {
  safeLog('log', '[OnchainAI] API Key exists:', !!AIML_API_KEY)
  safeLog('log', '[OnchainAI] API Key length:', AIML_API_KEY?.length || 0)
}

function attoToAlph(atto: string): number {
  try { 
    const attoBigInt = BigInt(atto)
    const divisor = BigInt('1000000000000000000') // 10^18
    return Number(attoBigInt / divisor)
  }
  catch { return 0 }
}

export function OnchainAIAnalyzer() {
  const { account } = useWallet()
  const address = typeof account === 'string' ? account : account?.address

  const [loading, setLoading] = useState(false)
  const [summary, setSummary] = useState<string>('')
  const [error, setError]     = useState<string | null>(null)

  const handleSummarize = async () => {
    if (!address) {
      setError('🔗 Please connect your wallet first.')
      return
    }

    setLoading(true)
    setError(null)
    setSummary('')

    try {
      // Call our secure server-side API
      const response = await fetch('/api/ai-analysis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ address }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `Request failed (${response.status})`)
      }

      const data = await response.json()
      setSummary(data.summary || 'No insights available.')
    } catch (e: any) {
      safeLog('error', '[OnchainAI] Error:', e)
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="bg-card/50 border-white/10 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-amber flex items-center">
          <AlertTriangle className="w-5 h-5 mr-2" />
          Onchain AI Analyzer
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Button
          onClick={handleSummarize}
          disabled={loading}
          className="mb-4"
        >
          {loading
            ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Analyzing…</>
            : 'Get AI Insights'}
        </Button>

        {error && <div className="text-red-400 mb-2">{error}</div>}

        {summary && (
          <div className="prose prose-invert max-w-none">
            <ReactMarkdown
              components={{
                h2: ({ node, ...props }) => (
                  <h2 className="text-mint text-lg font-semibold my-2" {...props} />
                ),
                strong: ({ node, ...props }) => (
                  <strong className="text-amber font-bold" {...props} />
                ),
                li: ({ node, ...props }) => (
                  <li className="ml-4 list-disc text-neutral mb-1" {...props} />
                ),
                code: ({ node, ...props }) => (
                  <code className="bg-white/10 px-1 rounded text-xs font-mono" {...props} />
                ),
              }}
            >
              {summary}
            </ReactMarkdown>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
