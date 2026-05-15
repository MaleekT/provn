import { keccak256, toHex, encodeAbiParameters, parseAbiParameters } from 'viem'
import { publicClient } from './arc'
import { getAgentWalletClient, getAgentAddress } from './agent-wallet'
import type { ScoreResult } from './types'

const ERC8183_ADDRESS = process.env.NEXT_PUBLIC_ERC8183 as `0x${string}`
const USDC_ADDRESS = process.env.NEXT_PUBLIC_USDC as `0x${string}`
const JOB_AMOUNT = BigInt(100000) // 0.10 USDC (6 decimals)

export const erc8183ABI = [
  {
    name: 'createJob',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'provider', type: 'address' },
      { name: 'token', type: 'address' },
      { name: 'amount', type: 'uint256' },
      { name: 'metadata', type: 'bytes' },
    ],
    outputs: [{ name: 'jobId', type: 'uint256' }],
  },
  {
    name: 'submitDeliverable',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'jobId', type: 'uint256' },
      { name: 'deliverableHash', type: 'bytes32' },
    ],
    outputs: [],
  },
  {
    name: 'completeJob',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [{ name: 'jobId', type: 'uint256' }],
    outputs: [],
  },
  {
    name: 'getJob',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'jobId', type: 'uint256' }],
    outputs: [
      {
        type: 'tuple',
        components: [
          { name: 'client', type: 'address' },
          { name: 'provider', type: 'address' },
          { name: 'token', type: 'address' },
          { name: 'amount', type: 'uint256' },
          { name: 'status', type: 'uint8' },
        ],
      },
    ],
  },
] as const

export const usdcABI = [
  {
    name: 'approve',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'spender', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    outputs: [{ type: 'bool' }],
  },
] as const

function buildJobMetadata(clientAddress: string): `0x${string}` {
  return encodeAbiParameters(parseAbiParameters('address'), [clientAddress as `0x${string}`])
}

function computeDeliverableHash(score: ScoreResult, wallet: string): `0x${string}` {
  return keccak256(toHex(JSON.stringify({ score, wallet, timestamp: Date.now() })))
}

export async function createScoringJob(clientAddress: string): Promise<{ jobId: bigint; txHash: string }> {
  const walletClient = getAgentWalletClient()
  const agentAddress = getAgentAddress()
  const metadata = buildJobMetadata(clientAddress)
  const args = [agentAddress, USDC_ADDRESS, JOB_AMOUNT, metadata] as const

  // Simulate to get the returned jobId without waiting for mining
  const { result: jobId } = await publicClient.simulateContract({
    address: ERC8183_ADDRESS,
    abi: erc8183ABI,
    functionName: 'createJob',
    args,
    account: agentAddress,
  })

  const txHash = await walletClient.writeContract({
    address: ERC8183_ADDRESS,
    abi: erc8183ABI,
    functionName: 'createJob',
    args,
  })

  return { jobId: jobId as bigint, txHash }
}

export async function submitDeliverable(jobId: bigint, score: ScoreResult, wallet: string): Promise<string> {
  const deliverableHash = computeDeliverableHash(score, wallet)
  const walletClient = getAgentWalletClient()

  return walletClient.writeContract({
    address: ERC8183_ADDRESS,
    abi: erc8183ABI,
    functionName: 'submitDeliverable',
    args: [jobId, deliverableHash],
  })
}

export async function completeJob(jobId: bigint): Promise<string> {
  const walletClient = getAgentWalletClient()

  return walletClient.writeContract({
    address: ERC8183_ADDRESS,
    abi: erc8183ABI,
    functionName: 'completeJob',
    args: [jobId],
  })
}

export { ERC8183_ADDRESS, USDC_ADDRESS }
