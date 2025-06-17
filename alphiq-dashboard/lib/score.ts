// lib/score.ts
import { supabase } from './supabaseClient'

const EXPLORER_API = 'https://backend.mainnet.alephium.org'

// ——— title buckets & helper ———
const TITLES = [
  { limit: 200,  name: 'Onchain Novice'     },
  { limit: 400,  name: 'Tx Enthusiast'       },
  { limit: 600,  name: 'Block Builder'       },
  { limit: 800,  name: 'Chain Connoisseur'   },
  { limit: 1000, name: 'Onchain Overlord'    },
]

function pickTitle(score: number): string {
  const bucket = TITLES.find((t) => score <= t.limit) 
               ?? TITLES[TITLES.length - 1]
  return bucket.name
}

// ——— main compute & store ———
export async function computeAndStoreScore(address: string) {
  try {
    // 1) fetch total txs
    const res = await fetch(`${EXPLORER_API}/addresses/${address}/total-transactions`)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const { total } = (await res.json()) as { total: number }

    // 2) simple scoring & titling
    const rawScore = Math.min(1000, total * 50)
    const title    = pickTitle(rawScore)

    const today = new Date().toISOString().slice(0,10) // "YYYY-MM-DD"
    const now   = new Date().toISOString()

    // 3) upsert into users
    await supabase
      .from('users')
      .upsert(
        { address, score: rawScore, title, updated_at: now },
        { onConflict: ['address'], returning: 'minimal' }
      )
      .then(({ error }) => {
        if (error) console.error('[score] users.upsert:', error)
      })

    // 4) fetch any existing history for today
    const { data: existing, error: fetchErr } = await supabase
      .from('user_score_history')
      .select('score,title,xp_points')
      .eq('address', address)
      .eq('snapshot_date', today)
      .single()

    if (fetchErr && fetchErr.code !== 'PGRST116') {
      console.error('[score] history.fetch:', fetchErr)
    }

    // 5) coalesce to avoid nulls
    const finalScore = rawScore
    const finalTitle = title
    const finalXp    = existing?.xp_points ?? 0

    // 6) upsert into history
    await supabase
      .from('user_score_history')
      .upsert(
        {
          address,
          snapshot_date: today,
          score:      finalScore,
          title:      finalTitle,
          xp_points:  finalXp,
          created_at: now
        },
        { onConflict: ['address','snapshot_date'], returning: 'minimal' }
      )
      .then(({ error }) => {
        if (error) console.error('[score] history.upsert:', error)
      })

    console.log(`[score] stored for ${address}`,{
      snapshot_date: today,
      score: finalScore,
      title: finalTitle,
      xp_points: finalXp
    })

    return { score: finalScore, title: finalTitle }

  } catch (e) {
    console.error('[computeAndStoreScore] error:', (e as Error).message)
    // safe fallback
    const fallback = pickTitle(0)
    return { score: 0, title: fallback }
  }
}
