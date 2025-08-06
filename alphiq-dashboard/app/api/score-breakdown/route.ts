import { NextRequest, NextResponse } from 'next/server'

const EXPLORER_API = 'https://backend.mainnet.alephium.org'

// Helper function to check if we're in development
const isDevelopment = () => process.env.NODE_ENV === 'development'

// Safe logging function that only logs in development
const safeLog = (level: 'log' | 'warn' | 'error', ...args: any[]) => {
  if (isDevelopment()) {
    console[level](...args)
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const address = searchParams.get('address')

  if (!address) {
    return NextResponse.json({ error: 'Address parameter is required' }, { status: 400 })
  }

  try {
    // 1) fetch address stats
    const resAddr = await fetch(`${EXPLORER_API}/addresses/${address}`)
    if (!resAddr.ok) {
      throw new Error(`address API HTTP ${resAddr.status}`)
    }
    
    const { balance: balStr, txNumber } = (await resAddr.json()) as {
      balance: string
      lockedBalance: string
      txNumber: number
    }

    // convert to ALPH
    const balanceAtto = BigInt(balStr)
    const balance = Number(balanceAtto / 10n ** 18n)
    safeLog('log', `[score-breakdown] ${address} → balance=${balance} ALPH, txNumber=${txNumber}`)

    // 2) balance‐based component
    let balScore = 0
    if (balance >= 1 && balance <= 200) {
      balScore = Math.round(balance / 20)
    } else if (balance > 200 && balance <= 1000) {
      balScore = Math.round(balance / 10)
    } else if (balance > 1000 && balance <= 8000) {
      const div15 = Math.round(balance / 15)
      const firstTwo = parseInt(Math.floor(balance).toString().slice(0, 2), 10) || 0
      balScore = div15 + txNumber * firstTwo
    } else if (balance > 8000 && balance <= 10000) {
      balScore = 500 + txNumber
    } else if (balance > 10000) {
      balScore = txNumber < 10 ? -100 : 700 + txNumber
    }
    safeLog('log', `[score-breakdown] ${address} → balanceScore=${balScore}`)

    // 3) time‐based component: months since first tx
    let ageScore = 0
    let monthsActive = 0
    
    try {
      const resTx = await fetch(`${EXPLORER_API}/addresses/${address}/transactions`)
      if (!resTx.ok) throw new Error(`tx API HTTP ${resTx.status}`)
      const txs = (await resTx.json()) as Array<{ timestamp: number }>
      if (txs.length) {
        const firstTs = txs.reduce((m, t) => (t.timestamp < m ? t.timestamp : m), txs[0].timestamp)
        monthsActive = Math.floor((Date.now() - firstTs) / (1000 * 60 * 60 * 24 * 30))
        if (monthsActive <= 12) ageScore = monthsActive * 15
        else if (monthsActive <= 36) ageScore = 12 * 15 + (monthsActive - 12) * 7
        else ageScore = 12 * 15 + 24 * 7 + (monthsActive - 36) * 5
      }
      safeLog('log', `[score-breakdown] ${address} → ageScore=${ageScore}, monthsActive=${monthsActive}`)
    } catch (e) {
      safeLog('error', '[score-breakdown] fetching tx history failed:', (e as Error).message)
    }

    // 4) combine & clamp
    const raw = balScore + ageScore
    const totalScore = Math.min(1000, Math.max(0, raw))
    safeLog('log', `[score-breakdown] ${address} → raw=${raw}, totalScore=${totalScore}`)

    return NextResponse.json({
      balanceScore: balScore,
      ageScore: ageScore,
      totalScore: totalScore,
      balance: balance,
      txNumber: txNumber,
      monthsActive: monthsActive
    })

  } catch (e) {
    safeLog('error', '[score-breakdown] fatal:', (e as Error).message)
    return NextResponse.json({ error: 'Failed to compute score breakdown' }, { status: 500 })
  }
} 