import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ['localhost'],
    unoptimized: false,
  },
  compress: true,
  poweredByHeader: false,
  generateEtags: false,
  trailingSlash: false,
};

export default nextConfig;
