import type { PhotoDoc } from "./payload";

export interface FilterOption {
  id: string;
  label: string;
  count: number;
}

/** Extract the string ID from a Payload relation (populated object or raw ID). */
function getRelationId(
  relation: { id: string | number } | string | number | null | undefined,
): string | null {
  if (relation == null) return null;
  if (typeof relation === "object") return String(relation.id);
  return String(relation);
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
