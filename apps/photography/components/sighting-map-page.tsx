"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { SightingMapLoader } from "@/components/sighting-map-loader";
import { countUniqueLocations } from "@/lib/map-utils";
import type { MapMarker } from "@/lib/map-utils";

interface BirdOption {
  slug: string;
  name: string;
}

interface SightingMapPageProps {
  markers: MapMarker[];
  birds: BirdOption[];
  initialBirdSlug?: string;
}

export function SightingMapPage({ markers, birds, initialBirdSlug }: SightingMapPageProps) {
  const [selectedBird, setSelectedBird] = useState<string>(initialBirdSlug ?? "");

  const filtered = useMemo(() => {
    if (!selectedBird) return markers;
    return markers.filter((m) => m.birdSlug === selectedBird);
  }, [markers, selectedBird]);

  const selectedBirdName = useMemo(() => {
    if (!selectedBird) return null;
    return birds.find((b) => b.slug === selectedBird)?.name ?? null;
  }, [selectedBird, birds]);

  // Sync filter to URL
  useEffect(() => {
    const params = new URLSearchParams();
    if (selectedBird) params.set("bird", selectedBird);
    const qs = params.toString();
    const url = qs ? `${window.location.pathname}?${qs}` : window.location.pathname;
    window.history.replaceState(null, "", url);
  }, [selectedBird]);

  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col gap-4">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <Link
          href="/birds"
          className="text-muted-foreground/70 hover:text-foreground inline-flex items-center gap-1.5 text-xs transition-colors"
        >
          &larr; Life List
        </Link>

        <select
          value={selectedBird}
          onChange={(e) => setSelectedBird(e.target.value)}
          className="border-border/40 bg-muted/30 text-foreground rounded-md border px-3 py-1.5 text-sm focus:ring-1 focus:outline-none"
        >
          <option value="">All species</option>
          {birds.map((b) => (
            <option key={b.slug} value={b.slug}>
              {b.name}
            </option>
          ))}
        </select>

        <p className="text-muted-foreground ml-auto text-xs">
          {(() => {
            const locationCount = countUniqueLocations(filtered);
            const photoLabel = filtered.length === 1 ? "photo" : "photos";
            const locationLabel = locationCount === 1 ? "location" : "locations";
            if (selectedBirdName) {
              return `${filtered.length} ${photoLabel} of ${selectedBirdName} at ${locationCount} ${locationLabel}`;
            }
            return `${filtered.length} ${photoLabel} at ${locationCount} ${locationLabel} across ${birds.length} species`;
          })()}
        </p>
      </div>

      {/* Map */}
      <SightingMapLoader markers={filtered} className="min-h-0 flex-1" />
    </div>
  );
}
