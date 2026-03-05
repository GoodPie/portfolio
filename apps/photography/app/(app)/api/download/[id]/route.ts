import * as Sentry from "@sentry/nextjs";
import { NextResponse } from "next/server";
import { getPayloadClient } from "@/lib/payload";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const payload = await getPayloadClient();

  let photo;
  try {
    photo = await payload.findByID({
      collection: "photos",
      id,
    });
  } catch {
    return NextResponse.json({ error: "Photo not found" }, { status: 404 });
  }

  if (!photo) {
    return NextResponse.json({ error: "Photo not found" }, { status: 404 });
  }

  // If the photo is protected, require authentication
  if (photo.isProtected) {
    try {
      const { user } = await payload.auth({ headers: request.headers });

      if (!user) {
        return NextResponse.json(
          { error: "Authentication required to download this photo" },
          { status: 401 },
        );
      }
    } catch (err) {
      Sentry.captureException(err, {
        tags: { section: "photo-download" },
        extra: { photoId: id },
      });
      return NextResponse.json({ error: "Authentication check failed" }, { status: 500 });
    }
  }

  // Get the original file URL
  const fileUrl = photo.url;
  if (!fileUrl) {
    return NextResponse.json({ error: "File not available" }, { status: 404 });
  }

  // Validate URL origin to prevent SSRF
  try {
    const parsed = new URL(fileUrl);
    const isVercelBlob = parsed.hostname.endsWith(".public.blob.vercel-storage.com");
    const isLocalhost = parsed.hostname === "localhost" || parsed.hostname === "127.0.0.1";
    if (!isVercelBlob && !isLocalhost) {
      return NextResponse.json({ error: "Forbidden origin" }, { status: 403 });
    }
  } catch {
    return NextResponse.json({ error: "Invalid file URL" }, { status: 400 });
  }

  // Fetch and stream the original file
  let fileResponse: Response;
  try {
    fileResponse = await fetch(fileUrl);
  } catch (err) {
    Sentry.captureException(err, {
      tags: { section: "photo-download" },
      extra: { photoId: id, fileUrl },
    });
    return NextResponse.json({ error: "Failed to retrieve file" }, { status: 502 });
  }
  if (!fileResponse.ok) {
    return NextResponse.json({ error: "Failed to retrieve file" }, { status: 502 });
  }

  const filename = photo.filename || `photo-${id}`;

  return new NextResponse(fileResponse.body, {
    headers: {
      "Content-Type": fileResponse.headers.get("Content-Type") || "application/octet-stream",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "private, no-cache",
    },
  });
}
