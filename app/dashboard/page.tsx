'use client'

import { usePrivy } from '@privy-io/react-auth'
import { useRouter } from 'next/navigation'
import { useEffect, useState, useCallback } from 'react'
import ScoreGauge from '@/components/ScoreGauge'
import DimensionBar from '@/components/DimensionBar'
import ImprovementCard from '@/components/ImprovementCard'
import { DIMENSION_LABELS, DIMENSION_MAX } from '@/lib/scorer'
import { explorerTxUrl } from '@/lib/arc'
import type { ProvnScoreResponse, ReputationEvent, ScoreBreakdown } from '@/lib/types'

function truncateWallet(address: string): string {
  return `${address.slice(0, 6)}…${address.slice(-4)}`
}

export default function DashboardPage() {
  const { ready, authenticated, user, logout } = usePrivy()
  const router = useRouter()

  const [scoreData, setScoreData] = useState<ProvnScoreResponse | null>(null)
  const [history, setHistory] = useState<ReputationEvent[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const wallet = user?.wallet?.address ?? ''

  useEffect(() => {
    if (ready && !authenticated) router.push('/')
  }, [ready, authenticated, router])

  const loadHistory = useCallback(async () => {
    if (!wallet) return
    try {
      const res = await fetch(`/api/history?wallet=${wallet}`)
      const json = (await res.json()) as { events?: ReputationEvent[] }
      setHistory(json.events ?? [])
    } catch {
      // history is non-critical — silently skip
    }
  }, [wallet])

  useEffect(() => {
    if (wallet) void loadHistory()
  }, [wallet, loadHistory])

  async function handleGetScore() {
    if (!wallet) return
    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ wallet }),
      })

      const json = (await res.json()) as ProvnScoreResponse & { error?: string }

      if (!res.ok) {
        setError(json.error ?? 'Scoring failed. Please try again.')
        return
      }

      setScoreData(json)
      await loadHistory()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unexpected error')
    } finally {
      setLoading(false)
    }
  }

  if (!ready || !authenticated) {
    return (
      <div className="min-h-screen bg-navy flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-score-green border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const breakdown = scoreData?.score.breakdown

  return (
    <main className="min-h-screen bg-navy">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-5 border-b border-slate-800/60">
        <a href="/" className="text-lg font-bold tracking-tight">
          <span className="text-white">Provn</span>
          <span className="text-score-green">.</span>
        </a>
        <div className="flex items-center gap-4">
          <a href="/leaderboard" className="text-sm text-slate-400 hover:text-white transition-colors">
            Leaderboard
          </a>
          <span className="font-mono text-sm text-slate-400 bg-slate-800/60 px-3 py-1 rounded-lg">
            {truncateWallet(wallet)}
          </span>
          <button
            onClick={logout}
            className="text-sm text-slate-500 hover:text-white transition-colors"
          >
            Disconnect
          </button>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-12 space-y-10">
        {/* Score section */}
        {scoreData ? (
          <>
            {/* Gauge + breakdown */}
            <div className="grid md:grid-cols-2 gap-8 items-start">
              <div className="flex flex-col items-center gap-6 p-8 rounded-2xl bg-slate-900/60 border border-slate-800/60">
                <ScoreGauge score={scoreData.score.total} size={220} />

                {/* Tx links */}
                <div className="w-full space-y-2 pt-2 border-t border-slate-800/60">
                  {scoreData.reputationTxHash && (
                    <a
                      href={explorerTxUrl(scoreData.reputationTxHash)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between text-xs text-slate-500 hover:text-score-green transition-colors"
                    >
                      <span>ERC-8004 write</span>
                      <span className="font-mono">{scoreData.reputationTxHash.slice(0, 10)}…↗</span>
                    </a>
                  )}
                  {scoreData.jobTxHash && (
                    <a
                      href={explorerTxUrl(scoreData.jobTxHash)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between text-xs text-slate-500 hover:text-score-green transition-colors"
                    >
                      <span>ERC-8183 job</span>
                      <span className="font-mono">{scoreData.jobTxHash.slice(0, 10)}…↗</span>
                    </a>
                  )}
                </div>
              </div>

              {/* Dimensions */}
              <div className="space-y-4 p-6 rounded-2xl bg-slate-900/60 border border-slate-800/60">
                <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-5">
                  Score Breakdown
                </h2>
                {breakdown &&
                  (Object.keys(breakdown) as (keyof ScoreBreakdown)[]).map((key) => (
                    <DimensionBar
                      key={key}
                      label={DIMENSION_LABELS[key]}
                      points={breakdown[key]}
                      maxPoints={DIMENSION_MAX[key]}
                    />
                  ))}
              </div>
            </div>

            {/* Claude explanation */}
            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/60">
              <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">
                Score Analysis
              </h2>
              <p className="text-slate-300 leading-relaxed">{scoreData.explanation}</p>
            </div>

            {/* Improvement suggestions */}
            <div>
              <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">
                How to Improve
              </h2>
              <div className="space-y-3">
                {scoreData.suggestions.map((s, i) => (
                  <ImprovementCard key={i} suggestion={s} index={i} />
                ))}
              </div>
            </div>

            {/* Re-score button */}
            <div className="flex justify-center pt-4">
              <button
                onClick={() => void handleGetScore()}
                disabled={loading}
                className="px-6 py-2.5 rounded-xl border border-slate-700 text-sm text-slate-400 hover:text-white hover:border-slate-500 transition-all disabled:opacity-50"
              >
                {loading ? 'Scoring…' : 'Re-score (0.10 USDC)'}
              </button>
            </div>
          </>
        ) : (
          /* No score yet */
          <div className="flex flex-col items-center gap-8 py-16 text-center">
            <div className="w-36 h-36 rounded-full bg-slate-900/80 border-2 border-slate-800 flex items-center justify-center">
              <span className="text-5xl font-bold text-slate-700">?</span>
            </div>

            <div className="space-y-2">
              <h1 className="text-2xl font-bold">You have not been scored yet</h1>
              <p className="text-slate-400 max-w-sm">
                Pay <span className="text-white font-semibold">0.10 testnet USDC</span> to score
                your Arc wallet. Get USDC free from{' '}
                <a
                  href="https://faucet.circle.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-score-green hover:underline"
                >
                  faucet.circle.com
                </a>
                .
              </p>
            </div>

            {error && (
              <div className="px-4 py-3 rounded-xl bg-score-red/10 border border-score-red/30 text-score-red text-sm max-w-sm">
                {error}
              </div>
            )}

            <button
              onClick={() => void handleGetScore()}
              disabled={loading || !wallet}
              className="px-8 py-3.5 rounded-xl bg-score-green text-navy text-base font-bold hover:bg-score-green/90 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-navy border-t-transparent rounded-full animate-spin" />
                  Scoring your wallet…
                </>
              ) : (
                'Get My Provn Score'
              )}
            </button>
          </div>
        )}

        {/* Score history */}
        {history.length > 0 && (
          <div>
            <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">
              Score History
            </h2>
            <div className="space-y-2">
              {history.map((event, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between px-4 py-3 rounded-xl bg-slate-900/40 border border-slate-800/60"
                >
                  <span className="text-sm text-slate-500">
                    {new Date(event.timestamp * 1000).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </span>
                  <span className="text-lg font-bold text-score-green tabular-nums">
                    {event.score}
                    <span className="text-slate-600 text-sm font-normal">/100</span>
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
