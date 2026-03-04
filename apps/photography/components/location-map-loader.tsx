"use client";

import dynamic from "next/dynamic";

const LocationMap = dynamic(
  () => import("@/components/location-map").then((m) => m.LocationMap),
  { ssr: false },
);

export function LocationMapLoader({
  latitude,
  longitude,
}: {
  latitude: number;
  longitude: number;
}) {
  return <LocationMap latitude={latitude} longitude={longitude} />;
}
