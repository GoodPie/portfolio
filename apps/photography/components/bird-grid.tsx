"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Badge } from "@goodpie/ui/components/badge";
import { cn } from "@goodpie/ui/lib/utils";
import { conservationStatusBgColors } from "@/lib/bird-utils";

interface BirdCardData {
  slug: string;
  name: string;
  scientificName?: string | null;
  conservationStatus?: string | null;
  coverUrl?: string | null;
  photoCount: number;
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
      <div
        onMouseEnter={() => setHovered(index)}
        onMouseLeave={() => setHovered(null)}
        className={cn(
          "rounded-lg relative bg-muted overflow-hidden h-48 sm:h-60 md:h-72 w-full transition-all duration-300 ease-out",
          hovered !== null && hovered !== index && "blur-sm scale-[0.98]",
        )}
      >
        {bird.coverUrl && (
          <img
            src={bird.coverUrl}
            alt={bird.name}
            loading="lazy"
            decoding="async"
            className="object-cover absolute inset-0 w-full h-full"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6 flex flex-col gap-1">
          <h2 className="text-lg md:text-xl font-serif font-medium text-white">
            {bird.name}
          </h2>
          {bird.scientificName && (
            <p className="text-xs text-white/60 italic">{bird.scientificName}</p>
          )}
          <div className="flex items-center gap-2 mt-1">
            {bird.conservationStatus && (
              <Badge
                className={cn(
                  "text-[10px] font-medium border-0 px-1.5 py-0",
                  conservationStatusBgColors[bird.conservationStatus],
                )}
              >
                {bird.conservationStatus}
              </Badge>
            )}
            <span className="text-xs text-white/50">
              {bird.photoCount} {bird.photoCount === 1 ? "photo" : "photos"}
            </span>
          </div>
        </div>
      </div>
    </Link>
  ),
);

BirdCard.displayName = "BirdCard";

export function BirdGrid({ birds }: { birds: BirdCardData[] }) {
  const [hovered, setHovered] = useState<number | null>(null);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 w-full">
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
