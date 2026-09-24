import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  devIndicators: false,
  distDir: process.env.IAMGAMER_TEST_OUTPUT || '.next',
};

export default nextConfig;
