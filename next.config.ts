import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    // Allow builds to complete even with TypeScript errors
    ignoreBuildErrors: true,
  },
  eslint: {
    // Allow builds to complete even with ESLint errors
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
