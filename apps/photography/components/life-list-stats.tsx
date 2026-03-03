import { Badge } from "@goodpie/ui/components/badge";
import { cn } from "@goodpie/ui/lib/utils";
import { conservationStatusBgColors } from "@/lib/bird-utils";

interface LifeListStatsProps {
  totalSpecies: number;
  totalPhotos: number;
  statusBreakdown: { status: string; count: number }[];
  yearCounts: { year: number; count: number }[];
}

export function LifeListStats({
  totalSpecies,
  totalPhotos,
  statusBreakdown,
  yearCounts,
}: LifeListStatsProps) {
  const latestYear =
    yearCounts.length > 0
      ? yearCounts.reduce((a, b) => (a.year > b.year ? a : b))
      : null;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
      <div className="bg-muted/50 rounded-lg p-4">
        <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">
          Species
        </p>
        <p className="text-3xl font-serif font-medium">{totalSpecies}</p>
        {latestYear && (
          <p className="text-xs text-muted-foreground mt-1">
            {latestYear.count} new in {latestYear.year}
          </p>
        )}
      </div>

      <div className="bg-muted/50 rounded-lg p-4">
        <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">
          Bird Photos
        </p>
        <p className="text-3xl font-serif font-medium">{totalPhotos}</p>
      </div>

      <div className="bg-muted/50 rounded-lg p-4">
        <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">
          Conservation
        </p>
        <div className="flex flex-wrap gap-1.5 mt-2">
          {statusBreakdown.map(({ status, count }) => (
            <Badge
              key={status}
              className={cn(
                "text-[10px] font-medium border-0 px-1.5 py-0",
                conservationStatusBgColors[status],
              )}
            >
              {status} {count}
            </Badge>
          ))}
        </div>
      </div>
    </div>
  );
}
