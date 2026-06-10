import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      }
    ]
  },
  async rewrites() {
    return [
      {
        source: "/ingest/static/:path*",
        destination: "http://us-assets.i.posthog.com/static/:path*"
      },
      {
        source: "/ingest/:path*",
        destination: "http://us.i.posthog.com/:path*"
      },
    ];
  },
  skipTrailingSlashRedirect: true,
};

export default nextConfig;
