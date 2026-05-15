import { initiateDeveloperControlledWalletsClient } from '@circle-fin/developer-controlled-wallets'

type CircleClient = ReturnType<typeof initiateDeveloperControlledWalletsClient>

let _client: CircleClient | null = null

export function getCircleClient(): CircleClient {
  if (_client) return _client

  const apiKey = process.env.CIRCLE_API_KEY
  const entitySecret = process.env.CIRCLE_ENTITY_SECRET

  if (!apiKey) throw new Error('CIRCLE_API_KEY is not set')
  if (!entitySecret) throw new Error('CIRCLE_ENTITY_SECRET is not set')

  _client = initiateDeveloperControlledWalletsClient({ apiKey, entitySecret })
  return _client
}

export function getAgentWalletId(): string {
  const id = process.env.AGENT_WALLET_ID
  if (!id) throw new Error('AGENT_WALLET_ID is not set — run scripts/setup-wallet.ts first')
  return id
}

export function getAgentWalletAddress(): string {
  const address = process.env.AGENT_WALLET_ADDRESS
  if (!address) throw new Error('AGENT_WALLET_ADDRESS is not set — run scripts/setup-wallet.ts first')
  return address
}
