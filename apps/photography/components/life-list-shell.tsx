"use client";

import { useState, useMemo, useEffect, startTransition } from "react";
import type { BirdCardData } from "@/components/bird-grid";
import type { SortOption, ViewMode } from "@/components/life-list-toolbar";
import { BirdGrid } from "@/components/bird-grid";
import { LifeListToolbar } from "@/components/life-list-toolbar";
import { TaxonomyGroupedGrid } from "@/components/taxonomy-grouped-grid";

interface LifeListShellProps {
  birds: BirdCardData[];
  availableYears: number[];
  availableStatuses: { status: string; count: number }[];
  initialSearch?: string;
  initialStatus?: string;
  initialSort?: string;
  initialYear?: string;
  initialView?: string;
}

function isValidSort(s: string | undefined): s is SortOption {
  return s === "name" || s === "photos" || s === "recent";
}

function isValidView(v: string | undefined): v is ViewMode {
  return v === "grid" || v === "taxonomy";
}

export function LifeListShell({
  birds,
  availableYears,
  availableStatuses,
  initialSearch,
  initialStatus,
  initialSort,
  initialYear,
  initialView,
}: LifeListShellProps) {
  const [search, setSearch] = useState(initialSearch ?? "");
  const [statusFilter, setStatusFilter] = useState<string | null>(initialStatus ?? null);
  const [sort, setSort] = useState<SortOption>(isValidSort(initialSort) ? initialSort : "name");
  const [yearFilter, setYearFilter] = useState<number | null>(
    initialYear ? parseInt(initialYear, 10) || null : null,
  );
  const [viewMode, setViewMode] = useState<ViewMode>(
    isValidView(initialView) ? initialView : "grid",
  );

  // Filter + sort pipeline
  const filtered = useMemo(() => {
    let result = birds;

    // Text search
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (b) =>
          b.name.toLowerCase().includes(q) ||
          (b.scientificName && b.scientificName.toLowerCase().includes(q)),
      );
    }

    // Conservation status filter
    if (statusFilter) {
      result = result.filter((b) => b.conservationStatus === statusFilter);
    }

    // Year filter
    if (yearFilter) {
      result = result.filter(
        (b) => b.firstSeen && new Date(b.firstSeen).getFullYear() === yearFilter,
      );
    }

    // Sort
    result = [...result].sort((a, b) => {
      switch (sort) {
        case "photos":
          return b.photoCount - a.photoCount;
        case "recent":
          if (!a.firstSeen && !b.firstSeen) return 0;
          if (!a.firstSeen) return 1;
          if (!b.firstSeen) return -1;
          return b.firstSeen.localeCompare(a.firstSeen);
        default:
          return a.name.localeCompare(b.name);
      }
    });

    return result;
  }, [birds, search, statusFilter, yearFilter, sort]);

  // Sync filter state to URL
  useEffect(() => {
    const params = new URLSearchParams();
    if (search) params.set("q", search);
    if (statusFilter) params.set("status", statusFilter);
    if (sort !== "name") params.set("sort", sort);
    if (yearFilter) params.set("year", String(yearFilter));
    if (viewMode !== "grid") params.set("view", viewMode);
    const qs = params.toString();
    const url = qs ? `${window.location.pathname}?${qs}` : window.location.pathname;
    window.history.replaceState(null, "", url);
  }, [search, statusFilter, sort, yearFilter, viewMode]);

  const hasFilters = search || statusFilter || yearFilter;

  function clearAll() {
    startTransition(() => {
      setSearch("");
      setStatusFilter(null);
      setYearFilter(null);
      setSort("name");
    });
  }

  return (
    <>
      <LifeListToolbar
        search={search}
        onSearchChange={(v) => startTransition(() => setSearch(v))}
        statusFilter={statusFilter}
        onStatusFilterChange={(v) => startTransition(() => setStatusFilter(v))}
        sort={sort}
        onSortChange={(v) => startTransition(() => setSort(v))}
        yearFilter={yearFilter}
        onYearFilterChange={(v) => startTransition(() => setYearFilter(v))}
        viewMode={viewMode}
        onViewModeChange={(v) => startTransition(() => setViewMode(v))}
        availableYears={availableYears}
        availableStatuses={availableStatuses}
        resultCount={filtered.length}
        totalCount={birds.length}
      />

      {filtered.length > 0 ? (
        viewMode === "taxonomy" ? (
          <TaxonomyGroupedGrid birds={filtered} />
        ) : (
          <BirdGrid birds={filtered} />
        )
      ) : hasFilters ? (
        <div className="py-24 text-center">
          <p className="text-muted-foreground">No species match your filters.</p>
          <button
            onClick={clearAll}
            className="text-primary hover:text-primary/80 mt-4 text-sm underline underline-offset-4 transition-colors"
          >
            Clear all filters
          </button>
        </div>
      ) : (
        <div className="py-24 text-center">
          <p className="text-muted-foreground">No species yet.</p>
        </div>
      )}
    </>
  );
}
