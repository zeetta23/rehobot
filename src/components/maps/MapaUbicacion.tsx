"use client";

import dynamic from "next/dynamic";

interface Props {
  lat: number;
  lng: number;
  radio?: number;
  altura?: string;
}

// react-leaflet accede a window al cargar, así que sólo se renderiza en cliente.
const MapaUbicacionInner = dynamic(
  () => import("./MapaUbicacionInner"),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full w-full items-center justify-center bg-cream font-body text-sm text-gray-text">
        Cargando mapa…
      </div>
    ),
  },
);

export function MapaUbicacion(props: Props) {
  return <MapaUbicacionInner {...props} />;
}
