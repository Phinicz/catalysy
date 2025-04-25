/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
      {
        protocol: "http",
        hostname: "**",
      },
    ],
  },
  serverRuntimeConfig: {
    snagsolutionsApiKey: process.env.SNAGSOLUTIONS_API_KEY,
  },
  async rewrites() {
    return [
      {
        source: "/api/snag/:path*",
        destination: "https://admin.snagsolutions.io/api/:path*",
      },
    ];
  },
};

module.exports = nextConfig;
