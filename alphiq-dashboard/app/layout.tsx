import type { Metadata } from 'next'
import { AlephiumWalletProvider } from '@alephium/web3-react'
import './globals.css'

export const metadata: Metadata = {
  title: 'Alph IQ',
  description: 'Analytics dashboard',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AlephiumWalletProvider theme="default">
          {children}
        </AlephiumWalletProvider>
      </body>
    </html>
  )
}
