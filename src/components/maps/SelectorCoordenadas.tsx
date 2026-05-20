"use client";

import dynamic from "next/dynamic";

interface Props {
  lat: number;
  lng: number;
  onChange: (lat: number, lng: number) => void;
  altura?: string;
}

const SelectorCoordenadasInner = dynamic(
  () => import("./SelectorCoordenadasInner"),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-80 w-full items-center justify-center rounded-lg border border-dashed border-navy/20 bg-cream font-body text-sm text-gray-text">
        Cargando mapa…
      </div>
    ),
  },
);

export function SelectorCoordenadas(props: Props) {
  return <SelectorCoordenadasInner {...props} />;
}
