import Link from "next/link";
import { Button } from "@goodpie/ui/components/button";

export default function GalleryNotFound() {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center text-center">
      <h2 className="font-serif text-2xl font-bold tracking-tight">
        Gallery not found
      </h2>
      <p className="mt-2 text-muted-foreground">
        The gallery you&apos;re looking for doesn&apos;t exist or may have been
        removed.
      </p>
      <Button asChild className="mt-6">
        <Link href="/">Browse all galleries</Link>
      </Button>
    </div>
  );
}
