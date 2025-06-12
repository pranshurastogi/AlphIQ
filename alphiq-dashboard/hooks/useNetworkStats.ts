// hooks/useNetworkStats.ts
'use client'

import useSWR from 'swr'

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
    console.log('[NetworkStats] ▶️ fetching /infos/total-transactions')
    const txRes = await fetch(`${EXPLORER_API}/infos/total-transactions`)
    console.log('[NetworkStats] total-transactions status:', txRes.status)
    if (!txRes.ok) throw new Error(`total-transactions failed: ${txRes.status}`)
    const totalTxRaw: number = await txRes.json()
    console.log('[NetworkStats] totalTxRaw:', totalTxRaw)
    const totalTx = totalTxRaw

    // 2) Hashrate chart (H/s → PH/s)
    console.log('[NetworkStats] ▶️ fetching /charts/hashrates')
    const toTs = Date.now()
    const fromTs = toTs - 60 * 60 * 1000
    const hrRes = await fetch(
      `${EXPLORER_API}/charts/hashrates?fromTs=${fromTs}&toTs=${toTs}&interval-type=hourly`
    )
    console.log('[NetworkStats] hashrates status:', hrRes.status)
    if (!hrRes.ok) throw new Error(`hashrates failed: ${hrRes.status}`)
    const hrData: Array<{ value: number }> = await hrRes.json()
    console.log('[NetworkStats] hrData:', hrData)
    const lastHr = hrData[hrData.length - 1]?.value ?? 0
    const hashratePh = Number((lastHr / 1e15).toFixed(2))
    console.log('[NetworkStats] hashratePh:', hashratePh)

    // 3) Total ALPH
    console.log('[NetworkStats] ▶️ fetching /infos/supply/total-alph')
    const taRes = await fetch(`${EXPLORER_API}/infos/supply/total-alph`)
    console.log('[NetworkStats] total-alph status:', taRes.status)
    if (!taRes.ok) throw new Error(`total-alph failed: ${taRes.status}`)
    const totalAlphRaw: number = await taRes.json()
    console.log('[NetworkStats] totalAlphRaw:', totalAlphRaw)
    const totalAlph = Number(totalAlphRaw.toFixed(2))
    console.log('[NetworkStats] totalAlph:', totalAlph)

    // 4) Circulating ALPH
    console.log('[NetworkStats] ▶️ fetching /infos/supply/circulating-alph')
    const caRes = await fetch(`${EXPLORER_API}/infos/supply/circulating-alph`)
    console.log('[NetworkStats] circulating-alph status:', caRes.status)
    if (!caRes.ok) throw new Error(`circulating-alph failed: ${caRes.status}`)
    const circulatingAlphRaw: number = await caRes.json()
    console.log('[NetworkStats] circulatingAlphRaw:', circulatingAlphRaw)
    const circulatingAlph = Number(circulatingAlphRaw.toFixed(2))
    console.log('[NetworkStats] circulatingAlph:', circulatingAlph)

    return { totalTx, hashratePh, totalAlph, circulatingAlph }
  } catch (err: any) {
    console.error('[NetworkStats] fetch error:', err)
    return { totalTx: 0, hashratePh: 0, totalAlph: 0, circulatingAlph: 0 }
  }
}

export function useNetworkStats() {
  const { data, error, isValidating } = useSWR('networkStats', fetchNetworkStats, {
    refreshInterval: 10_000,
  })
  console.log('[useNetworkStats]', { data, error, isValidating })
  return {
    stats: data,
    isLoading: !error && !data,
    isError: !!error,
    isRefreshing: isValidating,
  }
}
