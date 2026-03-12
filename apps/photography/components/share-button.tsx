"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@goodpie/ui/components/button";
import { Check, Share2 } from "lucide-react";

// NEXT_PUBLIC_SITE_URL is the root domain (e.g. "https://brandynbritton.com").
// The photography app is always mounted at /photography (next.config.mjs basePath),
// so absolute share URLs are constructed as ${NEXT_PUBLIC_SITE_URL}/photography/photo/${id}.
// This mirrors the pattern used in photo-json-ld.tsx, bird-json-ld.tsx, and sitemap.ts.
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3024";

interface ShareButtonProps {
  photoKey: string;
  title: string;
  className?: string;
}

export function ShareButton({ photoKey, title, className }: ShareButtonProps) {
  const [copied, setCopied] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    },
    [],
  );

  const handleShare = useCallback(async () => {
    const url = `${SITE_URL}/photography/photo/${photoKey}`;

    try {
      // Web Share API: triggers native OS share sheet (mobile) or browser share dialog (desktop).
      // canShare() guards against environments where share() would reject.
      if (typeof navigator.canShare === "function" && navigator.canShare({ url })) {
        await navigator.share({ title, text: title, url });
        return;
      }

      // Clipboard fallback: only available in secure contexts (HTTPS / localhost).
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(url);
        if (timerRef.current) clearTimeout(timerRef.current);
        setCopied(true);
        timerRef.current = setTimeout(() => setCopied(false), 2000);
        return;
      }

      // Last-resort fallback for non-secure HTTP contexts.
      window.prompt("Copy link:", url);
    } catch {
      // User dismissed the share sheet or clipboard was denied — no feedback needed.
    }
  }, [photoKey, title]);

  return (
    <Button
      variant="ghost"
      size="icon"
      className={className}
      onClick={handleShare}
      aria-label={copied ? "Link copied" : "Share photo"}
    >
      {copied ? <Check className="size-4" /> : <Share2 className="size-4" />}
    </Button>
  );
}
