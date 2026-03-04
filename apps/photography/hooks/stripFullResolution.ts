import type { CollectionAfterReadHook } from "payload";

/**
 * Strips full-resolution (2400w) and original upload URLs from photo documents
 * for unauthenticated REST/GraphQL requests. Local API calls (used by our
 * Server Components and download endpoint) pass through unmodified.
 */
export const stripFullResolution: CollectionAfterReadHook = ({ doc, req }) => {
  // Local API calls (Server Components, download endpoint) — pass through
  if (req.payloadAPI === "local") return doc;

  // Authenticated users (admin panel, API keys) — pass through
  if (req.user) return doc;

  // Unauthenticated REST/GraphQL — strip full size and original URL
  return {
    ...doc,
    url: null,
    filename: null,
    sizes: {
      ...doc.sizes,
      full: {
        ...doc.sizes?.full,
        url: null,
        filename: null,
      },
    },
  };
};
