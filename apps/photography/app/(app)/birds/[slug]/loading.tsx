export default function BirdLoading() {
  return (
    <div className="animate-pulse">
      {/* Back link */}
      <div className="h-4 w-24 bg-muted rounded mb-6" />

      {/* Hero skeleton */}
      <div className="h-56 sm:h-72 md:h-96 bg-muted rounded-xl mb-10" />

      {/* Bio skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        <div className="space-y-4">
          <div className="h-3 w-16 bg-muted rounded" />
          <div className="h-4 w-full bg-muted rounded" />
          <div className="h-4 w-3/4 bg-muted rounded" />
        </div>
        <div className="space-y-4">
          <div className="h-3 w-20 bg-muted rounded" />
          <div className="h-4 w-full bg-muted rounded" />
          <div className="h-4 w-2/3 bg-muted rounded" />
        </div>
      </div>

      {/* Photo grid skeleton */}
      <div className="h-3 w-16 bg-muted rounded mb-6" />
      <div className="columns-1 sm:columns-2 md:columns-3 gap-10">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="mb-10 break-inside-avoid rounded-lg bg-muted"
            style={{ aspectRatio: i % 2 === 0 ? "3/4" : "4/3" }}
          />
        ))}
      </div>
    </div>
  );
}
