"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Badge } from "@goodpie/ui/components/badge";
import type { FilterOption } from "@/lib/photos";

interface FilterBarProps {
  categories: FilterOption[];
  birds: FilterOption[];
}

function FilterGroup({
  label,
  paramKey,
  options,
  activeId,
  onSelect,
}: {
  label: string;
  paramKey: string;
  options: FilterOption[];
  activeId: string | null;
  onSelect: (key: string, value: string | null) => void;
}) {
  if (options.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-xs text-muted-foreground uppercase tracking-wider mr-1">
        {label}
      </span>
      <Badge
        asChild
        variant={!activeId ? "default" : "outline"}
        className="cursor-pointer hover:opacity-80"
      >
        <button onClick={() => onSelect(paramKey, null)}>All</button>
      </Badge>
      {options.map((option) => (
        <Badge
          key={option.id}
          asChild
          variant={activeId === option.id ? "default" : "outline"}
          className="cursor-pointer hover:opacity-80"
        >
          <button
            onClick={() =>
              onSelect(paramKey, activeId === option.id ? null : option.id)
            }
          >
            {option.label} <span className="opacity-50">{option.count}</span>
          </button>
        </Badge>
      ))}
    </div>
  );
}

export function FilterBar({ categories, birds }: FilterBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const activeCategory = searchParams.get("category");
  const activeBird = searchParams.get("bird");
  const hasFilters = activeCategory || activeBird;

  function setFilter(key: string, value: string | null) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    const qs = params.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }

  return (
    <div className="mb-10 space-y-3">
      <FilterGroup
        label="Category"
        paramKey="category"
        options={categories}
        activeId={activeCategory}
        onSelect={setFilter}
      />
      <FilterGroup
        label="Bird"
        paramKey="bird"
        options={birds}
        activeId={activeBird}
        onSelect={setFilter}
      />

      {hasFilters && (
        <button
          onClick={() => router.push(pathname, { scroll: false })}
          className="text-sm text-muted-foreground hover:text-foreground underline underline-offset-4 transition-colors"
        >
          Clear all filters
        </button>
      )}
    </div>
  );
}
