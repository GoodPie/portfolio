import { describe, it, expect } from "vitest";
import { stripFullResolution } from "./stripFullResolution";

/** Minimal helper to invoke the hook with the given overrides. */
function callHook(
  doc: Record<string, unknown>,
  overrides: { payloadAPI?: string; user?: unknown } = {},
) {
  const req = {
    payloadAPI: overrides.payloadAPI ?? "REST",
    user: overrides.user ?? null,
  };
  // The hook only uses `doc` and `req` from the args object
  return stripFullResolution({ doc, req } as never);
}

const sampleDoc = {
  id: "1",
  title: "Kea",
  caption: "Alpine parrot",
  url: "https://cdn.example.com/original.jpg",
  filename: "original.jpg",
  sizes: {
    thumbnail: { url: "https://cdn.example.com/thumb.jpg", width: 400 },
    card: { url: "https://cdn.example.com/card.jpg", width: 800 },
    large: { url: "https://cdn.example.com/large.jpg", width: 1200 },
    xl: { url: "https://cdn.example.com/xl.jpg", width: 1800 },
    full: { url: "https://cdn.example.com/full.jpg", width: 2400 },
  },
};

describe("stripFullResolution", () => {
  it("passes through unmodified for local API calls", () => {
    const result = callHook(sampleDoc, { payloadAPI: "local" });
    expect(result).toBe(sampleDoc); // same reference
  });

  it("passes through unmodified for authenticated users", () => {
    const result = callHook(sampleDoc, { user: { id: "admin" } });
    expect(result).toBe(sampleDoc);
  });

  it("strips full-size url and filename for unauthenticated REST", () => {
    const result = callHook(sampleDoc) as Record<string, unknown>;
    const sizes = result.sizes as Record<string, Record<string, unknown>>;
    expect(sizes.full.url).toBeNull();
    expect(sizes.full.filename).toBeNull();
  });

  it("strips root url and filename for unauthenticated REST", () => {
    const result = callHook(sampleDoc) as typeof sampleDoc;
    expect(result.url).toBeNull();
    expect(result.filename).toBeNull();
  });

  it("preserves other sizes untouched", () => {
    const result = callHook(sampleDoc) as typeof sampleDoc;
    expect(result.sizes.thumbnail).toEqual(sampleDoc.sizes.thumbnail);
    expect(result.sizes.card).toEqual(sampleDoc.sizes.card);
    expect(result.sizes.large).toEqual(sampleDoc.sizes.large);
    expect(result.sizes.xl).toEqual(sampleDoc.sizes.xl);
  });

  it("preserves all other doc fields", () => {
    const result = callHook(sampleDoc) as typeof sampleDoc;
    expect(result.id).toBe("1");
    expect(result.title).toBe("Kea");
    expect(result.caption).toBe("Alpine parrot");
  });

  it("handles missing sizes gracefully", () => {
    const docWithoutSizes = { id: "2", title: "No sizes" };
    const result = callHook(docWithoutSizes) as Record<string, unknown>;
    expect(result.url).toBeNull();
    expect(result.filename).toBeNull();
    // sizes.full should still be set with nulled fields
    expect((result.sizes as Record<string, unknown>)).toBeDefined();
  });
});
