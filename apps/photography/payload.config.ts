import { postgresAdapter } from "@payloadcms/db-postgres";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import { vercelBlobStorage } from "@payloadcms/storage-vercel-blob";
import { buildConfig } from "payload";
import sharp from "sharp";
import type { SharpDependency } from "payload";

import { Birds } from "@/collections/Birds";
import { Cameras } from "@/collections/Cameras";
import { Categories } from "@/collections/Categories";
import { Lenses } from "@/collections/Lenses";
import { Photos } from "@/collections/Photos";
import { Users } from "@/collections/Users";
import { SiteSettings } from "@/globals/SiteSettings";

const payloadSecret = process.env.PAYLOAD_SECRET;
if (!payloadSecret) {
  throw new Error(
    "PAYLOAD_SECRET environment variable is required. Set it to a random string of at least 32 characters.",
  );
}

export default buildConfig({
  serverURL: process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:3024/photography",
  cors: ["http://localhost:3024", process.env.NEXT_PUBLIC_SERVER_URL].filter(Boolean) as string[],
  csrf: ["http://localhost:3024", process.env.NEXT_PUBLIC_SERVER_URL].filter(Boolean) as string[],
  collections: [Users, Photos, Categories, Birds, Cameras, Lenses],
  globals: [SiteSettings],
  editor: lexicalEditor(),
  secret: payloadSecret,
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
    meta: {
      titleSuffix: " — Photography CMS",
    },
    components: {
      graphics: {
        Logo: "/components/admin/Logo",
        Icon: "/components/admin/Icon",
      },
    },
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
