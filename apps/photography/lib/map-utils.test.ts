import { describe, it, expect } from "vitest";

import { countUniqueLocations, buildMarkers, type MapMarker } from "./map-utils";
import type { PhotoDoc } from "./payload";

function makeMarker(overrides: Partial<MapMarker> = {}): MapMarker {
  return {
    id: "1",
    lat: 40.0,
    lng: -105.0,
    title: "Test",
    ...overrides,
  };
}

function makePhoto(overrides: Partial<PhotoDoc> = {}): PhotoDoc {
  return {
    id: "p1",
    title: "Test Photo",
    sizes: { thumbnail: { url: "/thumb.jpg", width: 400 } },
    ...overrides,
  };
}

describe("countUniqueLocations", () => {
  it("returns 0 for empty array", () => {
    expect(countUniqueLocations([])).toBe(0);
  });

  it("returns 1 for a single marker", () => {
    expect(countUniqueLocations([makeMarker()])).toBe(1);
  });

  it("deduplicates markers at the same coordinates", () => {
    const markers = [
      makeMarker({ id: "1", lat: 40.0, lng: -105.0 }),
      makeMarker({ id: "2", lat: 40.0, lng: -105.0 }),
      makeMarker({ id: "3", lat: 40.0, lng: -105.0 }),
    ];
    expect(countUniqueLocations(markers)).toBe(1);
  });

  it("counts distinct coordinates separately", () => {
    const markers = [
      makeMarker({ id: "1", lat: 40.0, lng: -105.0 }),
      makeMarker({ id: "2", lat: 41.0, lng: -106.0 }),
      makeMarker({ id: "3", lat: 40.0, lng: -105.0 }),
    ];
    expect(countUniqueLocations(markers)).toBe(2);
  });

  it("treats slightly different coordinates as distinct", () => {
    const markers = [
      makeMarker({ lat: 40.0, lng: -105.0 }),
      makeMarker({ lat: 40.0001, lng: -105.0 }),
    ];
    expect(countUniqueLocations(markers)).toBe(2);
  });
});

describe("buildMarkers", () => {
  it("returns empty array for empty input", () => {
    expect(buildMarkers([])).toEqual([]);
  });

  it("filters out photos without geolocation", () => {
    const photos = [
      makePhoto({ geolocation: null }),
      makePhoto({ geolocation: { latitude: null, longitude: null } }),
      makePhoto({ geolocation: { latitude: 40.0, longitude: null } }),
      makePhoto({ geolocation: { latitude: null, longitude: -105.0 } }),
    ];
    expect(buildMarkers(photos)).toEqual([]);
  });

  it("builds markers from geolocated photos", () => {
    const photos = [
      makePhoto({
        id: "p1",
        title: "Robin Photo",
        geolocation: { latitude: 40.0, longitude: -105.0 },
        dateTaken: "2025-06-15",
        sizes: { thumbnail: { url: "/thumb.jpg", width: 400 } },
      }),
    ];
    const markers = buildMarkers(photos);
    expect(markers).toHaveLength(1);
    expect(markers[0]).toEqual({
      id: "p1",
      lat: 40.0,
      lng: -105.0,
      title: "Robin Photo",
      thumbnailUrl: "/thumb.jpg",
      birdName: undefined,
      birdSlug: undefined,
      dateTaken: "2025-06-15",
    });
  });

  it("resolves populated bird relation", () => {
    const photos = [
      makePhoto({
        geolocation: { latitude: 40.0, longitude: -105.0 },
        bird: {
          id: "b1",
          name: "American Robin",
          slug: "american-robin",
          scientificName: "Turdus migratorius",
        },
      }),
    ];
    const markers = buildMarkers(photos);
    expect(markers[0].birdName).toBe("American Robin");
    expect(markers[0].birdSlug).toBe("american-robin");
  });

  it("handles non-populated bird relation (raw ID)", () => {
    const photos = [
      makePhoto({
        geolocation: { latitude: 40.0, longitude: -105.0 },
        bird: "b1" as unknown as PhotoDoc["bird"],
      }),
    ];
    const markers = buildMarkers(photos);
    expect(markers[0].birdName).toBeUndefined();
    expect(markers[0].birdSlug).toBeUndefined();
  });

  it("handles missing thumbnail gracefully", () => {
    const photos = [
      makePhoto({
        geolocation: { latitude: 40.0, longitude: -105.0 },
        sizes: null,
      }),
    ];
    const markers = buildMarkers(photos);
    expect(markers[0].thumbnailUrl).toBeUndefined();
  });

  it("handles missing dateTaken", () => {
    const photos = [
      makePhoto({
        geolocation: { latitude: 40.0, longitude: -105.0 },
        dateTaken: null,
      }),
    ];
    const markers = buildMarkers(photos);
    expect(markers[0].dateTaken).toBeUndefined();
  });

  it("processes mix of geolocated and non-geolocated photos", () => {
    const photos = [
      makePhoto({ id: "p1", geolocation: { latitude: 40.0, longitude: -105.0 } }),
      makePhoto({ id: "p2", geolocation: null }),
      makePhoto({ id: "p3", geolocation: { latitude: 41.0, longitude: -106.0 } }),
    ];
    const markers = buildMarkers(photos);
    expect(markers).toHaveLength(2);
    expect(markers.map((m) => m.id)).toEqual(["p1", "p3"]);
  });
});
