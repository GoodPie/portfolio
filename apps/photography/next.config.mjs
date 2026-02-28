/** @type {import('next').NextConfig} */
const nextConfig = {
  basePath: "/photography",
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.sanity.io",
      },
    ],
  },
};

export default nextConfig;
