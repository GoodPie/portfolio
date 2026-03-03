import type { CollectionAfterChangeHook } from "payload";
import sharp from "sharp";

export const generateBlurPlaceholder: CollectionAfterChangeHook = async ({
  doc,
  req,
  operation,
  context,
}) => {
  // Skip if this update was triggered by our own hook (prevent infinite loop)
  if (context.skipLqipHook) return doc;

  // Only re-process when a new file is uploaded
  if (operation === "update" && !req.file) return doc;

  const filePath = req.file?.data;
  if (!filePath) return doc;

  try {
    const buffer = Buffer.isBuffer(filePath) ? filePath : Buffer.from(filePath);
    const blurBuffer = await sharp(buffer)
      .resize(10, 10, { fit: "inside" })
      .webp({ quality: 20 })
      .toBuffer();

    const lqip = `data:image/webp;base64,${blurBuffer.toString("base64")}`;

    await req.payload.update({
      collection: "photos",
      id: doc.id,
      data: { lqip },
      req,
      context: { ...context, skipLqipHook: true, skipExifHook: true },
    });
  } catch (e) {
    req.payload.logger.error(`Failed to generate LQIP: ${e}`);
  }

  return doc;
};
