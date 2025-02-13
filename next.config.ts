/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      "lh3.googleusercontent.com",
      process.env.NEXT_PUBLIC_SUPABASE_URL
        ? process.env.NEXT_PUBLIC_SUPABASE_URL.split("//")[1]
        : "",
    ].filter(Boolean),
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
