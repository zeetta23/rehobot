"use client";

import "leaflet/dist/leaflet.css";
import { useEffect, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Circle,
  useMapEvents,
  useMap,
} from "react-leaflet";

interface Props {
  lat: number;
  lng: number;
  onChange: (lat: number, lng: number) => void;
  altura?: string;
}

const ALCALA: [number, number] = [40.4817, -3.3641];

function ClickHandler({
  onClick,
}: {
  onClick: (lat: number, lng: number) => void;
}) {
  useMapEvents({
    click(e) {
      onClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

// Cuando lat/lng cambian desde fuera (p.ej. buscador de dirección), vuela
// el mapa al nuevo punto sin recargar el componente.
function VolarA({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  useEffect(() => {
    if (lat !== 0 || lng !== 0) {
      map.flyTo([lat, lng], 17, { duration: 0.6 });
    }
  }, [lat, lng, map]);
  return null;
}

export default function SelectorCoordenadasInner({
  lat,
  lng,
  onChange,
  altura = "320px",
}: Props) {
  // Si lat/lng son 0 (sin coordenadas todavía), centramos en Alcalá
  const tieneCoordenadas = lat !== 0 && lng !== 0;
  const [centroInicial] = useState<[number, number]>(
    tieneCoordenadas ? [lat, lng] : ALCALA,
  );
  const posicion: [number, number] | null = tieneCoordenadas
    ? [lat, lng]
    : null;

  return (
    <MapContainer
      center={centroInicial}
      zoom={tieneCoordenadas ? 16 : 12}
      scrollWheelZoom
      style={{ height: altura, width: "100%" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <ClickHandler onClick={(lat, lng) => onChange(lat, lng)} />
      <VolarA lat={lat} lng={lng} />
      {posicion && (
        <Circle
          center={posicion}
          radius={80}
          pathOptions={{
            color: "#c9a96e",
            fillColor: "#c9a96e",
            fillOpacity: 0.4,
            weight: 3,
          }}
        />
      )}
    </MapContainer>
  );
}
