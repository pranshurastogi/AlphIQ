// hooks/useTokenDistribution.ts
import useSWR from 'swr'

export type HolderInfo = {
  address: string
  short: string
  balance: number    // in ALPH
  pct: number        // percent of total supply
}

export function useTokenDistribution() {
  const EXPLORER_API = 'https://backend.mainnet.alephium.org'
  const fetcher = async (url: string) => {
    const res = await fetch(url)
    if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`)
    return res.json()
  }

  const { data: holdersRaw, error: holdersErr } = useSWR(
    `${EXPLORER_API}/tokens/holders/alph`,
    fetcher
  )
  const { data: supplyRaw, error: supplyErr } = useSWR(
    `${EXPLORER_API}/infos/supply/total-alph`,
    fetcher
  )

  let holders: HolderInfo[] = []

  if (
    Array.isArray(holdersRaw) &&
    (typeof supplyRaw === 'number' || (supplyRaw && typeof supplyRaw.totalAlph === 'number'))
  ) {
    const supplyAlph =
      typeof supplyRaw === 'number' ? supplyRaw : (supplyRaw as any).totalAlph

    const toAlph = (atto: bigint) => Number(atto) / 1e18

    // take top 7
    holders = (holdersRaw as any[])
      .slice(0, 7)
      .map((h) => {
        const atto = BigInt(h.balance)
        const alph = toAlph(atto)
        const pct = (alph / supplyAlph) * 100
        const short =
          h.address.slice(0, 6) + '…' + h.address.slice(-6)
        return {
          address: h.address,
          short,
          balance: Number(alph.toFixed(2)),
          pct: Number(pct.toFixed(2)),
        }
      })
  }

  return {
    holders,
    isLoading: (!holdersErr && !holdersRaw) || (!supplyErr && !supplyRaw),
    isError: !!holdersErr || !!supplyErr,
  }
}
