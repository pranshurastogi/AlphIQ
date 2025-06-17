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
  const { account } = useWallet()
  const address = typeof account === 'string' ? account : account?.address

  // Track which address we've already upserted into Supabase
  const [lastUpserted, setLastUpserted] = useState<string | null>(null)
  // Mobile hamburger menu open state
  const [menuOpen, setMenuOpen] = useState(false)
  const pathname = usePathname()

  // Supabase upsert on every new address
  useEffect(() => {
    if (!address || address === lastUpserted) return
    ;(async () => {
      const now = new Date().toISOString()
      const { error } = await supabase
        .from('users')
        .upsert(
          {
            address,
            exists_flag: true,
            checked_at: now,
            // joined_at defaults to NOW() on insertion
          },
          {
            onConflict: ['address'],
            returning: 'minimal',
          }
        )
      if (error) {
        console.error('[Supabase] failed to sync user', address, error.message)
      } else {
        console.log('[Supabase] synced user', address)
        setLastUpserted(address)
      }
    })()
  }, [address, lastUpserted])

  const isAnalytics = pathname === '/'
  const isScore = pathname === '/onchain-score'

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

        {/* Desktop View Toggle */}
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

        {/* Mobile Hamburger */}
        <button
          className="md:hidden text-neutral hover:text-amber p-2 rounded"
          onClick={() => setMenuOpen((o) => !o)}
          aria-label="Toggle menu"
        >
          {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>

        {/* Wallet Connect */}
        <AlephiumConnectButton className="bg-amber hover:bg-amber/90 text-charcoal font-medium flex items-center px-4 py-2 rounded">
          <WalletIcon className="w-4 h-4 mr-2" />
          {address
            ? `${address.slice(0, 6)}…${address.slice(-6)}`
            : 'Connect Wallet'}
        </AlephiumConnectButton>
      </div>

      {/* Mobile Menu Panel */}
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
