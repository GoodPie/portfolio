"use client";

import { ViewTransition, useState } from "react";
import Image, { type ImageLoaderProps } from "next/image";
import Link from "next/link";
import { cn } from "@goodpie/ui/lib/utils";

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
      <div className="text-xl md:text-2xl font-medium text-overlay-foreground">
        {card.caption || card.title}
      </div>
      {exifParts.length > 0 && (
        <div className="text-xs text-overlay-muted">{exifParts.join(" · ")}</div>
      )}
      {exif?.LensModel && (
        <div className="text-xs text-overlay-dim">{exif.LensModel}</div>
      )}
    </div>
  );
}

export function PhotoGrid({
  photos,
  linkQuery,
}: {
  photos: PhotoCard[];
  /** Optional query string to append to photo links (e.g., "from=birds/tui") */
  linkQuery?: string;
}) {
  const [hovered, setHovered] = useState<number | null>(null);

  return (
    <div className="columns-1 sm:columns-2 md:columns-3 gap-10 w-full">
      {photos.map((photo, index) => (
        <Link
          key={photo.photoKey}
          href={linkQuery ? `/photo/${photo.photoKey}?${linkQuery}` : `/photo/${photo.photoKey}`}
          className="block mb-10 break-inside-avoid"
        >
          <ViewTransition name={`photo-${photo.photoKey}`} enter="photo-filter" exit="photo-filter">
            <div
              onMouseEnter={() => setHovered(index)}
              onMouseLeave={() => setHovered(null)}
              className={cn(
                "rounded-lg relative bg-muted overflow-hidden w-full transition-all duration-300 ease-out",
                hovered !== null && hovered !== index && "blur-sm scale-[0.98]"
              )}
              style={{
                aspectRatio:
                  photo.width && photo.height
                    ? `${photo.width} / ${photo.height}`
                    : undefined,
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
                className="object-cover w-full h-full"
                {...(photo.lqip && {
                  placeholder: "blur" as const,
                  blurDataURL: photo.lqip,
                })}
              />
              <div
                className={cn(
                  "absolute inset-0 bg-black/50 flex items-end py-8 px-4 transition-opacity duration-300",
                  hovered === index ? "opacity-100" : "opacity-0"
                )}
              >
                <ExifOverlay card={photo} />
              </div>
            </div>
          </ViewTransition>
        </Link>
      ))}
    </div>
  );
}
