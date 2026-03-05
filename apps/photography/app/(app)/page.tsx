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
import { getSiteConfig } from "@/lib/site-config";
import { buildFilterOptions, toPhotoCard } from "@/lib/photos";

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const [firstPhoto, config] = await Promise.all([getCachedGalleryOgPhoto(), getSiteConfig()]);
  const ogImage = firstPhoto ? getImageUrl(firstPhoto, 1200) : undefined;

  return {
    title: "Bird & Wildlife Photography Gallery",
    description: config.siteDescription,
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

  const [allPhotos, config] = await Promise.all([getCachedGalleryPhotos(), getSiteConfig()]);
  const { categories } = buildFilterOptions(allPhotos);
  const allCards = allPhotos.map(toPhotoCard);
  const speciesData = buildSpeciesStrip(allPhotos);

  const aboutLeftParagraphs = config.aboutLeft?.split("\n\n").filter(Boolean) ?? [];
  const aboutRightParagraphs = config.aboutRight?.split("\n\n").filter(Boolean) ?? [];
  const hasAbout = aboutLeftParagraphs.length > 0 || aboutRightParagraphs.length > 0;

  return (
    <>
      {/* Hero */}
      <section className="mb-16 max-w-2xl">
        <p className="text-muted-foreground mb-4 text-sm tracking-widest uppercase">Photography</p>
        <h1 className="mb-6 font-serif text-4xl font-medium tracking-tight md:text-5xl lg:text-6xl">
          {config.heroHeadline}
          <span className="text-teal">.</span>
        </h1>
        <p className="text-muted-foreground text-lg leading-relaxed md:text-xl">
          {config.heroSubtitle}
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
      {hasAbout && (
        <section className="border-border/40 mt-24 border-t pt-12">
          <h2 className="text-muted-foreground mb-6 text-xs tracking-widest uppercase">
            {config.aboutTitle}
          </h2>
          <div className="text-muted-foreground grid grid-cols-1 gap-x-12 gap-y-4 text-sm leading-relaxed md:grid-cols-2">
            {aboutLeftParagraphs.length > 0 && (
              <div className="space-y-4">
                {aboutLeftParagraphs.map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </div>
            )}
            {aboutRightParagraphs.length > 0 && (
              <div className="space-y-4">
                {aboutRightParagraphs.map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </div>
            )}
          </div>
        </section>
      )}
    </>
  );
}
