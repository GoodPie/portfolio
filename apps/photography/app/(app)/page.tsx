import type { SpeciesCardData } from "@/components/species-strip";
import type { PhotoDoc } from "@/lib/payload";
import type { Metadata } from "next";
import { GalleryShell } from "@/components/gallery-shell";
import { SpeciesStrip } from "@/components/species-strip";
import { getPayloadClient, getImageUrl, resolveRelation } from "@/lib/payload";
import { buildFilterOptions, toPhotoCard } from "@/lib/photos";

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const payload = await getPayloadClient();
  const { docs } = await payload.find({
    collection: "photos",
    sort: "-dateTaken",
    depth: 0,
    limit: 1,
  });

  const firstPhoto = docs[0] as unknown as PhotoDoc | undefined;
  const ogImage = firstPhoto ? getImageUrl(firstPhoto, 1200) : undefined;

  return {
    title: "Gallery",
    description:
      "A personal photography collection by Brandyn Britton — scenes and details captured between projects.",
    openGraph: {
      type: "website",
      ...(ogImage && { images: [{ url: ogImage, width: 1200 }] }),
    },
    twitter: {
      card: "summary_large_image",
    },
  };
}

/** Build species strip data from populated photo docs. */
function buildSpeciesStrip(photos: PhotoDoc[]): SpeciesCardData[] {
  const birdMap = new Map<
    string,
    { slug: string; name: string; thumbnailUrl: string | null; count: number }
  >();

  for (const photo of photos) {
    const bird = resolveRelation(photo.bird);
    if (!bird?.name || !bird.slug) continue;

    const id = String(bird.id);
    const existing = birdMap.get(id);
    if (existing) {
      existing.count++;
    } else {
      // Use this photo's card image as the thumbnail for the species card
      const coverPhoto = resolveRelation(bird.coverImage as PhotoDoc | string | number | null);
      const thumbnailUrl = coverPhoto ? getImageUrl(coverPhoto, 400) : getImageUrl(photo, 400);

      birdMap.set(id, {
        slug: bird.slug,
        name: bird.name,
        thumbnailUrl,
        count: 1,
      });
    }
  }

  return [...birdMap.values()]
    .sort((a, b) => b.count - a.count)
    .map(({ slug, name, thumbnailUrl, count }) => ({
      slug,
      name,
      thumbnailUrl,
      photoCount: count,
    }));
}

export default async function PhotosPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category: categoryId } = await searchParams;

  const payload = await getPayloadClient();
  const { docs } = await payload.find({
    collection: "photos",
    sort: "-dateTaken",
    depth: 1,
    limit: 100,
  });

  const allPhotos = docs as unknown as PhotoDoc[];
  const { categories } = buildFilterOptions(allPhotos);
  const allCards = allPhotos.map(toPhotoCard);
  const speciesData = buildSpeciesStrip(allPhotos);

  return (
    <>
      {/* Hero */}
      <section className="mb-16 max-w-2xl">
        <p className="text-muted-foreground mb-4 text-sm tracking-widest uppercase">Photography</p>
        <h1 className="mb-6 font-serif text-4xl font-medium tracking-tight md:text-5xl lg:text-6xl">
          Mostly birds<span className="text-teal">.</span>
        </h1>
        <p className="text-muted-foreground text-lg leading-relaxed md:text-xl">
          Sometimes landscapes. Occasionally something else entirely.
        </p>
      </section>

      <SpeciesStrip species={speciesData} />

      <GalleryShell
        allCards={allCards}
        categories={categories}
        initialCategory={categoryId ?? null}
      />
    </>
  );
}
