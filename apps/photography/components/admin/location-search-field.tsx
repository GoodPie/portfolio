"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { useField } from "@payloadcms/ui";

const LocationMap = dynamic(
  () => import("@/components/location-map").then((mod) => mod.LocationMap),
  { ssr: false },
);

interface NominatimResult {
  display_name: string;
  lat: string;
  lon: string;
}

export default function LocationSearchField() {
  const [results, setResults] = useState<NominatimResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const latField = useField<number>({ path: "geolocation.latitude" });
  const lngField = useField<number>({ path: "geolocation.longitude" });

  const lat = latField.value;
  const lng = lngField.value;

  function handleInput() {
    const value = inputRef.current?.value ?? "";
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!value.trim()) {
      setResults([]);
      setShowDropdown(false);
      return;
    }

    setIsSearching(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?${new URLSearchParams({
            q: value,
            format: "json",
            limit: "5",
          })}`,
        );
        const data: NominatimResult[] = await response.json();
        setResults(data);
        setShowDropdown(data.length > 0);
      } catch {
        setResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 400);
  }

  function handleSelect(result: NominatimResult) {
    latField.setValue(parseFloat(result.lat));
    lngField.setValue(parseFloat(result.lon));
    if (inputRef.current) inputRef.current.value = result.display_name;
    setShowDropdown(false);
    setResults([]);
  }

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div style={{ marginBottom: "1rem" }}>
      <label
        className="field-label"
        style={{ display: "block", marginBottom: "0.5rem" }}
      >
        Location Search
      </label>
      <div ref={dropdownRef} style={{ position: "relative" }}>
        <input
          ref={inputRef}
          type="text"
          onInput={handleInput}
          placeholder="Search for a location..."
          style={{
            width: "100%",
            padding: "0.5rem 0.75rem",
            borderRadius: "var(--style-radius-s, 4px)",
            border: "1px solid var(--theme-elevation-150, #ccc)",
            background: "var(--theme-input-bg, var(--theme-elevation-0, #fff))",
            color: "var(--theme-text, #333)",
            fontSize: "0.875rem",
          }}
          onFocus={() => results.length > 0 && setShowDropdown(true)}
        />
        {isSearching && (
          <span
            style={{
              position: "absolute",
              right: "0.75rem",
              top: "50%",
              transform: "translateY(-50%)",
              fontSize: "0.75rem",
              color: "var(--theme-elevation-400, #999)",
            }}
          >
            Searching...
          </span>
        )}
        {showDropdown && results.length > 0 && (
          <ul
            style={{
              position: "absolute",
              top: "100%",
              left: 0,
              right: 0,
              zIndex: 1000,
              background:
                "var(--theme-elevation-50, var(--theme-elevation-0, #fff))",
              border: "1px solid var(--theme-elevation-150, #ccc)",
              borderRadius: "var(--style-radius-s, 4px)",
              marginTop: "2px",
              padding: 0,
              listStyle: "none",
              maxHeight: "200px",
              overflowY: "auto",
              boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
            }}
          >
            {results.map((result, i) => (
              <li
                key={`${result.lat}-${result.lon}-${i}`}
                onClick={() => handleSelect(result)}
                style={{
                  padding: "0.5rem 0.75rem",
                  cursor: "pointer",
                  fontSize: "0.8125rem",
                  borderBottom:
                    i < results.length - 1
                      ? "1px solid var(--theme-elevation-100, #eee)"
                      : "none",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background =
                    "var(--theme-elevation-100, #f0f0f0)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = "transparent")
                }
              >
                {result.display_name}
              </li>
            ))}
          </ul>
        )}
      </div>
      {lat != null && lng != null && (
        <div style={{ marginTop: "0.75rem" }}>
          <LocationMap latitude={lat} longitude={lng} />
        </div>
      )}
    </div>
  );
}
