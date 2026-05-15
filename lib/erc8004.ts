import { keccak256, toHex, isAddress } from 'viem'
import { publicClient } from './arc'
import { getAgentWalletClient } from './agent-wallet'
import type { ReputationEvent, ScoreBreakdown } from './types'

const IDENTITY_REGISTRY = process.env.NEXT_PUBLIC_IDENTITY_REGISTRY as `0x${string}`
const REPUTATION_REGISTRY = process.env.NEXT_PUBLIC_REPUTATION_REGISTRY as `0x${string}`

const identityRegistryABI = [
  {
    name: 'isRegistered',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'wallet', type: 'address' }],
    outputs: [{ type: 'bool' }],
  },
] as const

const reputationRegistryABI = [
  {
    name: 'addReputationEvent',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'subject', type: 'address' },
      { name: 'score', type: 'uint8' },
      { name: 'evidenceHash', type: 'bytes32' },
    ],
    outputs: [{ type: 'uint256' }],
  },
  {
    name: 'getReputationEvents',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'subject', type: 'address' }],
    outputs: [
      {
        type: 'tuple[]',
        components: [
          { name: 'scorer', type: 'address' },
          { name: 'score', type: 'uint8' },
          { name: 'evidenceHash', type: 'bytes32' },
          { name: 'timestamp', type: 'uint256' },
        ],
      },
    ],
  },
] as const

export async function checkIdentityRegistered(walletAddress: string): Promise<boolean> {
  if (!isAddress(walletAddress)) return false
  try {
    const result = await publicClient.readContract({
      address: IDENTITY_REGISTRY,
      abi: identityRegistryABI,
      functionName: 'isRegistered',
      args: [walletAddress as `0x${string}`],
    })
    return result as boolean
  } catch {
    return false
  }
}

export async function getReputationHistory(walletAddress: string): Promise<ReputationEvent[]> {
  if (!isAddress(walletAddress)) return []
  try {
    const results = await publicClient.readContract({
      address: REPUTATION_REGISTRY,
      abi: reputationRegistryABI,
      functionName: 'getReputationEvents',
      args: [walletAddress as `0x${string}`],
    })
    return (
      results as { scorer: string; score: number; evidenceHash: string; timestamp: bigint }[]
    ).map((r) => ({
      scorer: r.scorer,
      score: Number(r.score),
      evidenceHash: r.evidenceHash,
      timestamp: Number(r.timestamp),
    }))
  } catch {
    return []
  }
}

export async function writeReputationEvent(
  walletAddress: string,
  score: number,
  breakdown: ScoreBreakdown
): Promise<string> {
  const evidenceHash = keccak256(
    toHex(JSON.stringify({ score, breakdown, timestamp: Date.now() }))
  )

  const walletClient = getAgentWalletClient()

  const txHash = await walletClient.writeContract({
    address: REPUTATION_REGISTRY,
    abi: reputationRegistryABI,
    functionName: 'addReputationEvent',
    args: [walletAddress as `0x${string}`, score, evidenceHash],
  })

  return txHash
}
