"use client";

import { useState } from "react";
import type { PhotoCard } from "./photo-grid";
import { PhotoLightbox } from "./photo-lightbox";

interface PhotoDetailImageProps {
  photo: PhotoCard;
  src: string;
  srcSet?: string;
  sizes?: string;
  alt: string;
  width?: number;
  height?: number;
  lqip?: string;
}

export function PhotoDetailImage({
  photo,
  src,
  srcSet,
  sizes,
  alt,
  width,
  height,
  lqip,
}: PhotoDetailImageProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        className="cursor-zoom-in"
        aria-label={`Open ${alt} in lightbox`}
        onClick={() => setOpen(true)}
      >
        <img
          src={src}
          srcSet={srcSet}
          sizes={sizes}
          alt={alt}
          width={width}
          height={height}
          fetchPriority="high"
          decoding="async"
          className="h-auto max-h-[85vh] w-full rounded-lg object-contain"
          {...(lqip && {
            style: {
              backgroundImage: `url(${lqip})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            },
          })}
        />
      </button>
      <PhotoLightbox
        photos={[photo]}
        selectedIndex={open ? 0 : null}
        onClose={() => setOpen(false)}
        onNavigate={() => {}}
      />
    </>
  );
}
