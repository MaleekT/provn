import type { WalletData, ScoreResult } from './types'

function daysSince(unixSeconds: number): number {
  return (Date.now() / 1000 - unixSeconds) / 86400
}

export function computeProvnScore(data: WalletData): ScoreResult {
  const walletAge = Math.min(15, Math.floor((daysSince(data.firstTxTimestamp) / 90) * 15))

  const txVolume = Math.min(15, Math.floor((data.totalTxCount / 500) * 15))

  const diversity = Math.min(15, Math.floor((data.uniqueContracts.size / 10) * 15))

  const jobCompletion =
    data.totalJobs === 0
      ? 5
      : Math.min(20, Math.floor((data.completedJobs / data.totalJobs) * 20))

  const loanRepayment =
    data.totalLoans === 0
      ? 10
      : Math.min(15, Math.floor((data.repaidLoans / data.totalLoans) * 15))

  const identity = data.isRegistered ? 10 : 0

  const successRate =
    data.totalTxCount === 0
      ? 0
      : Math.min(10, Math.floor((data.successfulTxCount / data.totalTxCount) * 10))

  const total =
    walletAge + txVolume + diversity + jobCompletion + loanRepayment + identity + successRate

  return {
    total,
    breakdown: { walletAge, txVolume, diversity, jobCompletion, loanRepayment, identity, successRate },
  }
}

export function getScoreTier(score: number): string {
  if (score <= 20) return 'Newcomer'
  if (score <= 40) return 'Active'
  if (score <= 60) return 'Established'
  if (score <= 80) return 'Trusted'
  return 'Elite'
}

export const DIMENSION_LABELS: Record<keyof import('./types').ScoreBreakdown, string> = {
  walletAge: 'Wallet Age',
  txVolume: 'Transaction Volume',
  diversity: 'Protocol Diversity',
  jobCompletion: 'Job Completion Rate',
  loanRepayment: 'Loan Repayment',
  identity: 'ERC-8004 Registration',
  successRate: 'Transaction Success Rate',
}

export const DIMENSION_MAX: Record<keyof import('./types').ScoreBreakdown, number> = {
  walletAge: 15,
  txVolume: 15,
  diversity: 15,
  jobCompletion: 20,
  loanRepayment: 15,
  identity: 10,
  successRate: 10,
}
