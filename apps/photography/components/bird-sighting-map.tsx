"use client";

import { SightingMapLoader } from "@/components/sighting-map-loader";
import { countUniqueLocations } from "@/lib/map-utils";
import type { MapMarker } from "@/lib/map-utils";

interface BirdSightingMapProps {
  markers: MapMarker[];
}

export function BirdSightingMap({ markers }: BirdSightingMapProps) {
  if (markers.length === 0) return null;

  const locationCount = countUniqueLocations(markers);
  const photoLabel = markers.length === 1 ? "photo" : "photos";
  const locationLabel = locationCount === 1 ? "location" : "locations";

  return (
    <section className="mb-10">
      <h2 className="text-muted-foreground mb-2 text-xs tracking-widest uppercase">
        Sighting Locations
      </h2>
      <p className="text-muted-foreground/70 mb-4 text-xs">
        {markers.length} {photoLabel} at {locationCount} {locationLabel}
      </p>
      <SightingMapLoader markers={markers} className="h-[300px]" />
    </section>
  );
}
