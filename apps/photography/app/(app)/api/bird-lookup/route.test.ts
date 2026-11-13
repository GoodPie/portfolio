import { describe, it, expect, vi, beforeEach } from "vitest";

const { auth, generateText } = vi.hoisted(() => ({ auth: vi.fn(), generateText: vi.fn() }));

vi.mock("@/lib/payload", () => ({ getPayloadClient: async () => ({ auth }) }));
vi.mock("@sentry/nextjs", () => ({ captureException: vi.fn() }));
vi.mock("ai", async (original) => ({ ...(await original<object>()), generateText }));

import { POST } from "./route";

const lookup = () =>
  POST(
    new Request("http://test/photography/api/bird-lookup", {
      method: "POST",
      body: JSON.stringify({ name: "White-winged Fairywren" }),
    }),
  );

describe("POST /api/bird-lookup", () => {
  beforeEach(() => {
    vi.stubEnv("NUTHATCH_API_KEY", "");
    auth.mockResolvedValue({ user: { id: 1 } });
  });

  it("rejects callers who are not signed in", async () => {
    auth.mockResolvedValue({ user: null });

    const res = await lookup();

    expect(res.status).toBe(401);
    expect(generateText).not.toHaveBeenCalled();
  });

  it("reports why the AI lookup failed instead of an empty success", async () => {
    generateText.mockRejectedValue(new Error("Free tier users do not have access to this model."));

    const body = await (await lookup()).json();

    expect(body.aiError).toBe("Free tier users do not have access to this model.");
    expect(body.source.ai).toBe(false);
  });

  it("returns the AI fields when the lookup works", async () => {
    generateText.mockResolvedValue({ output: { habitat: "Saltbush plains", diet: "Insects" } });

    const body = await (await lookup()).json();

    expect(body).toMatchObject({ habitat: "Saltbush plains", diet: "Insects", aiError: null });
  });
});
