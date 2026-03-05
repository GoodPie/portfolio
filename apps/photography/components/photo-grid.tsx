"use client";

import { cn } from "@goodpie/ui/lib/utils";
import Image, { type ImageLoaderProps } from "next/image";
import Link from "next/link";
import { ViewTransition, useState } from "react";

/** Payload image size breakpoints in ascending order */
const SIZE_BREAKPOINTS = [
  { key: "thumbnail", width: 400 },
  { key: "card", width: 800 },
  { key: "large", width: 1200 },
  { key: "xl", width: 1800 },
] as const;

type SizeKey = (typeof SIZE_BREAKPOINTS)[number]["key"];

export interface PhotoCard {
  photoKey: string;
  title: string;
  src: string;
  sizes?: string;
  caption?: string;
  exif?: {
    FocalLength?: number;
    FNumber?: number;
    ISO?: number;
    ExposureTime?: number;
    LensModel?: string;
  };
  lqip?: string;
  width?: number;
  height?: number;
  /** Map of Payload size key → URL for the custom loader */
  sizeUrls?: Partial<Record<SizeKey, string>>;
  dateTaken?: string;
  /** Relation ID for client-side filtering */
  birdId?: string;
  /** Relation ID for client-side filtering */
  categoryId?: string;
}

/**
 * Creates a loader that maps Next.js requested widths to Payload's pre-sized URLs.
 * Falls back to the default src if no matching size is found.
 */
function makePayloadLoader(photo: PhotoCard) {
  return ({ width }: ImageLoaderProps): string => {
    if (!photo.sizeUrls) return photo.src;

    // Find the smallest Payload size that covers the requested width
    for (const { key, width: bpWidth } of SIZE_BREAKPOINTS) {
      if (bpWidth >= width && photo.sizeUrls[key]) {
        return photo.sizeUrls[key];
      }
    }

    // Fallback to largest available or default src
    return photo.sizeUrls.xl ?? photo.sizeUrls.large ?? photo.src;
  };
}

function ExifOverlay({ card }: { card: PhotoCard }) {
  const { exif } = card;
  const exifParts = exif
    ? [
        exif.FocalLength && `${exif.FocalLength}mm`,
        exif.FNumber && `f/${exif.FNumber}`,
        exif.ExposureTime &&
          `${exif.ExposureTime >= 1 ? exif.ExposureTime : `1/${Math.round(1 / exif.ExposureTime)}`}s`,
        exif.ISO && `ISO ${exif.ISO}`,
      ].filter(Boolean)
    : [];

  return (
    <div className="flex flex-col gap-1">
      <div className="text-overlay-foreground text-xl font-medium md:text-2xl">
        {card.caption || card.title}
      </div>
      {exifParts.length > 0 && (
        <div className="text-overlay-muted text-xs">{exifParts.join(" · ")}</div>
      )}
      {card.dateTaken && (
        <div className="text-overlay-dim text-xs">
          {new Date(card.dateTaken).toLocaleDateString("en-NZ", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </div>
      )}
    </div>
  );
}

export function PhotoGrid({
  photos,
  linkQuery,
  onPhotoClick,
}: {
  photos: PhotoCard[];
  /** Optional query string to append to photo links (e.g., "from=birds/tui") */
  linkQuery?: string;
  /** When provided, clicking a photo calls this instead of navigating to the detail page */
  onPhotoClick?: (index: number) => void;
}) {
  const [hovered, setHovered] = useState<number | null>(null);

  return (
    <div className="w-full columns-1 gap-10 sm:columns-2 md:columns-3">
      {photos.map((photo, index) => {
        const card = (
          <ViewTransition name={`photo-${photo.photoKey}`} enter="photo-filter" exit="photo-filter">
            <div
              onMouseEnter={() => setHovered(index)}
              onMouseLeave={() => setHovered(null)}
              className={cn(
                "bg-muted relative w-full overflow-hidden rounded-lg transition-all duration-300 ease-out",
                hovered !== null && hovered !== index && "scale-[0.98] blur-sm",
              )}
              style={{
                aspectRatio:
                  photo.width && photo.height ? `${photo.width} / ${photo.height}` : undefined,
              }}
            >
              <Image
                src={photo.src}
                loader={makePayloadLoader(photo)}
                alt={photo.title}
                width={photo.width ?? 1200}
                height={photo.height ?? 800}
                sizes={photo.sizes}
                priority={index < 2}
                loading={index < 2 ? undefined : "lazy"}
                className="h-full w-full object-cover"
                {...(photo.lqip && {
                  placeholder: "blur" as const,
                  blurDataURL: photo.lqip,
                })}
              />
              <div
                className={cn(
                  "absolute inset-0 flex items-end bg-black/50 px-4 py-8 transition-opacity duration-300",
                  hovered === index ? "opacity-100" : "opacity-0",
                )}
              >
                <ExifOverlay card={photo} />
              </div>
            </div>
          </ViewTransition>
        );

        return onPhotoClick ? (
          <button
            key={photo.photoKey}
            type="button"
            className="mb-10 block w-full break-inside-avoid text-left"
            onClick={() => onPhotoClick(index)}
          >
            {card}
          </button>
        ) : (
          <Link
            key={photo.photoKey}
            href={linkQuery ? `/photo/${photo.photoKey}?${linkQuery}` : `/photo/${photo.photoKey}`}
            className="mb-10 block break-inside-avoid"
          >
            {card}
          </Link>
        );
      })}
    </div>
  );
}
