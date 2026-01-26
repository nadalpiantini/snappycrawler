/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
  env: {
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || 'https://snappycrawler.com',
  },
  // Production optimizations
  images: {
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days
  },
  // Compress responses
  compress: true,
  // Power off x-powered-by header
  poweredByHeader: false,
  // Generate ETags for caching
  generateEtags: true,
}

module.exports = nextConfig
