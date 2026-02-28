import { createClient } from "next-sanity";
import { createImageUrlBuilder } from "@sanity/image-url";
import type { SanityImageSource } from "@sanity/image-url";

export const client = createClient({
  projectId: "acr6dsfp",
  dataset: "production",
  apiVersion: "2025-01-28",
  useCdn: process.env.NODE_ENV === "production",
});

const builder = createImageUrlBuilder(client);

export function urlFor(source: SanityImageSource) {
  return builder.image(source);
}

/**
 * Generate a responsive srcset for a Sanity image.
 * Returns widths at 400, 800, 1200, 1800, 2400px with auto format (AVIF/WebP).
 */
export function responsiveSrcSet(
  source: SanityImageSource,
  widths = [400, 800, 1200, 1800, 2400]
): string {
  return widths
    .map((w) => `${urlFor(source).width(w).auto("format").url()} ${w}w`)
    .join(", ");
}

/**
 * Get LQIP (Low Quality Image Placeholder) data URI from a Sanity image asset.
 */
export function getLqip(image: {
  asset?: { metadata?: { lqip?: string } };
}): string | undefined {
  return image?.asset?.metadata?.lqip;
}
