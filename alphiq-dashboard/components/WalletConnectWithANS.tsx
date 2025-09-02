'use client'

import { useWallet } from '@alephium/web3-react'
import { AlephiumConnectButton } from '@alephium/web3-react'
import { ANSDisplay } from './ANSDisplay'
import { useANS } from '@/hooks/useANS'

interface WalletConnectWithANSProps {
  variant?: 'desktop' | 'mobile'
}

export function WalletConnectWithANS({ variant = 'desktop' }: WalletConnectWithANSProps) {
  const { account } = useWallet()
  const address = typeof account === 'string' ? account : account?.address
  const { ansName, hasANS } = useANS(address)

  if (variant === 'mobile') {
    return (
      <div className="flex items-center justify-between w-full">
        {address && hasANS ? (
          // Mobile: Show ANS profile with wallet connection below
          <div className="w-full space-y-3">
            <div className="glass-effect px-4 py-3 rounded-lg border border-amber/30">
              <ANSDisplay address={address} size="md" showAddress={true} />
            </div>
            <div className="glass-effect px-4 py-2 rounded-lg border border-amber/30">
              <AlephiumConnectButton />
            </div>
          </div>
        ) : (
          // Mobile: Show just wallet connect button when no ANS
          <div className="w-full">
            <div className="glass-effect px-4 py-2 rounded-lg border border-amber/30">
              <AlephiumConnectButton />
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="flex items-center">
      {address && hasANS ? (
        // Desktop: Show ANS profile with wallet connection integrated
        <div className="glass-effect hover:glass-hover text-neutral font-medium flex items-center px-4 py-2 rounded-lg border border-amber/30 transition-all duration-300">
          <div className="flex items-center space-x-3">
            <ANSDisplay address={address} size="sm" showAddress={false} />
            <div className="w-px h-6 bg-amber/30" />
            <AlephiumConnectButton />
          </div>
        </div>
      ) : (
        // Desktop: Show just wallet connect button when no ANS
        <div className="glass-effect hover:glass-hover text-neutral font-medium flex items-center px-4 py-2 rounded-lg border border-amber/30 transition-all duration-300">
          <AlephiumConnectButton />
        </div>
      )}
    </div>
  )
}
