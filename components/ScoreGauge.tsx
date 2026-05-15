'use client'

import { getScoreTier } from '@/lib/scorer'

interface ScoreGaugeProps {
  score: number
  size?: number
}

export default function ScoreGauge({ score, size = 220 }: ScoreGaugeProps) {
  const tier = getScoreTier(score)
  const cx = size / 2
  const cy = size / 2
  const r = (size / 2) * 0.78
  const strokeWidth = size * 0.072

  // Arc spans 240 degrees (from 150° to 390°/30°)
  const totalAngle = 240
  const startAngle = 150
  const fillAngle = (score / 100) * totalAngle
  const endAngle = startAngle + fillAngle

  function polarToXY(angleDeg: number, radius: number) {
    const rad = ((angleDeg - 90) * Math.PI) / 180
    return {
      x: cx + radius * Math.cos(rad),
      y: cy + radius * Math.sin(rad),
    }
  }

  function arcPath(from: number, to: number, radius: number) {
    const start = polarToXY(from, radius)
    const end = polarToXY(to, radius)
    const largeArc = to - from > 180 ? 1 : 0
    return `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArc} 1 ${end.x} ${end.y}`
  }

  // Color stops: red → amber → green
  const trackColor = '#1e2a3a'
  const scoreColor =
    score <= 33 ? '#EF4444' : score <= 66 ? '#F59E0B' : '#22C55E'

  const tierColors: Record<string, string> = {
    Newcomer: '#EF4444',
    Active: '#F97316',
    Established: '#F59E0B',
    Trusted: '#84CC16',
    Elite: '#22C55E',
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <defs>
          <linearGradient id="gaugeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#EF4444" />
            <stop offset="50%" stopColor="#F59E0B" />
            <stop offset="100%" stopColor="#22C55E" />
          </linearGradient>
        </defs>

        {/* Track */}
        <path
          d={arcPath(startAngle, startAngle + totalAngle, r)}
          fill="none"
          stroke={trackColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />

        {/* Fill */}
        {score > 0 && (
          <path
            d={arcPath(startAngle, endAngle, r)}
            fill="none"
            stroke={scoreColor}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            style={{ filter: `drop-shadow(0 0 ${size * 0.04}px ${scoreColor}80)` }}
          />
        )}

        {/* Score number */}
        <text
          x={cx}
          y={cy - size * 0.04}
          textAnchor="middle"
          dominantBaseline="middle"
          fill="white"
          fontSize={size * 0.22}
          fontWeight="700"
          fontFamily="system-ui, sans-serif"
        >
          {score}
        </text>

        {/* /100 label */}
        <text
          x={cx}
          y={cy + size * 0.14}
          textAnchor="middle"
          dominantBaseline="middle"
          fill="#64748b"
          fontSize={size * 0.08}
          fontFamily="system-ui, sans-serif"
        >
          / 100
        </text>
      </svg>

      {/* Tier badge */}
      <span
        className="px-4 py-1 rounded-full text-sm font-semibold tracking-wide"
        style={{
          backgroundColor: `${tierColors[tier] ?? '#22C55E'}20`,
          color: tierColors[tier] ?? '#22C55E',
          border: `1px solid ${tierColors[tier] ?? '#22C55E'}40`,
        }}
      >
        {tier}
      </span>
    </div>
  )
}
