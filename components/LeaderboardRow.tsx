'use client'


interface LeaderboardRowProps {
  rank: number
  wallet: string
  score: number
  tier: string
  lastScored: number
}

const tierColors: Record<string, string> = {
  Newcomer: '#EF4444',
  Active: '#F97316',
  Established: '#F59E0B',
  Trusted: '#84CC16',
  Elite: '#22C55E',
}

function truncateWallet(address: string): string {
  return `${address.slice(0, 6)}…${address.slice(-4)}`
}

function rankBadgeStyle(rank: number): string {
  if (rank === 1) return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
  if (rank === 2) return 'bg-slate-400/20 text-slate-300 border-slate-400/30'
  if (rank === 3) return 'bg-orange-600/20 text-orange-400 border-orange-600/30'
  return 'bg-slate-800/50 text-slate-400 border-slate-700/50'
}

export default function LeaderboardRow({ rank, wallet, score, tier, lastScored }: LeaderboardRowProps) {
  const tierColor = tierColors[tier] ?? '#22C55E'
  const date = new Date(lastScored * 1000).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  })

  return (
    <div className="flex items-center gap-4 px-5 py-3.5 rounded-xl bg-slate-800/30 border border-slate-700/40 hover:border-slate-600/60 hover:bg-slate-800/50 transition-all">
      {/* Rank */}
      <span
        className={`flex-shrink-0 w-8 h-8 rounded-lg border flex items-center justify-center text-sm font-bold ${rankBadgeStyle(rank)}`}
      >
        {rank}
      </span>

      {/* Wallet */}
      <a
        href={`https://testnet.arcscan.app/address/${wallet}`}
        target="_blank"
        rel="noopener noreferrer"
        className="flex-1 font-mono text-sm text-slate-300 hover:text-white transition-colors"
      >
        {truncateWallet(wallet)}
      </a>

      {/* Tier badge */}
      <span
        className="hidden sm:block px-2.5 py-0.5 rounded-full text-xs font-semibold"
        style={{
          backgroundColor: `${tierColor}18`,
          color: tierColor,
          border: `1px solid ${tierColor}30`,
        }}
      >
        {tier}
      </span>

      {/* Date */}
      <span className="hidden md:block text-xs text-slate-500">{date}</span>

      {/* Score */}
      <span className="text-lg font-bold tabular-nums" style={{ color: tierColor }}>
        {score}
      </span>
    </div>
  )
}
