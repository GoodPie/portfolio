import config from "@payload-config";
import { getPayload as getPayloadInstance } from "payload";

export async function getPayloadClient() {
  return getPayloadInstance({ config });
}

/**
 * Photo document shape from Payload's photos collection.
 * Used to type-assert results from payload.find/findByID until generated types are available.
 */
export interface PhotoDoc {
  id: string | number;
  title: string;
  caption?: string | null;
  description?: string | null;
  location?: string | null;
  dateTaken?: string | null;
  filename?: string | null;
  url?: string | null;
  width?: number | null;
  height?: number | null;
  isProtected?: boolean | null;
  lqip?: string | null;
  exif?: {
    focalLength?: number | null;
    aperture?: number | null;
    shutterSpeed?: number | null;
    iso?: number | null;
    lensModel?: string | null;
    cameraModel?: string | null;
  } | null;
  category?: { id: string | number; title?: string } | string | number | null;
  bird?: {
    id: string | number;
    name?: string;
    scientificName?: string;
    habitat?: string;
    diet?: string;
    conservationStatus?: string;
    facts?: { fact: string }[];
  } | string | number | null;
  camera?: { id: string | number; name?: string; manufacturer?: string } | string | number | null;
  lens?: { id: string | number; name?: string; manufacturer?: string } | string | number | null;
  sizes?: {
    thumbnail?: { url?: string | null; width?: number | null } | null;
    card?: { url?: string | null; width?: number | null } | null;
    large?: { url?: string | null; width?: number | null } | null;
    xl?: { url?: string | null; width?: number | null } | null;
    full?: { url?: string | null; width?: number | null } | null;
  } | null;
}

const sizeWidths = [
  { key: "thumbnail" as const, width: 400 },
  { key: "card" as const, width: 800 },
  { key: "large" as const, width: 1200 },
  { key: "xl" as const, width: 1800 },
  { key: "full" as const, width: 2400 },
];

/**
 * Build a responsive srcset string from Payload photo sizes.
 * Matches the Sanity widths: 400, 800, 1200, 1800, 2400.
 */
export function responsiveSrcSet(photo: PhotoDoc): string {
  return sizeWidths
    .map(({ key, width }) => {
      const url = photo.sizes?.[key]?.url;
      return url ? `${url} ${width}w` : null;
    })
    .filter(Boolean)
    .join(", ");
}

/**
 * Get the best image URL for a target display width.
 */
export function getImageUrl(photo: PhotoDoc, targetWidth: number): string {
  for (const { key, width } of sizeWidths) {
    if (width >= targetWidth) {
      const url = photo.sizes?.[key]?.url;
      if (url) return url;
    }
  }
  // Fallback to largest available or original
  return photo.sizes?.full?.url || photo.url || "";
}

/**
 * Get LQIP (Low Quality Image Placeholder) data URI from a Payload photo.
 */
export function getLqip(photo: PhotoDoc): string | undefined {
  return photo.lqip ?? undefined;
}
