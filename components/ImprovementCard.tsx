'use client'

interface ImprovementCardProps {
  suggestion: string
  index: number
}

export default function ImprovementCard({ suggestion, index }: ImprovementCardProps) {
  return (
    <div className="flex gap-4 p-4 rounded-xl bg-slate-800/50 border border-slate-700/50 hover:border-slate-600 transition-colors">
      <div className="flex-shrink-0 w-7 h-7 rounded-full bg-slate-700 flex items-center justify-center">
        <span className="text-xs font-bold text-slate-300">{index + 1}</span>
      </div>
      <p className="text-sm text-slate-300 leading-relaxed">{suggestion}</p>
    </div>
  )
}
