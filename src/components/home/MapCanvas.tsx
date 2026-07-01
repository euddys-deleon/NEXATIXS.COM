"use client";

import "leaflet/dist/leaflet.css";
import { CircleMarker, MapContainer, TileLayer, Tooltip } from "react-leaflet";
import { coverageLocations, headquarters } from "@/lib/coverage";

export function MapCanvas() {
  const points = [
    { ...headquarters, isHq: true },
    ...coverageLocations.DO.map((p) => ({ ...p, isHq: false })),
    ...coverageLocations.US.map((p) => ({ ...p, isHq: false })),
  ];

  return (
    <MapContainer
      center={[29, -73]}
      zoom={4}
      scrollWheelZoom={false}
      attributionControl={false}
      className="h-full w-full"
    >
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        attribution="&copy; OpenStreetMap contributors &copy; CARTO"
      />
      {points.map((point) => (
        <CircleMarker
          key={point.name}
          center={[point.lat, point.lng]}
          radius={point.isHq ? 8 : 5}
          pathOptions={{
            color: "#0e6eff",
            fillColor: point.isHq ? "#0e6eff" : "#66a3ff",
            fillOpacity: point.isHq ? 1 : 0.85,
            weight: point.isHq ? 2 : 1,
          }}
        >
          <Tooltip direction="top" offset={[0, -4]}>
            {point.name}
          </Tooltip>
        </CircleMarker>
      ))}
    </MapContainer>
  );
}
