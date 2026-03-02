import type { CollectionAfterChangeHook } from "payload";
import exifr from "exifr";

export const extractExifData: CollectionAfterChangeHook = async ({
  doc,
  req,
  operation,
}) => {
  // Only run on create or when a new file was uploaded
  if (doc.exif?.focalLength && operation === "update") return doc;

  const fileData = req.file?.data;
  if (!fileData) return doc;

  try {
    const buffer = Buffer.isBuffer(fileData) ? fileData : Buffer.from(fileData);
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

    if (!parsed) return doc;

    const exif: Record<string, unknown> = {};
    if (parsed.FocalLength) exif.focalLength = parsed.FocalLength;
    if (parsed.FNumber) exif.aperture = parsed.FNumber;
    if (parsed.ExposureTime) exif.shutterSpeed = parsed.ExposureTime;
    if (parsed.ISO) exif.iso = parsed.ISO;
    if (parsed.LensModel) exif.lensModel = parsed.LensModel;
    if (parsed.Model) exif.cameraModel = parsed.Model;

    const data: Record<string, unknown> = { exif };

    // Auto-fill dateTaken from EXIF if not already set
    if (!doc.dateTaken && parsed.DateTimeOriginal) {
      data.dateTaken = new Date(parsed.DateTimeOriginal).toISOString();
    }

    if (Object.keys(exif).length > 0) {
      // Use setTimeout to avoid infinite hook loop
      setTimeout(async () => {
        try {
          await req.payload.update({
            collection: "photos",
            id: doc.id,
            data,
          });
        } catch (e) {
          req.payload.logger.error(`Failed to save EXIF data: ${e}`);
        }
      }, 100);
    }
  } catch (e) {
    req.payload.logger.error(`Failed to extract EXIF data: ${e}`);
  }

  return doc;
};
