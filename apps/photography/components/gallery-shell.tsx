"use client";

import { useState, useMemo, useEffect, startTransition } from "react";
import { Button } from "@goodpie/ui/components/button";
import Link from "next/link";
import { PhotoGrid } from "@/components/photo-grid";
import type { PhotoCard } from "@/components/photo-grid";
import { FilterBar } from "@/components/filter-bar";
import type { FilterOption } from "@/lib/photos";

interface GalleryShellProps {
  allCards: PhotoCard[];
  categories: FilterOption[];
  initialCategory: string | null;
}

export function GalleryShell({
  allCards,
  categories,
  initialCategory,
}: GalleryShellProps) {
  const [activeCategory, setActiveCategory] = useState(initialCategory);

  const filtered = useMemo(() => {
    if (!activeCategory) return allCards;
    return allCards.filter((card) => card.categoryId === activeCategory);
  }, [allCards, activeCategory]);

  // Sync filter state to URL without triggering navigation
  useEffect(() => {
    const params = new URLSearchParams();
    if (activeCategory) params.set("category", activeCategory);
    const qs = params.toString();
    const url = qs ? `${window.location.pathname}?${qs}` : window.location.pathname;
    window.history.replaceState(null, "", url);
  }, [activeCategory]);

  function handleFilterChange(value: string | null) {
    startTransition(() => {
      setActiveCategory(value);
    });
  }

  const showFilterBar = categories.length > 0;

  return (
    <>
      {showFilterBar && (
        <FilterBar
          categories={categories}
          activeCategory={activeCategory}
          onFilterChange={handleFilterChange}
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
      ) : activeCategory ? (
        <div className="text-center py-24">
          <p className="text-muted-foreground">
            No photos found for this category.
          </p>
          <Button asChild variant="link" className="mt-4">
            <button onClick={() => handleFilterChange(null)}>Clear filter &rarr;</button>
          </Button>
        </div>
      ) : null}
    </>
  );
}
