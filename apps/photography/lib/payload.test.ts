import { describe, it, expect, vi } from "vitest";

// Mock heavy imports that are only used by getPayloadClient()
vi.mock("@payload-config", () => ({ default: {} }));
vi.mock("payload", () => ({ getPayload: vi.fn() }));

import { responsiveSrcSet, getImageUrl, getLqip, type PhotoDoc } from "./payload";

/** Helper to build a PhotoDoc with given sizes. */
function makePhoto(
  sizes: PhotoDoc["sizes"],
  overrides: Partial<PhotoDoc> = {},
): PhotoDoc {
  return {
    id: "1",
    title: "Test Photo",
    sizes,
    ...overrides,
  };
}

describe("responsiveSrcSet", () => {
  it("includes 400w, 800w, 1200w, 1800w sizes", () => {
    const photo = makePhoto({
      thumbnail: { url: "/thumb.jpg", width: 400 },
      card: { url: "/card.jpg", width: 800 },
      large: { url: "/large.jpg", width: 1200 },
      xl: { url: "/xl.jpg", width: 1800 },
      full: { url: "/full.jpg", width: 2400 },
    });
    const srcset = responsiveSrcSet(photo);
    expect(srcset).toContain("/thumb.jpg 400w");
    expect(srcset).toContain("/card.jpg 800w");
    expect(srcset).toContain("/large.jpg 1200w");
    expect(srcset).toContain("/xl.jpg 1800w");
  });

  it("excludes full (2400w) from srcset", () => {
    const photo = makePhoto({
      thumbnail: { url: "/thumb.jpg", width: 400 },
      card: { url: "/card.jpg", width: 800 },
      large: { url: "/large.jpg", width: 1200 },
      xl: { url: "/xl.jpg", width: 1800 },
      full: { url: "/full.jpg", width: 2400 },
    });
    const srcset = responsiveSrcSet(photo);
    expect(srcset).not.toContain("2400w");
    expect(srcset).not.toContain("/full.jpg");
  });

  it("skips sizes with null URLs", () => {
    const photo = makePhoto({
      thumbnail: { url: "/thumb.jpg", width: 400 },
      card: { url: null, width: 800 },
      large: { url: "/large.jpg", width: 1200 },
      xl: { url: null, width: 1800 },
    });
    const srcset = responsiveSrcSet(photo);
    expect(srcset).toBe("/thumb.jpg 400w, /large.jpg 1200w");
  });

  it("returns empty string when sizes is null", () => {
    const photo = makePhoto(null);
    expect(responsiveSrcSet(photo)).toBe("");
  });

  it("returns empty string when sizes is undefined", () => {
    const photo = makePhoto(undefined);
    expect(responsiveSrcSet(photo)).toBe("");
  });
});

describe("getImageUrl", () => {
  const photo = makePhoto({
    thumbnail: { url: "/thumb.jpg", width: 400 },
    card: { url: "/card.jpg", width: 800 },
    large: { url: "/large.jpg", width: 1200 },
    xl: { url: "/xl.jpg", width: 1800 },
    full: { url: "/full.jpg", width: 2400 },
  });

  it("returns smallest size >= target width", () => {
    expect(getImageUrl(photo, 300)).toBe("/thumb.jpg");
    expect(getImageUrl(photo, 400)).toBe("/thumb.jpg");
    expect(getImageUrl(photo, 401)).toBe("/card.jpg");
    expect(getImageUrl(photo, 800)).toBe("/card.jpg");
    expect(getImageUrl(photo, 801)).toBe("/large.jpg");
    expect(getImageUrl(photo, 1201)).toBe("/xl.jpg");
  });

  it("never returns full (2400w) even for large targets", () => {
    expect(getImageUrl(photo, 2000)).not.toContain("full");
    expect(getImageUrl(photo, 2400)).not.toContain("full");
  });

  it("falls back to xl for targets beyond 1800w", () => {
    expect(getImageUrl(photo, 2000)).toBe("/xl.jpg");
  });

  it("falls back to large if xl is unavailable", () => {
    const noXl = makePhoto({
      thumbnail: { url: "/thumb.jpg", width: 400 },
      card: { url: "/card.jpg", width: 800 },
      large: { url: "/large.jpg", width: 1200 },
      xl: { url: null, width: 1800 },
    });
    expect(getImageUrl(noXl, 2000)).toBe("/large.jpg");
  });

  it("returns empty string when no sizes are available", () => {
    const empty = makePhoto(null);
    expect(getImageUrl(empty, 800)).toBe("");
  });
});

describe("getLqip", () => {
  it("returns the lqip data URI when present", () => {
    const photo = makePhoto(null, { lqip: "data:image/jpeg;base64,abc123" });
    expect(getLqip(photo)).toBe("data:image/jpeg;base64,abc123");
  });

  it("returns undefined when lqip is null", () => {
    const photo = makePhoto(null, { lqip: null });
    expect(getLqip(photo)).toBeUndefined();
  });

  it("returns undefined when lqip is not set", () => {
    const photo = makePhoto(null);
    expect(getLqip(photo)).toBeUndefined();
  });
});
