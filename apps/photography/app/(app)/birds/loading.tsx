export default function BirdsLoading() {
  return (
    <div className="animate-pulse">
      {/* Back link */}
      <div className="bg-muted mb-6 h-4 w-28 rounded" />

      {/* Heading */}
      <div className="mb-10 space-y-4">
        <div className="bg-muted h-3 w-16 rounded" />
        <div className="bg-muted h-10 w-48 rounded" />
        <div className="bg-muted h-5 w-80 rounded" />
      </div>

      {/* Grid skeleton */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="bg-muted h-48 rounded-lg sm:h-60 md:h-72" />
        ))}
      </div>
    </div>
  );
}
