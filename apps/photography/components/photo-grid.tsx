"use client";

import { ViewTransition, useState } from "react";
import Link from "next/link";
import { cn } from "@goodpie/ui/lib/utils";

interface PhotoCard {
  photoKey: string;
  title: string;
  src: string;
  srcSet?: string;
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

export function PhotoGrid({ photos }: { photos: PhotoCard[] }) {
  const [hovered, setHovered] = useState<number | null>(null);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-10 w-full">
      {photos.map((photo, index) => (
        <Link
          key={photo.photoKey}
          href={`/photo/${photo.photoKey}`}
          className="block"
        >
          <ViewTransition name={`photo-${photo.photoKey}`}>
            <div
              onMouseEnter={() => setHovered(index)}
              onMouseLeave={() => setHovered(null)}
              className={cn(
                "rounded-lg relative bg-muted overflow-hidden h-60 md:h-96 w-full transition-all duration-300 ease-out",
                hovered !== null && hovered !== index && "blur-sm scale-[0.98]"
              )}
            >
              <img
                src={photo.src}
                srcSet={photo.srcSet}
                sizes={photo.sizes}
                alt={photo.title}
                width={photo.width}
                height={photo.height}
                loading={index < 6 ? "eager" : "lazy"}
                fetchPriority={index === 0 ? "high" : undefined}
                decoding="async"
                className="object-cover absolute inset-0 w-full h-full"
                {...(photo.lqip && {
                  style: {
                    backgroundImage: `url(${photo.lqip})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  },
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
