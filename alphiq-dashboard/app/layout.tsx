// app/layout.tsx
import './globals.css'
import { AlephiumWalletProvider } from '@alephium/web3-react'
import TopBar from '@/components/TopBar'
import { Footer } from '@/components/Footer'
import { Analytics } from '@vercel/analytics/next'
import { ErrorBoundary } from '@/components/ErrorBoundary'

export const metadata = {
  title: 'AlphIQ Dashboard',
  description: 'DeFi Intelligence & Onchain Scores for Alephium',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-charcoal text-neutral">
        {/* Wallet context for all pages */}
        <AlephiumWalletProvider 
          theme="retro"
          network="mainnet"
        >
          {/* Error boundary to catch any unhandled errors */}
          <ErrorBoundary>
            {/* Shared header with Connect button */}
            <TopBar />

            {/* Page content */}
            {children}
          </ErrorBoundary>
        </AlephiumWalletProvider>
        <Analytics />
        <Footer />
      </body>
    </html>
  )
}
