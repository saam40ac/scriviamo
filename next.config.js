/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true,
    domains: ['okkhdmyiqmmmnbbrpbzx.supabase.co'],
  },
  // Per hosting tradizionale (Ergonet)
  assetPrefix: process.env.NODE_ENV === 'production' ? '' : '',
}

module.exports = nextConfig
