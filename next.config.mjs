/** @type {import('next').NextConfig} */
import withPWAInit from 'next-pwa';

const withPWA = withPWAInit({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  register: true,
  skipWaiting: true,
});

const nextConfig = {
  reactStrictMode: true,
  turbopack: {},
  // Ensure webpack handles native modules correctly if needed
  webpack: (config) => {
    config.externals = [...config.externals, { canvas: 'canvas' }]; // often needed for PDF export later
    return config;
  },
};

export default withPWA(nextConfig);
