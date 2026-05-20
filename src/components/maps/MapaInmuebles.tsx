"use client";

import dynamic from "next/dynamic";
import type { InmueblePublicoListado } from "@/lib/firestore/inmuebles";

interface Props {
  inmuebles: InmueblePublicoListado[];
  altura?: string;
  interactivo?: boolean;
}

const MapaInmueblesInner = dynamic(
  () => import("./MapaInmueblesInner"),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full w-full items-center justify-center bg-cream font-body text-sm text-gray-text">
        Cargando mapa…
      </div>
    ),
  },
);

export function MapaInmuebles(props: Props) {
  return <MapaInmueblesInner {...props} />;
}
