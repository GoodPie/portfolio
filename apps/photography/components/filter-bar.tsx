import { Badge } from "@goodpie/ui/components/badge";
import type { FilterOption } from "@/lib/photos";

interface FilterBarProps {
  categories: FilterOption[];
  activeCategory: string | null;
  onFilterChange: (value: string | null) => void;
}

export function FilterBar({ categories, activeCategory, onFilterChange }: FilterBarProps) {
  if (categories.length === 0) return null;

  return (
    <div className="mb-10">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-muted-foreground mr-1 text-xs tracking-wider uppercase">
          Category
        </span>
        <Badge
          asChild
          variant={!activeCategory ? "default" : "outline"}
          className="cursor-pointer hover:opacity-80"
        >
          <button onClick={() => onFilterChange(null)}>All</button>
        </Badge>
        {categories.map((option) => (
          <Badge
            key={option.id}
            asChild
            variant={activeCategory === option.id ? "default" : "outline"}
            className="cursor-pointer hover:opacity-80"
          >
            <button onClick={() => onFilterChange(activeCategory === option.id ? null : option.id)}>
              {option.label} <span className="opacity-50">{option.count}</span>
            </button>
          </Badge>
        ))}
      </div>

      {activeCategory && (
        <button
          onClick={() => onFilterChange(null)}
          className="text-muted-foreground hover:text-foreground mt-3 text-sm underline underline-offset-4 transition-colors"
        >
          Clear filter
        </button>
      )}
    </div>
  );
}
