import { revalidateTag } from "next/cache";
import type { CollectionAfterChangeHook } from "payload";

const REVALIDATE_PROFILE = "seconds";

export const revalidatePhotosCache: CollectionAfterChangeHook = async ({ doc, context }) => {
  if (context.skipProcessUpload) return doc;

  try {
    revalidateTag("photos", REVALIDATE_PROFILE);
    revalidateTag(`photo:${doc.id}`, REVALIDATE_PROFILE);

    const birdId = doc.bird
      ? typeof doc.bird === "object"
        ? String(doc.bird.id)
        : String(doc.bird)
      : null;
    if (birdId) {
      revalidateTag(`bird-photos:${birdId}`, REVALIDATE_PROFILE);
    }
  } catch {
    // revalidateTag can throw outside a Next.js request context (e.g. seed scripts)
  }

  return doc;
};

export const revalidateBirdsCache: CollectionAfterChangeHook = async ({ doc }) => {
  try {
    revalidateTag("birds", REVALIDATE_PROFILE);
    if (doc.slug) {
      revalidateTag(`bird:${doc.slug}`, REVALIDATE_PROFILE);
    }
  } catch {
    // revalidateTag can throw outside a Next.js request context (e.g. seed scripts)
  }

  return doc;
};
