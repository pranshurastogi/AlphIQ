// lib/score.ts
import { supabase } from './supabaseClient'

const EXPLORER_API = 'https://backend.mainnet.alephium.org'

// Helper function to check if we're in development
const isDevelopment = () => process.env.NODE_ENV === 'development'

// Safe logging function that only logs in development
const safeLog = (level: 'log' | 'warn' | 'error', ...args: any[]) => {
  if (isDevelopment()) {
    console[level](...args)
  }
}

// —— Titles (50 increasing levels) ——
const TITLES = [
  "Chain Novice","Block Beginner","Tx Trainee","Ledger Learner","Byte Voyager",
  "Gas Navigator","Nonce Newbie","Script Rookie","Fee Forager","Smart Starter",
  "Contract Cadet","Token Traveler","Event Enthusiast","State Scholar","Stake Sentinel",
  "Validator Voyager","DEX Diver","Oracle Observer","Bridge Builder","Governance Guide",
  "Security Scout","Optimizer Oracle","Consensus Connoisseur","Node Nomad","Epoch Enthusiast",
  "Fork Forecaster","Sharding Sherpa","Throughput Thespian","Blocksmith","Chain Artisan",
  "Transaction Tactician","Ledger Lieutenant","Byte Brigadier","Gas General","Nonce Navigator",
  "Script Specialist","Fee Frontrunner","Contract Captain","Token Titan","Event Emperor",
  "State Sovereign","Stake Strategist","Validator Vanguard","DEX Duke","Oracle Orator",
  "Bridge Baron","Governance Governor","Security Sentinel","Consensus Champion","Onchain Overlord"
]
function pickTitle(score: number): string {
  // bucket = score / (1000/50)
  const idx = Math.floor(score / (1000 / TITLES.length))
  return TITLES[Math.min(idx, TITLES.length - 1)]
}

export async function computeAndStoreScore(address: string): Promise<{ score: number; title: string }> {
  const today = new Date().toISOString().slice(0, 10)      // YYYY-MM-DD
  const nowIso = new Date().toISOString()
  
  try {
    // 1) fetch address stats
    const resAddr = await fetch(`${EXPLORER_API}/addresses/${address}`)
    if (!resAddr.ok) throw new Error(`address API HTTP ${resAddr.status}`)
    const { balance: balStr, txNumber } = (await resAddr.json()) as {
      balance: string
      lockedBalance: string
      txNumber: number
    }

    // convert to ALPH
    const balanceAtto = BigInt(balStr)
    const balance = Number(balanceAtto / 10n ** 18n)
    safeLog('log', `[score] ${address} → balance=${balance} ALPH, txNumber=${txNumber}`)

    // 2) balance‐based component
    let balScore = 0
    if (balance >= 1 && balance <= 200) {
      balScore = Math.round(balance / 20)
    } else if (balance > 200 && balance <= 1000) {
      balScore = Math.round(balance / 10)
    } else if (balance > 1000 && balance <= 5000) {
      const div15 = Math.round(balance / 15)
      const firstTwo = parseInt(Math.floor(balance).toString().slice(0, 2), 10) || 0
      balScore = div15 + txNumber * firstTwo
    } else if (balance > 5000 && balance <= 10000) {
      balScore = 500 + txNumber
    } else if (balance > 10000) {
      balScore = txNumber < 10 ? -100 : 700 + txNumber
    }
    safeLog('log', `[score] ${address} → balanceScore=${balScore}`)

    // 3) time‐based component: months since first tx
    let ageScore = 0
    try {
      const resTx = await fetch(`${EXPLORER_API}/addresses/${address}/transactions`)
      if (!resTx.ok) throw new Error(`tx API HTTP ${resTx.status}`)
      const txs = (await resTx.json()) as Array<{ timestamp: number }>
      if (txs.length) {
        const firstTs = txs.reduce((m, t) => (t.timestamp < m ? t.timestamp : m), txs[0].timestamp)
        const months = Math.floor((Date.now() - firstTs) / (1000 * 60 * 60 * 24 * 30))
        if (months <= 12) ageScore = months * 15
        else if (months <= 36) ageScore = 12 * 15 + (months - 12) * 7
        else ageScore = 12 * 15 + 24 * 7 + (months - 36) * 5
      }
      safeLog('log', `[score] ${address} → ageScore=${ageScore}`)
    } catch (e) {
      safeLog('error', '[score] fetching tx history failed:', (e as Error).message)
    }

    // 4) combine & clamp
    const raw = balScore + ageScore
    let finalScore = Math.min(1000, Math.max(0, raw))
    const title = pickTitle(finalScore)
    safeLog('log', `[score] ${address} → raw=${raw}, finalScore=${finalScore}, title="${title}"`)

    // 5) upsert into users
    const { error: uErr } = await supabase
      .from('users')
      .upsert(
        { address, score: finalScore, title, updated_at: nowIso },
        { onConflict: ['address'], returning: 'minimal' }
      )
    if (uErr) safeLog('error', '[score] users.upsert error:', uErr)

    // 6) upsert into history (no nulls)
    const { error: hErr } = await supabase
      .from('user_score_history')
      .upsert(
        {
          address,
          snapshot_date: today,
          score: finalScore,
          title,
          xp_points: 0,
          created_at: nowIso
        },
        { onConflict: ['address', 'snapshot_date'], returning: 'minimal' }
      )
    if (hErr) safeLog('error', '[score] user_score_history.upsert error:', hErr)

    return { score: finalScore, title }
  } catch (e) {
    safeLog('error', '[computeAndStoreScore] fatal:', (e as Error).message)
    return { score: 0, title: TITLES[0] }
  }
}


// Single‐endpoint fetch of /addresses/{addr} for balance & txNumber.

// Simple tiered formula exactly as you described.

// Age bonus computed from the first‐seen tx timestamp.

// 50 unique titles spanning 0→1000.

// All fetches wrapped in try/catch with console.error for debugging.

// Upsert into both users and user_score_history, supplying non‐null defaults (xp_points: 0).

// Clamped final score to [0,1000].

/**
 * Formula:
 *
 *   score = clamp( balanceBonus(balance) + ageBonus(monthsSinceFirstTx), 0, 1000 )
 *
 * where:
 *
 *   balanceBonus(b):
 *     if   1   ≤ b ≤ 200    → ⌊b / 20⌋
 *     else if 200 < b ≤ 1000  → ⌊b / 10⌋
 *     else if 1000 < b ≤ 5000 → ⌊b / 15⌋ + txNumber × firstTwoDigits(b)
 *     else if 5000 < b ≤ 10000→ 500 + txNumber
 *     else if b > 10000       → (txNumber < 10 ? –100 : 700 + txNumber)
 *
 *   ageBonus(m):
 *     // m = months since first-ever transaction
 *     if   m ≤ 12   → m × 15
 *     else if 12 < m ≤ 36 → 12×15 + (m−12)×7
 *     else              → 12×15 + 24×7 + (m−36)×5
 *
 *   clamp(x,a,b) = Math.min(b, Math.max(a, x))
 */
