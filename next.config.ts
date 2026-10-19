import type { NextConfig } from 'next';

const config: NextConfig = {
  poweredByHeader: false,
  productionBrowserSourceMaps: false,
  reactStrictMode: true,
  compress: true,
  experimental: {
    optimizePackageImports: ['lucide-react', 'radix-ui'],
  },
};

export default config;
