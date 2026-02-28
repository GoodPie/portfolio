"use client";

import { useEffect } from "react";
import { Button } from "@goodpie/ui/components/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center text-center">
      <h2 className="font-serif text-2xl font-bold tracking-tight">
        Something went wrong
      </h2>
      <p className="mt-2 text-muted-foreground">
        There was a problem loading this page. Please try again.
      </p>
      <Button onClick={reset} className="mt-6">
        Try again
      </Button>
    </div>
  );
}
