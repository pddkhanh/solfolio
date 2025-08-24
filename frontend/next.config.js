/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  // Enable build caching for faster rebuilds in CI
  experimental: {
    turbotrace: {
      logLevel: 'error',
    },
  },
  // Configure cache handler for CI environments
  cacheHandler: process.env.CI ? undefined : undefined,
  cacheMaxMemorySize: 0, // Disable in-memory caching in CI
}

module.exports = nextConfig