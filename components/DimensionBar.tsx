'use client'

interface DimensionBarProps {
  label: string
  points: number
  maxPoints: number
}

export default function DimensionBar({ label, points, maxPoints }: DimensionBarProps) {
  const pct = maxPoints > 0 ? (points / maxPoints) * 100 : 0
  const color = points === maxPoints ? '#22C55E' : pct > 50 ? '#F59E0B' : '#EF4444'

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex justify-between items-center">
        <span className="text-sm text-slate-300">{label}</span>
        <span className="text-sm font-semibold tabular-nums" style={{ color }}>
          {points}
          <span className="text-slate-500 font-normal">/{maxPoints}</span>
        </span>
      </div>

      <div className="h-1.5 rounded-full bg-slate-800 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{
            width: `${pct}%`,
            backgroundColor: color,
            boxShadow: `0 0 6px ${color}60`,
          }}
        />
      </div>
    </div>
  )
}
