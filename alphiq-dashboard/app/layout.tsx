import type { Metadata } from 'next'
import './globals.css'
import { AlephiumWalletProvider } from "@alephium/web3-react"


export const metadata: Metadata = {
  title: 'AlphIQ',
  description: 'Analytics and Onchain Profile dapp',
  generator: 'Pranshu Rastogi',
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