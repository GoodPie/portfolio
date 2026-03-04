import { Badge } from "@goodpie/ui/components/badge";
import { cn } from "@goodpie/ui/lib/utils";
import type { BirdDoc } from "@/lib/payload";
import type { PhotoDoc } from "@/lib/payload";
import { conservationStatusBgColors } from "@/lib/bird-utils";
import { formatShortDate } from "@/lib/format";
import { resolveRelation, getImageUrl } from "@/lib/payload";

interface BirdHeroProps {
  bird: BirdDoc;
  photoCount: number;
  firstSeen?: string | null;
}

export function BirdHero({ bird, photoCount, firstSeen }: BirdHeroProps) {
  const coverPhoto = resolveRelation(bird.coverImage as PhotoDoc | string | number | null);
  const coverUrl = coverPhoto ? getImageUrl(coverPhoto, 1800) : null;

  return (
    <section className="relative mb-6 w-full overflow-hidden rounded-xl">
      {coverUrl ? (
        <div className="relative h-56 sm:h-72 md:h-96">
          <img
            src={coverUrl}
            alt={`${bird.name} cover photo`}
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
          <div className="absolute bottom-0 left-0 flex flex-col gap-2 p-6 md:p-10">
            <h1 className="font-serif text-3xl font-medium tracking-tight text-white md:text-5xl">
              {bird.name}
            </h1>
            {bird.scientificName && (
              <p className="text-base text-white/70 italic md:text-lg">{bird.scientificName}</p>
            )}
            <div className="mt-1 flex items-center gap-3">
              {bird.conservationStatus && (
                <Badge
                  className={cn(
                    "border-0 text-xs font-medium",
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
          <h1 className="font-serif text-3xl font-medium tracking-tight md:text-5xl">
            {bird.name}
          </h1>
          {bird.scientificName && (
            <p className="text-muted-foreground mt-2 text-base italic md:text-lg">
              {bird.scientificName}
            </p>
          )}
          <div className="mt-3 flex items-center gap-3">
            {bird.conservationStatus && (
              <Badge
                className={cn(
                  "border-0 text-xs font-medium",
                  conservationStatusBgColors[bird.conservationStatus],
                )}
              >
                {bird.conservationStatus}
              </Badge>
            )}
            <span className="text-muted-foreground text-sm">
              {photoCount} {photoCount === 1 ? "photo" : "photos"}
            </span>
            {firstSeen && (
              <span className="text-muted-foreground/60 text-sm">
                · First seen {formatShortDate(firstSeen)}
              </span>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
