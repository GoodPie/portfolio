/**
 * One-time migration script: convert existing JPEG size variants to WebP.
 *
 * Usage:
 *   npx tsx apps/photography/scripts/migrate-webp.ts
 *
 * Requires BLOB_READ_WRITE_TOKEN and DATABASE_URL environment variables.
 */

import { list, put } from "@vercel/blob";
import { getPayload } from "payload";
import sharp from "sharp";

const IMAGE_SIZES = [
  { name: "thumbnail", width: 400 },
  { name: "card", width: 800 },
  { name: "large", width: 1200 },
  { name: "xl", width: 1800 },
  { name: "full", width: 2400 },
] as const;

async function main() {
  const blobToken = process.env.BLOB_READ_WRITE_TOKEN;
  if (!blobToken) {
    console.error("Missing BLOB_READ_WRITE_TOKEN");
    process.exit(1);
  }

  // Dynamic import of the Payload config (handles path aliases, etc.)
  const configModule = await import("../payload.config");
  const config = configModule.default;

  const payload = await getPayload({ config });

  // Fetch all photos (minimal fields)
  const { docs: photos } = await payload.find({
    collection: "photos",
    depth: 0,
    pagination: false,
    select: {
      url: true,
      filename: true,
      width: true,
      height: true,
      sizes: true,
    },
  });

  // Build a lookup map of all blobs in Vercel Blob storage (filename → URL).
  // This lets us find the actual blob URL for each photo regardless of what's stored in the DB.
  console.log("Building Vercel Blob index...");
  const blobIndex = new Map<string, string>();
  let cursor: string | undefined;
  do {
    const result = await list({ token: blobToken, cursor, limit: 1000 });
    for (const blob of result.blobs) {
      // Extract just the filename (last path segment)
      const name = blob.pathname.split("/").pop() ?? blob.pathname;
      blobIndex.set(name, blob.url);
    }
    cursor = result.hasMore ? result.cursor : undefined;
  } while (cursor);
  console.log(`Indexed ${blobIndex.size} blobs`);

  console.log(`Found ${photos.length} photos to process`);

  let processed = 0;
  let skipped = 0;

  for (const photo of photos) {
    const filename = photo.filename as string | undefined;

    if (!filename) {
      console.log(`Skipping photo ${photo.id}: no filename`);
      skipped++;
      continue;
    }

    // Check if already migrated (sizes already have .webp)
    const sizes = photo.sizes as
      | Record<string, { url?: string; filename?: string; width?: number }>
      | undefined;
    const alreadyWebp = sizes && Object.values(sizes).some((s) => s?.filename?.endsWith(".webp"));
    if (alreadyWebp) {
      console.log(`Skipping photo ${photo.id}: already WebP`);
      skipped++;
      continue;
    }

    // Find the original file in Vercel Blob by filename
    const sourceUrl = blobIndex.get(filename);
    if (!sourceUrl) {
      console.log(`Skipping photo ${photo.id}: "${filename}" not found in blob store`);
      skipped++;
      continue;
    }

    try {
      // Download from Vercel Blob
      console.log(`Fetching: ${sourceUrl}`);
      const res = await fetch(sourceUrl).catch((err: Error) => {
        console.error(`Fetch error for photo ${photo.id}: ${err.message}\n${err.cause ?? ""}`);
        return null;
      });
      if (!res || !res.ok) {
        if (res) console.error(`Failed to download photo ${photo.id}: ${res.status}`);
        skipped++;
        continue;
      }
      const buffer = Buffer.from(await res.arrayBuffer());

      const metadata = await sharp(buffer).metadata();
      const origWidth = metadata.width ?? 0;
      const origHeight = metadata.height ?? 0;

      if (origWidth === 0 || origHeight === 0) {
        console.error(`Photo ${photo.id}: could not determine dimensions`);
        skipped++;
        continue;
      }

      const aspectRatio = origHeight / origWidth;
      const basename = filename.replace(/\.[^.]+$/, "");

      const sizeResults = await Promise.allSettled(
        IMAGE_SIZES.filter(({ width }) => width < origWidth).map(async ({ name, width }) => {
          const height = Math.round(width * aspectRatio);
          const resizedBuffer = await sharp(buffer)
            .resize(width, height, { fit: "inside" })
            .webp({ quality: 80 })
            .toBuffer();

          const sizeFilename = `${basename}-${width}x${height}.webp`;
          const blob = await put(sizeFilename, resizedBuffer, {
            access: "public",
            token: blobToken,
            addRandomSuffix: false,
            contentType: "image/webp",
          });

          return {
            name,
            url: blob.url,
            filename: sizeFilename,
            width,
            height,
            filesize: resizedBuffer.length,
            mimeType: "image/webp" as const,
          };
        }),
      );

      const newSizes: Record<string, unknown> = {};
      for (const result of sizeResults) {
        if (result.status === "fulfilled") {
          const { name, ...sizeData } = result.value;
          newSizes[name] = sizeData;
        } else {
          console.error(`Photo ${photo.id}: failed size variant: ${result.reason}`);
        }
      }

      if (Object.keys(newSizes).length > 0) {
        await payload.update({
          collection: "photos",
          id: photo.id,
          data: { sizes: newSizes },
          context: { skipProcessUpload: true },
        });
      }

      processed++;
      console.log(`Processed ${processed}/${photos.length - skipped} photos (photo ${photo.id})`);
    } catch (err) {
      console.error(`Photo ${photo.id}: error — ${err}`);
    }
  }

  console.log(`\nDone! Processed: ${processed}, Skipped: ${skipped}, Total: ${photos.length}`);
  process.exit(0);
}

main();
