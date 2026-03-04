export default function Loading() {
  return (
    <>
      {/* Hero skeleton */}
      <section className="mb-12 text-center">
        <div className="bg-muted mx-auto h-12 w-64 animate-pulse rounded-lg" />
        <div className="bg-muted mx-auto mt-4 h-6 w-96 max-w-full animate-pulse rounded-lg" />
      </section>

      {/* Photo grid skeleton */}
      <div className="grid w-full grid-cols-1 gap-10 md:grid-cols-3">
        {Array.from({ length: 9 }).map((_, i) => (
          <div
            key={i}
            className="bg-muted h-60 w-full animate-pulse overflow-hidden rounded-lg md:h-96"
          />
        ))}
      </div>
    </>
  );
}
