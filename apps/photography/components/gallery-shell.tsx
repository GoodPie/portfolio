"use client";

import { useState, useMemo, useEffect, startTransition } from "react";
import { Button } from "@goodpie/ui/components/button";
import Link from "next/link";
import { PhotoGrid } from "@/components/photo-grid";
import type { PhotoCard } from "@/components/photo-grid";
import { FilterBar } from "@/components/filter-bar";
import {
  type FilterOption,
  filterPhotoCards,
  getActiveFilterNames,
} from "@/lib/photos";

interface GalleryShellProps {
  allCards: PhotoCard[];
  categories: FilterOption[];
  birds: FilterOption[];
  initialCategory: string | null;
  initialBird: string | null;
}

export function GalleryShell({
  allCards,
  categories,
  birds,
  initialCategory,
  initialBird,
}: GalleryShellProps) {
  const [activeCategory, setActiveCategory] = useState(initialCategory);
  const [activeBird, setActiveBird] = useState(initialBird);

  const filtered = useMemo(
    () =>
      filterPhotoCards(allCards, {
        categoryId: activeCategory ?? undefined,
        birdId: activeBird ?? undefined,
      }),
    [allCards, activeCategory, activeBird],
  );

  // Sync filter state to URL without triggering navigation
  useEffect(() => {
    const params = new URLSearchParams();
    if (activeCategory) params.set("category", activeCategory);
    if (activeBird) params.set("bird", activeBird);
    const qs = params.toString();
    const url = qs ? `${window.location.pathname}?${qs}` : window.location.pathname;
    window.history.replaceState(null, "", url);
  }, [activeCategory, activeBird]);

  function handleFilterChange(key: string, value: string | null) {
    startTransition(() => {
      if (key === "category") setActiveCategory(value);
      if (key === "bird") setActiveBird(value);
    });
  }

  function handleClearAll() {
    startTransition(() => {
      setActiveCategory(null);
      setActiveBird(null);
    });
  }

  const showFilterBar = categories.length > 0 || birds.length > 0;
  const hasFilters = activeCategory || activeBird;
  const activeFilterNames = getActiveFilterNames(categories, birds, {
    categoryId: activeCategory ?? undefined,
    birdId: activeBird ?? undefined,
  });

  return (
    <>
      {showFilterBar && (
        <FilterBar
          categories={categories}
          birds={birds}
          activeCategory={activeCategory}
          activeBird={activeBird}
          onFilterChange={handleFilterChange}
          onClearAll={handleClearAll}
        />
      )}

      {allCards.length === 0 ? (
        <div className="text-center py-24">
          <p className="text-muted-foreground">No photos yet.</p>
          <Button asChild variant="link" className="mt-4">
            <Link href="/admin">
              Open Admin to upload your first photo &rarr;
            </Link>
          </Button>
        </div>
      ) : filtered.length > 0 ? (
        <PhotoGrid photos={filtered} />
      ) : hasFilters ? (
        <div className="text-center py-24">
          <p className="text-muted-foreground">
            No photos found for {activeFilterNames.join(" + ")}.
          </p>
          <Button asChild variant="link" className="mt-4">
            <button onClick={handleClearAll}>Clear filters &rarr;</button>
          </Button>
        </div>
      ) : null}
    </>
  );
}
