import Link from "next/link";
import { notFound } from "next/navigation";
import { ViewTransition } from "react";
import type { PhotoDoc } from "@/lib/payload";
import type { Metadata } from "next";
import { BirdBio } from "@/components/bird-bio";
import { BirdHero } from "@/components/bird-hero";
import { BirdJsonLd } from "@/components/bird-json-ld";
import { BirdPhotoSection } from "@/components/bird-photo-section";
import {
  getCachedBirdBySlug,
  getCachedPhotosByBirdId,
  getCachedPhotosWithGeolocationByBird,
  getImageUrl,
  resolveRelation,
} from "@/lib/payload";
import { getSiteConfig } from "@/lib/site-config";
import { toPhotoCard } from "@/lib/photos";
import { BirdSightingMap } from "@/components/bird-sighting-map";
import { buildMarkers } from "@/lib/map-utils";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const [bird, config] = await Promise.all([getCachedBirdBySlug(slug), getSiteConfig()]);
  if (!bird) return { title: "Bird Not Found" };

  const title = bird.scientificName ? `${bird.name} (${bird.scientificName})` : bird.name;
  const description =
    [
      bird.habitat && `Habitat: ${bird.habitat}`,
      bird.diet && `Diet: ${bird.diet}`,
      bird.conservationStatus && `Status: ${bird.conservationStatus}`,
    ]
      .filter(Boolean)
      .join(". ") || `Photos of ${bird.name} by ${config.authorName}`;

  const coverPhoto = resolveRelation(bird.coverImage as PhotoDoc | string | number | null);
  const imageUrl = coverPhoto ? getImageUrl(coverPhoto, 1200) : undefined;

  return {
    title,
    description,
    openGraph: {
      type: "article",
      title,
      description,
      ...(imageUrl && {
        images: [{ url: imageUrl, width: 1200, alt: bird.name }],
      }),
    },
    twitter: {
      card: imageUrl ? "summary_large_image" : "summary",
      title,
      description,
      ...(imageUrl && { images: [imageUrl] }),
    },
    alternates: {
      canonical: `/birds/${slug}`,
    },
  };
}

export default async function BirdPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [bird, config] = await Promise.all([getCachedBirdBySlug(slug), getSiteConfig()]);
  if (!bird) notFound();

  const [photos, geoPhotos] = await Promise.all([
    getCachedPhotosByBirdId(bird.id),
    getCachedPhotosWithGeolocationByBird(bird.id),
  ]);
  const photoCards = photos.map(toPhotoCard);

  const sightingMarkers = buildMarkers(geoPhotos);

  const firstSeen = photos.reduce(
    (earliest, p) => {
      if (!p.dateTaken) return earliest;
      return !earliest || p.dateTaken < earliest ? p.dateTaken : earliest;
    },
    null as string | null,
  );

  return (
    <div>
      <Link
        href="/birds"
        className="text-muted-foreground/70 hover:text-foreground mb-6 inline-flex items-center gap-1.5 text-xs transition-colors lg:mb-8"
      >
        &larr; All species
      </Link>

      <ViewTransition name={`bird-${slug}`}>
        <BirdHero bird={bird} photoCount={photos.length} firstSeen={firstSeen} />
      </ViewTransition>
      <ViewTransition enter="meta-enter" default="none">
        <BirdBio bird={bird} />
      </ViewTransition>

      {sightingMarkers.length > 0 && <BirdSightingMap markers={sightingMarkers} />}

      {photoCards.length > 0 && (
        <section>
          <h2 className="text-muted-foreground mb-6 text-xs tracking-widest uppercase">Photos</h2>
          <BirdPhotoSection photos={photoCards} />
        </section>
      )}

      <BirdJsonLd bird={bird} siteUrl={config.siteUrl} />
    </div>
  );
}
