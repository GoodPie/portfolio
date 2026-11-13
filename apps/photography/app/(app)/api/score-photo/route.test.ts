import { describe, it, expect, vi } from "vitest";

const payload = vi.hoisted(() => ({
  auth: vi.fn().mockResolvedValue({ user: { id: 1 } }),
  findByID: vi.fn(),
  jobs: { queue: vi.fn().mockResolvedValue({ id: 7 }), runByID: vi.fn() },
}));

vi.mock("@/lib/payload", () => ({ getPayloadClient: async () => payload }));

import { POST } from "./route";

const score = () =>
  POST(
    new Request("http://test/photography/api/score-photo", {
      method: "POST",
      body: JSON.stringify({ photoId: 3 }),
    }),
  );

describe("POST /api/score-photo", () => {
  it("reports why scoring failed instead of claiming success", async () => {
    payload.findByID.mockImplementation(async ({ collection }) =>
      collection === "payload-jobs"
        ? { log: [{ error: { message: "Free tier users do not have access to this model." } }] }
        : { id: 3 },
    );
    payload.jobs.runByID.mockResolvedValue({ jobStatus: { 7: { status: "error" } } });

    const res = await score();

    expect(res.status).toBe(502);
    expect((await res.json()).error).toContain("Free tier users do not have access to this model.");
  });

  it("confirms a photo that was scored", async () => {
    payload.findByID.mockResolvedValue({ id: 3 });
    payload.jobs.runByID.mockResolvedValue({ jobStatus: { 7: { status: "success" } } });

    expect((await score()).status).toBe(200);
  });
});
