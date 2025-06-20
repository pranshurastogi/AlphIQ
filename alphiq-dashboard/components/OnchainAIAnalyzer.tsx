// components/OnchainAIAnalyzer.tsx
'use client'

import { useState } from 'react'
import { useWallet } from '@alephium/web3-react'
import ReactMarkdown from 'react-markdown'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AlertTriangle, Loader2 } from 'lucide-react'

const EXPLORER_API = 'https://backend.mainnet.alephium.org'
const AIML_API_URL = 'https://api.aimlapi.com/v1/chat/completions'
const AIML_MODEL   = 'google/gemma-3n-e4b-it'
const AIML_API_KEY = process.env.NEXT_PUBLIC_AIMLAPI_KEY

function attoToAlph(atto: string): number {
  try { return Number(BigInt(atto) / 10n**18n) }
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
      // 1) Fetch all transactions (no limit param)
      const txRes = await fetch(`${EXPLORER_API}/addresses/${address}/transactions`)
      if (!txRes.ok) {
        console.error('[OnchainAI] tx fetch error', txRes.status, txRes.statusText)
        throw new Error(`Transactions fetch failed (${txRes.status})`)
      }
      const rawTxs: any[] = await txRes.json()
      console.log('[OnchainAI] fetched txs count:', rawTxs.length)

      // 2) Keep only the last 30 days, then up to 50 most recent
      const thirtyAgo = Date.now() - 30 * 24 * 3600 * 1000
      const recent = rawTxs
        .filter(tx => tx.timestamp >= thirtyAgo)
        .slice(-50)
        .map(tx => ({
          hash: tx.hash,
          date: new Date(tx.timestamp).toLocaleDateString(),
          in:   attoToAlph(tx.inputs?.[0]?.attoAlphAmount ?? '0'),
          out:  attoToAlph(tx.outputs?.[0]?.attoAlphAmount ?? '0'),
          fee:  attoToAlph(
                  (BigInt(tx.gasAmount) * BigInt(tx.gasPrice)).toString()
                )
        }))
      console.log('[OnchainAI] recent txs for analysis:', recent.length)

      // 3) Build a richer prompt
      const prompt = `
You are a friendly on-chain AI analyst. Provide a **Markdown** summary of this wallet’s past 30 days on Alephium:
- **H2 headings** for sections.
- **Bullet points** with **bold** key figures.
- One “fun fact” or interesting insight at the end.

Here are the transactions JSON:
\`\`\`json
${JSON.stringify(recent, null, 2)}
\`\`\`
      `.trim()

      // 4) Call the LLM
      const aiRes = await fetch(AIML_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type':  'application/json',
          'Authorization': `Bearer ${AIML_API_KEY}`
        },
        body: JSON.stringify({
          model: AIML_MODEL,
          messages: [{ role: 'user', content: prompt }]
        })
      })
      if (!aiRes.ok) {
        console.error('[OnchainAI] AI API error', aiRes.status, aiRes.statusText)
        throw new Error(`AI API request failed (${aiRes.status})`)
      }
      const aiJson = await aiRes.json()
      console.log('[OnchainAI] aiJson:', aiJson)
      const md = aiJson.choices?.[0]?.message?.content
      setSummary(md ?? 'No insights returned.')
    } catch (e: any) {
      console.error('[OnchainAI] Error:', e)
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
