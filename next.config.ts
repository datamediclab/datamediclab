import type { Configuration } from 'webpack';
import type { NextConfig } from 'next';

const configureWebpack = (config: Configuration): Configuration => {
  config.module?.rules?.push({
    test: /\.svg$/,
    use: ['@svgr/webpack'],
  });
  return config;
};

const nextConfig: NextConfig = {
  webpack: configureWebpack,
};

export default nextConfig;
