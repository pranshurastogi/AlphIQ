// hooks/useAddressInfo.ts
'use client'

import useSWR from 'swr'

const EXPLORER_API = 'https://backend.mainnet.alephium.org'

// fetcher that throws on non-2xx
const fetcher = async (url: string) => {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Fetch error ${res.status} for ${url}`)
  return res.json()
}

export type AddressInfo = {
  balance: string
  lockedBalance: string
  txNumber: number
}

export function useAddressInfo(address?: string) {
  const key = address ? `${EXPLORER_API}/addresses/${address}` : null
  const { data, error, isValidating } = useSWR<AddressInfo>(
    key,
    fetcher,
    {
      refreshInterval: 300_000,        // every 5m
      revalidateOnFocus: false,
      revalidateOnReconnect: false
    }
  )
  return {
    info: data,
    isLoading: !error && !data,
    isError: !!error
  }
}
