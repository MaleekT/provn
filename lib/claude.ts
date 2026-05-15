import type { ScoreResult } from './types'
import { getScoreTier } from './scorer'

export interface ScoreExplanation {
  explanation: string
  suggestions: string[]
}

const DIMENSION_MAX = { walletAge: 15, txVolume: 15, diversity: 15, jobCompletion: 20, loanRepayment: 15, identity: 10, successRate: 10 }

function pct(val: number, max: number) { return max === 0 ? 0 : val / max }

export async function generateScoreExplanation(
  wallet: string,
  score: ScoreResult
): Promise<ScoreExplanation> {
  const tier = getScoreTier(score.total)
  const b = score.breakdown

  // Build explanation from the two weakest and two strongest dimensions
  const dims = [
    { label: 'wallet age', val: b.walletAge, max: DIMENSION_MAX.walletAge },
    { label: 'transaction volume', val: b.txVolume, max: DIMENSION_MAX.txVolume },
    { label: 'protocol diversity', val: b.diversity, max: DIMENSION_MAX.diversity },
    { label: 'job completion rate', val: b.jobCompletion, max: DIMENSION_MAX.jobCompletion },
    { label: 'loan repayment', val: b.loanRepayment, max: DIMENSION_MAX.loanRepayment },
    { label: 'ERC-8004 identity', val: b.identity, max: DIMENSION_MAX.identity },
    { label: 'transaction success rate', val: b.successRate, max: DIMENSION_MAX.successRate },
  ].map((d) => ({ ...d, ratio: pct(d.val, d.max) }))
    .sort((a, b) => a.ratio - b.ratio)

  const weakest = dims.slice(0, 2).map((d) => d.label)
  const strongest = dims.slice(-2).map((d) => d.label)

  const short = `${wallet.slice(0, 6)}…${wallet.slice(-4)}`

  const explanation =
    `Wallet ${short} earned a ${score.total}/100 ${tier} score on Arc testnet. ` +
    `Strongest dimensions are ${strongest[1]} and ${strongest[0]}, demonstrating consistent on-chain activity. ` +
    `${score.total < 50
      ? `This wallet is still building its reputation — focused activity will push the score higher.`
      : `This wallet shows solid on-chain credibility across most dimensions.`}`

  const suggestions = buildSuggestions(b)

  return { explanation, suggestions }
}

function buildSuggestions(b: ScoreResult['breakdown']): string[] {
  const tips: string[] = []

  if (pct(b.walletAge, DIMENSION_MAX.walletAge) < 0.5)
    tips.push('Keep your wallet active — age scores improve automatically as your wallet history grows on Arc testnet.')

  if (pct(b.txVolume, DIMENSION_MAX.txVolume) < 0.5)
    tips.push('Increase your transaction volume by interacting with Arc testnet dApps and contracts regularly.')

  if (pct(b.diversity, DIMENSION_MAX.diversity) < 0.5)
    tips.push('Interact with more unique smart contracts to improve your protocol diversity score.')

  if (pct(b.jobCompletion, DIMENSION_MAX.jobCompletion) < 0.7)
    tips.push('Complete more ERC-8183 agentic jobs — a higher completion rate is the biggest scoring lever.')

  if (b.identity === 0)
    tips.push('Register your wallet on the ERC-8004 IdentityRegistry to unlock the full 10-point identity bonus.')

  if (pct(b.successRate, DIMENSION_MAX.successRate) < 0.8)
    tips.push('Reduce failed transactions — a high success rate signals a reliable, well-managed wallet.')

  if (tips.length === 0)
    tips.push('Maintain your activity level to protect your Elite score as competition grows on the leaderboard.')

  return tips.slice(0, 3)
}
