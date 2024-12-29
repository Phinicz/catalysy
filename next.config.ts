/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      "lh3.googleusercontent.com", // For Google profile pictures
      `${process.env.NEXT_PUBLIC_SUPABASE_URL?.split("//")[1]}`, // For Supabase storage
    ],
  },
};

module.exports = nextConfig;
