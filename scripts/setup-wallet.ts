import { readFileSync } from 'fs'
import { resolve } from 'path'

// Load .env.local since tsx doesn't auto-load it like Next.js
try {
  const envPath = resolve(process.cwd(), '.env.local')
  const lines = readFileSync(envPath, 'utf-8').split('\n')
  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eqIdx = trimmed.indexOf('=')
    if (eqIdx === -1) continue
    const key = trimmed.slice(0, eqIdx).trim()
    const value = trimmed.slice(eqIdx + 1).trim()
    if (key && !(key in process.env)) process.env[key] = value
  }
} catch { /* .env.local not found — rely on existing env */ }

import { getCircleClient } from '../lib/circle'
import { Blockchain } from '@circle-fin/developer-controlled-wallets'

async function main() {
  const client = getCircleClient()

  console.log('Creating Provn wallet set...')
  const setResponse = await client.createWalletSet({ name: 'Provn Agent' })
  const walletSetId = setResponse.data?.walletSet?.id

  if (!walletSetId) {
    console.error('Failed to create wallet set — check your Circle API key and entity secret')
    process.exit(1)
  }

  console.log(`Wallet set created: ${walletSetId}`)
  console.log('Creating agent wallet on ARC-TESTNET...')

  const walletResponse = await client.createWallets({
    walletSetId,
    blockchains: [Blockchain.ArcTestnet],
    count: 1,
  })

  const wallet = walletResponse.data?.wallets?.[0]

  if (!wallet) {
    console.error('Failed to create wallet')
    process.exit(1)
  }

  console.log('\nWallet created. Add these to your .env.local:\n')
  console.log(`AGENT_WALLET_ID=${wallet.id}`)
  console.log(`AGENT_WALLET_ADDRESS=${wallet.address}`)
  console.log('\nThen fund it at https://faucet.circle.com (select Arc Testnet — get USDC)')
}

main().catch((err: unknown) => {
  console.error(err)
  process.exit(1)
})
