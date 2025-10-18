// hooks/useAdvancedTokenDistribution.ts
import useSWR from 'swr'

export type AdvancedHolderInfo = {
  address: string
  short: string
  balance: number
  balanceHint: string
  pct: number
  type: string | null
  name: string | null
  firstTxRecv: number | null
  lastTxRecv: number | null
  firstTxSend: number | null
  lastTxSend: number | null
  ins: number
  outs: number
  updatedOn: number
  lockedBalance: number
  lockedHint: string
  isGenesis: boolean
  isReserved: boolean
  lastTxTimestamp: number
  activityStatus: 'active' | 'moderate' | 'dormant'
  daysSinceLastActivity: number
}

export type TypeDistribution = {
  type: string
  count: number
  totalBalance: number
  percentage: number
  color: string
}

export type AnalyticsData = {
  totalActiveAddresses: number
  typeDistribution: TypeDistribution[]
  exchangeDominance: number
  bridgeActivity: number
  individualHolders: number
  averageActivity: number
  concentrationRatio: number
  alphPrice: number
  totalValueUSD: number
}

export function useAdvancedTokenDistribution() {
  // Use internal API routes instead of direct external calls
  const RICHLIST_API = '/api/richlist'
  const SUPPLY_API = '/api/supply'
  const PRICE_API = '/api/price'
  
  const fetcher = async (url: string) => {
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 15000) // 15 second timeout
      
      const res = await fetch(url, { 
        signal: controller.signal,
        method: 'GET',
        headers: {
          'Accept': 'application/json, text/plain, */*',
          'User-Agent': 'AlphIQ-Dashboard/1.0'
        }
      })
      
      clearTimeout(timeoutId)
      
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`)
      }
      
      const data = await res.json()
      return data
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('Request timeout - please try again')
      }
      throw error
    }
  }

  const { data: richlistData, error: richlistErr, mutate: retryRichlist } = useSWR(
    `${RICHLIST_API}?page=1&amount=50&sort=balance&order=desc&filter=nogenesis`,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      errorRetryCount: 3,
      errorRetryInterval: 2000,
      refreshInterval: 30000, // Refresh every 30 seconds
      fallbackData: {
        addresses: [],
        active_addresses: 0
      }
    }
  )

  const { data: supplyData, error: supplyErr, mutate: retrySupply } = useSWR(
    SUPPLY_API,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      errorRetryCount: 2,
      errorRetryInterval: 3000,
      fallbackData: { totalAlph: 1e9 } // 1B ALPH fallback
    }
  )

  const { data: priceData, error: priceErr, mutate: retryPrice } = useSWR(
    `${PRICE_API}?source=coingecko`,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      errorRetryCount: 2,
      errorRetryInterval: 3000,
      refreshInterval: 60000, // Refresh every minute
      fallbackData: { alephium: { usd: 0.5 } } // $0.50 fallback
    }
  )

  let holders: AdvancedHolderInfo[] = []
  let analytics: AnalyticsData | null = null

  if (richlistData && supplyData && priceData) {
    // Handle different supply data formats
    const totalSupply = typeof supplyData === 'number' 
      ? supplyData 
      : supplyData.totalAlph || supplyData.total || 1e9 // Fallback to 1B ALPH
    
    const toAlph = (atto: number) => atto / 1e18

    // Process holders data
    holders = richlistData.addresses.map((holder: any, index: number) => {
      const balance = toAlph(holder.balance)
      const pct = (balance / totalSupply) * 100
      const short = holder.address.slice(0, 6) + '…' + holder.address.slice(-6)
      
      // Calculate activity status
      const now = Date.now()
      const lastActivity = holder.last_tx_timestamp || holder.updated_on
      const daysSinceLastActivity = lastActivity ? Math.floor((now - lastActivity) / (1000 * 60 * 60 * 24)) : 999
      
      let activityStatus: 'active' | 'moderate' | 'dormant' = 'dormant'
      if (daysSinceLastActivity <= 7) activityStatus = 'active'
      else if (daysSinceLastActivity <= 30) activityStatus = 'moderate'

      return {
        address: holder.address,
        short,
        balance,
        balanceHint: holder.balanceHint,
        pct,
        type: holder.type,
        name: holder.name,
        firstTxRecv: holder.first_tx_recv,
        lastTxRecv: holder.last_tx_recv,
        firstTxSend: holder.first_tx_send,
        lastTxSend: holder.last_tx_send,
        ins: holder.ins,
        outs: holder.outs,
        updatedOn: holder.updated_on,
        lockedBalance: holder.locked_balance,
        lockedHint: holder.lockedHint,
        isGenesis: holder.isGenesis,
        isReserved: holder.isReserved,
        lastTxTimestamp: holder.last_tx_timestamp,
        activityStatus,
        daysSinceLastActivity
      }
    })

    // Calculate analytics
    const typeMap = new Map<string, { count: number; totalBalance: number }>()
    let exchangeBalance = 0
    let bridgeBalance = 0
    let individualBalance = 0
    let totalActivity = 0

    holders.forEach(holder => {
      const type = holder.type || 'Individual'
      const existing = typeMap.get(type) || { count: 0, totalBalance: 0 }
      typeMap.set(type, {
        count: existing.count + 1,
        totalBalance: existing.totalBalance + holder.balance
      })

      if (holder.type === 'Exchange') exchangeBalance += holder.balance
      if (holder.type === 'Bridge') bridgeBalance += holder.balance
      if (!holder.type) individualBalance += holder.balance
      
      totalActivity += holder.ins + holder.outs
    })

    const typeDistribution: TypeDistribution[] = Array.from(typeMap.entries()).map(([type, data], index) => ({
      type,
      count: data.count,
      totalBalance: data.totalBalance,
      percentage: (data.totalBalance / holders.reduce((sum, h) => sum + h.balance, 0)) * 100,
      color: getTypeColor(type, index)
    }))

    // Handle different price data formats
    const alphPrice = priceData.alephium?.usd || 
                     priceData.quotes?.USD?.price || 
                     priceData.price || 
                     0.5 // Fallback price
    
    const totalBalance = holders.reduce((sum, h) => sum + h.balance, 0)
    const totalValueUSD = totalBalance * alphPrice

    analytics = {
      totalActiveAddresses: richlistData.active_addresses || 0,
      typeDistribution,
      exchangeDominance: (exchangeBalance / totalBalance) * 100,
      bridgeActivity: (bridgeBalance / totalBalance) * 100,
      individualHolders: (individualBalance / totalBalance) * 100,
      averageActivity: totalActivity / holders.length,
      concentrationRatio: holders.slice(0, 10).reduce((sum, h) => sum + h.balance, 0) / totalBalance,
      alphPrice,
      totalValueUSD
    }
  }

  const isLoading = (!richlistErr && !richlistData) || (!supplyErr && !supplyData) || (!priceErr && !priceData)
  const isError = !!richlistErr || !!supplyErr || !!priceErr
  
  const retryAll = () => {
    retryRichlist()
    retrySupply()
    retryPrice()
  }

  const getErrorDetails = () => {
    const errors = []
    if (richlistErr) errors.push(`Richlist: ${richlistErr.message}`)
    if (supplyErr) errors.push(`Supply: ${supplyErr.message}`)
    if (priceErr) errors.push(`Price: ${priceErr.message}`)
    return errors
  }

  return {
    holders,
    analytics,
    isLoading,
    isError,
    errorDetails: getErrorDetails(),
    retryAll,
    lastUpdated: new Date().toISOString(),
  }
}

function getTypeColor(type: string, index: number): string {
  const colors = [
    '#A285FF', '#FF8A65', '#00E6B0', '#FFD54F', '#4BC0C0', '#FF6384', '#36A2EB',
    '#FF9F40', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8'
  ]
  
  if (type === 'Exchange') return '#FF6384'
  if (type === 'Bridge') return '#4BC0C0'
  if (type === 'Uniswap') return '#36A2EB'
  if (type === 'Treasury') return '#FFD54F'
  
  return colors[index % colors.length]
}
