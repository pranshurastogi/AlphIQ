// components/TopBar.tsx
'use client'

import Link from 'next/link'
import { Activity, Trophy, Wallet as WalletIcon, Zap } from 'lucide-react'
import { AlephiumConnectButton } from '@alephium/web3-react'

export default function TopBar() {
  return (
    <header className="border-b border-white/10 bg-charcoal/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-br from-mint to-amber rounded-lg flex items-center justify-center">
            <Zap className="w-5 h-5 text-charcoal" />
          </div>
          <h1 className="text-xl font-bold text-neutral">AlphIQ</h1>
        </div>

        {/* View Toggle */}
        <div className="flex items-center space-x-4 bg-white/5 rounded-lg p-1">
          <Link
            href="/"
            className="flex items-center text-neutral hover:text-amber px-3 py-1 rounded"
          >
            <Activity className="w-4 h-4 mr-1" />
            Analytics View
          </Link>
          <Link
            href="/onchain-score"
            className="flex items-center text-neutral hover:text-amber px-3 py-1 rounded"
          >
            <Trophy className="w-4 h-4 mr-1" />
            Onchain Score
          </Link>
        </div>

        {/* Wallet Connect */}
        <AlephiumConnectButton className="bg-amber hover:bg-amber/90 text-charcoal font-medium flex items-center px-4 py-2 rounded">
          <WalletIcon className="w-4 h-4 mr-2" />
          {/* Will auto-display the connected address */}
        </AlephiumConnectButton>
      </div>
    </header>
  )
}
