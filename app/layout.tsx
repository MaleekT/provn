import type { Metadata } from 'next'
import localFont from 'next/font/local'
import './globals.css'
import PrivyProviderWrapper from '@/components/PrivyProviderWrapper'

const geistSans = localFont({
  src: './fonts/GeistVF.woff',
  variable: '--font-geist-sans',
  weight: '100 900',
})
const geistMono = localFont({
  src: './fonts/GeistMonoVF.woff',
  variable: '--font-geist-mono',
  weight: '100 900',
})

export const metadata: Metadata = {
  title: 'Provn — On-Chain Reputation Score',
  description: 'Your verifiable Arc testnet reputation score, stored permanently via ERC-8004.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-navy text-white`}>
        <PrivyProviderWrapper>{children}</PrivyProviderWrapper>
      </body>
    </html>
  )
}
