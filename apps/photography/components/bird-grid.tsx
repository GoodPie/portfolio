"use client";

import { Badge } from "@goodpie/ui/components/badge";
import { cn } from "@goodpie/ui/lib/utils";
import Link from "next/link";
import React, { useState, ViewTransition } from "react";
import { conservationStatusBgColors } from "@/lib/bird-utils";
import { formatShortDate } from "@/lib/format";

interface BirdCardData {
  slug: string;
  name: string;
  scientificName?: string | null;
  conservationStatus?: string | null;
  coverUrl?: string | null;
  photoCount: number;
  firstSeen?: string | null;
  taxonomicOrder?: string | null;
  family?: string | null;
}

const BirdCard = React.memo(
  ({
    bird,
    index,
    hovered,
    setHovered,
  }: {
    bird: BirdCardData;
    index: number;
    hovered: number | null;
    setHovered: React.Dispatch<React.SetStateAction<number | null>>;
  }) => (
    <Link href={`/birds/${bird.slug}`} className="block">
      <ViewTransition name={`bird-${bird.slug}`} enter="photo-filter" exit="photo-filter">
        <div
          onMouseEnter={() => setHovered(index)}
          onMouseLeave={() => setHovered(null)}
          className={cn(
            "bg-muted relative h-48 w-full overflow-hidden rounded-lg transition-all duration-300 ease-out sm:h-60 md:h-72",
            hovered !== null && hovered !== index && "scale-[0.98] blur-sm",
          )}
        >
          {bird.coverUrl && (
            <img
              src={bird.coverUrl}
              alt={bird.name}
              loading="lazy"
              decoding="async"
              className="absolute inset-0 h-full w-full object-cover"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
          <div className="absolute right-0 bottom-0 left-0 flex flex-col gap-1 p-4 md:p-6">
            <h2 className="font-serif text-lg font-medium text-white md:text-xl">{bird.name}</h2>
            {bird.scientificName && (
              <p className="text-xs text-white/60 italic">{bird.scientificName}</p>
            )}
            <div className="mt-1 flex items-center gap-2">
              {bird.conservationStatus && (
                <Badge
                  className={cn(
                    "border-0 px-1.5 py-0 text-[10px] font-medium",
                    conservationStatusBgColors[bird.conservationStatus],
                  )}
                >
                  {bird.conservationStatus}
                </Badge>
              )}
              <span className="text-xs text-white/50">
                {bird.photoCount} {bird.photoCount === 1 ? "photo" : "photos"}
              </span>
              {bird.firstSeen && (
                <span className="text-xs text-white/50">
                  · First seen {formatShortDate(bird.firstSeen)}
                </span>
              )}
            </div>
          </div>
        </div>
      </ViewTransition>
    </Link>
  ),
);

BirdCard.displayName = "BirdCard";

export function BirdGrid({ birds }: { birds: BirdCardData[] }) {
  const [hovered, setHovered] = useState<number | null>(null);

  return (
    <div className="grid w-full grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
      {birds.map((bird, index) => (
        <BirdCard
          key={bird.slug}
          bird={bird}
          index={index}
          hovered={hovered}
          setHovered={setHovered}
        />
      ))}
    </div>
  );
}

export type { BirdCardData };
