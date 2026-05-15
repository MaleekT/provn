'use client'

import { usePrivy } from '@privy-io/react-auth'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import ScoreGauge from '@/components/ScoreGauge'

export default function LandingPage() {
  const { login, authenticated, ready } = usePrivy()
  const router = useRouter()

  useEffect(() => {
    if (ready && authenticated) {
      router.push('/dashboard')
    }
  }, [ready, authenticated, router])

  return (
    <main className="min-h-screen bg-navy flex flex-col">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-5 border-b border-slate-800/60">
        <span className="text-lg font-bold tracking-tight">
          <span className="text-white">Provn</span>
          <span className="text-score-green">.</span>
        </span>
        <a
          href="/leaderboard"
          className="text-sm text-slate-400 hover:text-white transition-colors"
        >
          Leaderboard
        </a>
      </nav>

      {/* Hero */}
      <section className="flex-1 flex flex-col items-center justify-center px-6 py-20 text-center">
        {/* Eyebrow */}
        <div className="mb-6 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-score-green/10 border border-score-green/20">
          <span className="w-1.5 h-1.5 rounded-full bg-score-green animate-pulse" />
          <span className="text-xs text-score-green font-medium tracking-wide">
            Live on Arc Testnet
          </span>
        </div>

        {/* Headline */}
        <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight leading-none mb-5">
          Your On-Chain
          <br />
          <span className="text-score-green">Identity Score</span>
        </h1>

        <p className="max-w-xl text-slate-400 text-lg leading-relaxed mb-10">
          Provn reads your complete Arc testnet wallet history, scores your credibility across
          seven dimensions, and stores the result permanently via{' '}
          <span className="text-slate-300 font-medium">ERC-8004</span> — the first verifiable
          reputation primitive on Arc.
        </p>

        {/* CTA */}
        <button
          onClick={login}
          disabled={!ready}
          className="px-8 py-3.5 rounded-xl bg-score-green text-navy text-base font-bold hover:bg-score-green/90 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {ready ? 'Connect Wallet' : 'Loading…'}
        </button>

        <p className="mt-4 text-xs text-slate-600">
          Email, Google, or MetaMask · No crypto knowledge needed · Testnet USDC only
        </p>

        {/* Sample gauge */}
        <div className="mt-20 flex flex-col items-center gap-6">
          <p className="text-xs text-slate-600 uppercase tracking-widest font-semibold">
            Sample Score
          </p>
          <div className="p-8 rounded-2xl bg-slate-900/60 border border-slate-800/60 backdrop-blur-sm">
            <ScoreGauge score={72} size={200} />
          </div>
        </div>
      </section>

      {/* Dimensions grid */}
      <section className="px-6 py-16 border-t border-slate-800/60 max-w-4xl mx-auto w-full">
        <p className="text-xs text-slate-600 uppercase tracking-widest font-semibold text-center mb-10">
          Seven Scoring Dimensions
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Wallet Age', pts: 15 },
            { label: 'Tx Volume', pts: 15 },
            { label: 'Protocol Diversity', pts: 15 },
            { label: 'Job Completion', pts: 20 },
            { label: 'Loan Repayment', pts: 15 },
            { label: 'ERC-8004 Identity', pts: 10 },
            { label: 'Tx Success Rate', pts: 10 },
          ].map((d) => (
            <div
              key={d.label}
              className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/60 flex flex-col gap-1"
            >
              <span className="text-score-green font-bold text-lg">{d.pts}</span>
              <span className="text-xs text-slate-400 leading-tight">{d.label}</span>
            </div>
          ))}
          <div className="p-4 rounded-xl bg-score-green/10 border border-score-green/20 flex flex-col gap-1">
            <span className="text-score-green font-bold text-lg">100</span>
            <span className="text-xs text-slate-400 leading-tight">Total Points</span>
          </div>
        </div>
      </section>

      <footer className="px-6 py-6 border-t border-slate-800/60 text-center text-xs text-slate-700">
        Provn · Arc Testnet · ERC-8004 + ERC-8183 · Powered by Circle &amp; Privy
      </footer>
    </main>
  )
}
