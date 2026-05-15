/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    // Privy optionally imports Farcaster packages we don't use — stub them out
    config.resolve.alias['@farcaster/mini-app-solana'] = false
    config.resolve.alias['@farcaster/frame-sdk'] = false
    return config
  },
}

export default nextConfig
