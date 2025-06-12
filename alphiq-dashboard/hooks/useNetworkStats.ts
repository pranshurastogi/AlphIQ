// hooks/useNetworkStats.ts
'use client'

import useSWR from 'swr'

export type NetworkStats = {
  tps: number
  hashrate: number
  blockTimeSec: number
}

const EXPLORER_API = 'https://backend.mainnet.alephium.org'

const fetchNetworkStats = async (): Promise<NetworkStats> => {
  try {
    const toTs = Date.now()
    const fromTs = toTs - 60 * 60 * 1000  // last 1 hour

    // 1) TPS: transactions per second from tx count chart
    console.log('[NetworkStats] ▶️ fetching tx counts for TPS')
    const txRes = await fetch(
      `${EXPLORER_API}/charts/transactions-count?fromTs=${fromTs}&toTs=${toTs}&interval-type=hourly`
    )
    console.log('[NetworkStats] tx-counts status:', txRes.status)
    if (!txRes.ok) throw new Error(`Tx-counts fetch failed: ${txRes.status}`)
    const txData: Array<{ timestamp: number; value: number }> = await txRes.json()
    console.log('[NetworkStats] tx-counts payload:', txData)
    // value = count in that hour → TPS = count / 3600
    const lastTx = txData[txData.length - 1]?.value ?? 0
    const tps = Math.round(lastTx / 3600)
    console.log('[NetworkStats] ⚡️ computed TPS:', tps)

    // 2) Hashrate from hashrates chart
    console.log('[NetworkStats] ▶️ fetching hashrates chart')
    const hrRes = await fetch(
      `${EXPLORER_API}/charts/hashrates?fromTs=${fromTs}&toTs=${toTs}&interval-type=hourly`
    )
    console.log('[NetworkStats] hashrates status:', hrRes.status)
    if (!hrRes.ok) throw new Error(`Hashrates fetch failed: ${hrRes.status}`)
    const hrData: Array<{ timestamp: number; value: number }> = await hrRes.json()
    console.log('[NetworkStats] hashrates payload:', hrData)
    const hashrate = hrData[hrData.length - 1]?.value ?? 0
    console.log('[NetworkStats] ⚡️ current hashrate:', hashrate)

    // 3) Block Time from average-block-times
    console.log('[NetworkStats] ▶️ fetching average-block-times')
    const btRes = await fetch(`${EXPLORER_API}/infos/average-block-times`)
    console.log('[NetworkStats] avg-block-times status:', btRes.status)
    if (!btRes.ok) throw new Error(`Avg-block-times fetch failed: ${btRes.status}`)
    const btData: any = await btRes.json()
    console.log('[NetworkStats] avg-block-times payload:', btData)
    // payload could be object or array – pick first numeric field
    let blockTimeSec = 0
    if (Array.isArray(btData) && btData.length) {
      // try common field names
      blockTimeSec = Math.round(btData[0].averageBlockTime ?? btData[0].value ?? 0)
    } else if (typeof btData.averageBlockTime === 'number') {
      blockTimeSec = Math.round(btData.averageBlockTime)
    }
    console.log('[NetworkStats] ⏱ blockTimeSec:', blockTimeSec)

    return { tps, hashrate, blockTimeSec }
  } catch (err: any) {
    console.error('[NetworkStats] ❌ fetch error:', err)
    return { tps: 0, hashrate: 0, blockTimeSec: 0 }
  }
}

export function useNetworkStats() {
  const { data, error, isValidating } = useSWR('networkStats', fetchNetworkStats, {
    refreshInterval: 10_000,
  })

  console.log('[useNetworkStats] data:', data, 'error:', error, 'validating:', isValidating)

  return {
    stats: data,
    isLoading: !error && !data,
    isError: !!error,
    isRefreshing: isValidating,
  }
}
