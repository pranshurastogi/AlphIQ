// lib/score.ts
import { supabase } from './supabaseClient'

const EXPLORER_API = 'https://backend.mainnet.alephium.org'

// Dev-only logs
const isDevelopment = () => process.env.NODE_ENV === 'development'
const safeLog = (level: 'log' | 'warn' | 'error', ...args: any[]) => {
  if (isDevelopment()) console[level](...args)
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
  const idx = Math.floor(score / (1000 / TITLES.length))
  return TITLES[Math.min(idx, TITLES.length - 1)]
}

// ---------- Helpers ----------
const clamp = (x: number, min: number, max: number) => Math.min(max, Math.max(min, x))
const lerp  = (a: number, b: number, t: number) => a + (b - a) * t

// Smooth diminishing-returns curve in [0, cap]
function softCap(value: number, half: number, cap: number) {
  const t = value / (value + half) // logistic-like
  return clamp(t * cap, 0, cap)
}

// Deterministic 0..1 hash from address string (tiny, fast)
function hash01(s: string): number {
  let h = 2166136261 >>> 0
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  // final mix
  h += h << 13; h ^= h >>> 7; h += h << 3; h ^= h >>> 17; h += h << 5
  // normalize
  return (h >>> 0) / 0xffffffff
}

// Tiny deterministic jitter around 0 with given magnitude
function jitter(addr: string, magnitude: number) {
  const r = hash01(addr) // 0..1
  return (r * 2 - 1) * magnitude // -mag .. +mag
}

type TxLite = { timestamp?: number }

// Pull recent transactions with best-effort limits and graceful fallbacks
async function fetchTransactions(address: string, limit = 300): Promise<TxLite[]> {
  try {
    const url = `${EXPLORER_API}/addresses/${address}/transactions`
    const res = await fetch(url)
    if (!res.ok) throw new Error(`tx API HTTP ${res.status}`)
    const parsed = (await res.json()) as any[]
    return (Array.isArray(parsed) ? parsed : []).slice(0, limit).map(t => ({
      timestamp: typeof t?.timestamp === 'number' ? t.timestamp : undefined
    }))
  } catch (e) {
    safeLog('error', '[score] fetchTransactions failed:', (e as Error).message)
    return []
  }
}

async function fetchAddress(address: string): Promise<{ balanceAtto: bigint; txNumber: number }> {
  const res = await fetch(`${EXPLORER_API}/addresses/${address}`)
  if (!res.ok) throw new Error(`address API HTTP ${res.status}`)
  const j = await res.json()
  const balStr: string = j?.balance ?? '0'
  const txNumber: number = Number(j?.txNumber ?? 0)
  return {
    balanceAtto: BigInt(balStr),
    txNumber: Number.isFinite(txNumber) ? txNumber : 0
  }
}

// ---------- Scoring model (weights sum to 1000) ----------
// 1) Balance Quality (max 260)
// 2) Tenure / Account Age (max 190)
// 3) Lifetime Activity (max 180)
// 4) Recent Activity (max 210)
// 5) Consistency (max 110)
// 6) Account Health (max 50)

const W_BALANCE   = 260
const W_TENURE    = 190
const W_LIFETIME  = 180
const W_RECENT    = 210
const W_CONSIST   = 110
const W_HEALTH    = 50

export type ScoreParts = {
  balance: number
  tenure: number
  lifetime: number
  recent: number
  consist: number
  health: number
}

export type ScoreBreakdownPayload = ScoreParts & {
  totalScore: number
  title: string
  // context for UI hints
  balanceALPH: number
  txNumber: number
  monthsActive: number
  activeMonths12: number
  last7: number
  last30: number
  last90: number
  daysSinceLast: number
  evenness: number // 0..1
}

/**
 * Complex, widely spread Balance score:
 * - Hybrid of piecewise softcaps + log-scaled component.
 * - Coupled with activity (txNumber) so parked whales don't dominate.
 * - Sweet-spot Gaussian boost around mid-range balances with activity.
 * - Graduated damping for near-zero balances with huge tx counts (spam).
 * - Deterministic micro-jitter to break ties.
 */
function computeBalanceScore(balanceALPH: number, txNumber: number, address: string): number {
  const b = Math.max(0, balanceALPH)
  const t = Math.max(0, txNumber)

  // --- 1) Piecewise tiers (refined) ---
  const tier0 = softCap(b, 120, 70)                               // 0..~200 ALPH → up to 70
  const tier1 = b > 200  ? softCap(b - 200, 450, 70) : 0          // 200..1000    → +70
  const tier2 = b > 1000 ? softCap(b - 1000, 1800, 55) : 0        // 1k..8k       → +55
  const tier3 = b > 8000 ? softCap(b - 8000, 600, 25) : 0         // 8k..10k      → +25
  let basePiecewise = tier0 + tier1 + tier2 + tier3                // ~0..220

  // --- 2) Log-scaled richness ---
  const logB = Math.log10(b + 1)
  const logComp = softCap(logB * 45, 30, 60)                      // up to 60

  // --- 3) Activity coupling ---
  const activityFactor = softCap(t, 25, 1)                        // 0..1
  const activityBoost = activityFactor * 15

  // --- 4) Sweet-spot boost (mid-range healthy participants) ---
  const gauss = Math.exp(-Math.pow((b - 1500) / 1000, 2))         // 0..1
  const sweetBoost = gauss * (10 + 25 * activityFactor)           // up to ~35

  // --- 5) Idle-whale damping ---
  let idlePenalty = 0
  if (b > 10000) {
    const whaleScale = softCap(Math.log10(b - 9999), 0.5, 1)
    const inactivity = 1 - activityFactor
    idlePenalty = whaleScale * inactivity * 70                     // up to ~70
  }

  // --- 6) Zero-balance spam damping ---
  let thinPenalty = 0
  if (b < 1 && t > 50) {
    thinPenalty = Math.min(45, (t - 50) * 0.25)
  }

  // --- 7) Efficiency modulation ---
  const denom = Math.log10(b + 10)
  const efficiency = denom > 0 ? clamp(t / (denom * 14), 0.6, 1.4) : 0.6
  const efficiencyMult = lerp(0.9, 1.1, clamp((efficiency - 0.6) / 0.8, 0, 1))

  // --- 8) Deterministic micro-jitter ---
  const micro = jitter(address, 6) // ±6 pts

  let rawBalance =
    (basePiecewise + logComp + activityBoost + sweetBoost - idlePenalty - thinPenalty) * efficiencyMult +
    micro

  rawBalance = clamp(rawBalance, 0, 320)
  const scaled = rawBalance * (W_BALANCE / 320)
  return clamp(scaled, 0, W_BALANCE)
}

function computeTenureScore(firstTs?: number): number {
  if (!firstTs) return 0
  const months = Math.floor((Date.now() - firstTs) / (1000 * 60 * 60 * 24 * 30))
  let raw = 0
  if (months <= 12) raw = months * 15
  else if (months <= 36) raw = 12 * 15 + (months - 12) * 7
  else raw = 12 * 15 + 24 * 7 + (months - 36) * 5
  return clamp(softCap(raw, 240, W_TENURE), 0, W_TENURE)
}

function computeLifetimeActivityScore(txNumber: number): number {
  const raw = Math.sqrt(Math.max(0, txNumber))
  const scaled = softCap(raw, 16, W_LIFETIME) // half around ~256 tx
  return clamp(scaled, 0, W_LIFETIME)
}

function computeRecentActivityScore(txs: TxLite[]): number {
  const now = Date.now()
  const days = (ms: number) => Math.floor(ms / (1000 * 60 * 60 * 24))
  const last30  = txs.filter(t => t.timestamp && days(now - t.timestamp!) <= 30).length
  const last90  = txs.filter(t => t.timestamp && days(now - t.timestamp!) <= 90).length
  const last7   = txs.filter(t => t.timestamp && days(now - t.timestamp!) <= 7).length

  let base = softCap(last30, 10, 120)
  base += softCap(Math.max(0, last90 - last30), 20, 60)
  base += softCap(last7, 5, 30)

  return clamp(base * (W_RECENT / 210), 0, W_RECENT)
}

function monthKey(ts: number) {
  const d = new Date(ts)
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`
}

function computeConsistencyScore(txs: TxLite[]): number {
  const now = Date.now()
  const cut = now - 365 * 24 * 60 * 60 * 1000
  const recent = txs.filter(t => t.timestamp && t.timestamp! >= cut)
  if (recent.length === 0) return 0

  const byMonth = new Map<string, number>()
  for (const t of recent) {
    const key = monthKey(t.timestamp!)
    byMonth.set(key, (byMonth.get(key) || 0) + 1)
  }

  const activeMonths = byMonth.size
  const activePart = softCap(activeMonths, 6, 70) // up to 70

  const counts = [...byMonth.values()]
  const avg = counts.reduce((a, b) => a + b, 0) / counts.length
  const variance = counts.reduce((a, b) => a + (b - avg) ** 2, 0) / counts.length
  const std = Math.sqrt(variance)

  const evenness = avg > 0 ? clamp(1 - std / (avg + 1e-6), 0, 1) : 0
  const evenPart = evenness * 40 // up to 40

  return clamp((activePart + evenPart) * (W_CONSIST / 110), 0, W_CONSIST)
}

function computeHealthScore(balanceALPH: number, txNumber: number, lastTs?: number, firstTs?: number): number {
  let score = 0

  if (lastTs) {
    const daysSince = Math.floor((Date.now() - lastTs) / (1000 * 60 * 60 * 24))
    if (daysSince > 180) {
      score -= lerp(0, 25, clamp((daysSince - 180) / 180, 0, 1))
    }
  }

  if (firstTs) {
    const months = Math.floor((Date.now() - firstTs) / (1000 * 60 * 60 * 24 * 30))
    if (months <= 3 && txNumber >= 5) score += 15
  }

  if (balanceALPH < 0.5 && txNumber < 3) score -= 5

  return clamp(score + W_HEALTH / 2, 0, W_HEALTH)
}

/** ---------------- NEW: single source of truth for UI + persistence ---------------- */
export async function computeScoreBreakdown(address: string): Promise<ScoreBreakdownPayload> {
  // 1) fetch address snapshot
  const { balanceAtto, txNumber } = await fetchAddress(address)
  const balanceALPH = Number(balanceAtto / 10n ** 18n)

  // 2) fetch transactions (best-effort subset)
  const txs = await fetchTransactions(address, 300)
  const timestamps = txs.filter(t => typeof t.timestamp === 'number').map(t => t.timestamp as number)
  const firstTs = timestamps.length ? Math.min(...timestamps) : undefined
  const lastTs  = timestamps.length ? Math.max(...timestamps) : undefined

  // recency aggregates for UI context
  const now = Date.now()
  const days = (ms: number) => Math.floor(ms / (1000 * 60 * 60 * 24))
  const last7  = txs.filter(t => t.timestamp && days(now - t.timestamp!) <= 7).length
  const last30 = txs.filter(t => t.timestamp && days(now - t.timestamp!) <= 30).length
  const last90 = txs.filter(t => t.timestamp && days(now - t.timestamp!) <= 90).length
  const daysSinceLast = lastTs ? days(now - lastTs) : 1e9

  // consistency context
  const cut = now - 365 * 24 * 60 * 60 * 1000
  const recent = txs.filter(t => t.timestamp && t.timestamp! >= cut)
  const byMonth = new Map<string, number>()
  for (const t of recent) {
    const key = t.timestamp ? monthKey(t.timestamp) : undefined
    if (key) byMonth.set(key, (byMonth.get(key) || 0) + 1)
  }
  const activeMonths12 = byMonth.size
  const counts = [...byMonth.values()]
  const avg = counts.length ? counts.reduce((a, b) => a + b, 0) / counts.length : 0
  const variance = counts.length ? counts.reduce((a, b) => a + (b - avg) ** 2, 0) / counts.length : 0
  const std = Math.sqrt(variance)
  const evenness = avg > 0 ? clamp(1 - std / (avg + 1e-6), 0, 1) : 0

  // 3) compute parts
  const parts: ScoreParts = {
    balance:  computeBalanceScore(balanceALPH, txNumber, address),
    tenure:   computeTenureScore(firstTs),
    lifetime: computeLifetimeActivityScore(txNumber),
    recent:   computeRecentActivityScore(txs),
    consist:  computeConsistencyScore(txs),
    health:   computeHealthScore(balanceALPH, txNumber, lastTs, firstTs),
  }

  // same tiny, deterministic tie-breaker as storage path
  const raw = parts.balance + parts.tenure + parts.lifetime + parts.recent + parts.consist + parts.health + jitter(address, 4)
  const totalScore = clamp(Math.round(raw), 0, 1000)
  const title = pickTitle(totalScore)

  safeLog('log', `[score:breakdown] ${address} parts=`, parts, `→ total=${totalScore}, title="${title}"`)

  return {
    ...parts,
    totalScore,
    title,
    balanceALPH,
    txNumber,
    monthsActive: firstTs ? Math.floor((Date.now() - firstTs) / (1000 * 60 * 60 * 24 * 30)) : 0,
    activeMonths12,
    last7,
    last30,
    last90,
    daysSinceLast,
    evenness,
  }
}

// ---------- Main (persists) ----------
export async function computeAndStoreScore(address: string): Promise<{ score: number; title: string }> {
  const today = new Date().toISOString().slice(0, 10)
  const nowIso = new Date().toISOString()

  try {
    const detail = await computeScoreBreakdown(address) // ← single source of truth
    const finalScore = detail.totalScore
    const title = detail.title

    // persist
    const { error: uErr } = await supabase
      .from('users')
      .upsert(
        { address, score: finalScore, title, updated_at: nowIso },
        { onConflict: ['address'], returning: 'minimal' }
      )
    if (uErr) safeLog('error', '[score] users.upsert error:', uErr)

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

/**
 * ---------------------------------------------------------------------
 * User Score Calculation Model (0 – 1000)
 * (Same as before; computeScoreBreakdown() now exposes the exact parts
 * used by computeAndStoreScore(), ensuring UI == storage.)
 * ---------------------------------------------------------------------
 */
