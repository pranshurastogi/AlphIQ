// components/WalletProfiler.tsx
'use client'

import useSWR from 'swr'
import { useWallet } from '@alephium/web3-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Wallet as WalletIcon } from 'lucide-react'

const EXPLORER_API = 'https://backend.mainnet.alephium.org'

// Throws on HTTP error
const fetcher = async (url: string) => {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Fetch error ${res.status} for ${url}`)
  return res.json()
}

export function WalletProfiler() {
  const { account: acctObj, connectionStatus } = useWallet()
  const address = typeof acctObj === 'string' ? acctObj : acctObj?.address

  const shouldFetch = Boolean(address)
  const { data, error, isValidating } = useSWR(
    shouldFetch ? `${EXPLORER_API}/addresses/${address}` : null,
    fetcher,
    { refreshInterval: 15_000 }
  )

  console.log('[WalletProfiler] address:', address)
  console.log('[WalletProfiler] data:', data, 'error:', error, 'validating:', isValidating)

  let balanceDisplay: string
  let totalTxDisplay: string

  if (!address) {
    balanceDisplay = '—'
    totalTxDisplay = '—'
  } else if (isValidating && !data) {
    balanceDisplay = 'Loading…'
    totalTxDisplay = 'Loading…'
  } else if (error) {
    balanceDisplay = 'Error'
    totalTxDisplay = 'Error'
  } else {
    // data has shape { balance: string, lockedBalance: string, txNumber: number }
    try {
      const raw = BigInt((data as any).balance)
      const alph = Number(raw) / 1e18
      balanceDisplay = `${alph.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ALPH`
    } catch (e) {
      console.error('[WalletProfiler] balance parse error:', e)
      balanceDisplay = 'Error'
    }
    totalTxDisplay = String((data as any).txNumber ?? 0)
  }

  return (
    <Card className="bg-card/50 border-white/10 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-amber flex items-center">
          <WalletIcon className="w-5 h-5 mr-2" />
          Wallet Profiler
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Balance */}
        <div className="space-y-2">
          <div className="text-sm text-neutral/70">Balance</div>
          <div className="text-2xl font-bold text-amber">{balanceDisplay}</div>
        </div>

        <Separator className="bg-white/10" />

        {/* Total TX */}
        <div className="space-y-2">
          <div className="text-sm text-neutral/70">Total TX</div>
          <div className="text-xl font-medium text-mint">{totalTxDisplay}</div>
        </div>
      </CardContent>
    </Card>
  )
}
