// components/WalletProfiler.tsx
'use client'

import { useMemo } from 'react'
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

import { useAddressInfo } from '@/hooks/useAddressInfo'
import { useAddressTransactions, AddressTx } from '@/hooks/useAddressTransactions'

const EXPLORER_BASE = 'https://explorer.alephium.org/addresses'

// helpers
function truncate(addr: string, front = 5, back = 5) {
  if (addr.length <= front + back) return addr
  return `${addr.slice(0, front)}…${addr.slice(-back)}`
}
function getSizeEmoji(avg: number): string {
  if (avg < 1) return '🪨'
  if (avg < 50) return '🐟'
  if (avg < 500) return '🐬'
  if (avg < 1_000) return '🐋'
  if (avg < 100_000) return '🦈'
  return '🐲'
}

export function WalletProfiler() {
  const { account: acctObj } = useWallet()
  const address = typeof acctObj === 'string' ? acctObj : acctObj?.address

  // 1) Address info
  const {
    info: addrInfo,
    isLoading: infoLoading,
    isError: infoError
  } = useAddressInfo(address)

  // 2) Transactions
  const {
    txs,
    isLoading: txLoading,
    isError: txError
  } = useAddressTransactions(address)

  // 3) Net transfers
  const processed = useMemo(() => {
    if (!Array.isArray(txs) || !address) return []
    return (txs as AddressTx[])
      .map(tx => {
        const inSum = tx.inputs
          .filter(i => i.address === address)
          .reduce((s, i) => s + BigInt(i.attoAlphAmount ?? "0"), 0n)
        const outSum = tx.outputs
          .filter(o => o.address === address)
          .reduce((s, o) => s + BigInt(o.attoAlphAmount ?? "0"), 0n)
        return { tx, net: outSum - inSum }
      })
      .filter(({ net }) => net !== 0n)
  }, [txs, address])
  const recent = processed.slice(0, 5)

  // 4) Balance & Total TX
  let balanceDisplay = '—'
  let totalTxDisplay = '—'
  if (address && addrInfo) {
    try {
      const alph = Number(BigInt(addrInfo.balance ?? "0")) / 1e18
      balanceDisplay = `${alph.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })} ALPH`
    } catch {
      balanceDisplay = 'Error'
    }
    totalTxDisplay = String(addrInfo.txNumber ?? 0)
  }

  // 5) Avg Tx Size & Fee (last 50)
  const { avgSize, avgFee } = useMemo(() => {
    if (!Array.isArray(txs) || !address) return { avgSize: 0, avgFee: 0 }
    const slice = (txs as AddressTx[]).slice(0, 50)
    let sumSize = 0, sumFee = 0
    slice.forEach(tx => {
      const inSum = tx.inputs
        .filter(i => i.address === address)
        .reduce((s, i) => s + BigInt(i.attoAlphAmount ?? "0"), 0n)
      const outSum = tx.outputs
        .filter(o => o.address === address)
        .reduce((s, o) => s + BigInt(o.attoAlphAmount ?? "0"), 0n)
      sumSize += Number(outSum - inSum) / 1e18
      sumFee += Number((BigInt(tx.gasAmount) * BigInt(tx.gasPrice)) / 10n**18n)
    })
    return { avgSize: sumSize / slice.length, avgFee: sumFee / slice.length }
  }, [txs, address])

  // 6) 7-day sparkline
  const sparkData = useMemo(() => {
    if (!Array.isArray(txs)) return []
    const today = new Date()
    const buckets: Record<string, number> = {}
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today)
      d.setDate(d.getDate() - i)
      buckets[d.toISOString().slice(0, 10)] = 0
    }
    ;(txs as AddressTx[]).forEach(tx => {
      const day = new Date(tx.timestamp).toISOString().slice(0, 10)
      if (buckets[day] !== undefined) buckets[day]++
    })
    return Object.entries(buckets).map(([date, count]) => ({
      timestamp: date,
      value: count
    }))
  }, [txs])

  return (
    <Card className="bg-card/50 border-white/10 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-amber flex items-center space-x-2">
          <WalletIcon className="w-5 h-5" /> <span>Wallet Profiler</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Balance */}
        <div>
          <div className="text-sm text-neutral/70">Balance</div>
          <div className="text-2xl font-bold text-amber">{balanceDisplay}</div>
        </div>

        <Separator className="bg-white/10" />

        {/* Total TX */}
        <div>
          <div className="text-sm text-neutral/70">Total TX</div>
          <div className="text-xl font-medium text-mint">{totalTxDisplay}</div>
        </div>

        <Separator className="bg-white/10" />

        {/* Avg Size & Fee */}
        <div className="flex space-x-6">
          <div className="flex items-center space-x-2">
            <span>🧾</span>
            <div>
              <div className="text-xs text-neutral/70">Avg Tx Size {getSizeEmoji(avgSize)}</div>
              <div className="text-lg font-bold">{avgSize.toFixed(2)} ALPH</div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <span>⛽</span>
            <div>
              <div className="text-xs text-neutral/70">Avg Fee</div>
              <div className="text-lg font-bold">{avgFee.toFixed(6)} ALPH</div>
            </div>
          </div>
        </div>

        <Separator className="bg-white/10" />

        {/* Recent Transfers */}
        {(txLoading || !txs) && (
          <div className="text-neutral/70 text-center">Loading transactions…</div>
        )}
        {txError && (
          <div className="text-red-400 text-center">Failed to load transactions</div>
        )}
        {!txError && recent.length === 0 && (
          <div className="text-neutral/70 text-center">No recent transfers</div>
        )}
        {recent.length > 0 && (
          <div className="space-y-3">
            {recent.map(({ tx, net }) => {
              const isIn = net > 0n
              const icon = isIn ? (
                <ArrowDownLeft className="w-4 h-4 text-mint" />
              ) : (
                <ArrowUpRight className="w-4 h-4 text-red-400" />
              )
              const amount = Number(net < 0n ? -net : net) / 1e18
              const fee = Number((BigInt(tx.gasAmount) * BigInt(tx.gasPrice)) / 10n**18n)
              const time = new Date(tx.timestamp).toLocaleString()

              return (
                <div key={tx.hash} className="flex justify-between items-start">
                  <div className="flex items-center space-x-2">
                    {icon}
                    <span className="font-mono text-sm text-neutral/70">
                      {truncate(tx.hash, 5, 5)}
                    </span>
                  </div>
                  <div className="text-right space-y-1">
                    <div className={`font-medium ${isIn ? 'text-mint' : 'text-red-400'}`}>
                      {isIn ? '+' : '-'}
                      {amount.toLocaleString(undefined, { minimumFractionDigits:2, maximumFractionDigits:2 })} ALPH
                    </div>
                    <div className="text-xs text-neutral/50">
                      Fee: {fee.toFixed(6)} ALPH · {time}
                    </div>
                  </div>
                </div>
              )
            })}

            {processed.length > 5 && (
              <div className="pt-2 text-center">
                <a href={`${EXPLORER_BASE}/${address}`} target="_blank" rel="noopener noreferrer">
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
        {sparkData.length === 0 ? (
          <div className="text-neutral/70 text-center text-sm">Loading…</div>
        ) : (
          <div className="select-none">
            <ResponsiveContainer width="100%" height={40}>
              <LineChart data={sparkData}>
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
                  labelFormatter={d =>
                    new Date(d).toLocaleDateString(undefined, { month:'short',day:'numeric' })
                  }
                  formatter={(v: number) => [`${v} txs`, '']}
                />
                <Line type="monotone" dataKey="value" stroke="#FF8A65" dot={false} strokeWidth={2} />
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
