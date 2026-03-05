"use client";

import { cn } from "@goodpie/ui/lib/utils";
import Link from "next/link";
import React, { useState, ViewTransition } from "react";

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
    <Link href={`/birds/${species.slug}`} className="block shrink-0 snap-start">
      <ViewTransition name={`bird-${species.slug}`}>
        <div
          onMouseEnter={() => setHovered(index)}
          onMouseLeave={() => setHovered(null)}
          className={cn(
            "bg-muted relative h-24 w-36 overflow-hidden rounded-lg transition-all duration-300 ease-out md:h-32 md:w-44",
            hovered !== null && hovered !== index && "scale-[0.98] blur-sm",
          )}
        >
          {species.thumbnailUrl && (
            <img
              src={species.thumbnailUrl}
              alt={species.name}
              loading="lazy"
              decoding="async"
              className="absolute inset-0 h-full w-full object-cover"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
          <div className="absolute right-0 bottom-0 left-0 px-3 py-2">
            <p className="truncate text-sm font-medium text-white">{species.name}</p>
            <p className="text-[10px] text-white/50">
              {species.photoCount} {species.photoCount === 1 ? "photo" : "photos"}
            </p>
          </div>
        </div>
      </ViewTransition>
    </Link>
  ),
);

SpeciesCard.displayName = "SpeciesCard";

export function SpeciesStrip({ species }: { species: SpeciesCardData[] }) {
  const [hovered, setHovered] = useState<number | null>(null);

  if (species.length === 0) return null;

  return (
    <section className="mb-12">
      <div className="mb-4 flex items-center justify-between">
        <span className="text-muted-foreground text-xs tracking-wider uppercase">Species</span>
        <Link
          href="/birds"
          className="text-muted-foreground/70 hover:text-foreground text-xs transition-colors"
        >
          View all &rarr;
        </Link>
      </div>
      <div className="species-strip flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2">
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
