import { withPayload } from "@payloadcms/next/withPayload";

/** @type {import('next').NextConfig} */
const nextConfig = {
  basePath: "/photography",
  allowedDevOrigins: ["localhost:3024"],
  experimental: {
    viewTransition: true,
    serverActions: {
      allowedOrigins: ["localhost:3024"],
    },
  },
};

export default withPayload(nextConfig);
