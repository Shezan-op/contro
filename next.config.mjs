/** @type {import('next').NextConfig} */
import withSerwistInit from "@serwist/next";

const withSerwist = withSerwistInit({
  swSrc: "src/app/sw.ts",
  swDest: "public/sw.js",
  disable: process.env.NODE_ENV === "development",
});

const nextConfig = {
  reactStrictMode: true,
  turbopack: {}, // Can cause issues with Serwist depending on version
  // Ensure webpack handles native modules correctly if needed
  webpack: (config) => {
    config.externals = [...config.externals, { canvas: 'canvas' }]; // often needed for PDF export later
    return config;
  },
};

export default withSerwist(nextConfig);
