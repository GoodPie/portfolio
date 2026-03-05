import type { PhotoDoc } from "@/lib/payload";

export interface MapMarker {
  id: string | number;
  lat: number;
  lng: number;
  title: string;
  thumbnailUrl?: string;
  birdName?: string;
  birdSlug?: string;
  dateTaken?: string;
}

/** Count unique lat,lng coordinate pairs. */
export function countUniqueLocations(markers: MapMarker[]): number {
  const seen = new Set<string>();
  for (const m of markers) seen.add(`${m.lat},${m.lng}`);
  return seen.size;
}

/** Build map markers from geolocated PhotoDocs. */
export function buildMarkers(photos: PhotoDoc[]): MapMarker[] {
  return photos
    .filter((p) => p.geolocation?.latitude != null && p.geolocation?.longitude != null)
    .map((p) => {
      const birdRaw = p.bird;
      const bird = (birdRaw != null && typeof birdRaw === "object" ? birdRaw : null) as {
        id: string | number;
        name?: string;
        slug?: string;
      } | null;
      return {
        id: p.id,
        lat: p.geolocation!.latitude!,
        lng: p.geolocation!.longitude!,
        title: p.title,
        thumbnailUrl: p.sizes?.thumbnail?.url ?? undefined,
        birdName: bird?.name,
        birdSlug: bird?.slug,
        dateTaken: p.dateTaken ?? undefined,
      };
    });
}
