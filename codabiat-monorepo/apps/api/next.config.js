/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
  env: {
    MONGODB_URI: process.env.MONGODB_URI,
    JWT_SECRET: process.env.JWT_SECRET,
  },
  // Enable transpiling packages from monorepo
  transpilePackages: ['@codabiat/types', '@codabiat/database', '@codabiat/auth', '@codabiat/utils'],
};

module.exports = nextConfig;

