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

      {/* FocusCards grid skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-10 w-full">
        {Array.from({ length: 9 }).map((_, i) => (
          <div
            key={i}
            className="h-60 md:h-96 animate-pulse rounded-lg bg-muted"
          />
        ))}
      </div>
    </>
  );
}
