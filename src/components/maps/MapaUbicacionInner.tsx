"use client";

import "leaflet/dist/leaflet.css";
import { MapContainer, TileLayer, Circle } from "react-leaflet";

interface Props {
  lat: number;
  lng: number;
  radio?: number;
  altura?: string;
}

export default function MapaUbicacionInner({
  lat,
  lng,
  radio = 100,
  altura = "100%",
}: Props) {
  const centro: [number, number] = [lat, lng];

  return (
    <MapContainer
      center={centro}
      zoom={15}
      scrollWheelZoom={false}
      style={{ height: altura, width: "100%" }}
      attributionControl={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Circle
        center={centro}
        radius={radio}
        pathOptions={{
          color: "#0a1f44",
          fillColor: "#0a1f44",
          fillOpacity: 0.15,
          weight: 2,
        }}
      />
    </MapContainer>
  );
}
