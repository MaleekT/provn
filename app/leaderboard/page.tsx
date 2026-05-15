import LeaderboardRow from '@/components/LeaderboardRow'
import { getLeaderboard } from '@/lib/envio'
import type { LeaderboardEntry } from '@/lib/types'

export const revalidate = 60

export default async function LeaderboardPage() {
  let entries: LeaderboardEntry[] = []
  let fetchError: string | null = null

  try {
    entries = await getLeaderboard()
  } catch (err: unknown) {
    fetchError = err instanceof Error ? err.message : 'Failed to load leaderboard'
  }

  return (
    <main className="min-h-screen bg-navy">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-5 border-b border-slate-800/60">
        <a href="/" className="text-lg font-bold tracking-tight">
          <span className="text-white">Provn</span>
          <span className="text-score-green">.</span>
        </a>
        <a href="/dashboard" className="text-sm text-slate-400 hover:text-white transition-colors">
          My Score
        </a>
      </nav>

      <div className="max-w-2xl mx-auto px-6 py-12">
        <div className="mb-10">
          <h1 className="text-3xl font-bold mb-2">Leaderboard</h1>
          <p className="text-slate-400 text-sm">
            Top scored wallets on Arc testnet · Updates every 60 seconds
          </p>
        </div>

        {fetchError ? (
          <div className="px-5 py-4 rounded-xl bg-score-red/10 border border-score-red/30 text-score-red text-sm">
            {fetchError}
          </div>
        ) : entries.length === 0 ? (
          <div className="flex flex-col items-center gap-4 py-20 text-center">
            <span className="text-4xl">🏆</span>
            <p className="text-slate-400">
              No wallets scored yet. Be the first on the leaderboard.
            </p>
            <a
              href="/dashboard"
              className="px-5 py-2.5 rounded-xl bg-score-green text-navy text-sm font-bold hover:bg-score-green/90 transition-all"
            >
              Get My Score
            </a>
          </div>
        ) : (
          <div className="space-y-2">
            {entries.map((entry, i) => (
              <LeaderboardRow
                key={entry.wallet}
                rank={i + 1}
                wallet={entry.wallet}
                score={entry.score}
                tier={entry.tier}
                lastScored={entry.lastScored}
              />
            ))}
          </div>
        )}
      </div>

      <footer className="px-6 py-6 border-t border-slate-800/60 text-center text-xs text-slate-700 mt-12">
        Provn · Arc Testnet · ERC-8004 + ERC-8183
      </footer>
    </main>
  )
}
