import { Badge } from "@goodpie/ui/components/badge";
import { cn } from "@goodpie/ui/lib/utils";
import type { BirdDoc } from "@/lib/payload";
import { resolveRelation, getImageUrl } from "@/lib/payload";
import { conservationStatusBgColors } from "@/lib/bird-utils";
import { formatShortDate } from "@/lib/format";
import type { PhotoDoc } from "@/lib/payload";

interface BirdHeroProps {
  bird: BirdDoc;
  photoCount: number;
  firstSeen?: string | null;
}

export function BirdHero({ bird, photoCount, firstSeen }: BirdHeroProps) {
  const coverPhoto = resolveRelation(bird.coverImage as PhotoDoc | string | number | null);
  const coverUrl = coverPhoto ? getImageUrl(coverPhoto, 1800) : null;

  return (
    <section className="relative w-full rounded-xl overflow-hidden mb-6">
      {coverUrl ? (
        <div className="relative h-56 sm:h-72 md:h-96">
          <img
            src={coverUrl}
            alt={`${bird.name} cover photo`}
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
          <div className="absolute bottom-0 left-0 p-6 md:p-10 flex flex-col gap-2">
            <h1 className="text-3xl md:text-5xl font-serif font-medium tracking-tight text-white">
              {bird.name}
            </h1>
            {bird.scientificName && (
              <p className="text-base md:text-lg text-white/70 italic">{bird.scientificName}</p>
            )}
            <div className="flex items-center gap-3 mt-1">
              {bird.conservationStatus && (
                <Badge
                  className={cn(
                    "text-xs font-medium border-0",
                    conservationStatusBgColors[bird.conservationStatus],
                  )}
                >
                  {bird.conservationStatus}
                </Badge>
              )}
              <span className="text-sm text-white/60">
                {photoCount} {photoCount === 1 ? "photo" : "photos"}
              </span>
              {firstSeen && (
                <span className="text-sm text-white/50">
                  · First seen {formatShortDate(firstSeen)}
                </span>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="pt-4 md:pt-8">
          <h1 className="text-3xl md:text-5xl font-serif font-medium tracking-tight">
            {bird.name}
          </h1>
          {bird.scientificName && (
            <p className="text-base md:text-lg text-muted-foreground italic mt-2">
              {bird.scientificName}
            </p>
          )}
          <div className="flex items-center gap-3 mt-3">
            {bird.conservationStatus && (
              <Badge
                className={cn(
                  "text-xs font-medium border-0",
                  conservationStatusBgColors[bird.conservationStatus],
                )}
              >
                {bird.conservationStatus}
              </Badge>
            )}
            <span className="text-sm text-muted-foreground">
              {photoCount} {photoCount === 1 ? "photo" : "photos"}
            </span>
            {firstSeen && (
              <span className="text-sm text-muted-foreground/60">
                · First seen {formatShortDate(firstSeen)}
              </span>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
