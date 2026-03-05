import { unstable_cache } from "next/cache";
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
  geolocation?: {
    latitude?: number | null;
    longitude?: number | null;
  } | null;
  category?: { id: string | number; title?: string } | string | number | null;
  bird?:
    | {
        id: string | number;
        name?: string;
        slug?: string;
        scientificName?: string;
        taxonomicOrder?: string;
        family?: string;
        ebirdSpeciesCode?: string;
        habitat?: string;
        diet?: string;
        conservationStatus?: string;
        facts?: { fact: string }[];
        coverImage?: PhotoDoc | string | number | null;
      }
    | string
    | number
    | null;
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
  if (relation !== null && relation !== undefined && typeof relation === "object") return relation;
  return null;
}

/**
 * Bird document shape from Payload's birds collection.
 */
export interface BirdDoc {
  id: string | number;
  name: string;
  slug: string;
  scientificName?: string | null;
  taxonomicOrder?: string | null;
  family?: string | null;
  ebirdSpeciesCode?: string | null;
  habitat?: string | null;
  diet?: string | null;
  conservationStatus?: string | null;
  facts?: { fact: string }[];
  coverImage?: PhotoDoc | string | number | null;
  photos?: {
    docs?: PhotoDoc[];
    hasNextPage?: boolean;
    totalDocs?: number;
  } | null;
  updatedAt?: string;
  createdAt?: string;
}

export interface BirdPhotoStats {
  photoCount: number;
  firstSeen: string | null; // earliest dateTaken ISO string
}

/** Fetch photo counts and first-sighted dates for all birds. */
export async function getBirdPhotoStats(): Promise<Map<string, BirdPhotoStats>> {
  const payload = await getPayloadClient();
  const { docs } = await payload.find({
    collection: "photos",
    depth: 0,
    where: { bird: { exists: true } },
    select: { bird: true, dateTaken: true },
    pagination: false,
  });

  const stats = new Map<string, BirdPhotoStats>();
  for (const doc of docs) {
    const photo = doc as unknown as PhotoDoc;
    const birdId = photo.bird
      ? typeof photo.bird === "object"
        ? String((photo.bird as { id: string | number }).id)
        : String(photo.bird)
      : null;
    if (!birdId) continue;
    const dateTaken = photo.dateTaken ?? null;
    const existing = stats.get(birdId);
    if (existing) {
      existing.photoCount++;
      if (dateTaken && (!existing.firstSeen || dateTaken < existing.firstSeen)) {
        existing.firstSeen = dateTaken;
      }
    } else {
      stats.set(birdId, { photoCount: 1, firstSeen: dateTaken });
    }
  }
  return stats;
}

/** Fetch all birds sorted by name. */
export async function getAllBirds(): Promise<BirdDoc[]> {
  const payload = await getPayloadClient();
  const { docs } = await payload.find({
    collection: "birds",
    sort: "name",
    depth: 1,
    select: {
      name: true,
      slug: true,
      scientificName: true,
      taxonomicOrder: true,
      family: true,
      conservationStatus: true,
      coverImage: true,
      updatedAt: true,
    },
    pagination: false,
  });
  return docs as unknown as BirdDoc[];
}

/** Fetch a single bird by its URL slug. */
export async function getBirdBySlug(slug: string): Promise<BirdDoc | null> {
  const payload = await getPayloadClient();
  const { docs } = await payload.find({
    collection: "birds",
    where: { slug: { equals: slug } },
    depth: 1,
    limit: 1,
    pagination: false,
  });
  return docs.length > 0 ? (docs[0] as unknown as BirdDoc) : null;
}

/** Fetch all photos for a given bird ID, sorted by date taken descending. */
export async function getPhotosByBirdId(birdId: string | number): Promise<PhotoDoc[]> {
  const payload = await getPayloadClient();
  const { docs } = await payload.find({
    collection: "photos",
    where: { bird: { equals: birdId } },
    sort: "-dateTaken",
    depth: 1,
    select: {
      title: true,
      caption: true,
      dateTaken: true,
      width: true,
      height: true,
      lqip: true,
      exif: true,
      sizes: true,
      bird: true,
      category: true,
    },
    pagination: false,
  });
  return docs as unknown as PhotoDoc[];
}

// --- Cached wrapper functions (unstable_cache with tags) ---

/** Cached gallery photos for the main gallery page. */
export const getCachedGalleryPhotos = unstable_cache(
  async (): Promise<PhotoDoc[]> => {
    const payload = await getPayloadClient();
    const { docs } = await payload.find({
      collection: "photos",
      sort: "-dateTaken",
      depth: 1,
      limit: 100,
      select: {
        title: true,
        caption: true,
        dateTaken: true,
        width: true,
        height: true,
        lqip: true,
        exif: true,
        sizes: true,
        bird: true,
        category: true,
      },
    });
    return docs as unknown as PhotoDoc[];
  },
  ["gallery-photos"],
  { revalidate: 60, tags: ["photos"] },
);

/** Cached OG image photo for gallery metadata. */
export const getCachedGalleryOgPhoto = unstable_cache(
  async (): Promise<PhotoDoc | null> => {
    const payload = await getPayloadClient();
    const { docs } = await payload.find({
      collection: "photos",
      sort: "-dateTaken",
      depth: 0,
      limit: 1,
      select: { sizes: true },
    });
    return docs.length > 0 ? (docs[0] as unknown as PhotoDoc) : null;
  },
  ["gallery-og-photo"],
  { revalidate: 3600, tags: ["photos"] },
);

/** Cached single photo by ID. */
export function getCachedPhoto(id: string) {
  return unstable_cache(
    async (): Promise<PhotoDoc | null> => {
      const payload = await getPayloadClient();
      try {
        const raw = await payload.findByID({ collection: "photos", id, depth: 1 });
        return raw ? (raw as unknown as PhotoDoc) : null;
      } catch {
        return null;
      }
    },
    ["photo", id],
    { revalidate: 60, tags: ["photos", `photo:${id}`] },
  )();
}

/** Cached all birds. */
export const getCachedAllBirds = unstable_cache(
  async (): Promise<BirdDoc[]> => getAllBirds(),
  ["all-birds"],
  { revalidate: 60, tags: ["birds"] },
);

/** Cached bird photo stats. Returns entries array (Map is not serializable). */
export const getCachedBirdPhotoStats = unstable_cache(
  async (): Promise<[string, BirdPhotoStats][]> => {
    const stats = await getBirdPhotoStats();
    return [...stats.entries()];
  },
  ["bird-photo-stats"],
  { revalidate: 60, tags: ["photos", "birds"] },
);

/** Cached bird by slug. */
export function getCachedBirdBySlug(slug: string) {
  return unstable_cache(async (): Promise<BirdDoc | null> => getBirdBySlug(slug), ["bird", slug], {
    revalidate: 60,
    tags: ["birds", `bird:${slug}`],
  })();
}

/** Cached photos by bird ID. */
export function getCachedPhotosByBirdId(id: string | number) {
  return unstable_cache(
    async (): Promise<PhotoDoc[]> => getPhotosByBirdId(id),
    ["bird-photos", String(id)],
    { revalidate: 60, tags: ["photos", `bird-photos:${id}`] },
  )();
}

/** Fetch geolocated photos, optionally filtered by bird ID. */
export async function getPhotosWithGeolocation(birdId?: string | number): Promise<PhotoDoc[]> {
  const payload = await getPayloadClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: any = {
    "geolocation.latitude": { exists: true },
  };
  if (birdId) where.bird = { equals: birdId };

  const { docs } = await payload.find({
    collection: "photos",
    where,
    sort: "-dateTaken",
    depth: 1,
    select: {
      title: true,
      dateTaken: true,
      geolocation: true,
      bird: true,
      sizes: true,
    },
    pagination: false,
  });
  return docs as unknown as PhotoDoc[];
}

/** Cached geolocated photos for all birds (map page). */
export const getCachedPhotosWithGeolocation = unstable_cache(
  async (): Promise<PhotoDoc[]> => getPhotosWithGeolocation(),
  ["photos-with-geolocation"],
  { revalidate: 60, tags: ["photos"] },
);

/** Cached geolocated photos for a specific bird (bird profile map). */
export function getCachedPhotosWithGeolocationByBird(birdId: string | number) {
  return unstable_cache(
    async (): Promise<PhotoDoc[]> => getPhotosWithGeolocation(birdId),
    ["photos-with-geolocation-bird", String(birdId)],
    { revalidate: 60, tags: ["photos", `bird-photos:${birdId}`] },
  )();
}

/** Cached sitemap photos (minimal fields). */
export const getCachedSitemapPhotos = unstable_cache(
  async (): Promise<PhotoDoc[]> => {
    const payload = await getPayloadClient();
    const { docs } = await payload.find({
      collection: "photos",
      depth: 0,
      sort: "-dateTaken",
      select: { sizes: true, updatedAt: true },
      pagination: false,
    });
    return docs as unknown as PhotoDoc[];
  },
  ["sitemap-photos"],
  { revalidate: 3600, tags: ["photos"] },
);
