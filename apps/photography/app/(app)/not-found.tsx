import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
      <p className="text-muted-foreground mb-4 text-sm tracking-widest uppercase">Page not found</p>

      <h1 className="mb-6 font-serif text-7xl font-medium tracking-tight md:text-8xl lg:text-9xl">
        4<span className="text-teal">0</span>4
      </h1>

      <p className="text-muted-foreground mb-12 max-w-md text-lg leading-relaxed md:text-xl">
        This photo doesn&apos;t seem to exist. Maybe it was never taken.
      </p>

      <Link
        href="/"
        className="bg-teal text-background hover:bg-teal/90 inline-flex items-center gap-2 rounded-md px-6 py-3 font-medium transition-colors"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="m12 19-7-7 7-7" />
          <path d="M19 12H5" />
        </svg>
        Back to Gallery
      </Link>
    </div>
  );
}
