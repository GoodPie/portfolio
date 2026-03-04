import type { CollectionBeforeChangeHook } from "payload";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export const generateSlug: CollectionBeforeChangeHook = async ({
  data,
  originalDoc,
  operation,
  req,
}) => {
  const name = data.name as string | undefined;

  // Only regenerate slug on create, or when name changes on update
  const needsSlug =
    operation === "create" || (operation === "update" && name && name !== originalDoc?.name);

  if (!needsSlug || !name) return data;

  let slug = slugify(name);

  // Check for collisions
  const existing = await req.payload.find({
    collection: "birds",
    where: {
      slug: { equals: slug },
      ...(originalDoc?.id ? { id: { not_equals: originalDoc.id } } : {}),
    },
    limit: 1,
    depth: 0,
  });

  if (existing.docs.length > 0) {
    slug = `${slug}-${Date.now()}`;
  }

  return { ...data, slug };
};
