import type { Metadata } from "next";
import { getCachedPhotosWithGeolocation, getCachedAllBirds } from "@/lib/payload";
import { buildMarkers } from "@/lib/map-utils";
import { SightingMapPage } from "@/components/sighting-map-page";

export const metadata: Metadata = {
  title: "Sighting Map",
  description: "Map of bird photography sighting locations",
};

export default async function MapPage({
  searchParams,
}: {
  searchParams: Promise<{ bird?: string }>;
}) {
  const { bird: initialBirdSlug } = await searchParams;

  const [photos, birds] = await Promise.all([
    getCachedPhotosWithGeolocation(),
    getCachedAllBirds(),
  ]);

  const markers = buildMarkers(photos);

  const birdOptions = birds
    .map((b) => ({ slug: b.slug, name: b.name }))
    .sort((a, b) => a.name.localeCompare(b.name));

  return (
    <SightingMapPage markers={markers} birds={birdOptions} initialBirdSlug={initialBirdSlug} />
  );
}
