// components/WalletProfiler.tsx
'use client'

import { useWallet } from '@alephium/web3-react'
import useSWR from 'swr'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'
import { ArrowUpRight, ArrowDownLeft, ExternalLink, Wallet as WalletIcon } from 'lucide-react'

const EXPLORER_API = 'https://backend.mainnet.alephium.org'
const EXPLORER_BASE = 'https://explorer.alephium.org/addresses'

// throws on HTTP error
const fetcher = async (url: string) => {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Fetch error ${res.status} for ${url}`)
  return res.json()
}

export function WalletProfiler() {
  const { account: acctObj } = useWallet()
  const address = typeof acctObj === 'string' ? acctObj : acctObj?.address

  // 1) Fetch address summary
  const { data: addrInfo, error: addrErr, isValidating: addrLoading } = useSWR(
    address ? `${EXPLORER_API}/addresses/${address}` : null,
    fetcher,
    { refreshInterval: 300_000 }
  )

  // 2) Fetch full tx list
  const { data: txs, error: txErr, isValidating: txLoading } = useSWR(
    address ? `${EXPLORER_API}/addresses/${address}/transactions` : null,
    fetcher,
    { refreshInterval: 300_000 }
  )

  // Balance & total tx
  let balanceDisplay = '—'
  let totalTxDisplay = '—'
  if (address) {
    if (addrLoading && !addrInfo) {
      balanceDisplay = 'Loading…'
      totalTxDisplay = 'Loading…'
    } else if (addrErr) {
      balanceDisplay = 'Error'
      totalTxDisplay = 'Error'
    } else if (addrInfo) {
      try {
        const raw = BigInt((addrInfo as any).balance)
        const alph = Number(raw) / 1e18
        balanceDisplay = `${alph.toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        })} ALPH`
      } catch {
        balanceDisplay = 'Error'
      }
      totalTxDisplay = String((addrInfo as any).txNumber ?? 0)
    }
  }

  // Process & filter transactions for net != 0
  const processed = Array.isArray(txs)
    ? (txs as any[])
        .map(tx => {
          // net = outputs_to_address - inputs_from_address
          const inSum = (tx.inputs as any[])
            .filter(i => i.address === address)
            .reduce((sum, i) => sum + BigInt(i.attoAlphAmount), 0n)
          const outSum = (tx.outputs as any[])
            .filter(o => o.address === address)
            .reduce((sum, o) => sum + BigInt(o.attoAlphAmount), 0n)
          const net = outSum - inSum // positive = incoming

          return { tx, net }
        })
        .filter(({ net }) => net !== 0n)
    : []

  // show up to 5
  const recent = processed.slice(0, 5)

  return (
    <Card className="bg-card/50 border-white/10 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-amber flex items-center space-x-2">
          <WalletIcon className="w-5 h-5" />
          <span>Wallet Profiler</span>
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

        <Separator className="bg-white/10" />

        {/* Recent Activity */}
        {(txLoading || (!address && !txs)) && (
          <div className="text-neutral/70 text-center">Loading transactions…</div>
        )}
        {txErr && (
          <div className="text-red-400 text-center">Failed to load transactions</div>
        )}
        {!txErr && recent.length === 0 && !txLoading && (
          <div className="text-neutral/70 text-center">No recent transfers</div>
        )}
        {recent.length > 0 && (
          <div className="space-y-3">
            {recent.map(({ tx, net }) => {
              const isIncoming = net > 0n
              const icon = isIncoming ? (
                <ArrowDownLeft className="w-4 h-4 text-mint" />
              ) : (
                <ArrowUpRight className="w-4 h-4 text-red-400" />
              )
              const amount = Number(net < 0n ? -net : net) / 1e18
              const fee = Number(BigInt(tx.gasAmount) * BigInt(tx.gasPrice)) / 1e18
              const time = new Date(tx.timestamp).toLocaleString()

              return (
                <div key={tx.hash} className="flex justify-between items-start">
                  <div className="flex items-center space-x-2">
                    {icon}
                    <span className="font-mono text-sm text-neutral/70">
                      {tx.hash.slice(0, 6)}…{tx.hash.slice(-6)}
                    </span>
                  </div>
                  <div className="text-right space-y-1">
                    <div
                      className={`font-medium ${
                        isIncoming ? 'text-mint' : 'text-red-400'
                      }`}
                    >
                      {isIncoming ? '+' : '-'}
                      {amount.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                      })} ALPH
                    </div>
                    <div className="text-xs text-neutral/50">
                      Fee: {fee.toFixed(6)} ALPH · {time}
                    </div>
                  </div>
                </div>
              )
            })}

            {/* View More */}
            {Array.isArray(txs) && processed.length > 5 && (
              <div className="pt-2 text-center">
                <a
                  href={`${EXPLORER_BASE}/${address}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button variant="ghost" size="sm">
                    View More <ExternalLink className="w-4 h-4 ml-1" />
                  </Button>
                </a>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
