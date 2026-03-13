/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'api.ownerrez.com',
      },
      {
        protocol: 'https',
        hostname: 'uc.orez.io',
      },
    ],
  },
}

module.exports = nextConfig
