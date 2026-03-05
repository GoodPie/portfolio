import type { SpeciesCardData } from "@/components/species-strip";
import type { PhotoDoc } from "@/lib/payload";
import type { Metadata } from "next";
import { GalleryShell } from "@/components/gallery-shell";
import { SpeciesStrip } from "@/components/species-strip";
import {
  getCachedGalleryOgPhoto,
  getCachedGalleryPhotos,
  getImageUrl,
  resolveRelation,
} from "@/lib/payload";
import { buildFilterOptions, toPhotoCard } from "@/lib/photos";

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const firstPhoto = await getCachedGalleryOgPhoto();
  const ogImage = firstPhoto ? getImageUrl(firstPhoto, 1200) : undefined;

  return {
    title: "Bird & Wildlife Photography Gallery",
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

  const allPhotos = await getCachedGalleryPhotos();
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

      {speciesData.length > 0 && (
        <section className="mb-12">
          <h2 className="text-muted-foreground mb-6 text-xs tracking-widest uppercase">
            Featured Species
          </h2>
          <SpeciesStrip species={speciesData} />
        </section>
      )}

      <section>
        <h2 className="text-muted-foreground mb-6 text-xs tracking-widest uppercase">Gallery</h2>
        <GalleryShell
          allCards={allCards}
          categories={categories}
          initialCategory={categoryId ?? null}
        />
      </section>

      {/* About — below the gallery for SEO content without cluttering the visual experience */}
      <section className="border-border/40 mt-24 border-t pt-12">
        <h2 className="text-muted-foreground mb-6 text-xs tracking-widest uppercase">
          About This Collection
        </h2>
        <div className="text-muted-foreground grid grid-cols-1 gap-x-12 gap-y-4 text-sm leading-relaxed md:grid-cols-2">
          <div className="space-y-4">
            <p>
              What started as a casual interest in birdwatching quickly grew into a deeper passion
              for capturing the personality, movement, and beauty of wild birds through a camera
              lens. This gallery is a growing personal collection of wildlife photographs taken
              during early morning walks, day hikes, and dedicated birding trips — featuring
              everything from common garden visitors and backyard regulars to rare and elusive
              species spotted in their natural habitats.
            </p>
            <p>
              Each photograph is captured with an emphasis on natural light and authentic behaviour.
              Rather than staged or baited shots, these images aim to document birds and wildlife as
              they go about their daily lives — hunting, feeding, nesting, displaying, and simply
              being. The goal is always to tell a small story about the moment and the subject,
              whether it is a kingfisher mid-dive or a fantail perched quietly at dawn.
            </p>
          </div>
          <div className="space-y-4">
            <p>
              You can browse the full collection below or filter by category to explore specific
              types of photographs. Each species featured in the gallery has its own dedicated page
              with identification details, habitat information, and every related photo collected so
              far. Clicking any image reveals the full-resolution version alongside camera settings
              and EXIF data for those interested in the technical side of wildlife photography.
            </p>
            <p>
              The equipment behind these images ranges from mid-range telephoto zoom lenses for
              general birding to longer prime lenses for detailed close-up portraits. Camera body
              and lens information is recorded automatically with each shot and displayed alongside
              every photograph, so you can see exactly what was used. This collection is regularly
              updated as new photos are taken and processed. Whether you are a fellow birder, a
              photography enthusiast, or simply someone who appreciates the natural world, I hope
              you find something here that catches your eye.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
