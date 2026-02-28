export default function Loading() {
  return (
    <>
      {/* Hero skeleton */}
      <section className="mb-12 text-center">
        <div className="mx-auto h-12 w-64 animate-pulse rounded-lg bg-muted" />
        <div className="mx-auto mt-4 h-6 w-96 max-w-full animate-pulse rounded-lg bg-muted" />
      </section>

      {/* Gallery grid skeleton */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="overflow-hidden rounded-lg border border-border/40 bg-card"
          >
            <div className="aspect-[4/3] animate-pulse bg-muted" />
            <div className="p-4 space-y-2">
              <div className="h-5 w-3/4 animate-pulse rounded bg-muted" />
              <div className="h-3 w-1/4 animate-pulse rounded bg-muted" />
              <div className="h-4 w-full animate-pulse rounded bg-muted" />
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
