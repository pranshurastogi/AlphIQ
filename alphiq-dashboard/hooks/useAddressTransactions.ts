// hooks/useAddressTransactions.ts
'use client'

import useSWR from 'swr'

const EXPLORER_API = 'https://backend.mainnet.alephium.org'

// same fetcher
const fetcher = async (url: string) => {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Fetch error ${res.status} for ${url}`)
  return res.json()
}

// minimal tx type
export type AddressTx = {
  hash: string
  timestamp: number
  inputs: Array<{ address: string; attoAlphAmount: string }>
  outputs: Array<{ address: string; attoAlphAmount: string }>
  gasAmount: number
  gasPrice: string
}

export function useAddressTransactions(address?: string) {
  const key = address ? `${EXPLORER_API}/addresses/${address}/transactions` : null
  const { data, error, isValidating } = useSWR<AddressTx[]>(
    key,
    fetcher,
    {
      refreshInterval: 300_000,
      revalidateOnFocus: false,
      revalidateOnReconnect: false
    }
  )
  return {
    txs: data,
    isLoading: !error && !data,
    isError: !!error
  }
}
