import type { CollectionAfterChangeHook } from "payload";
import sharp from "sharp";
import exifr from "exifr";

export const processUploadData: CollectionAfterChangeHook = async ({
  doc,
  req,
  operation,
  context,
}) => {
  // Prevent infinite loop — this hook calls payload.update which triggers afterChange again
  if (context.skipProcessUpload) return doc;

  // Only process when a new file is uploaded
  if (operation === "update" && !req.file) return doc;

  const fileData = req.file?.data;
  if (!fileData) return doc;

  const buffer = Buffer.isBuffer(fileData) ? fileData : Buffer.from(fileData);
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

  // 5. Persist all extracted metadata in a single update
  if (Object.keys(updates).length > 0) {
    await req.payload.update({
      collection: "photos",
      id: doc.id,
      data: updates,
      req,
      context: { ...context, skipProcessUpload: true },
    });
  }

  return doc;
};
