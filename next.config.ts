import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  /* config options here */
  outputFileTracingRoot: path.join(__dirname, "."),
  compress: true,
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
    ],
    minimumCacheTTL: 2592000,
  },

  async redirects() {
    return [
      {
        source: "/:path*",
        destination: "https://www.futuremilestone.shop/:path*",
        permanent: true,
      },
    ];
  },



};

export default nextConfig;

