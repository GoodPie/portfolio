import type { Metadata } from "next";
import { getPayloadClient, getImageUrl, getLqip } from "@/lib/payload";
import type { PhotoDoc } from "@/lib/payload";
import { buildFilterOptions } from "@/lib/photos";
import { GalleryShell } from "@/components/gallery-shell";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Gallery",
  description:
    "A personal photography collection by Brandyn Britton — scenes and details captured between projects.",
  openGraph: {
    type: "website",
  },
  twitter: {
    card: "summary",
  },
};

/** Extract the string ID from a Payload relation (populated object or raw ID). */
function getRelationId(
  relation: { id: string | number } | string | number | null | undefined,
): string | undefined {
  if (relation == null) return undefined;
  if (typeof relation === "object") return String(relation.id);
  return String(relation);
}

function toPhotoCard(photo: PhotoDoc) {
  return {
    photoKey: String(photo.id),
    title: photo.caption || photo.title,
    src: getImageUrl(photo, 1200),
    sizes: "(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw",
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
    sizeUrls: {
      thumbnail: photo.sizes?.thumbnail?.url ?? undefined,
      card: photo.sizes?.card?.url ?? undefined,
      large: photo.sizes?.large?.url ?? undefined,
      xl: photo.sizes?.xl?.url ?? undefined,
    },
    birdId: getRelationId(photo.bird),
    categoryId: getRelationId(photo.category),
  };
}

export default async function PhotosPage({
  searchParams,
}: {
  searchParams: Promise<{ bird?: string; category?: string }>;
}) {
  const { bird: birdId, category: categoryId } = await searchParams;

  const payload = await getPayloadClient();
  const { docs } = await payload.find({
    collection: "photos",
    sort: "-dateTaken",
    depth: 1,
    limit: 100,
  });

  const allPhotos = docs as unknown as PhotoDoc[];
  const { categories, birds } = buildFilterOptions(allPhotos);
  const allCards = allPhotos.map(toPhotoCard);

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

      <GalleryShell
        allCards={allCards}
        categories={categories}
        birds={birds}
        initialCategory={categoryId ?? null}
        initialBird={birdId ?? null}
      />
    </>
  );
}
