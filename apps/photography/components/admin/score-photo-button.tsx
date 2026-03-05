"use client";

import { useDocumentInfo } from "@payloadcms/ui";
import { useState } from "react";

export default function ScorePhotoButton() {
  const { id } = useDocumentInfo();
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  async function handleScore() {
    if (!id) return;

    setIsLoading(true);
    setMessage(null);

    try {
      const res = await fetch("/photography/api/score-photo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ photoId: Number(id) }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Failed to queue scoring");
      }

      const data = await res.json();
      setMessage({
        type: "success",
        text: data.message || "Scoring job queued — scores will appear shortly.",
      });
    } catch (err) {
      setMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Failed to queue scoring",
      });
    } finally {
      setIsLoading(false);
    }
  }

  if (!id) return null;

  return (
    <div style={{ marginBottom: "1rem" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
        <button
          type="button"
          onClick={handleScore}
          disabled={isLoading}
          style={{
            padding: "0.5rem 1rem",
            borderRadius: "var(--style-radius-s, 4px)",
            border: "1px solid var(--theme-elevation-150, #ccc)",
            background: "var(--theme-elevation-100, #f0f0f0)",
            color: "var(--theme-text, #333)",
            fontSize: "0.875rem",
            cursor: isLoading ? "not-allowed" : "pointer",
            opacity: isLoading ? 0.5 : 1,
            whiteSpace: "nowrap",
          }}
        >
          {isLoading ? "Queuing..." : "Score Photo"}
        </button>
      </div>
      {message && (
        <div
          style={{
            marginTop: "0.5rem",
            padding: "0.5rem 0.75rem",
            borderRadius: "var(--style-radius-s, 4px)",
            fontSize: "0.8125rem",
            background:
              message.type === "success"
                ? "var(--theme-success-50, #ecfdf5)"
                : "var(--theme-error-50, #fef2f2)",
            color:
              message.type === "success"
                ? "var(--theme-success-500, #059669)"
                : "var(--theme-error-500, #dc2626)",
            border: `1px solid ${
              message.type === "success"
                ? "var(--theme-success-200, #a7f3d0)"
                : "var(--theme-error-200, #fecaca)"
            }`,
          }}
        >
          {message.text}
        </div>
      )}
    </div>
  );
}
