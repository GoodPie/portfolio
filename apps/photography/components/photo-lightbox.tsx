"use client";

import { useCallback, useEffect } from "react";
import ReactDOM from "react-dom";
import { Dialog, DialogClose, DialogContent, DialogTitle } from "@goodpie/ui/components/dialog";
import { Button } from "@goodpie/ui/components/button";
import { ChevronLeft, ChevronRight, Expand, X } from "lucide-react";
import Link from "next/link";
import type { PhotoCard } from "./photo-grid";

interface PhotoLightboxProps {
  photos: PhotoCard[];
  selectedIndex: number | null;
  onClose: () => void;
  onNavigate: (index: number) => void;
}

function LightboxExif({ card }: { card: PhotoCard }) {
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
      <div className="text-sm font-medium text-white">{card.caption || card.title}</div>
      {exifParts.length > 0 && <div className="text-xs text-white/60">{exifParts.join(" · ")}</div>}
      {exif?.LensModel && <div className="text-xs text-white/40">{exif.LensModel}</div>}
    </div>
  );
}

export function PhotoLightbox({ photos, selectedIndex, onClose, onNavigate }: PhotoLightboxProps) {
  const isOpen = selectedIndex !== null;
  const photo = selectedIndex !== null ? photos[selectedIndex] : null;

  const goNext = useCallback(() => {
    if (selectedIndex === null) return;
    onNavigate((selectedIndex + 1) % photos.length);
  }, [selectedIndex, photos.length, onNavigate]);

  const goPrev = useCallback(() => {
    if (selectedIndex === null) return;
    onNavigate((selectedIndex - 1 + photos.length) % photos.length);
  }, [selectedIndex, photos.length, onNavigate]);

  useEffect(() => {
    if (!isOpen) return;
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "ArrowRight") {
        e.preventDefault();
        goNext();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        goPrev();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, goNext, goPrev]);

  // Preload adjacent images for smoother navigation
  useEffect(() => {
    if (selectedIndex === null || photos.length <= 1) return;
    const nextIdx = (selectedIndex + 1) % photos.length;
    const prevIdx = (selectedIndex - 1 + photos.length) % photos.length;
    for (const idx of [nextIdx, prevIdx]) {
      const p = photos[idx];
      const src = p?.sizeUrls?.xl ?? p?.sizeUrls?.large ?? p?.src;
      if (src) ReactDOM.preload(src, { as: "image" });
    }
  }, [selectedIndex, photos]);

  const imageSrc = photo?.sizeUrls?.xl ?? photo?.sizeUrls?.large ?? photo?.src;

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent
        showCloseButton={false}
        overlayClassName="bg-transparent"
        className="inset-0 top-0 left-0 flex h-dvh max-w-none translate-x-0 translate-y-0 items-center justify-center border-none bg-black/95 p-0 sm:max-w-none"
        aria-describedby={undefined}
      >
        <DialogTitle className="sr-only">{photo?.caption || photo?.title || "Photo"}</DialogTitle>

        {/* Close */}
        <DialogClose asChild>
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 z-10 text-white hover:bg-white/10"
          >
            <X className="size-5" />
            <span className="sr-only">Close</span>
          </Button>
        </DialogClose>

        {/* Previous */}
        {photos.length > 1 && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-1/2 left-4 z-10 -translate-y-1/2 text-white hover:bg-white/10"
            onClick={goPrev}
          >
            <ChevronLeft className="size-6" />
            <span className="sr-only">Previous photo</span>
          </Button>
        )}

        {/* Next */}
        {photos.length > 1 && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-1/2 right-4 z-10 -translate-y-1/2 text-white hover:bg-white/10"
            onClick={goNext}
          >
            <ChevronRight className="size-6" />
            <span className="sr-only">Next photo</span>
          </Button>
        )}

        {/* Image */}
        {photo && (
          <img
            key={selectedIndex}
            src={imageSrc}
            alt={photo.caption || photo.title}
            width={photo.width}
            height={photo.height}
            className="max-h-[85vh] max-w-[90vw] rounded-lg object-contain"
            {...(photo.lqip && {
              style: {
                backgroundImage: `url(${photo.lqip})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              },
            })}
          />
        )}

        {/* Bottom bar */}
        {photo && (
          <div className="absolute right-0 bottom-0 left-0 flex items-end justify-between px-6 pb-6">
            <LightboxExif card={photo} />
            <div className="flex items-center gap-3">
              {photos.length > 1 && (
                <span className="text-xs text-white/50">
                  {(selectedIndex ?? 0) + 1} / {photos.length}
                </span>
              )}
              {photos.length > 1 && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white hover:bg-white/10"
                  asChild
                >
                  <Link href={`/photo/${photo.photoKey}`}>
                    <Expand className="size-4" />
                    <span className="sr-only">View full details</span>
                  </Link>
                </Button>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
