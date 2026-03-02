import { buildConfig } from "payload";
import { postgresAdapter } from "@payloadcms/db-postgres";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import { vercelBlobStorage } from "@payloadcms/storage-vercel-blob";
import type { SharpDependency } from "payload";
import sharp from "sharp";

import { Users } from "@/collections/Users";
import { Photos } from "@/collections/Photos";
import { Categories } from "@/collections/Categories";
import { Birds } from "@/collections/Birds";
import { Cameras } from "@/collections/Cameras";
import { Lenses } from "@/collections/Lenses";
import { SiteSettings } from "@/globals/SiteSettings";

export default buildConfig({
  serverURL: process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:3024/photography",
  cors: [
    "http://localhost:3024",
  ],
  csrf: [
    "http://localhost:3024",
  ],
  collections: [Users, Photos, Categories, Birds, Cameras, Lenses],
  globals: [SiteSettings],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || "CHANGE-ME-IN-PRODUCTION",
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URL || "",
      ssl: {
        rejectUnauthorized: false,
      },
    },
  }),
  plugins: [
    ...(process.env.BLOB_READ_WRITE_TOKEN
      ? [
          vercelBlobStorage({
            collections: {
              photos: true,
            },
            token: process.env.BLOB_READ_WRITE_TOKEN,
            clientUploads: true,
          }),
        ]
      : []),
  ],
  admin: {
    user: Users.slug,
  },
  routes: {
    admin: "/admin",
    api: "/api",
  },
  sharp: sharp as unknown as SharpDependency,
  typescript: {
    outputFile: "payload-types.ts",
  },
});
