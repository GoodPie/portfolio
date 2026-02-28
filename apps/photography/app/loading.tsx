export default function Loading() {
  return (
    <>
      {/* Hero skeleton */}
      <section className="mb-12 text-center">
        <div className="mx-auto h-12 w-64 animate-pulse rounded-lg bg-muted" />
        <div className="mx-auto mt-4 h-6 w-96 max-w-full animate-pulse rounded-lg bg-muted" />
      </section>

      {/* Photo grid skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-10 w-full">
        {Array.from({ length: 9 }).map((_, i) => (
          <div
            key={i}
            className="rounded-lg overflow-hidden h-60 md:h-96 w-full animate-pulse bg-muted"
          />
        ))}
      </div>
    </>
  );
}
