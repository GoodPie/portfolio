import * as Sentry from "@sentry/nextjs";
import { put } from "@vercel/blob";
import exifr from "exifr";
import sharp from "sharp";
import type { CollectionAfterChangeHook, Payload } from "payload";

/** Image size definitions — must match Photos.ts imageSizes config. */
const IMAGE_SIZES = [
  { name: "thumbnail", width: 400 },
  { name: "card", width: 800 },
  { name: "large", width: 1200 },
  { name: "xl", width: 1800 },
  { name: "full", width: 2400 },
] as const;

/**
 * Resolve the image buffer from either the request file (server uploads)
 * or by downloading from the blob URL (client uploads via Vercel Blob).
 */
async function resolveImageBuffer(
  reqFile: { data: Buffer } | undefined | null,
  docUrl: string | undefined | null,
): Promise<Buffer | null> {
  // Server-side upload — file buffer is on the request
  if (reqFile?.data) {
    const d = reqFile.data;
    return Buffer.isBuffer(d) ? d : Buffer.from(d);
  }

  // Client upload (Vercel Blob) — download from the stored URL
  if (docUrl) {
    const res = await fetch(docUrl);
    if (res.ok) {
      return Buffer.from(await res.arrayBuffer());
    }
  }

  return null;
}

/**
 * Background worker that does all the heavy lifting:
 * download original, generate LQIP + sizes, extract EXIF, auto-match gear.
 * Runs detached from the request so it won't hit Supabase statement timeouts.
 */
async function processInBackground(
  payload: Payload,
  docId: string | number,
  doc: Record<string, unknown>,
  fileData: { data: Buffer } | undefined | null,
) {
  const buffer = await resolveImageBuffer(fileData, doc.url as string);
  if (!buffer) return;

  const updates: Record<string, unknown> = {};

  // 1. Generate LQIP
  try {
    const blurBuffer = await sharp(buffer)
      .resize(10, 10, { fit: "inside" })
      .webp({ quality: 20 })
      .toBuffer();

    updates.lqip = `data:image/webp;base64,${blurBuffer.toString("base64")}`;
  } catch (e) {
    payload.logger.error(`Failed to generate LQIP: ${e}`);
  }

  // 2. Generate image size variants and upload to Vercel Blob
  const blobToken = process.env.BLOB_READ_WRITE_TOKEN;
  const filename = doc.filename as string | undefined;
  if (blobToken && filename) {
    try {
      const metadata = await sharp(buffer).metadata();
      const origWidth = metadata.width ?? 0;
      const origHeight = metadata.height ?? 0;

      if (origWidth > 0 && origHeight > 0) {
        const aspectRatio = origHeight / origWidth;
        const basename = filename.replace(/\.[^.]+$/, "");
        const ext = "webp";

        const sizeResults = await Promise.allSettled(
          IMAGE_SIZES.filter(({ width }) => width < origWidth).map(async ({ name, width }) => {
            const height = Math.round(width * aspectRatio);
            const resizedBuffer = await sharp(buffer)
              .resize(width, height, { fit: "inside" })
              .webp({ quality: 80 })
              .toBuffer();

            const sizeFilename = `${basename}-${width}x${height}.${ext}`;
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

        const sizes: Record<string, unknown> = {};
        for (const result of sizeResults) {
          if (result.status === "fulfilled") {
            const { name, ...sizeData } = result.value;
            sizes[name] = sizeData;
            payload.logger.info(`Generated size "${name}": ${sizeData.width}x${sizeData.height}`);
          } else {
            payload.logger.error(`Failed to generate image size: ${result.reason}`);
          }
        }

        if (Object.keys(sizes).length > 0) {
          updates.sizes = sizes;
          if (sizes.thumbnail) {
            updates.thumbnailURL = (sizes.thumbnail as { url: string }).url;
          }
        }
      }
    } catch (e) {
      payload.logger.error(`Failed to generate image sizes: ${e}`);
    }
  }

  // 3. Extract EXIF data
  let parsedModel: string | undefined;
  let parsedLensModel: string | undefined;

  try {
    const parsed = await exifr.parse(buffer, {
      pick: [
        "FocalLength",
        "FNumber",
        "ExposureTime",
        "ISO",
        "LensModel",
        "Model",
        "DateTimeOriginal",
      ],
    });

    if (parsed) {
      const exif: Record<string, unknown> = {};
      if (parsed.FocalLength) exif.focalLength = parsed.FocalLength;
      if (parsed.FNumber) exif.aperture = parsed.FNumber;
      if (parsed.ExposureTime) exif.shutterSpeed = parsed.ExposureTime;
      if (parsed.ISO) exif.iso = parsed.ISO;
      if (parsed.LensModel) {
        exif.lensModel = parsed.LensModel;
        parsedLensModel = parsed.LensModel;
      }
      if (parsed.Model) {
        exif.cameraModel = parsed.Model;
        parsedModel = parsed.Model;
      }

      if (Object.keys(exif).length > 0) {
        updates.exif = exif;
      }

      // Auto-fill dateTaken from EXIF if not already set
      if (!doc.dateTaken && parsed.DateTimeOriginal) {
        updates.dateTaken = new Date(parsed.DateTimeOriginal).toISOString();
      }
    }
  } catch (e) {
    payload.logger.error(`Failed to extract EXIF data: ${e}`);
  }

  // 3b. Extract GPS coordinates
  try {
    const gps = await exifr.gps(buffer);
    if (
      gps?.latitude !== null &&
      gps?.latitude !== undefined &&
      gps?.longitude !== null &&
      gps?.longitude !== undefined
    ) {
      updates.geolocation = {
        latitude: gps.latitude,
        longitude: gps.longitude,
      };
    }
  } catch (e) {
    payload.logger.error(`Failed to extract GPS data: ${e}`);
  }

  // 4. Auto-match camera
  if (!doc.camera && parsedModel) {
    try {
      const { docs } = await payload.find({
        collection: "cameras",
        where: { name: { contains: parsedModel } },
        limit: 1,
        depth: 0,
      });
      if (docs.length > 0) {
        updates.camera = docs[0].id;
      }
    } catch (e) {
      payload.logger.error(`Failed to auto-match camera: ${e}`);
    }
  }

  // 5. Auto-match lens
  if (!doc.lens && parsedLensModel) {
    try {
      const { docs } = await payload.find({
        collection: "lenses",
        where: { name: { contains: parsedLensModel } },
        limit: 1,
        depth: 0,
      });
      if (docs.length > 0) {
        updates.lens = docs[0].id;
      }
    } catch (e) {
      payload.logger.error(`Failed to auto-match lens: ${e}`);
    }
  }

  // 6. Persist all extracted metadata in a single update.
  if (Object.keys(updates).length > 0) {
    try {
      await payload.update({
        collection: "photos",
        id: docId,
        data: updates,
        context: { skipProcessUpload: true },
      });
      payload.logger.info(`Photo ${docId}: background processing complete`);
    } catch (e) {
      Sentry.captureException(e, {
        tags: { section: "photo-upload" },
        extra: { photoId: docId, updates: Object.keys(updates) },
      });
      payload.logger.error(`Failed to persist upload data for photo ${docId}: ${e}`);
    }
  }

  // 7. Queue AI quality scoring job (runs async via Payload Jobs)
  try {
    await payload.jobs.queue({
      task: "scorePhoto",
      input: { photoId: Number(docId) },
    });
    payload.logger.info(`Photo ${docId}: scoring job queued`);
  } catch (e) {
    payload.logger.error(`Failed to queue scoring job for photo ${docId}: ${e}`);
  }
}

export const processUploadData: CollectionAfterChangeHook = async ({
  doc,
  req,
  operation,
  context,
}) => {
  // Prevent infinite loop — this hook calls payload.update which triggers afterChange again
  if (context.skipProcessUpload) return doc;

  // Skip metadata-only updates (no new file uploaded).
  // With client uploads req.file is absent even for new uploads, so also
  // check whether we've already processed this doc (lqip exists).
  if (operation === "update" && !req.file && doc.lqip) return doc;

  // Capture references we need, then schedule processing in the background
  // so the original request returns immediately (avoids Supabase statement timeout).
  const payload = req.payload;
  const fileData = req.file as { data: Buffer } | undefined | null;

  // Fire-and-forget — detach from request lifecycle
  processInBackground(payload, doc.id, doc, fileData).catch((err) => {
    Sentry.captureException(err, {
      tags: { section: "photo-upload" },
      extra: { photoId: doc.id },
    });
    payload.logger.error(`Background upload processing failed: ${err}`);
  });

  return doc;
};
