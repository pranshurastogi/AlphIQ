// components/WalletProfiler.tsx
'use client'

import { useWallet } from '@alephium/web3-react'
import useSWR from 'swr'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'
import {
  ArrowUpRight,
  ArrowDownLeft,
  ExternalLink,
  Wallet as WalletIcon
} from 'lucide-react'
import { LineChart, Line, ResponsiveContainer, Tooltip, XAxis } from 'recharts'

const EXPLORER_API = 'https://backend.mainnet.alephium.org'
const EXPLORER_BASE = 'https://explorer.alephium.org/addresses'

// Simple fetcher that throws on HTTP error
const fetcher = async (url: string) => {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Fetch error ${res.status} for ${url}`)
  return res.json()
}

export function WalletProfiler() {
  const { account: acctObj } = useWallet()
  const address = typeof acctObj === 'string' ? acctObj : acctObj?.address

  // 1) Address info (balance, txNumber) — polls every 5m
  const {
    data: addrInfo,
    error: addrErr,
    isValidating: addrLoading
  } = useSWR(
    address ? `${EXPLORER_API}/addresses/${address}` : null,
    fetcher,
    {
      refreshInterval: 300_000,
      revalidateOnFocus: false,
      revalidateOnReconnect: false
    }
  )

  // 2) Transactions list — polls every 5m
  const {
    data: txs,
    error: txErr,
    isValidating: txLoading
  } = useSWR(
    address ? `${EXPLORER_API}/addresses/${address}/transactions` : null,
    fetcher,
    {
      refreshInterval: 300_000,
      revalidateOnFocus: false,
      revalidateOnReconnect: false
    }
  )

  // —————————————————————————————
  // Prepare Balance & Total TX
  // —————————————————————————————
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

  // —————————————————————————————
  // Process & filter recent non-zero transfers
  // —————————————————————————————
  const processed = Array.isArray(txs)
    ? (txs as any[])
        .map(tx => {
          const inSum = (tx.inputs as any[])
            .filter(i => i.address === address)
            .reduce((sum, i) => sum + BigInt(i.attoAlphAmount), 0n)
          const outSum = (tx.outputs as any[])
            .filter(o => o.address === address)
            .reduce((sum, o) => sum + BigInt(o.attoAlphAmount), 0n)
          const net = outSum - inSum
          return { tx, net }
        })
        .filter(({ net }) => net !== 0n)
    : []
  const recent = processed.slice(0, 5)

  // —————————————————————————————
  // Build 7-day sparkline (tx count) client-side
  // —————————————————————————————
  const today = new Date()
  const buckets: { date: string; count: number }[] = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    buckets.push({ date: d.toISOString().slice(0, 10), count: 0 })
  }
  processed.forEach(({ tx }) => {
    const day = new Date(tx.timestamp).toISOString().slice(0, 10)
    const b = buckets.find(b => b.date === day)
    if (b) b.count += 1
  })
  const sparkData = buckets.map(b => ({ timestamp: b.date, value: b.count }))

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
          <div className="text-2xl font-bold text-amber">
            {balanceDisplay}
          </div>
        </div>

        <Separator className="bg-white/10" />

        {/* Total TX */}
        <div className="space-y-2">
          <div className="text-sm text-neutral/70">Total TX</div>
          <div className="text-xl font-medium text-mint">
            {totalTxDisplay}
          </div>
        </div>

        <Separator className="bg-white/10" />

        {/* Recent Transfers */}
        {(txLoading || (!address && !txs)) && (
          <div className="text-neutral/70 text-center">
            Loading transactions…
          </div>
        )}
        {txErr && (
          <div className="text-red-400 text-center">
            Failed to load transactions
          </div>
        )}
        {!txErr && recent.length === 0 && !txLoading && (
          <div className="text-neutral/70 text-center">
            No recent transfers
          </div>
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
              const fee =
                Number(BigInt(tx.gasAmount) * BigInt(tx.gasPrice)) /
                1e18
              const time = new Date(tx.timestamp).toLocaleString()

              return (
                <div
                  key={tx.hash}
                  className="flex justify-between items-start"
                >
                  <div className="flex items-center space-x-2">
                    {icon}
                    <span className="font-mono text-sm text-neutral/70">
                      {tx.hash.slice(0, 6)}…
                      {tx.hash.slice(-6)}
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
                      })}{' '}
                      ALPH
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

        <Separator className="bg-white/10" />
        
{/* 7-Day Sparkline */}
{!sparkData ? (
  <div className="text-neutral/70 text-center text-sm">Loading…</div>
) : (
  <div className="select-none">
    <ResponsiveContainer width="100%" height={40}>
      <LineChart data={sparkData}>
        {/* 👇 Add this line: explicitly bind timestamp */}
        <XAxis dataKey="timestamp" hide />

        <Tooltip
          cursor={false}
          contentStyle={{
            backgroundColor: 'rgba(0,0,0,0.8)',
            border: 'none',
            padding: '4px 8px',
            borderRadius: '4px',
            color: '#E0E0E0',
            fontSize: '12px'
          }}
          labelFormatter={dateStr =>
            new Date(dateStr).toLocaleDateString(undefined, {
              month: 'short',
              day: 'numeric'
            })
          }
          formatter={(value: number) => [`${value} txs`, '']}
        />

        <Line
          type="monotone"
          dataKey="value"
          stroke="#FF8A65"
          dot={false}
          strokeWidth={2}
        />
      </LineChart>
    </ResponsiveContainer>

    <div className="text-xs text-neutral/50 text-center mt-1">
      Tx Count (last 7 days)
    </div>
  </div>
)}

      </CardContent>
    </Card>
  )
}
