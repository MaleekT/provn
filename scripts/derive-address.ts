import { privateKeyToAccount } from 'viem/accounts'

const pk = process.argv[2] as `0x${string}`
if (!pk) { console.error('Usage: npx tsx scripts/derive-address.ts <privateKey>'); process.exit(1) }
const account = privateKeyToAccount(pk)
console.log('AGENT_WALLET_ADDRESS=' + account.address)
