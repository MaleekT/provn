import { getScoreTier } from './scorer'
import { publicClient } from './arc'
import { parseAbiItem } from 'viem'
import type { WalletData, LeaderboardEntry } from './types'

const ARCSCAN_API = 'https://testnet.arcscan.app/api'
const REPUTATION_REGISTRY = process.env.NEXT_PUBLIC_REPUTATION_REGISTRY as `0x${string}`
const ERC8183_ADDRESS = process.env.NEXT_PUBLIC_ERC8183 as `0x${string}`

// ArcScan (Blockscout) response shapes
interface BlockscoutTx {
  hash: string
  from: string
  to: string
  timeStamp: string
  isError: string
  txreceipt_status: string
}

interface BlockscoutResponse<T> {
  status: string
  message: string
  result: T
}

async function fetchTxList(address: string): Promise<BlockscoutTx[]> {
  const url = `${ARCSCAN_API}?module=account&action=txlist&address=${address}&sort=asc&page=1&offset=1000`
  try {
    const res = await fetch(url, { next: { revalidate: 60 } })
    const json = (await res.json()) as BlockscoutResponse<BlockscoutTx[]>
    if (!Array.isArray(json.result)) return []
    return json.result
  } catch {
    return []
  }
}

// Use viem getLogs to query ERC-8183 job events for a given client wallet
async function fetchJobEvents(clientAddress: string): Promise<{ total: number; completed: number }> {
  try {
    const createdEvent = parseAbiItem(
      'event JobCreated(uint256 indexed jobId, address indexed client, address indexed provider, address token, uint256 amount)'
    )
    const completedEvent = parseAbiItem(
      'event JobCompleted(uint256 indexed jobId)'
    )

    const [created, completed] = await Promise.all([
      publicClient.getLogs({
        address: ERC8183_ADDRESS,
        event: createdEvent,
        args: { client: clientAddress as `0x${string}` },
        fromBlock: 'earliest',
        toBlock: 'latest',
      }),
      publicClient.getLogs({
        address: ERC8183_ADDRESS,
        event: completedEvent,
        fromBlock: 'earliest',
        toBlock: 'latest',
      }),
    ])

    // completed jobs are ones where jobId appears in both created (for this client) and completed
    const clientJobIds = new Set(created.map((l) => String(l.args.jobId)))
    const completedCount = completed.filter((l) => clientJobIds.has(String(l.args.jobId))).length

    return { total: created.length, completed: completedCount }
  } catch {
    // If the contract doesn't emit standard events, fall back to 0
    return { total: 0, completed: 0 }
  }
}

export async function getWalletHistory(address: string): Promise<WalletData> {
  const [txs, jobs] = await Promise.all([
    fetchTxList(address),
    fetchJobEvents(address),
  ])

  const addr = address.toLowerCase()

  const firstTxTimestamp =
    txs.length > 0
      ? Number(txs[0].timeStamp)
      : Math.floor(Date.now() / 1000)

  const successfulTxCount = txs.filter(
    (t) => t.isError === '0' && t.txreceipt_status !== '0'
  ).length

  const uniqueContracts = new Set(
    txs
      .map((t) => t.to?.toLowerCase())
      .filter((a): a is string => Boolean(a) && a !== addr)
  )

  return {
    firstTxTimestamp,
    totalTxCount: txs.length,
    successfulTxCount,
    uniqueContracts,
    totalJobs: jobs.total,
    completedJobs: jobs.completed,
    totalLoans: 0,  // No lending protocol addresses known — scorer defaults to 10pts
    repaidLoans: 0,
    isRegistered: false,
  }
}

// Pull all reputation events from the on-chain registry via viem getLogs
export async function getLeaderboard(): Promise<LeaderboardEntry[]> {
  try {
    const reputationEvent = parseAbiItem(
      'event ReputationEventAdded(address indexed subject, uint8 score, bytes32 evidenceHash, uint256 timestamp)'
    )

    const logs = await publicClient.getLogs({
      address: REPUTATION_REGISTRY,
      event: reputationEvent,
      fromBlock: 'earliest',
      toBlock: 'latest',
    })

    // Keep only the highest score per wallet
    const best = new Map<string, { score: number; timestamp: number }>()
    for (const log of logs) {
      const wallet = (log.args.subject as string).toLowerCase()
      const score = Number(log.args.score)
      const timestamp = log.args.timestamp
        ? Number(log.args.timestamp)
        : log.blockNumber
          ? Number(log.blockNumber)
          : 0
      const existing = best.get(wallet)
      if (!existing || score > existing.score) {
        best.set(wallet, { score, timestamp })
      }
    }

    return Array.from(best.entries())
      .sort((a, b) => b[1].score - a[1].score)
      .slice(0, 20)
      .map(([wallet, { score, timestamp }]) => ({
        wallet,
        score,
        tier: getScoreTier(score),
        lastScored: timestamp,
      }))
  } catch {
    return []
  }
}
