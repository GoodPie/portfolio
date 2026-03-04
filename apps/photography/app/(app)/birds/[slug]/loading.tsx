export default function BirdLoading() {
  return (
    <div className="animate-pulse">
      {/* Back link */}
      <div className="bg-muted mb-6 h-4 w-24 rounded" />

      {/* Hero skeleton */}
      <div className="bg-muted mb-10 h-56 rounded-xl sm:h-72 md:h-96" />

      {/* Bio skeleton */}
      <div className="mb-12 grid grid-cols-1 gap-8 md:grid-cols-2">
        <div className="space-y-4">
          <div className="bg-muted h-3 w-16 rounded" />
          <div className="bg-muted h-4 w-full rounded" />
          <div className="bg-muted h-4 w-3/4 rounded" />
        </div>
        <div className="space-y-4">
          <div className="bg-muted h-3 w-20 rounded" />
          <div className="bg-muted h-4 w-full rounded" />
          <div className="bg-muted h-4 w-2/3 rounded" />
        </div>
      </div>

      {/* Photo grid skeleton */}
      <div className="bg-muted mb-6 h-3 w-16 rounded" />
      <div className="columns-1 gap-10 sm:columns-2 md:columns-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="bg-muted mb-10 break-inside-avoid rounded-lg"
            style={{ aspectRatio: i % 2 === 0 ? "3/4" : "4/3" }}
          />
        ))}
      </div>
    </div>
  );
}
