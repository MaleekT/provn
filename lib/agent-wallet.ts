import { createWalletClient, http } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { arcTestnet } from './arc'

function getAgentAccount() {
  const pk = process.env.AGENT_PRIVATE_KEY
  if (!pk) throw new Error('AGENT_PRIVATE_KEY is not set in .env.local')
  return privateKeyToAccount(pk as `0x${string}`)
}

export function getAgentWalletClient() {
  return createWalletClient({
    account: getAgentAccount(),
    chain: arcTestnet,
    transport: http(process.env.NEXT_PUBLIC_ARC_RPC_URL),
  })
}

export function getAgentAddress(): `0x${string}` {
  return getAgentAccount().address
}
