export default function GalleryLoading() {
  return (
    <>
      {/* Header skeleton */}
      <div className="mb-8">
        <div className="h-4 w-24 animate-pulse rounded bg-muted" />
        <div className="mt-4 h-10 w-72 animate-pulse rounded-lg bg-muted" />
        <div className="mt-2 flex items-center gap-4">
          <div className="h-4 w-16 animate-pulse rounded bg-muted" />
          <div className="h-4 w-32 animate-pulse rounded bg-muted" />
          <div className="h-4 w-20 animate-pulse rounded bg-muted" />
        </div>
        <div className="mt-4 h-5 w-full max-w-2xl animate-pulse rounded bg-muted" />
      </div>

      {/* Masonry skeleton */}
      <div className="columns-1 gap-4 sm:columns-2 lg:columns-3">
        {Array.from({ length: 9 }).map((_, i) => {
          // Vary heights to mimic masonry layout
          const heights = ["h-64", "h-80", "h-96", "h-72", "h-88"];
          return (
            <div
              key={i}
              className={`mb-4 break-inside-avoid animate-pulse rounded-lg bg-muted ${heights[i % heights.length]}`}
            />
          );
        })}
      </div>
    </>
  );
}
