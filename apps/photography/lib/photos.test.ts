import { describe, it, expect, vi } from "vitest";

// Mock heavy imports that are only used by getPayloadClient()
vi.mock("@payload-config", () => ({ default: {} }));
vi.mock("payload", () => ({ getPayload: vi.fn() }));

import {
  getRelationId,
  toPhotoCard,
  buildFilterOptions,
  filterPhotos,
  filterPhotoCards,
  getActiveFilterNames,
  type FilterOption,
} from "./photos";
import type { PhotoDoc } from "./payload";

/** Helper to build a minimal PhotoDoc. */
function makePhoto(overrides: Partial<PhotoDoc> = {}): PhotoDoc {
  return {
    id: "1",
    title: "Test Photo",
    sizes: {
      thumbnail: { url: "/thumb.jpg", width: 400 },
      card: { url: "/card.jpg", width: 800 },
      large: { url: "/large.jpg", width: 1200 },
      xl: { url: "/xl.jpg", width: 1800 },
      full: { url: "/full.jpg", width: 2400 },
    },
    ...overrides,
  };
}

describe("getRelationId", () => {
  it("returns string ID from a populated object", () => {
    expect(getRelationId({ id: "abc" })).toBe("abc");
  });

  it("returns stringified numeric ID from a populated object", () => {
    expect(getRelationId({ id: 42 })).toBe("42");
  });

  it("returns string when given a string ID directly", () => {
    expect(getRelationId("abc")).toBe("abc");
  });

  it("returns stringified number when given a numeric ID", () => {
    expect(getRelationId(123)).toBe("123");
  });

  it("returns null for null", () => {
    expect(getRelationId(null)).toBeNull();
  });

  it("returns null for undefined", () => {
    expect(getRelationId(undefined)).toBeNull();
  });
});

describe("toPhotoCard", () => {
  it("converts a full PhotoDoc to PhotoCard", () => {
    const photo = makePhoto({
      id: "p1",
      title: "Kea",
      caption: "Alpine parrot",
      width: 4000,
      height: 3000,
      lqip: "data:image/webp;base64,abc",
      exif: {
        focalLength: 200,
        aperture: 5.6,
        iso: 400,
        shutterSpeed: 0.001,
        lensModel: "RF 100-500mm",
      },
      bird: { id: "b1", name: "Kea" },
      category: { id: "c1", title: "Wildlife" },
    });

    const card = toPhotoCard(photo);
    expect(card.photoKey).toBe("p1");
    expect(card.title).toBe("Alpine parrot"); // caption preferred over title
    expect(card.src).toBe("/large.jpg"); // getImageUrl(photo, 1200)
    expect(card.lqip).toBe("data:image/webp;base64,abc");
    expect(card.width).toBe(4000);
    expect(card.height).toBe(3000);
    expect(card.birdId).toBe("b1");
    expect(card.categoryId).toBe("c1");
  });

  it("falls back to title when caption is absent", () => {
    const photo = makePhoto({ caption: null });
    expect(toPhotoCard(photo).title).toBe("Test Photo");
  });

  it("maps exif fields correctly", () => {
    const photo = makePhoto({
      exif: {
        focalLength: 85,
        aperture: 1.4,
        iso: 100,
        shutterSpeed: 0.008,
        lensModel: "RF 85mm F1.4",
      },
    });
    const card = toPhotoCard(photo);
    expect(card.exif).toEqual({
      FocalLength: 85,
      FNumber: 1.4,
      ISO: 100,
      ExposureTime: 0.008,
      LensModel: "RF 85mm F1.4",
    });
  });

  it("omits exif when null", () => {
    const photo = makePhoto({ exif: null });
    expect(toPhotoCard(photo).exif).toBeUndefined();
  });

  it("excludes full size from sizeUrls", () => {
    const card = toPhotoCard(makePhoto());
    expect(card.sizeUrls).not.toHaveProperty("full");
  });

  it("handles missing bird/category as undefined", () => {
    const photo = makePhoto({ bird: null, category: null });
    const card = toPhotoCard(photo);
    expect(card.birdId).toBeUndefined();
    expect(card.categoryId).toBeUndefined();
  });
});

describe("buildFilterOptions", () => {
  it("counts and sorts categories by frequency (descending)", () => {
    const photos = [
      makePhoto({ category: { id: "c1", title: "Wildlife" } }),
      makePhoto({ category: { id: "c1", title: "Wildlife" } }),
      makePhoto({ category: { id: "c2", title: "Landscape" } }),
    ];
    const { categories } = buildFilterOptions(photos);
    expect(categories).toEqual([
      { id: "c1", label: "Wildlife", count: 2 },
      { id: "c2", label: "Landscape", count: 1 },
    ]);
  });

  it("counts and sorts birds by frequency (descending)", () => {
    const photos = [
      makePhoto({ bird: { id: "b1", name: "Kea" } as PhotoDoc["bird"] }),
      makePhoto({ bird: { id: "b2", name: "Tui" } as PhotoDoc["bird"] }),
      makePhoto({ bird: { id: "b2", name: "Tui" } as PhotoDoc["bird"] }),
    ];
    const { birds } = buildFilterOptions(photos);
    expect(birds).toEqual([
      { id: "b2", label: "Tui", count: 2 },
      { id: "b1", label: "Kea", count: 1 },
    ]);
  });

  it("skips photos without category or bird", () => {
    const photos = [makePhoto({ category: null, bird: null })];
    const { categories, birds } = buildFilterOptions(photos);
    expect(categories).toEqual([]);
    expect(birds).toEqual([]);
  });

  it("skips non-populated relations (raw IDs)", () => {
    const photos = [makePhoto({ category: "c1" as unknown as PhotoDoc["category"] })];
    const { categories } = buildFilterOptions(photos);
    expect(categories).toEqual([]);
  });

  it("returns empty arrays for empty input", () => {
    const { categories, birds } = buildFilterOptions([]);
    expect(categories).toEqual([]);
    expect(birds).toEqual([]);
  });
});

describe("filterPhotos", () => {
  const photos = [
    makePhoto({
      id: "1",
      category: { id: "c1", title: "Wildlife" },
      bird: { id: "b1", name: "Kea" } as PhotoDoc["bird"],
    }),
    makePhoto({
      id: "2",
      category: { id: "c2", title: "Landscape" },
      bird: null,
    }),
    makePhoto({
      id: "3",
      category: { id: "c1", title: "Wildlife" },
      bird: { id: "b2", name: "Tui" } as PhotoDoc["bird"],
    }),
  ];

  it("returns all photos when no filters applied", () => {
    expect(filterPhotos(photos, {})).toBe(photos);
  });

  it("filters by categoryId", () => {
    const result = filterPhotos(photos, { categoryId: "c1" });
    expect(result.map((p) => p.id)).toEqual(["1", "3"]);
  });

  it("filters by birdId", () => {
    const result = filterPhotos(photos, { birdId: "b1" });
    expect(result.map((p) => p.id)).toEqual(["1"]);
  });

  it("applies AND logic for both filters", () => {
    const result = filterPhotos(photos, { categoryId: "c1", birdId: "b2" });
    expect(result.map((p) => p.id)).toEqual(["3"]);
  });

  it("returns empty when no match", () => {
    expect(filterPhotos(photos, { categoryId: "nonexistent" })).toEqual([]);
  });
});

describe("filterPhotoCards", () => {
  const cards = [
    { photoKey: "1", title: "A", src: "", sizes: "", birdId: "b1", categoryId: "c1" },
    { photoKey: "2", title: "B", src: "", sizes: "", categoryId: "c2" },
    { photoKey: "3", title: "C", src: "", sizes: "", birdId: "b2", categoryId: "c1" },
  ] as Parameters<typeof filterPhotoCards>[0];

  it("returns all cards when no filters", () => {
    expect(filterPhotoCards(cards, {})).toBe(cards);
  });

  it("filters by categoryId", () => {
    const result = filterPhotoCards(cards, { categoryId: "c1" });
    expect(result.map((c) => c.photoKey)).toEqual(["1", "3"]);
  });

  it("filters by birdId", () => {
    const result = filterPhotoCards(cards, { birdId: "b1" });
    expect(result.map((c) => c.photoKey)).toEqual(["1"]);
  });
});

describe("getActiveFilterNames", () => {
  const categories: FilterOption[] = [
    { id: "c1", label: "Wildlife", count: 5 },
    { id: "c2", label: "Landscape", count: 3 },
  ];
  const birds: FilterOption[] = [
    { id: "b1", label: "Kea", count: 4 },
    { id: "b2", label: "Tui", count: 2 },
  ];

  it("returns empty for no active filters", () => {
    expect(getActiveFilterNames(categories, birds, {})).toEqual([]);
  });

  it("returns category label when filtering by category", () => {
    expect(getActiveFilterNames(categories, birds, { categoryId: "c1" })).toEqual(["Wildlife"]);
  });

  it("returns bird label when filtering by bird", () => {
    expect(getActiveFilterNames(categories, birds, { birdId: "b2" })).toEqual(["Tui"]);
  });

  it("returns both labels when filtering by both", () => {
    expect(getActiveFilterNames(categories, birds, { categoryId: "c2", birdId: "b1" })).toEqual([
      "Landscape",
      "Kea",
    ]);
  });

  it("skips unmatched IDs", () => {
    expect(getActiveFilterNames(categories, birds, { categoryId: "nonexistent" })).toEqual([]);
  });
});
