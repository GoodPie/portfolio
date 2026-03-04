"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Badge } from "@goodpie/ui/components/badge";
import { cn } from "@goodpie/ui/lib/utils";
import { conservationStatusBgColors } from "@/lib/bird-utils";

export type SortOption = "name" | "photos" | "recent";
export type ViewMode = "grid" | "taxonomy";

interface LifeListToolbarProps {
  search: string;
  onSearchChange: (value: string) => void;
  statusFilter: string | null;
  onStatusFilterChange: (value: string | null) => void;
  sort: SortOption;
  onSortChange: (value: SortOption) => void;
  yearFilter: number | null;
  onYearFilterChange: (value: number | null) => void;
  viewMode: ViewMode;
  onViewModeChange: (value: ViewMode) => void;
  availableYears: number[];
  availableStatuses: { status: string; count: number }[];
  resultCount: number;
  totalCount: number;
}

const sortOptions: { value: SortOption; label: string }[] = [
  { value: "name", label: "Name" },
  { value: "photos", label: "Most Photos" },
  { value: "recent", label: "Recently Seen" },
];

export function LifeListToolbar({
  search,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  sort,
  onSortChange,
  yearFilter,
  onYearFilterChange,
  viewMode,
  onViewModeChange,
  availableYears,
  availableStatuses,
  resultCount,
  totalCount,
}: LifeListToolbarProps) {
  const [inputValue, setInputValue] = useState(search);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(null);

  // Sync when the parent resets search (e.g. clearAll)
  useEffect(() => {
    setInputValue(search);
  }, [search]);

  const handleSearch = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setInputValue(value);
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        onSearchChange(value);
      }, 200);
    },
    [onSearchChange],
  );

  return (
    <div className="mb-8 flex flex-col gap-4">
      {/* Search + View Toggle row */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z"
            />
          </svg>
          <input
            type="text"
            value={inputValue}
            onChange={handleSearch}
            placeholder="Search species..."
            className="w-full rounded-md border border-border/40 bg-muted/30 py-2 pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-primary/50"
          />
        </div>

        <div className="flex items-center rounded-md border border-border/40 overflow-hidden">
          <button
            onClick={() => onViewModeChange("grid")}
            className={cn(
              "px-3 py-2 text-xs font-medium transition-colors",
              viewMode === "grid"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            Grid
          </button>
          <button
            onClick={() => onViewModeChange("taxonomy")}
            className={cn(
              "px-3 py-2 text-xs font-medium transition-colors",
              viewMode === "taxonomy"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            Taxonomy
          </button>
        </div>
      </div>

      {/* Sort badges */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs text-muted-foreground uppercase tracking-wider mr-1">
          Sort
        </span>
        {sortOptions.map((option) => (
          <Badge
            key={option.value}
            asChild
            variant={sort === option.value ? "default" : "outline"}
            className="cursor-pointer hover:opacity-80"
          >
            <button onClick={() => onSortChange(option.value)}>
              {option.label}
            </button>
          </Badge>
        ))}
      </div>

      {/* Conservation status filter */}
      {availableStatuses.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-muted-foreground uppercase tracking-wider mr-1">
            Status
          </span>
          <Badge
            asChild
            variant={!statusFilter ? "default" : "outline"}
            className="cursor-pointer hover:opacity-80"
          >
            <button onClick={() => onStatusFilterChange(null)}>All</button>
          </Badge>
          {availableStatuses.map(({ status, count }) => (
            <Badge
              key={status}
              asChild
              variant={statusFilter === status ? "default" : "outline"}
              className={cn(
                "cursor-pointer hover:opacity-80",
                statusFilter === status && conservationStatusBgColors[status],
              )}
            >
              <button
                onClick={() =>
                  onStatusFilterChange(statusFilter === status ? null : status)
                }
              >
                {status}{" "}
                <span className="opacity-50">{count}</span>
              </button>
            </Badge>
          ))}
        </div>
      )}

      {/* Year filter */}
      {availableYears.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-muted-foreground uppercase tracking-wider mr-1">
            Year
          </span>
          <Badge
            asChild
            variant={!yearFilter ? "default" : "outline"}
            className="cursor-pointer hover:opacity-80"
          >
            <button onClick={() => onYearFilterChange(null)}>All</button>
          </Badge>
          {availableYears.map((year) => (
            <Badge
              key={year}
              asChild
              variant={yearFilter === year ? "default" : "outline"}
              className="cursor-pointer hover:opacity-80"
            >
              <button
                onClick={() =>
                  onYearFilterChange(yearFilter === year ? null : year)
                }
              >
                {year}
              </button>
            </Badge>
          ))}
        </div>
      )}

      {/* Result count */}
      <p className="text-xs text-muted-foreground">
        {resultCount === totalCount
          ? `${totalCount} species`
          : `${resultCount} of ${totalCount} species`}
      </p>
    </div>
  );
}
