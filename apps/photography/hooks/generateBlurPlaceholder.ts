import type { CollectionAfterChangeHook } from "payload";
import sharp from "sharp";

export const generateBlurPlaceholder: CollectionAfterChangeHook = async ({
  doc,
  req,
  operation,
}) => {
  // Only run on create or when a new file was uploaded
  if (doc.lqip && operation === "update") return doc;

  const filePath = req.file?.data;
  if (!filePath) return doc;

  try {
    const buffer = Buffer.isBuffer(filePath) ? filePath : Buffer.from(filePath);
    const blurBuffer = await sharp(buffer)
      .resize(10, 10, { fit: "inside" })
      .webp({ quality: 20 })
      .toBuffer();

    const lqip = `data:image/webp;base64,${blurBuffer.toString("base64")}`;

    // Use setTimeout to avoid infinite hook loop
    setTimeout(async () => {
      try {
        await req.payload.update({
          collection: "photos",
          id: doc.id,
          data: { lqip },
        });
      } catch (e) {
        req.payload.logger.error(`Failed to save LQIP: ${e}`);
      }
    }, 100);
  } catch (e) {
    req.payload.logger.error(`Failed to generate LQIP: ${e}`);
  }

  return doc;
};
