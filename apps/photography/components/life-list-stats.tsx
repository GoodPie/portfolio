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
    yearCounts.length > 0 ? yearCounts.reduce((a, b) => (a.year > b.year ? a : b)) : null;

  return (
    <div className="mb-10 grid grid-cols-1 gap-4 sm:grid-cols-3">
      <div className="bg-muted/50 rounded-lg p-4">
        <p className="text-muted-foreground mb-1 text-xs tracking-widest uppercase">Species</p>
        <p className="font-serif text-3xl font-medium">{totalSpecies}</p>
        {latestYear && (
          <p className="text-muted-foreground mt-1 text-xs">
            {latestYear.count} new in {latestYear.year}
          </p>
        )}
      </div>

      <div className="bg-muted/50 rounded-lg p-4">
        <p className="text-muted-foreground mb-1 text-xs tracking-widest uppercase">Bird Photos</p>
        <p className="font-serif text-3xl font-medium">{totalPhotos}</p>
      </div>

      <div className="bg-muted/50 rounded-lg p-4">
        <p className="text-muted-foreground mb-1 text-xs tracking-widest uppercase">Conservation</p>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {statusBreakdown.map(({ status, count }) => (
            <Badge
              key={status}
              className={cn(
                "border-0 px-1.5 py-0 text-[10px] font-medium",
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
