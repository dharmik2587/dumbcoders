import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'avatars.githubusercontent.com' },
      { protocol: 'https', hostname: 'github.com' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
    ],
    // Enable modern image formats
    formats: ['image/avif', 'image/webp'],
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Compress responses
  compress: true,
  poweredByHeader: false,
  webpack: (config) => {
    config.resolve.alias['@'] = path.resolve(__dirname, 'src');
    return config;
  },
  async redirects() {
    return [
      {
        source: '/dashboard',
        destination: '/discover',
        permanent: true,
      },
    ];
  },
  async headers() {
    return [
      {
        // Cache static assets (JS/CSS/fonts/images) for 1 year
        source: '/_next/static/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
      {
        // Keepalive response cache — short TTL
        source: '/api/keepalive',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=30, stale-while-revalidate=60' },
        ],
      },
      {
        // API routes: no cache by default
        source: '/api/:path*',
        headers: [
          { key: 'Cache-Control', value: 'no-store, max-age=0' },
        ],
      },
    ];
  },
};

export default nextConfig;
