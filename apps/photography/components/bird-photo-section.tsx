"use client";

import { useState } from "react";
import type { PhotoCard } from "./photo-grid";
import { PhotoGrid } from "./photo-grid";
import { PhotoLightbox } from "./photo-lightbox";

export function BirdPhotoSection({ photos }: { photos: PhotoCard[] }) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  return (
    <>
      <PhotoGrid photos={photos} onPhotoClick={(index) => setSelectedIndex(index)} />
      <PhotoLightbox
        photos={photos}
        selectedIndex={selectedIndex}
        onClose={() => setSelectedIndex(null)}
        onNavigate={setSelectedIndex}
      />
    </>
  );
}
