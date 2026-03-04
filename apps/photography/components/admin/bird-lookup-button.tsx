"use client";

import { useField, useAllFormFields } from "@payloadcms/ui";
import { useState } from "react";

interface BirdLookupResult {
  scientificName: string | null;
  taxonomicOrder: string | null;
  family: string | null;
  conservationStatus: string | null;
  habitat: string | null;
  diet: string | null;
  facts: string[] | null;
  ebirdSpeciesCode: string | null;
  source: { nuthatch: boolean; ai: boolean };
}

export default function BirdLookupButton() {
  const { value: name } = useField<string>({ path: "name" });
  const [, dispatchFields] = useAllFormFields();
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  async function handleLookup() {
    if (!name?.trim()) return;

    setIsLoading(true);
    setMessage(null);

    try {
      const res = await fetch("/photography/api/bird-lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim() }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Lookup failed");
      }

      const data: BirdLookupResult = await res.json();
      const populated: string[] = [];

      const simpleFields = [
        "scientificName",
        "taxonomicOrder",
        "family",
        "conservationStatus",
        "habitat",
        "diet",
        "ebirdSpeciesCode",
      ] as const;

      for (const field of simpleFields) {
        const value = data[field];
        if (value !== null && value !== undefined) {
          dispatchFields({
            type: "UPDATE",
            path: field,
            value,
          });
          populated.push(field);
        }
      }

      if (data.facts && data.facts.length > 0) {
        // Set the row count for the array field
        dispatchFields({
          type: "UPDATE",
          path: "facts",
          value: data.facts.length,
          rows: data.facts.map((_, i) => ({
            id: `fact-${i}-${Date.now()}`,
            collapsed: false,
            blockType: undefined,
          })),
        });

        // Set each fact value
        for (let i = 0; i < data.facts.length; i++) {
          dispatchFields({
            type: "UPDATE",
            path: `facts.${i}.fact`,
            value: data.facts[i],
          });
        }

        populated.push("facts");
      }

      const sources = [];
      if (data.source.nuthatch) sources.push("Nuthatch API");
      if (data.source.ai) sources.push("AI");

      setMessage({
        type: "success",
        text: `Populated ${populated.length} fields (${populated.join(", ")}) from ${sources.join(" + ")}`,
      });
    } catch (err) {
      setMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Lookup failed",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div style={{ marginBottom: "1rem" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
        <button
          type="button"
          onClick={handleLookup}
          disabled={!name?.trim() || isLoading}
          style={{
            padding: "0.5rem 1rem",
            borderRadius: "var(--style-radius-s, 4px)",
            border: "1px solid var(--theme-elevation-150, #ccc)",
            background: "var(--theme-elevation-100, #f0f0f0)",
            color: "var(--theme-text, #333)",
            fontSize: "0.875rem",
            cursor: !name?.trim() || isLoading ? "not-allowed" : "pointer",
            opacity: !name?.trim() || isLoading ? 0.5 : 1,
            whiteSpace: "nowrap",
          }}
        >
          {isLoading ? "Looking up..." : "Lookup Bird Info"}
        </button>
        {!name?.trim() && (
          <span
            style={{
              fontSize: "0.75rem",
              color: "var(--theme-elevation-400, #999)",
            }}
          >
            Enter a bird name first
          </span>
        )}
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
