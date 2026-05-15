import Anthropic from '@anthropic-ai/sdk'
import type { ScoreResult } from './types'
import { getScoreTier } from './scorer'

function getClient(): Anthropic {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) throw new Error('ANTHROPIC_API_KEY is not set')
  return new Anthropic({ apiKey })
}

export interface ScoreExplanation {
  explanation: string
  suggestions: string[]
}

export async function generateScoreExplanation(
  wallet: string,
  score: ScoreResult
): Promise<ScoreExplanation> {
  const client = getClient()
  const tier = getScoreTier(score.total)

  const message = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1024,
    messages: [
      {
        role: 'user',
        content: `You are analysing an on-chain reputation score for wallet ${wallet} on Arc testnet.

Score: ${score.total}/100 — Tier: ${tier}
Breakdown:
- Wallet Age: ${score.breakdown.walletAge}/15
- Transaction Volume: ${score.breakdown.txVolume}/15
- Protocol Diversity: ${score.breakdown.diversity}/15
- Job Completion Rate: ${score.breakdown.jobCompletion}/20
- Loan Repayment: ${score.breakdown.loanRepayment}/15
- ERC-8004 Registration: ${score.breakdown.identity}/10
- Transaction Success Rate: ${score.breakdown.successRate}/10

Return ONLY valid JSON with this exact structure:
{
  "explanation": "2-3 sentence plain English summary of the score",
  "suggestions": ["specific action 1", "specific action 2", "specific action 3"]
}`,
      },
    ],
  })

  const raw = message.content[0]
  if (raw.type !== 'text') throw new Error('Unexpected Claude response type')

  const jsonMatch = raw.text.match(/\{[\s\S]*\}/)
  if (!jsonMatch) throw new Error('Claude response did not contain valid JSON')

  const parsed = JSON.parse(jsonMatch[0]) as unknown

  if (
    typeof parsed !== 'object' ||
    parsed === null ||
    typeof (parsed as Record<string, unknown>).explanation !== 'string' ||
    !Array.isArray((parsed as Record<string, unknown>).suggestions)
  ) {
    throw new Error('Claude response had unexpected shape')
  }

  const result = parsed as { explanation: string; suggestions: unknown[] }

  return {
    explanation: result.explanation,
    suggestions: result.suggestions.slice(0, 3).map((s) => String(s)),
  }
}
