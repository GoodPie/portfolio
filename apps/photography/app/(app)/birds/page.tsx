import type { Metadata } from "next";
import Link from "next/link";
import { getAllBirds, getBirdPhotoStats, getImageUrl, resolveRelation } from "@/lib/payload";
import type { PhotoDoc } from "@/lib/payload";
import type { BirdCardData } from "@/components/bird-grid";
import { LifeListShell } from "@/components/life-list-shell";
import { LifeListStats } from "@/components/life-list-stats";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Life List",
  description: "Bird species photographed by Brandyn Britton — a growing life list.",
  openGraph: {
    type: "website",
  },
  twitter: {
    card: "summary",
  },
  alternates: {
    canonical: "/birds",
  },
};

export default async function BirdsPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    status?: string;
    sort?: string;
    year?: string;
    view?: string;
  }>;
}) {
  const params = await searchParams;
  const [birds, stats] = await Promise.all([
    getAllBirds(),
    getBirdPhotoStats(),
  ]);

  const birdCards: BirdCardData[] = birds.map((bird) => {
    const coverPhoto = resolveRelation(bird.coverImage as PhotoDoc | string | number | null);
    const birdStats = stats.get(String(bird.id));
    return {
      slug: bird.slug,
      name: bird.name,
      scientificName: bird.scientificName,
      conservationStatus: bird.conservationStatus,
      coverUrl: coverPhoto ? getImageUrl(coverPhoto, 800) : null,
      photoCount: birdStats?.photoCount ?? 0,
      firstSeen: birdStats?.firstSeen ?? null,
      taxonomicOrder: bird.taxonomicOrder,
      family: bird.family,
    };
  });

  // Derive available years from firstSeen dates
  const yearSet = new Set<number>();
  for (const card of birdCards) {
    if (card.firstSeen) {
      yearSet.add(new Date(card.firstSeen).getFullYear());
    }
  }
  const availableYears = [...yearSet].sort((a, b) => b - a);

  // Compute stats for the banner
  const totalPhotos = [...stats.values()].reduce((sum, s) => sum + s.photoCount, 0);
  const statusBreakdown = Object.entries(
    birds.reduce(
      (acc, b) => {
        if (b.conservationStatus)
          acc[b.conservationStatus] = (acc[b.conservationStatus] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    ),
  ).map(([status, count]) => ({ status, count }));
  const yearCounts = availableYears.map((y) => ({
    year: y,
    count: birdCards.filter(
      (b) => b.firstSeen && new Date(b.firstSeen).getFullYear() === y,
    ).length,
  }));

  return (
    <div>
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-xs text-muted-foreground/70 hover:text-foreground transition-colors mb-6 lg:mb-8"
      >
        &larr; Back to gallery
      </Link>

      <section className="mb-10">
        <p className="text-sm tracking-widest text-muted-foreground uppercase mb-4">
          Life List
        </p>
        <h1 className="text-4xl md:text-5xl font-serif font-medium tracking-tight mb-4">
          {birds.length} {birds.length === 1 ? "species" : "species"}
          <span className="text-teal">.</span>
        </h1>
        <p className="text-lg text-muted-foreground leading-relaxed">
          Every bird I&apos;ve had the privilege of photographing.
        </p>
      </section>

      <LifeListStats
        totalSpecies={birds.length}
        totalPhotos={totalPhotos}
        statusBreakdown={statusBreakdown}
        yearCounts={yearCounts}
      />

      <LifeListShell
        birds={birdCards}
        availableYears={availableYears}
        initialSearch={params.q}
        initialStatus={params.status}
        initialSort={params.sort}
        initialYear={params.year}
        initialView={params.view}
      />
    </div>
  );
}
