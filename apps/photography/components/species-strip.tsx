"use client";

import React, { useState } from "react";
import Link from "next/link";
import { cn } from "@goodpie/ui/lib/utils";

interface SpeciesCardData {
  slug: string;
  name: string;
  thumbnailUrl?: string | null;
  photoCount: number;
}

const SpeciesCard = React.memo(
  ({
    species,
    index,
    hovered,
    setHovered,
  }: {
    species: SpeciesCardData;
    index: number;
    hovered: number | null;
    setHovered: React.Dispatch<React.SetStateAction<number | null>>;
  }) => (
    <Link
      href={`/birds/${species.slug}`}
      className="shrink-0 snap-start block"
    >
      <div
        onMouseEnter={() => setHovered(index)}
        onMouseLeave={() => setHovered(null)}
        className={cn(
          "relative rounded-lg overflow-hidden bg-muted w-36 h-24 md:w-44 md:h-32 transition-all duration-300 ease-out",
          hovered !== null && hovered !== index && "blur-sm scale-[0.98]",
        )}
      >
        {species.thumbnailUrl && (
          <img
            src={species.thumbnailUrl}
            alt={species.name}
            loading="lazy"
            decoding="async"
            className="object-cover absolute inset-0 w-full h-full"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 px-3 py-2">
          <p className="text-sm font-medium text-white truncate">{species.name}</p>
          <p className="text-[10px] text-white/50">
            {species.photoCount} {species.photoCount === 1 ? "photo" : "photos"}
          </p>
        </div>
      </div>
    </Link>
  ),
);

SpeciesCard.displayName = "SpeciesCard";

export function SpeciesStrip({ species }: { species: SpeciesCardData[] }) {
  const [hovered, setHovered] = useState<number | null>(null);

  if (species.length === 0) return null;

  return (
    <section className="mb-12">
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs text-muted-foreground uppercase tracking-wider">
          Species
        </span>
        <Link
          href="/birds"
          className="text-xs text-muted-foreground/70 hover:text-foreground transition-colors"
        >
          View all &rarr;
        </Link>
      </div>
      <div className="species-strip flex gap-4 overflow-x-auto pb-2 snap-x snap-mandatory">
        {species.map((s, index) => (
          <SpeciesCard
            key={s.slug}
            species={s}
            index={index}
            hovered={hovered}
            setHovered={setHovered}
          />
        ))}
      </div>
    </section>
  );
}

export type { SpeciesCardData };
