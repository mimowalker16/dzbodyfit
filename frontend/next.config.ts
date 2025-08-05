import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  trailingSlash: false,
  poweredByHeader: false,
  experimental: {
    optimizePackageImports: ['lucide-react']
  }
};

export default nextConfig;
