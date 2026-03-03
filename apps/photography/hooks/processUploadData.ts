import type { CollectionBeforeChangeHook } from "payload";
import sharp from "sharp";
import exifr from "exifr";

export const processUploadData: CollectionBeforeChangeHook = async ({
  data,
  req,
  operation,
}) => {
  // Only process when a new file is uploaded
  if (operation === "update" && !req.file) return data;

  const fileData = req.file?.data;
  if (!fileData) return data;

  const buffer = Buffer.isBuffer(fileData) ? fileData : Buffer.from(fileData);

  // 1. Generate LQIP
  try {
    const blurBuffer = await sharp(buffer)
      .resize(10, 10, { fit: "inside" })
      .webp({ quality: 20 })
      .toBuffer();

    data.lqip = `data:image/webp;base64,${blurBuffer.toString("base64")}`;
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
        data.exif = exif;
      }

      // Auto-fill dateTaken from EXIF if not already set
      if (!data.dateTaken && parsed.DateTimeOriginal) {
        data.dateTaken = new Date(parsed.DateTimeOriginal).toISOString();
      }
    }
  } catch (e) {
    req.payload.logger.error(`Failed to extract EXIF data: ${e}`);
  }

  // 3. Auto-match camera
  if (!data.camera && parsedModel) {
    try {
      const { docs } = await req.payload.find({
        collection: "cameras",
        where: { name: { contains: parsedModel } },
        limit: 1,
        depth: 0,
      });
      if (docs.length > 0) {
        data.camera = docs[0].id;
      }
    } catch (e) {
      req.payload.logger.error(`Failed to auto-match camera: ${e}`);
    }
  }

  // 4. Auto-match lens
  if (!data.lens && parsedLensModel) {
    try {
      const { docs } = await req.payload.find({
        collection: "lenses",
        where: { name: { contains: parsedLensModel } },
        limit: 1,
        depth: 0,
      });
      if (docs.length > 0) {
        data.lens = docs[0].id;
      }
    } catch (e) {
      req.payload.logger.error(`Failed to auto-match lens: ${e}`);
    }
  }

  return data;
};
