export interface WalletData {
  firstTxTimestamp: number
  totalTxCount: number
  successfulTxCount: number
  uniqueContracts: Set<string>
  totalJobs: number
  completedJobs: number
  totalLoans: number
  repaidLoans: number
  isRegistered: boolean
}

export interface ScoreBreakdown {
  walletAge: number
  txVolume: number
  diversity: number
  jobCompletion: number
  loanRepayment: number
  identity: number
  successRate: number
}

export interface ScoreResult {
  total: number
  breakdown: ScoreBreakdown
}

export interface ProvnScoreResponse {
  wallet: string
  score: ScoreResult
  explanation: string
  suggestions: string[]
  reputationTxHash: string
  jobTxHash: string
  timestamp: number
}

export interface ReputationEvent {
  scorer: string
  score: number
  evidenceHash: string
  timestamp: number
}

export interface LeaderboardEntry {
  wallet: string
  score: number
  tier: string
  lastScored: number
}
