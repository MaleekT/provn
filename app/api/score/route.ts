import { NextRequest, NextResponse } from 'next/server'
import { isAddress } from 'viem'
import { getWalletHistory } from '@/lib/envio'
import { checkIdentityRegistered, writeReputationEvent } from '@/lib/erc8004'
import { computeProvnScore } from '@/lib/scorer'
import { generateScoreExplanation } from '@/lib/claude'
import { createScoringJob, submitDeliverable, completeJob } from '@/lib/erc8183'
import type { ProvnScoreResponse } from '@/lib/types'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const body = (await req.json()) as unknown

    if (typeof body !== 'object' || body === null) {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
    }

    const { wallet } = body as Record<string, unknown>

    if (typeof wallet !== 'string' || !isAddress(wallet)) {
      return NextResponse.json({ error: 'Invalid wallet address' }, { status: 400 })
    }

    // 1. Fetch on-chain history via ArcScan + viem getLogs
    const walletData = await getWalletHistory(wallet)

    // 2. Check ERC-8004 identity registration
    walletData.isRegistered = await checkIdentityRegistered(wallet)

    // 3. Compute score
    const score = computeProvnScore(walletData)

    // 4. Write reputation event to ERC-8004 registry (agent signs via viem)
    const reputationTxHash = await writeReputationEvent(wallet, score.total, score.breakdown)

    // 5. Generate score explanation (local, no external API)
    const { explanation, suggestions } = await generateScoreExplanation(wallet, score)

    // 6. Create ERC-8183 scoring job, submit deliverable, complete job
    // Non-fatal: agent wallet needs testnet USDC + approval to fund the job escrow
    let jobTxHash = ''
    try {
      const { jobId, txHash: createTxHash } = await createScoringJob(wallet)
      void createTxHash
      await submitDeliverable(jobId, score, wallet)
      jobTxHash = await completeJob(jobId)
    } catch (jobErr: unknown) {
      console.error('[/api/score] ERC-8183 job flow failed (non-fatal):', jobErr)
    }

    const response: ProvnScoreResponse = {
      wallet,
      score,
      explanation,
      suggestions,
      reputationTxHash,
      jobTxHash,
      timestamp: Math.floor(Date.now() / 1000),
    }

    return NextResponse.json(response)
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error'
    console.error('[/api/score]', err)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
