import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
import { isAddress } from 'viem'
import { getReputationHistory } from '@/lib/erc8004'
import type { ReputationEvent } from '@/lib/types'

export async function GET(req: NextRequest): Promise<NextResponse> {
  try {
    const wallet = req.nextUrl.searchParams.get('wallet')

    if (!wallet || !isAddress(wallet)) {
      return NextResponse.json({ error: 'Invalid wallet address' }, { status: 400 })
    }

    const events: ReputationEvent[] = await getReputationHistory(wallet)

    return NextResponse.json({ wallet, events })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error'
    console.error('[/api/history]', err)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
