// components/ContractDecoder.tsx
'use client'

import { useState } from 'react'
import useSWR from 'swr'
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Copy } from 'lucide-react'

const NODE_API = 'https://node.mainnet.alephium.org'
const fetcher = async (url: string) => {
  const res = await fetch(url)
  if (!res.ok) {
    const err = new Error(`HTTP ${res.status}`)
    // attach status so we can inspect it later
    ;(err as any).status = res.status
    throw err
  }
  return res.json()
}

export function ContractDecoder() {
  const [contractId, setContractId] = useState<string>('')
  const [shouldFetch, setShouldFetch] = useState(false)

  // 1) fetch on-chain state from contract address
  const stateKey = shouldFetch && contractId
    ? `${NODE_API}/contracts/${contractId}/state`
    : null

  const {
    data: state,
    error: sErr,
    isValidating: sLoading,
  } = useSWR(stateKey, fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
  })

  // 2) once state arrives, use its codeHash to fetch raw bytecode
  const codeHash = (state as any)?.codeHash
  const codeKey = codeHash
    ? `${NODE_API}/contracts/${codeHash}/code`
    : null

  const {
    data: code,
    error: cErr,
    isValidating: cLoading,
  } = useSWR(codeKey, fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
  })

  const isLoading = sLoading || cLoading
  const isError   = !!sErr || !!cErr

  // copy helper
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).catch(() => {
      /* swallow */
    })
  }

  // detect 404 on state fetch
  const invalidAddress = (sErr as any)?.status === 404

  return (
    <Card className="bg-card/50 border-white/10">
      <CardHeader>
        <CardTitle>Contract Decoder</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">

        {/* — Input + Fetch Button — */}
        <div className="flex space-x-2">
          <Input
            placeholder="Enter contract address…"
            value={contractId}
            onChange={e => {
              setContractId(e.target.value.trim())
              setShouldFetch(false)
            }}
            className="flex-1 bg-white/5 border-white/10 placeholder:text-neutral/50"
          />
          <Button
            disabled={!contractId || isLoading}
            onClick={() => setShouldFetch(true)}
          >
            Fetch
          </Button>
        </div>

        <Separator className="bg-white/10" />

        {/* — No ID yet — */}
        {!shouldFetch && !state && !code && (
          <div className="text-neutral/70 text-center text-sm">
            Type an on-chain contract address and hit “Fetch”
          </div>
        )}

        {/* — Invalid address error — */}
        {invalidAddress && (
          <div className="text-red-400 text-center">
            ✘ Invalid contract address
          </div>
        )}

        {/* — Loading — */}
        {shouldFetch && isLoading && !invalidAddress && (
          <div className="text-neutral/70 text-center">Loading…</div>
        )}

        {/* — Other errors — */}
        {isError && !invalidAddress && !isLoading && (
          <div className="text-red-400 text-center">
            Failed to load {sErr ? 'state' : ''}{sErr && cErr ? ' & ' : ''}{cErr ? 'code' : ''}
          </div>
        )}

        {/* — Success: show state & code — */}
        {state && code && !isLoading && !invalidAddress && (
          <div className="space-y-6 relative">

            {/* On-chain State */}
            <div className="relative">
              <h3 className="text-sm font-semibold text-mint mb-1">
                On-chain State (ID: {contractId})
              </h3>
              <pre className="overflow-auto text-xs bg-black/20 p-3 rounded">
                {JSON.stringify(state, null, 2)}
              </pre>
              <Copy
                className="absolute bottom-2 right-2 w-4 h-4 text-neutral hover:text-mint cursor-pointer"
                onClick={() => copyToClipboard(JSON.stringify(state, null, 2))}
                title="Copy state JSON"
              />
            </div>

            {/* Raw Bytecode */}
            <div className="relative">
              <h3 className="text-sm font-semibold text-mint mb-1">
                Raw Bytecode (codeHash: {codeHash})
              </h3>
              <pre className="overflow-auto text-xs bg-black/20 p-3 rounded">
                {JSON.stringify(code, null, 2)}
              </pre>
              <Copy
                className="absolute bottom-2 right-2 w-4 h-4 text-neutral hover:text-mint cursor-pointer"
                onClick={() => copyToClipboard(JSON.stringify(code, null, 2))}
                title="Copy code JSON"
              />
            </div>

          </div>
        )}
      </CardContent>
    </Card>
  )
}
