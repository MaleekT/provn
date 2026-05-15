import { createPublicClient, http, defineChain } from 'viem'

export const arcTestnet = defineChain({
  id: 5042002,
  name: 'Arc Testnet',
  nativeCurrency: { name: 'ARC', symbol: 'ARC', decimals: 18 },
  rpcUrls: {
    default: { http: [process.env.NEXT_PUBLIC_ARC_RPC_URL ?? 'https://rpc.testnet.arc.network'] },
  },
  blockExplorers: {
    default: { name: 'ArcScan', url: 'https://testnet.arcscan.app' },
  },
  testnet: true,
})

export const publicClient = createPublicClient({
  chain: arcTestnet,
  transport: http(process.env.NEXT_PUBLIC_ARC_RPC_URL ?? 'https://rpc.testnet.arc.network'),
})

export const EXPLORER_URL = 'https://testnet.arcscan.app'

export function explorerTxUrl(hash: string): string {
  return `${EXPLORER_URL}/tx/${hash}`
}
