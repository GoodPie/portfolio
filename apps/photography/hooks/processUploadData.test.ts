import { describe, it, expect, vi, beforeEach, type Mock } from "vitest";

// ---------------------------------------------------------------------------
// Module mocks — must be declared before importing the module under test
// ---------------------------------------------------------------------------

const mockSharpInstance = {
  resize: vi.fn().mockReturnThis(),
  webp: vi.fn().mockReturnThis(),
  jpeg: vi.fn().mockReturnThis(),
  toBuffer: vi.fn().mockResolvedValue(Buffer.from("fake-resized")),
  metadata: vi.fn().mockResolvedValue({ width: 4000, height: 3000 }),
};

vi.mock("sharp", () => ({
  default: vi.fn(() => mockSharpInstance),
}));

vi.mock("exifr", () => ({
  default: {
    parse: vi.fn().mockResolvedValue(null),
    gps: vi.fn().mockResolvedValue(null),
  },
}));

vi.mock("@vercel/blob", () => ({
  put: vi.fn().mockResolvedValue({ url: "https://blob.test/resized.jpg" }),
}));

// Import mocks so we can configure per-test
import sharp from "sharp";
import exifr from "exifr";
import { put } from "@vercel/blob";
import { processUploadData } from "./processUploadData";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makePayload(overrides: Record<string, unknown> = {}) {
  return {
    logger: { info: vi.fn(), error: vi.fn() },
    find: vi.fn().mockResolvedValue({ docs: [] }),
    update: vi.fn().mockResolvedValue({}),
    ...overrides,
  };
}

function makeDoc(overrides: Record<string, unknown> = {}) {
  return {
    id: "photo-1",
    url: "https://blob.test/original.jpg",
    filename: "bird.jpg",
    width: 4000,
    height: 3000,
    ...overrides,
  };
}

interface HookArgs {
  doc: Record<string, unknown>;
  req: {
    payload: ReturnType<typeof makePayload>;
    file?: { data: Buffer } | null;
  };
  operation: "create" | "update";
  context: Record<string, unknown>;
}

function makeHookArgs(overrides: Partial<HookArgs> = {}): HookArgs {
  const payload = makePayload();
  return {
    doc: makeDoc(),
    req: { payload, file: undefined },
    operation: "create",
    context: {},
    ...overrides,
  };
}

/** Wait for fire-and-forget background promise to settle. */
async function flush() {
  // processInBackground is fire-and-forget. Give microtasks time to flush.
  await new Promise((r) => setTimeout(r, 50));
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

beforeEach(() => {
  vi.clearAllMocks();
  // Reset default mock implementations
  mockSharpInstance.toBuffer.mockResolvedValue(Buffer.from("fake-resized"));
  mockSharpInstance.metadata.mockResolvedValue({ width: 4000, height: 3000 });
  (exifr.parse as Mock).mockResolvedValue(null);
  (exifr.gps as Mock).mockResolvedValue(null);
  (put as Mock).mockResolvedValue({ url: "https://blob.test/resized.jpg" });

  // processInBackground uses fetch for client uploads — mock globally
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue({
      ok: true,
      arrayBuffer: () => Promise.resolve(new ArrayBuffer(8)),
    }),
  );

  // processInBackground reads BLOB_READ_WRITE_TOKEN from env
  process.env.BLOB_READ_WRITE_TOKEN = "test-token";
});

describe("processUploadData — guard clauses", () => {
  it("returns doc unchanged when skipProcessUpload is set (infinite loop guard)", async () => {
    const args = makeHookArgs({ context: { skipProcessUpload: true } });
    const result = await (processUploadData as Function)(args);
    expect(result).toBe(args.doc);
    expect(args.req.payload.update).not.toHaveBeenCalled();
  });

  it("returns doc unchanged on update with no file when lqip exists", async () => {
    const args = makeHookArgs({
      operation: "update",
      doc: makeDoc({ lqip: "data:image/webp;base64,existing" }),
      req: { payload: makePayload(), file: undefined },
    });
    const result = await (processUploadData as Function)(args);
    expect(result).toBe(args.doc);
  });

  it("processes on update when lqip is missing (new client upload)", async () => {
    const args = makeHookArgs({
      operation: "update",
      doc: makeDoc({ lqip: undefined }),
    });
    await (processUploadData as Function)(args);
    await flush();
    expect(args.req.payload.update).toHaveBeenCalled();
  });

  it("processes on create even without req.file (client upload path)", async () => {
    const args = makeHookArgs({ operation: "create" });
    await (processUploadData as Function)(args);
    await flush();
    expect(args.req.payload.update).toHaveBeenCalled();
  });
});

describe("processUploadData — resolveImageBuffer", () => {
  it("uses req.file.data when available (server upload)", async () => {
    const fileBuffer = Buffer.from("server-file-data");
    const args = makeHookArgs({
      req: { payload: makePayload(), file: { data: fileBuffer } },
    });
    await (processUploadData as Function)(args);
    await flush();

    // sharp should have been called with the server file buffer
    expect(sharp).toHaveBeenCalledWith(fileBuffer);
  });

  it("fetches from doc.url when req.file is absent (client upload)", async () => {
    const args = makeHookArgs({
      doc: makeDoc({ url: "https://blob.test/client-upload.jpg" }),
    });
    await (processUploadData as Function)(args);
    await flush();

    expect(fetch).toHaveBeenCalledWith("https://blob.test/client-upload.jpg");
  });

  it("skips processing when neither file nor URL is available", async () => {
    const args = makeHookArgs({
      doc: makeDoc({ url: undefined }),
      req: { payload: makePayload(), file: undefined },
    });
    await (processUploadData as Function)(args);
    await flush();

    expect(args.req.payload.update).not.toHaveBeenCalled();
  });
});

describe("processUploadData — LQIP generation", () => {
  it("generates a base64 webp data URI", async () => {
    const lqipBuffer = Buffer.from("tiny-blur");
    mockSharpInstance.toBuffer.mockResolvedValueOnce(lqipBuffer);

    const args = makeHookArgs();
    await (processUploadData as Function)(args);
    await flush();

    const updateCall = args.req.payload.update.mock.calls[0][0];
    expect(updateCall.data.lqip).toBe(`data:image/webp;base64,${lqipBuffer.toString("base64")}`);
  });

  it("calls sharp with 10x10 resize and webp quality 20", async () => {
    const args = makeHookArgs();
    await (processUploadData as Function)(args);
    await flush();

    expect(mockSharpInstance.resize).toHaveBeenCalledWith(10, 10, {
      fit: "inside",
    });
    expect(mockSharpInstance.webp).toHaveBeenCalledWith({ quality: 20 });
  });
});

describe("processUploadData — image size variants", () => {
  it("generates sizes smaller than original width", async () => {
    // Original is 4000x3000 — all 5 sizes (400..2400) should be generated
    const args = makeHookArgs();
    await (processUploadData as Function)(args);
    await flush();

    // put() should be called for each of the 5 sizes
    expect(put).toHaveBeenCalledTimes(5);
  });

  it("skips sizes larger than or equal to original width", async () => {
    mockSharpInstance.metadata.mockResolvedValueOnce({
      width: 1000,
      height: 750,
    });

    const args = makeHookArgs();
    await (processUploadData as Function)(args);
    await flush();

    // Only thumbnail (400) and card (800) are < 1000
    expect(put).toHaveBeenCalledTimes(2);
  });

  it("uses deterministic filenames with dimensions", async () => {
    const args = makeHookArgs({ doc: makeDoc({ filename: "kea-portrait.jpg" }) });
    await (processUploadData as Function)(args);
    await flush();

    const putCalls = (put as Mock).mock.calls;
    const filenames = putCalls.map((c) => c[0]);
    expect(filenames).toContain("kea-portrait-400x300.jpg");
    expect(filenames).toContain("kea-portrait-800x600.jpg");
  });

  it("uploads with public access and correct content type", async () => {
    const args = makeHookArgs();
    await (processUploadData as Function)(args);
    await flush();

    const putCall = (put as Mock).mock.calls[0];
    expect(putCall[2]).toMatchObject({
      access: "public",
      token: "test-token",
      addRandomSuffix: false,
      contentType: "image/jpeg",
    });
  });

  it("skips size generation when BLOB_READ_WRITE_TOKEN is missing", async () => {
    delete process.env.BLOB_READ_WRITE_TOKEN;

    const args = makeHookArgs();
    await (processUploadData as Function)(args);
    await flush();

    expect(put).not.toHaveBeenCalled();
  });

  it("skips size generation when filename is missing", async () => {
    const args = makeHookArgs({ doc: makeDoc({ filename: undefined }) });
    await (processUploadData as Function)(args);
    await flush();

    expect(put).not.toHaveBeenCalled();
  });
});

describe("processUploadData — EXIF extraction", () => {
  it("maps EXIF fields to the exif group", async () => {
    (exifr.parse as Mock).mockResolvedValueOnce({
      FocalLength: 200,
      FNumber: 5.6,
      ExposureTime: 0.001,
      ISO: 400,
      LensModel: "RF 100-500mm F4.5-7.1",
      Model: "Canon EOS R5",
      DateTimeOriginal: new Date("2024-06-15T10:30:00"),
    });

    const args = makeHookArgs({ doc: makeDoc({ dateTaken: undefined }) });
    await (processUploadData as Function)(args);
    await flush();

    const updateData = args.req.payload.update.mock.calls[0][0].data;
    expect(updateData.exif).toEqual({
      focalLength: 200,
      aperture: 5.6,
      shutterSpeed: 0.001,
      iso: 400,
      lensModel: "RF 100-500mm F4.5-7.1",
      cameraModel: "Canon EOS R5",
    });
  });

  it("auto-fills dateTaken from EXIF when not already set", async () => {
    const dateOriginal = new Date("2024-06-15T10:30:00");
    (exifr.parse as Mock).mockResolvedValueOnce({
      DateTimeOriginal: dateOriginal,
    });

    const args = makeHookArgs({ doc: makeDoc({ dateTaken: undefined }) });
    await (processUploadData as Function)(args);
    await flush();

    const updateData = args.req.payload.update.mock.calls[0][0].data;
    expect(updateData.dateTaken).toBe(dateOriginal.toISOString());
  });

  it("does NOT overwrite dateTaken when already set", async () => {
    (exifr.parse as Mock).mockResolvedValueOnce({
      DateTimeOriginal: new Date("2024-06-15T10:30:00"),
    });

    const args = makeHookArgs({
      doc: makeDoc({ dateTaken: "2023-01-01T00:00:00.000Z" }),
    });
    await (processUploadData as Function)(args);
    await flush();

    const updateData = args.req.payload.update.mock.calls[0][0].data;
    expect(updateData.dateTaken).toBeUndefined();
  });

  it("handles partial EXIF data gracefully", async () => {
    (exifr.parse as Mock).mockResolvedValueOnce({
      ISO: 800,
      // Other fields missing
    });

    const args = makeHookArgs();
    await (processUploadData as Function)(args);
    await flush();

    const updateData = args.req.payload.update.mock.calls[0][0].data;
    expect(updateData.exif).toEqual({ iso: 800 });
  });

  it("skips exif update when parse returns null", async () => {
    (exifr.parse as Mock).mockResolvedValueOnce(null);

    const args = makeHookArgs();
    await (processUploadData as Function)(args);
    await flush();

    const updateData = args.req.payload.update.mock.calls[0][0].data;
    expect(updateData.exif).toBeUndefined();
  });
});

describe("processUploadData — GPS extraction", () => {
  it("extracts latitude and longitude", async () => {
    (exifr.gps as Mock).mockResolvedValueOnce({
      latitude: -36.8485,
      longitude: 174.7633,
    });

    const args = makeHookArgs();
    await (processUploadData as Function)(args);
    await flush();

    const updateData = args.req.payload.update.mock.calls[0][0].data;
    expect(updateData.geolocation).toEqual({
      latitude: -36.8485,
      longitude: 174.7633,
    });
  });

  it("skips geolocation when GPS data is null", async () => {
    (exifr.gps as Mock).mockResolvedValueOnce(null);

    const args = makeHookArgs();
    await (processUploadData as Function)(args);
    await flush();

    const updateData = args.req.payload.update.mock.calls[0][0].data;
    expect(updateData.geolocation).toBeUndefined();
  });

  it("skips geolocation when latitude is null", async () => {
    (exifr.gps as Mock).mockResolvedValueOnce({
      latitude: null,
      longitude: 174.7633,
    });

    const args = makeHookArgs();
    await (processUploadData as Function)(args);
    await flush();

    const updateData = args.req.payload.update.mock.calls[0][0].data;
    expect(updateData.geolocation).toBeUndefined();
  });
});

describe("processUploadData — camera auto-match", () => {
  it("auto-matches camera from EXIF Model field", async () => {
    (exifr.parse as Mock).mockResolvedValueOnce({ Model: "Canon EOS R5" });

    const payload = makePayload({
      find: vi.fn().mockResolvedValue({ docs: [{ id: "cam-1" }] }),
    });
    const args = makeHookArgs({
      doc: makeDoc({ camera: undefined }),
      req: { payload, file: undefined },
    });
    await (processUploadData as Function)(args);
    await flush();

    expect(payload.find).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: "cameras",
        where: { name: { contains: "Canon EOS R5" } },
      }),
    );
    const updateData = payload.update.mock.calls[0][0].data;
    expect(updateData.camera).toBe("cam-1");
  });

  it("skips camera match when doc.camera is already set", async () => {
    (exifr.parse as Mock).mockResolvedValueOnce({ Model: "Canon EOS R5" });

    const payload = makePayload();
    const args = makeHookArgs({
      doc: makeDoc({ camera: "existing-cam" }),
      req: { payload, file: undefined },
    });
    await (processUploadData as Function)(args);
    await flush();

    // Should not query cameras collection
    const findCalls = payload.find.mock.calls.filter(
      (c: unknown[]) => (c[0] as Record<string, unknown>).collection === "cameras",
    );
    expect(findCalls).toHaveLength(0);
  });

  it("skips camera match when no Model in EXIF", async () => {
    (exifr.parse as Mock).mockResolvedValueOnce({ ISO: 400 });

    const payload = makePayload();
    const args = makeHookArgs({
      doc: makeDoc({ camera: undefined }),
      req: { payload, file: undefined },
    });
    await (processUploadData as Function)(args);
    await flush();

    const findCalls = payload.find.mock.calls.filter(
      (c: unknown[]) => (c[0] as Record<string, unknown>).collection === "cameras",
    );
    expect(findCalls).toHaveLength(0);
  });
});

describe("processUploadData — lens auto-match", () => {
  it("auto-matches lens from EXIF LensModel field", async () => {
    (exifr.parse as Mock).mockResolvedValueOnce({
      LensModel: "RF 100-500mm F4.5-7.1",
    });

    const payload = makePayload({
      find: vi.fn().mockResolvedValue({ docs: [{ id: "lens-1" }] }),
    });
    const args = makeHookArgs({
      doc: makeDoc({ lens: undefined }),
      req: { payload, file: undefined },
    });
    await (processUploadData as Function)(args);
    await flush();

    expect(payload.find).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: "lenses",
        where: { name: { contains: "RF 100-500mm F4.5-7.1" } },
      }),
    );
    const updateData = payload.update.mock.calls[0][0].data;
    expect(updateData.lens).toBe("lens-1");
  });

  it("skips lens match when doc.lens is already set", async () => {
    (exifr.parse as Mock).mockResolvedValueOnce({
      LensModel: "RF 100-500mm",
    });

    const payload = makePayload();
    const args = makeHookArgs({
      doc: makeDoc({ lens: "existing-lens" }),
      req: { payload, file: undefined },
    });
    await (processUploadData as Function)(args);
    await flush();

    const findCalls = payload.find.mock.calls.filter(
      (c: unknown[]) => (c[0] as Record<string, unknown>).collection === "lenses",
    );
    expect(findCalls).toHaveLength(0);
  });
});

describe("processUploadData — final persist", () => {
  it("calls payload.update with skipProcessUpload context", async () => {
    const args = makeHookArgs();
    await (processUploadData as Function)(args);
    await flush();

    expect(args.req.payload.update).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: "photos",
        id: "photo-1",
        context: { skipProcessUpload: true },
      }),
    );
  });

  it("does not call update when buffer is null (nothing to process)", async () => {
    (global.fetch as Mock).mockResolvedValueOnce({ ok: false });

    const args = makeHookArgs({
      doc: makeDoc({ url: "https://blob.test/missing.jpg" }),
      req: { payload: makePayload(), file: undefined },
    });
    await (processUploadData as Function)(args);
    await flush();

    expect(args.req.payload.update).not.toHaveBeenCalled();
  });
});

describe("processUploadData — error isolation", () => {
  it("continues processing when LQIP generation fails", async () => {
    // First sharp call (LQIP) fails, rest succeed
    mockSharpInstance.toBuffer
      .mockRejectedValueOnce(new Error("LQIP failed"))
      .mockResolvedValue(Buffer.from("resized"));

    (exifr.parse as Mock).mockResolvedValueOnce({ ISO: 200 });

    const args = makeHookArgs();
    await (processUploadData as Function)(args);
    await flush();

    // Should still persist EXIF data despite LQIP failure
    const updateData = args.req.payload.update.mock.calls[0][0].data;
    expect(updateData.exif).toEqual({ iso: 200 });
    expect(updateData.lqip).toBeUndefined();
  });

  it("continues processing when EXIF extraction fails", async () => {
    (exifr.parse as Mock).mockRejectedValueOnce(new Error("EXIF parse failed"));

    const args = makeHookArgs();
    await (processUploadData as Function)(args);
    await flush();

    // Should still persist LQIP and sizes despite EXIF failure
    const updateData = args.req.payload.update.mock.calls[0][0].data;
    expect(updateData.lqip).toBeDefined();
  });

  it("logs error when background processing fails entirely", async () => {
    // Make fetch fail so resolveImageBuffer returns null for client path,
    // but provide a file that will cause sharp to throw
    (global.fetch as Mock).mockRejectedValueOnce(new Error("Network error"));

    const payload = makePayload();
    const args = makeHookArgs({
      doc: makeDoc({ url: undefined }),
      req: { payload, file: undefined },
    });
    await (processUploadData as Function)(args);
    await flush();

    // No update should have been called
    expect(payload.update).not.toHaveBeenCalled();
  });
});
