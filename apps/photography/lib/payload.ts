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
  updatedAt?: string;
  createdAt?: string;
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

const allSizes = [
  { key: "thumbnail" as const, width: 400 },
  { key: "card" as const, width: 800 },
  { key: "large" as const, width: 1200 },
  { key: "xl" as const, width: 1800 },
  { key: "full" as const, width: 2400 },
];

/** Public-facing sizes — excludes full (2400w) to cap resolution at 1800px. */
const publicSizes = allSizes.filter(({ key }) => key !== "full");

/**
 * Build a responsive srcset string from Payload photo sizes.
 * Capped at xl (1800w) — full resolution is only available via authenticated download.
 */
export function responsiveSrcSet(photo: PhotoDoc): string {
  return publicSizes
    .map(({ key, width }) => {
      const url = photo.sizes?.[key]?.url;
      return url ? `${url} ${width}w` : null;
    })
    .filter(Boolean)
    .join(", ");
}

/**
 * Get the best image URL for a target display width.
 * Capped at xl (1800w) for public display.
 */
export function getImageUrl(photo: PhotoDoc, targetWidth: number): string {
  for (const { key, width } of publicSizes) {
    if (width >= targetWidth) {
      const url = photo.sizes?.[key]?.url;
      if (url) return url;
    }
  }
  // Fallback to largest public size
  return photo.sizes?.xl?.url || photo.sizes?.large?.url || "";
}

/**
 * Get LQIP (Low Quality Image Placeholder) data URI from a Payload photo.
 */
export function getLqip(photo: PhotoDoc): string | undefined {
  return photo.lqip ?? undefined;
}

/**
 * Narrow a Payload polymorphic relation (object | string | number | null)
 * to its populated object form, or null if it's an ID / missing.
 */
export function resolveRelation<T extends { id: string | number }>(
  relation: T | string | number | null | undefined,
): T | null {
  if (relation != null && typeof relation === "object") return relation;
  return null;
}
