// components/TopBar.tsx
'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Activity,
  Trophy,
  Wallet as WalletIcon,
  Zap,
  Menu,
  X,
} from 'lucide-react'
import { AlephiumConnectButton, useWallet } from '@alephium/web3-react'
import { supabase } from '@/lib/supabaseClient'

export default function TopBar() {
  // — wallet + routing
  const { account } = useWallet()
  const address = typeof account === 'string' ? account : account?.address
  const pathname = usePathname()
  const isAnalytics = pathname === '/'
  const isScore     = pathname === '/onchain-score'

  // — mobile menu state
  const [menuOpen, setMenuOpen] = useState(false)
  // — track which address we've already processed this session
  const [lastUpserted, setLastUpserted] = useState<string | null>(null)

  useEffect(() => {
    if (!address || address === lastUpserted) return

    const todayDate     = new Date().toISOString().slice(0, 10)
    const yesterdayDate = new Date(Date.now() - 86400000).toISOString().slice(0, 10)
    const nowIso        = new Date().toISOString()

    ;(async () => {
      console.log('[Streak] start sync for', address)

      // 1) Upsert into users
      const { error: userErr } = await supabase
        .from('users')
        .upsert(
          { address, exists_flag: true, checked_at: nowIso },
          { onConflict: ['address'], returning: 'minimal' }
        )
      if (userErr) console.error('[Streak] users.upsert error', userErr)
      else          console.log('[Streak] users.upsert OK')

      // 2) Insert today’s login (ignore duplicates)
      const { error: loginErr } = await supabase
        .from('user_logins')
        .insert(
          [{ address, login_date: todayDate }],
          { onConflict: ['address','login_date'], ignoreDuplicates: true }
        )
      if (loginErr) console.error('[Streak] user_logins.insert error', loginErr)
      else          console.log('[Streak] user_logins.insert OK')

      // 3) Fetch existing streak
      const { data: streakRow, error: getStreakErr } = await supabase
        .from('user_streaks')
        .select('current_streak,last_login_date')
        .eq('address', address)
        .single()
      if (getStreakErr && getStreakErr.code !== 'PGRST116') {
        console.error('[Streak] fetch user_streaks error', getStreakErr)
      } else {
        console.log('[Streak] fetched row', streakRow)
      }

      // 4) Compute new streak
      let newStreak = 1
      if (streakRow) {
        const lastDate = streakRow.last_login_date
        if (lastDate === todayDate) {
          // already logged in today: keep same streak
          newStreak = streakRow.current_streak
          console.log('[Streak] same-day login, streak remains', newStreak)
        } else if (lastDate === yesterdayDate) {
          // consecutive days
          newStreak = streakRow.current_streak + 1
          console.log('[Streak] consecutive login, increment to', newStreak)
        } else {
          // gap of 2+ days or brand-new
          newStreak = 1
          console.log('[Streak] gap detected (last:', lastDate, '), reset to 1')
        }
      } else {
        console.log('[Streak] no existing streak, start at 1')
      }

      // 5) Upsert streak
      const { error: upsertErr } = await supabase
        .from('user_streaks')
        .upsert(
          {
            address,
            current_streak:  newStreak,
            last_login_date: todayDate,
            updated_at:      nowIso,
          },
          { onConflict: ['address'], returning: 'minimal' }
        )
      if (upsertErr) console.error('[Streak] user_streaks.upsert error', upsertErr)
      else           console.log('[Streak] user_streaks.upsert OK, streak=', newStreak)

      setLastUpserted(address)
    })()
  }, [address, lastUpserted])

  return (
    <header className="relative border-b border-white/10 bg-charcoal/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-br from-mint to-amber rounded-lg flex items-center justify-center">
            <Zap className="w-5 h-5 text-charcoal" />
          </div>
          <h1 className="text-xl font-bold text-neutral">AlphIQ</h1>
        </div>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center space-x-4 bg-white/5 rounded-lg p-1">
          <Link
            href="/"
            className={`flex items-center px-3 py-1 rounded ${
              isAnalytics
                ? 'bg-white/10 text-amber'
                : 'text-neutral hover:text-amber'
            }`}
          >
            <Activity className="w-4 h-4 mr-1" />
            Analytics View
          </Link>
          <Link
            href="/onchain-score"
            className={`flex items-center px-3 py-1 rounded ${
              isScore
                ? 'bg-white/10 text-amber'
                : 'text-neutral hover:text-amber'
            }`}
          >
            <Trophy className="w-4 h-4 mr-1" />
            Onchain Score
          </Link>
        </nav>

        {/* Mobile hamburger */}
        <button
          className="md:hidden text-neutral hover:text-amber p-2 rounded"
          onClick={() => setMenuOpen((o) => !o)}
          aria-label="Toggle menu"
        >
          {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>

        {/* Wallet connect */}
        <AlephiumConnectButton className="bg-amber hover:bg-amber/90 text-charcoal font-medium flex items-center px-4 py-2 rounded">
          <WalletIcon className="w-4 h-4 mr-2" />
          {address ? `${address.slice(0, 6)}…${address.slice(-6)}` : 'Connect Wallet'}
        </AlephiumConnectButton>
      </div>

      {/* Mobile nav panel */}
      {menuOpen && (
        <div className="md:hidden bg-charcoal/95 backdrop-blur-sm absolute inset-x-0 top-full z-40">
          <nav className="flex flex-col px-6 py-4 space-y-2">
            <Link
              href="/"
              className={`flex items-center px-3 py-2 rounded ${
                isAnalytics
                  ? 'bg-white/10 text-amber'
                  : 'text-neutral hover:text-amber'
              }`}
              onClick={() => setMenuOpen(false)}
            >
              <Activity className="w-5 h-5 mr-2" />
              Analytics View
            </Link>
            <Link
              href="/onchain-score"
              className={`flex items-center px-3 py-2 rounded ${
                isScore
                  ? 'bg-white/10 text-amber'
                  : 'text-neutral hover:text-amber'
              }`}
              onClick={() => setMenuOpen(false)}
            >
              <Trophy className="w-5 h-5 mr-2" />
              Onchain Score
            </Link>
          </nav>
        </div>
      )}
    </header>
  )
}
