export default function BirdsLoading() {
  return (
    <div className="animate-pulse">
      {/* Back link */}
      <div className="h-4 w-28 bg-muted rounded mb-6" />

      {/* Heading */}
      <div className="mb-10 space-y-4">
        <div className="h-3 w-16 bg-muted rounded" />
        <div className="h-10 w-48 bg-muted rounded" />
        <div className="h-5 w-80 bg-muted rounded" />
      </div>

      {/* Grid skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="rounded-lg bg-muted h-48 sm:h-60 md:h-72"
          />
        ))}
      </div>
    </div>
  );
}
