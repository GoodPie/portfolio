"use client";

import dynamic from "next/dynamic";
import type { MapMarker } from "@/lib/map-utils";

const SightingMap = dynamic(() => import("@/components/sighting-map").then((m) => m.SightingMap), {
  ssr: false,
});

export function SightingMapLoader({
  markers,
  className,
}: {
  markers: MapMarker[];
  className?: string;
}) {
  return <SightingMap markers={markers} className={className} />;
}
