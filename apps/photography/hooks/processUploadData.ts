import type { CollectionAfterChangeHook } from "payload";
import sharp from "sharp";
import exifr from "exifr";

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

  const buffer = await resolveImageBuffer(req.file, doc.url);
  if (!buffer) return doc;
  const updates: Record<string, unknown> = {};

  // 1. Generate LQIP
  try {
    const blurBuffer = await sharp(buffer)
      .resize(10, 10, { fit: "inside" })
      .webp({ quality: 20 })
      .toBuffer();

    updates.lqip = `data:image/webp;base64,${blurBuffer.toString("base64")}`;
  } catch (e) {
    req.payload.logger.error(`Failed to generate LQIP: ${e}`);
  }

  // 2. Extract EXIF data
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
    req.payload.logger.error(`Failed to extract EXIF data: ${e}`);
  }

  // 2b. Extract GPS coordinates
  try {
    const gps = await exifr.gps(buffer);
    if (gps?.latitude != null && gps?.longitude != null) {
      updates.geolocation = {
        latitude: gps.latitude,
        longitude: gps.longitude,
      };
    }
  } catch (e) {
    req.payload.logger.error(`Failed to extract GPS data: ${e}`);
  }

  // 3. Auto-match camera
  if (!doc.camera && parsedModel) {
    try {
      const { docs } = await req.payload.find({
        collection: "cameras",
        where: { name: { contains: parsedModel } },
        limit: 1,
        depth: 0,
      });
      if (docs.length > 0) {
        updates.camera = docs[0].id;
      }
    } catch (e) {
      req.payload.logger.error(`Failed to auto-match camera: ${e}`);
    }
  }

  // 4. Auto-match lens
  if (!doc.lens && parsedLensModel) {
    try {
      const { docs } = await req.payload.find({
        collection: "lenses",
        where: { name: { contains: parsedLensModel } },
        limit: 1,
        depth: 0,
      });
      if (docs.length > 0) {
        updates.lens = docs[0].id;
      }
    } catch (e) {
      req.payload.logger.error(`Failed to auto-match lens: ${e}`);
    }
  }

  // 5. Persist all extracted metadata in a single update.
  // IMPORTANT: Do NOT pass `req` here — the original req still carries
  // req.file which would cause Payload to re-run generateFileData
  // (re-processing image sizes and triggering cascading cloud-storage uploads).
  if (Object.keys(updates).length > 0) {
    await req.payload.update({
      collection: "photos",
      id: doc.id,
      data: updates,
      context: { ...context, skipProcessUpload: true },
    });
  }

  return doc;
};
