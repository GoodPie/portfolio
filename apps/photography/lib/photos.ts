import { getImageUrl, getLqip } from "./payload";
import type { PhotoDoc } from "./payload";
import type { PhotoCard } from "@/components/photo-grid";

export interface FilterOption {
  id: string;
  label: string;
  count: number;
}

/** Extract the string ID from a Payload relation (populated object or raw ID). */
export function getRelationId(
  relation: { id: string | number } | string | number | null | undefined,
): string | null {
  if (relation === null || relation === undefined) return null;
  if (typeof relation === "object") return String(relation.id);
  return String(relation);
}

/** Convert a PhotoDoc to a PhotoCard for use in PhotoGrid. */
export function toPhotoCard(photo: PhotoDoc): PhotoCard {
  return {
    photoKey: String(photo.id),
    title: photo.caption || photo.title,
    src: getImageUrl(photo, 1200),
    sizes: "(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw",
    caption: photo.caption ?? undefined,
    exif: photo.exif
      ? {
          FocalLength: photo.exif.focalLength ?? undefined,
          FNumber: photo.exif.aperture ?? undefined,
          ISO: photo.exif.iso ?? undefined,
          ExposureTime: photo.exif.shutterSpeed ?? undefined,
          LensModel: photo.exif.lensModel ?? undefined,
        }
      : undefined,
    lqip: getLqip(photo),
    width: photo.width ?? undefined,
    height: photo.height ?? undefined,
    sizeUrls: {
      thumbnail: photo.sizes?.thumbnail?.url ?? undefined,
      card: photo.sizes?.card?.url ?? undefined,
      large: photo.sizes?.large?.url ?? undefined,
      xl: photo.sizes?.xl?.url ?? undefined,
    },
    birdId: getRelationId(photo.bird) ?? undefined,
    categoryId: getRelationId(photo.category) ?? undefined,
  };
}

/** Build sorted filter options with counts from an unfiltered photo set. */
export function buildFilterOptions(photos: PhotoDoc[]) {
  const categoryMap = new Map<string, { label: string; count: number }>();
  const birdMap = new Map<string, { label: string; count: number }>();

  for (const photo of photos) {
    if (photo.category && typeof photo.category === "object") {
      const id = String(photo.category.id);
      const existing = categoryMap.get(id);
      if (existing) {
        existing.count++;
      } else {
        categoryMap.set(id, { label: photo.category.title || "Untitled", count: 1 });
      }
    }

    if (photo.bird && typeof photo.bird === "object") {
      const id = String(photo.bird.id);
      const existing = birdMap.get(id);
      if (existing) {
        existing.count++;
      } else {
        birdMap.set(id, { label: photo.bird.name || "Unknown", count: 1 });
      }
    }
  }

  const toSorted = (map: Map<string, { label: string; count: number }>): FilterOption[] =>
    [...map.entries()]
      .map(([id, { label, count }]) => ({ id, label, count }))
      .sort((a, b) => b.count - a.count);

  return { categories: toSorted(categoryMap), birds: toSorted(birdMap) };
}

/** Filter photos by category and/or bird ID (AND logic). */
export function filterPhotos(
  photos: PhotoDoc[],
  filters: { categoryId?: string; birdId?: string },
): PhotoDoc[] {
  const { categoryId, birdId } = filters;
  if (!categoryId && !birdId) return photos;

  return photos.filter((photo) => {
    if (categoryId && getRelationId(photo.category) !== categoryId) return false;
    if (birdId && getRelationId(photo.bird) !== birdId) return false;
    return true;
  });
}

/** Filter PhotoCards by flat string IDs (AND logic). */
export function filterPhotoCards(
  cards: PhotoCard[],
  filters: { categoryId?: string; birdId?: string },
): PhotoCard[] {
  const { categoryId, birdId } = filters;
  if (!categoryId && !birdId) return cards;

  return cards.filter((card) => {
    if (categoryId && card.categoryId !== categoryId) return false;
    if (birdId && card.birdId !== birdId) return false;
    return true;
  });
}

/** Resolve active filter IDs to human-readable labels. */
export function getActiveFilterNames(
  categories: FilterOption[],
  birds: FilterOption[],
  filters: { categoryId?: string; birdId?: string },
): string[] {
  const names: string[] = [];
  if (filters.categoryId) {
    const cat = categories.find((c) => c.id === filters.categoryId);
    if (cat) names.push(cat.label);
  }
  if (filters.birdId) {
    const bird = birds.find((b) => b.id === filters.birdId);
    if (bird) names.push(bird.label);
  }
  return names;
}
