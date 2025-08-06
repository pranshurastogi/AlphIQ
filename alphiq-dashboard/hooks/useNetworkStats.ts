// hooks/useNetworkStats.ts
'use client'

import useSWR from 'swr'

// Helper function to check if we're in development
const isDevelopment = () => process.env.NODE_ENV === 'development'

// Safe logging function that only logs in development
const safeLog = (level: 'log' | 'warn' | 'error', ...args: any[]) => {
  if (isDevelopment()) {
    console[level](...args)
  }
}

export type NetworkStats = {
  totalTx: number
  hashratePh: number
  totalAlph: number
  circulatingAlph: number
}

const EXPLORER_API = 'https://backend.mainnet.alephium.org'

const fetchNetworkStats = async (): Promise<NetworkStats> => {
  try {
    // 1) Total Transactions
    const txRes = await fetch(`${EXPLORER_API}/infos/total-transactions`)
    if (!txRes.ok) throw new Error(`total-transactions failed: ${txRes.status}`)
    const totalTxRaw: number = await txRes.json()
    const totalTx = totalTxRaw

    // 2) Hashrate chart (H/s → PH/s)
    const toTs = Date.now()
    const fromTs = toTs - 60 * 60 * 1000
    const hrRes = await fetch(
      `${EXPLORER_API}/charts/hashrates?fromTs=${fromTs}&toTs=${toTs}&interval-type=hourly`
    )
    if (!hrRes.ok) throw new Error(`hashrates failed: ${hrRes.status}`)
    const hrData: Array<{ value: number }> = await hrRes.json()
    const lastHr = hrData[hrData.length - 1]?.value ?? 0
    const hashratePh = Number((lastHr / 1e15).toFixed(2))

    // 3) Total ALPH
    const taRes = await fetch(`${EXPLORER_API}/infos/supply/total-alph`)
    if (!taRes.ok) throw new Error(`total-alph failed: ${taRes.status}`)
    const totalAlphRaw: number = await taRes.json()
    const totalAlph = Number(totalAlphRaw.toFixed(2))

    // 4) Circulating ALPH
    const caRes = await fetch(`${EXPLORER_API}/infos/supply/circulating-alph`)
    if (!caRes.ok) throw new Error(`circulating-alph failed: ${caRes.status}`)
    const circulatingAlphRaw: number = await caRes.json()
    const circulatingAlph = Number(circulatingAlphRaw.toFixed(2))

    return { totalTx, hashratePh, totalAlph, circulatingAlph }
  } catch (err: any) {
    safeLog('error', '[NetworkStats] fetch error:', err.message)
    return { totalTx: 0, hashratePh: 0, totalAlph: 0, circulatingAlph: 0 }
  }
}

export function useNetworkStats() {
  const { data, error, isValidating } = useSWR('networkStats', fetchNetworkStats, {
    refreshInterval: 10_000,
  })
  
  return {
    stats: data,
    isLoading: !error && !data,
    isError: !!error,
    isRefreshing: isValidating,
  }
}
