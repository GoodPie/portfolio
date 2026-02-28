"use client";

import { FocusCards } from "@goodpie/ui/components/focus-cards";

interface PhotoCardData {
  title: string;
  src: string;
  caption?: string;
  exif?: {
    FocalLength?: number;
    FNumber?: number;
    ISO?: number;
    ExposureTime?: number;
    LensModel?: string;
  };
}

function ExifOverlay({ card }: { card: PhotoCardData }) {
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
      <div className="text-xl md:text-2xl font-medium bg-clip-text text-transparent bg-gradient-to-b from-neutral-50 to-neutral-200">
        {card.caption || card.title}
      </div>
      {exifParts.length > 0 && (
        <div className="text-xs text-neutral-400">{exifParts.join(" · ")}</div>
      )}
      {exif?.LensModel && (
        <div className="text-xs text-neutral-500">{exif.LensModel}</div>
      )}
    </div>
  );
}

export function PhotoFocusCards({ photos }: { photos: PhotoCardData[] }) {
  const cards = photos.map((photo) => ({
    title: photo.caption || photo.title,
    src: photo.src,
    content: <ExifOverlay card={photo} />,
  }));

  return <FocusCards cards={cards} />;
}
