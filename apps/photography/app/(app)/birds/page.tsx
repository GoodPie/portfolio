import type { Metadata } from "next";
import Link from "next/link";
import { getAllBirds, getPayloadClient, getImageUrl, resolveRelation } from "@/lib/payload";
import type { PhotoDoc } from "@/lib/payload";
import { BirdGrid } from "@/components/bird-grid";
import type { BirdCardData } from "@/components/bird-grid";

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

async function getBirdPhotoCounts(): Promise<Map<string, number>> {
  const payload = await getPayloadClient();
  const { docs } = await payload.find({
    collection: "photos",
    depth: 0,
    limit: 1000,
    where: { bird: { exists: true } },
  });

  const counts = new Map<string, number>();
  for (const doc of docs) {
    const photo = doc as unknown as PhotoDoc;
    const birdId = photo.bird
      ? typeof photo.bird === "object" ? String(photo.bird.id) : String(photo.bird)
      : null;
    if (birdId) {
      counts.set(birdId, (counts.get(birdId) || 0) + 1);
    }
  }
  return counts;
}

export default async function BirdsPage() {
  const [birds, photoCounts] = await Promise.all([
    getAllBirds(),
    getBirdPhotoCounts(),
  ]);

  const birdCards: BirdCardData[] = birds.map((bird) => {
    const coverPhoto = resolveRelation(bird.coverImage as PhotoDoc | string | number | null);
    return {
      slug: bird.slug,
      name: bird.name,
      scientificName: bird.scientificName,
      conservationStatus: bird.conservationStatus,
      coverUrl: coverPhoto ? getImageUrl(coverPhoto, 800) : null,
      photoCount: photoCounts.get(String(bird.id)) || 0,
    };
  });

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

      <BirdGrid birds={birdCards} />
    </div>
  );
}
