import * as Sentry from "@sentry/nextjs";
import { postgresAdapter } from "@payloadcms/db-postgres";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import { vercelBlobStorage } from "@payloadcms/storage-vercel-blob";
import { buildConfig } from "payload";
import sharp from "sharp";
import type { SharpDependency } from "payload";

import { scorePhoto } from "@/lib/score-photo";
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

// Extract scheme+host only — browsers send Origin without a path, so the csrf/cors
// arrays must not include the /photography basePath or the exact match will fail.
const productionOrigin = process.env.NEXT_PUBLIC_SERVER_URL
  ? new URL(process.env.NEXT_PUBLIC_SERVER_URL).origin
  : null;

export default buildConfig({
  serverURL: process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:3024/photography",
  cors: ["http://localhost:3024", productionOrigin].filter(Boolean) as string[],
  csrf: ["http://localhost:3024", productionOrigin].filter(Boolean) as string[],
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
  jobs: {
    tasks: [
      {
        slug: "scorePhoto",
        retries: 2,
        inputSchema: [{ name: "photoId", type: "number", required: true }],
        handler: async ({ input, req }) => {
          try {
            const photo = await req.payload.findByID({
              collection: "photos",
              id: input.photoId as number,
              depth: 0,
            });

            if (!photo) {
              throw new Error(`Photo ${input.photoId} not found`);
            }

            const sizes = photo.sizes as Record<string, { url?: string }> | undefined;
            const imageUrl =
              sizes?.large?.url || sizes?.xl?.url || (photo.url as string | undefined);

            if (!imageUrl) {
              throw new Error(`Photo ${input.photoId} has no image URL available`);
            }

            const exif = photo.exif as {
              focalLength?: number | null;
              aperture?: number | null;
              shutterSpeed?: number | null;
              iso?: number | null;
            } | null;

            const scores = await scorePhoto(imageUrl, exif);

            await req.payload.update({
              collection: "photos",
              id: input.photoId as number,
              data: { qualityScores: scores },
              context: { skipProcessUpload: true },
            });

            req.payload.logger.info(`Photo ${input.photoId} scored: overall=${scores.overall}`);

            return {
              output: {
                photoId: input.photoId,
                overall: scores.overall,
              },
            };
          } catch (e) {
            Sentry.captureException(e, {
              tags: { section: "photo-scoring" },
              extra: { photoId: input.photoId },
            });
            throw e;
          }
        },
      },
    ],
    access: {
      run: ({ req }) => {
        // Allow authenticated admin users
        if (req.user) return true;
        // Allow Vercel Cron requests with CRON_SECRET
        const authHeader = req.headers.get("authorization");
        const cronSecret = process.env.CRON_SECRET;
        if (cronSecret && authHeader === `Bearer ${cronSecret}`) return true;
        return false;
      },
    },
  },
  sharp: sharp as unknown as SharpDependency,
  typescript: {
    outputFile: "payload-types.ts",
  },
});
