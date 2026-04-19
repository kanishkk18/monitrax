/** @type {import('next').NextConfig} */
const nextConfig = {
   eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true, // Add this too if you want to skip the TS errors shown
  },
  transpilePackages: ["@changd/database", "@changd/shared"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "utfs.io",
      },
      {
        protocol: "https",
        hostname: "*.amazonaws.com",
      },
      {
        protocol: "https",
        hostname: "*.ufs.sh",
      },
    ],
  },
  serverExternalPackages: ["playwright", "ioredis", "bullmq", "sharp"],
};

module.exports = nextConfig;
