// components/TopBar.tsx
'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import {
  Activity,
  Trophy,
  Wallet as WalletIcon,
  Menu,
  X,
} from 'lucide-react'
import { AlephiumConnectButton, useWallet } from '@alephium/web3-react'
import { supabase } from '@/lib/supabaseClient'

export default function TopBar() {
  const { account } = useWallet()
  const address = typeof account === 'string' ? account : account?.address
  const pathname = usePathname()
  const isAnalytics = pathname === '/'
  const isScore     = pathname === '/onchain-score'

  const [menuOpen, setMenuOpen] = useState(false)
  const [lastUpserted, setLastUpserted] = useState<string | null>(null)

  useEffect(() => {
    if (!address || address === lastUpserted) return

    const todayDate     = new Date().toISOString().slice(0, 10)
    const yesterdayDate = new Date(Date.now() - 86400000).toISOString().slice(0, 10)
    const nowIso        = new Date().toISOString()

    ;(async () => {
      console.log('[Streak] sync start for', address)

      // 1) upsert user
      const { error: userErr } = await supabase
        .from('users')
        .upsert(
          { address, exists_flag: true, checked_at: nowIso },
          { onConflict: ['address'], returning: 'minimal' }
        )
      if (userErr) console.error('[Streak] users.upsert error', userErr)
      else          console.log('[Streak] users.upsert OK')

      // 2) insert today’s login, ignore dupes
      const { error: loginErr } = await supabase
        .from('user_logins')
        .insert(
          [{ address, login_date: todayDate }],
          { onConflict: ['address', 'login_date'], ignoreDuplicates: true }
        )
      if (loginErr) console.error('[Streak] logins.insert error', loginErr)
      else          console.log('[Streak] logins.insert OK')

      // 3) fetch streak
      const { data: streakRow, error: getStreakErr } = await supabase
        .from('user_streaks')
        .select('current_streak,last_login_date')
        .eq('address', address)
        .single()
      if (getStreakErr && getStreakErr.code !== 'PGRST116') {
        console.error('[Streak] fetch error', getStreakErr)
      } else {
        console.log('[Streak] fetched', streakRow)
      }

      // 4) compute new streak
      let newStreak = 1
      if (streakRow) {
        if (streakRow.last_login_date === todayDate) {
          newStreak = streakRow.current_streak
          console.log('[Streak] same-day, stay at', newStreak)
        } else if (streakRow.last_login_date === yesterdayDate) {
          newStreak = streakRow.current_streak + 1
          console.log('[Streak] consecutive, increment to', newStreak)
        } else {
          console.log('[Streak] gap detected, reset to 1')
        }
      } else {
        console.log('[Streak] no prior streak, start at 1')
      }

      // 5) upsert streak
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
      if (upsertErr) console.error('[Streak] streaks.upsert error', upsertErr)
      else           console.log('[Streak] streaks.upsert OK, streak=', newStreak)

      setLastUpserted(address)
    })()
  }, [address, lastUpserted])

  return (
    <header className="relative border-b border-white/10 bg-charcoal/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center space-x-3">
          <Image
            src="/images/alphiq.png"
            alt="AlphIQ logo"
            width={32}
            height={32}
          />
          <h1 className="text-xl font-bold text-neutral">AlphIQ</h1>
        </div>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center space-x-4 bg-white/5 rounded-lg p-1">
          <Link
            href="/"
            className={`flex items-center px-3 py-1 rounded ${
              isAnalytics ? 'bg-white/10 text-amber' : 'text-neutral hover:text-amber'
            }`}
          >
            <Activity className="w-4 h-4 mr-1" />
            Analytics View
          </Link>
          <Link
            href="/onchain-score"
            className={`flex items-center px-3 py-1 rounded ${
              isScore ? 'bg-white/10 text-amber' : 'text-neutral hover:text-amber'
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
          {address
            ? `${address.slice(0, 6)}…${address.slice(-6)}`
            : 'Connect Wallet'}
        </AlephiumConnectButton>
      </div>

      {/* Mobile nav panel */}
      {menuOpen && (
        <div className="md:hidden bg-charcoal/95 backdrop-blur-sm absolute inset-x-0 top-full z-40">
          <nav className="flex flex-col px-6 py-4 space-y-2">
            <Link
              href="/"
              className={`flex items-center px-3 py-2 rounded ${
                isAnalytics ? 'bg-white/10 text-amber' : 'text-neutral hover:text-amber'
              }`}
              onClick={() => setMenuOpen(false)}
            >
              <Activity className="w-5 h-5 mr-2" />
              Analytics View
            </Link>
            <Link
              href="/onchain-score"
              className={`flex items-center px-3 py-2 rounded ${
                isScore ? 'bg-white/10 text-amber' : 'text-neutral hover:text-amber'
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
