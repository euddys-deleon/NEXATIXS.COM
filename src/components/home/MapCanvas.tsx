"use client";

import { useEffect, useMemo } from "react";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { CircleMarker, MapContainer, Marker, TileLayer, Tooltip, useMap } from "react-leaflet";
import { coverageLocations, headquarters, type CountryKey } from "@/lib/coverage";

const hqIcon = L.divIcon({
  className: "",
  html: `
    <div class="relative flex h-6 w-6 items-center justify-center">
      <span class="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-blue opacity-50"></span>
      <span class="relative inline-flex h-3.5 w-3.5 rounded-full border-2 border-white bg-brand-blue shadow-[0_0_0_4px_rgba(14,110,255,0.18)]"></span>
    </div>
  `,
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

function boundsFor(country: CountryKey) {
  const points =
    country === "DO" ? [headquarters, ...coverageLocations.DO] : coverageLocations.US;
  return L.latLngBounds(points.map((p) => [p.lat, p.lng] as [number, number])).pad(0.35);
}

function FlyToCountry({ country }: { country: CountryKey }) {
  const map = useMap();

  useEffect(() => {
    map.flyToBounds(boundsFor(country), {
      maxZoom: country === "DO" ? 9 : 7,
      duration: 1.1,
    });
  }, [country, map]);

  return null;
}

export function MapCanvas({ country }: { country: CountryKey }) {
  const points = useMemo(() => {
    if (country === "DO") {
      return [
        { ...headquarters, isHq: true },
        ...coverageLocations.DO.map((p) => ({ ...p, isHq: false })),
      ];
    }
    return coverageLocations.US.map((p) => ({ ...p, isHq: false }));
  }, [country]);

  return (
    <MapContainer
      center={[headquarters.lat, headquarters.lng]}
      zoom={8}
      scrollWheelZoom={false}
      attributionControl={false}
      className="h-full w-full"
    >
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        attribution="&copy; OpenStreetMap contributors &copy; CARTO"
      />
      <FlyToCountry country={country} />
      {points.map((point) =>
        point.isHq ? (
          <Marker key={point.name} position={[point.lat, point.lng]} icon={hqIcon}>
            <Tooltip direction="top" offset={[0, -14]}>
              {point.name}
            </Tooltip>
          </Marker>
        ) : (
          <CircleMarker
            key={point.name}
            center={[point.lat, point.lng]}
            radius={5}
            pathOptions={{
              color: "#0e6eff",
              fillColor: "#66a3ff",
              fillOpacity: 0.85,
              weight: 1,
            }}
          >
            <Tooltip direction="top" offset={[0, -4]}>
              {point.name}
            </Tooltip>
          </CircleMarker>
        ),
      )}
    </MapContainer>
  );
}
