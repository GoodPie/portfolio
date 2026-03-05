import { withPayload } from "@payloadcms/next/withPayload";

/** @type {import('next').NextConfig} */
const nextConfig = {
  basePath: "/photography",
  allowedDevOrigins: ["localhost:3024"],
  experimental: {
    viewTransition: true,
    serverActions: {
      allowedOrigins: [
        "localhost:3024",
        ...(process.env.NEXT_PUBLIC_SERVER_URL
          ? [new URL(process.env.NEXT_PUBLIC_SERVER_URL).host]
          : []),
      ],
    },
  },
};

export default withPayload(nextConfig);
