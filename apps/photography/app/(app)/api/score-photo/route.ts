import { getPayloadClient } from "@/lib/payload";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const payload = await getPayloadClient();

    // Verify the user is authenticated via Payload session cookie
    const headers = new Headers(request.headers);
    const { user } = await payload.auth({ headers });
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const photoId = body?.photoId;

    if (!photoId || typeof photoId !== "number") {
      return NextResponse.json({ error: "photoId (number) is required" }, { status: 400 });
    }

    // Verify photo exists
    const photo = await payload.findByID({ collection: "photos", id: photoId, depth: 0 });
    if (!photo) {
      return NextResponse.json({ error: "Photo not found" }, { status: 404 });
    }

    await payload.jobs.queue({
      task: "scorePhoto",
      input: { photoId },
    });

    // Run the queue immediately so scores appear without waiting for cron
    await payload.jobs.run();

    return NextResponse.json({
      message: "Photo scored successfully. Refresh to see results.",
    });
  } catch {
    return NextResponse.json({ error: "Failed to queue scoring job" }, { status: 500 });
  }
}
