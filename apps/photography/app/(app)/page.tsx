import { Button } from "@goodpie/ui/components/button";
import Link from "next/link";
import { PhotoGrid } from "@/components/photo-grid";
import { getPayloadClient, responsiveSrcSet, getImageUrl, getLqip } from "@/lib/payload";
import type { PhotoDoc } from "@/lib/payload";

export const revalidate = 60;

export default async function PhotosPage() {
  const payload = await getPayloadClient();
  const { docs } = await payload.find({
    collection: "photos",
    sort: "-dateTaken",
    depth: 1,
    limit: 100,
  });

  const photos = docs as unknown as PhotoDoc[];

  const cards = photos.map((photo) => ({
    photoKey: String(photo.id),
    title: photo.caption || photo.title,
    src: getImageUrl(photo, 1200),
    srcSet: responsiveSrcSet(photo),
    sizes: "(max-width: 768px) 100vw, (max-width: 1280px) 33vw, 400px",
    caption: photo.caption ?? undefined,
    exif: photo.exif
      ? {
          FocalLength: photo.exif.focalLength ?? undefined,
          FNumber: photo.exif.aperture ?? undefined,
          ISO: photo.exif.iso ?? undefined,
          ExposureTime: photo.exif.shutterSpeed ?? undefined,
          LensModel: photo.exif.lensModel ?? undefined,
        }
      : undefined,
    lqip: getLqip(photo),
    width: photo.width ?? undefined,
    height: photo.height ?? undefined,
  }));

  return (
    <>
      {/* Hero */}
      <section className="mb-16 max-w-2xl">
        <p className="text-sm tracking-widest text-muted-foreground uppercase mb-4">
          Photography
        </p>
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-medium tracking-tight mb-6">
          Mostly birds<span className="text-teal">.</span>
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
          Sometimes landscapes. Occasionally something else entirely.
        </p>
      </section>

      {/* Photos */}
      {cards.length > 0 ? (
        <PhotoGrid photos={cards} />
      ) : (
        <div className="text-center py-24">
          <p className="text-muted-foreground">No photos yet.</p>
          <Button asChild variant="link" className="mt-4">
            <Link href="/admin">
              Open Admin to upload your first photo &rarr;
            </Link>
          </Button>
        </div>
      )}
    </>
  );
}
