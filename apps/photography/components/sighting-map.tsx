"use client";

import { useState, useMemo, useCallback, useRef } from "react";
import Link from "next/link";
import { Map, Source, Layer, Popup } from "react-map-gl/mapbox";
import type { MapRef, MapMouseEvent } from "react-map-gl/mapbox";
import type { GeoJSON } from "geojson";
import type { CircleLayerSpecification, SymbolLayerSpecification } from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import type { MapMarker } from "@/lib/map-utils";

export type { MapMarker } from "@/lib/map-utils";

interface SightingMapProps {
  markers: MapMarker[];
  className?: string;
}

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

const clusterLayer: CircleLayerSpecification = {
  id: "clusters",
  type: "circle",
  source: "sightings",
  filter: ["has", "point_count"],
  paint: {
    "circle-color": ["step", ["get", "point_count"], "#51bbd6", 10, "#f1f075", 25, "#f28cb1"],
    "circle-radius": ["step", ["get", "point_count"], 18, 10, 24, 25, 32],
    "circle-stroke-width": 2,
    "circle-stroke-color": "rgba(255,255,255,0.3)",
  },
};

const clusterCountLayer: SymbolLayerSpecification = {
  id: "cluster-count",
  type: "symbol",
  source: "sightings",
  filter: ["has", "point_count"],
  layout: {
    "text-field": ["get", "point_count_abbreviated"],
    "text-font": ["DIN Offc Pro Medium", "Arial Unicode MS Bold"],
    "text-size": 12,
  },
  paint: {
    "text-color": "#1a1a2e",
  },
};

const unclusteredPointLayer: CircleLayerSpecification = {
  id: "unclustered-point",
  type: "circle",
  source: "sightings",
  filter: ["!", ["has", "point_count"]],
  paint: {
    "circle-color": "#51bbd6",
    "circle-radius": 7,
    "circle-stroke-width": 2,
    "circle-stroke-color": "rgba(255,255,255,0.5)",
  },
};

export function SightingMap({ markers, className = "h-[500px]" }: SightingMapProps) {
  const mapRef = useRef<MapRef>(null);
  const [popupInfo, setPopupInfo] = useState<MapMarker | null>(null);

  const geojson = useMemo<GeoJSON.FeatureCollection>(
    () => ({
      type: "FeatureCollection",
      features: markers.map((m) => ({
        type: "Feature" as const,
        geometry: { type: "Point" as const, coordinates: [m.lng, m.lat] },
        properties: {
          id: m.id,
          title: m.title,
          thumbnailUrl: m.thumbnailUrl ?? "",
          birdName: m.birdName ?? "",
          birdSlug: m.birdSlug ?? "",
          dateTaken: m.dateTaken ?? "",
        },
      })),
    }),
    [markers],
  );

  const bounds = useMemo(() => {
    if (markers.length === 0) return undefined;
    let minLng = Infinity,
      maxLng = -Infinity,
      minLat = Infinity,
      maxLat = -Infinity;
    for (const m of markers) {
      if (m.lng < minLng) minLng = m.lng;
      if (m.lng > maxLng) maxLng = m.lng;
      if (m.lat < minLat) minLat = m.lat;
      if (m.lat > maxLat) maxLat = m.lat;
    }
    return [minLng, minLat, maxLng, maxLat] as [number, number, number, number];
  }, [markers]);

  const onClick = useCallback((e: MapMouseEvent) => {
    const map = mapRef.current;
    if (!map) return;

    const features = map.queryRenderedFeatures(e.point, {
      layers: ["clusters", "unclustered-point"],
    });
    if (!features.length) {
      setPopupInfo(null);
      return;
    }

    const feature = features[0];

    const layerId = feature.layer?.id;

    if (layerId === "clusters") {
      const clusterId = feature.properties?.cluster_id;
      const source = map.getSource("sightings") as mapboxgl.GeoJSONSource;
      source.getClusterExpansionZoom(clusterId, (err: unknown, zoom: number | null | undefined) => {
        if (err || zoom == null || !feature.geometry || feature.geometry.type !== "Point") return;
        map.flyTo({
          center: feature.geometry.coordinates as [number, number],
          zoom,
          duration: 500,
        });
      });
    } else if (layerId === "unclustered-point") {
      const props = feature.properties;
      if (!props || !feature.geometry || feature.geometry.type !== "Point") return;
      setPopupInfo({
        id: props.id,
        lat: feature.geometry.coordinates[1],
        lng: feature.geometry.coordinates[0],
        title: props.title,
        thumbnailUrl: props.thumbnailUrl,
        birdName: props.birdName,
        birdSlug: props.birdSlug,
        dateTaken: props.dateTaken,
      });
    }
  }, []);

  if (!MAPBOX_TOKEN) {
    return (
      <div className={`${className} bg-muted flex items-center justify-center rounded-lg`}>
        <p className="text-muted-foreground text-sm">Map unavailable — missing Mapbox token</p>
      </div>
    );
  }

  if (markers.length === 0) return null;

  return (
    <div className={`${className} w-full overflow-hidden rounded-lg`}>
      <Map
        ref={mapRef}
        mapboxAccessToken={MAPBOX_TOKEN}
        initialViewState={
          bounds
            ? { bounds, fitBoundsOptions: { padding: 60, maxZoom: 14 } }
            : { longitude: -98, latitude: 39, zoom: 3 }
        }
        mapStyle="mapbox://styles/mapbox/dark-v11"
        interactiveLayerIds={["clusters", "unclustered-point"]}
        onClick={onClick}
        style={{ width: "100%", height: "100%" }}
      >
        <Source
          id="sightings"
          type="geojson"
          data={geojson}
          cluster={true}
          clusterMaxZoom={14}
          clusterRadius={50}
        >
          <Layer {...clusterLayer} />
          <Layer {...clusterCountLayer} />
          <Layer {...unclusteredPointLayer} />
        </Source>

        {popupInfo && (
          <Popup
            longitude={popupInfo.lng}
            latitude={popupInfo.lat}
            anchor="bottom"
            onClose={() => setPopupInfo(null)}
            closeOnClick={false}
            className="sighting-popup"
          >
            <div className="flex flex-col gap-1.5 p-1">
              {popupInfo.thumbnailUrl && (
                <img
                  src={popupInfo.thumbnailUrl}
                  alt={popupInfo.title}
                  className="h-20 w-full rounded object-cover"
                />
              )}
              {popupInfo.birdName && <p className="text-xs font-medium">{popupInfo.birdName}</p>}
              {popupInfo.dateTaken && (
                <p className="text-[10px] text-gray-400">
                  {new Date(popupInfo.dateTaken).toLocaleDateString(undefined, {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </p>
              )}
              <Link
                href={`/photo/${popupInfo.id}`}
                className="text-[10px] text-blue-400 hover:underline"
              >
                View photo
              </Link>
            </div>
          </Popup>
        )}
      </Map>
    </div>
  );
}
