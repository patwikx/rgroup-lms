/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
        {
          protocol: 'https',
          hostname: 'uploadthing.com',
        },
        {
          protocol: 'https',
          hostname: 'utfs.io',
        },
        {
          protocol: 'https',
          hostname: 'img.clerk.com',
        },
        {
          protocol: 'https',
          hostname: 'subdomain',
        },
        {
          protocol: 'https',
          hostname: 'files.stripe.com',
        },
        {
          protocol: 'https',
          hostname: '4b9moeer4y.ufs.sh',
        },
        ],
      },
        reactStrictMode: false,
}

module.exports = nextConfig
