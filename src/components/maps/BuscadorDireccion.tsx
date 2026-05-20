"use client";

import { useEffect, useRef, useState } from "react";

interface NominatimResult {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
  type: string;
  importance?: number;
  address?: {
    house_number?: string;
    road?: string;
    suburb?: string;
    quarter?: string;
    neighbourhood?: string;
    city?: string;
    town?: string;
    village?: string;
    municipality?: string;
    postcode?: string;
    state?: string;
  };
}

interface Props {
  onSelect: (lat: number, lng: number, label: string) => void;
}

// Endpoint Nominatim de OpenStreetMap: gratis, sin API key.
// Política de uso: máximo ~1 req/seg → usamos debounce de 500 ms.
const NOMINATIM = "https://nominatim.openstreetmap.org/search";

function buildShortLabel(r: NominatimResult): string {
  const a = r.address ?? {};
  const partes: string[] = [];
  // Calle + número
  if (a.road) {
    partes.push(a.house_number ? `${a.road}, ${a.house_number}` : a.road);
  }
  // Barrio
  const barrio = a.suburb || a.quarter || a.neighbourhood;
  if (barrio) partes.push(barrio);
  // Ciudad
  const ciudad = a.city || a.town || a.village || a.municipality;
  if (ciudad) partes.push(ciudad);
  return partes.join(" · ") || r.display_name;
}

export function BuscadorDireccion({ onSelect }: Props) {
  const [query, setQuery] = useState("");
  const [resultados, setResultados] = useState<NominatimResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [abierto, setAbierto] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Click fuera = cerrar la lista
  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setAbierto(false);
      }
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (query.trim().length < 3) {
      setResultados([]);
      setError(null);
      return;
    }

    debounceRef.current = setTimeout(() => {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        q: query.trim(),
        format: "json",
        addressdetails: "1",
        limit: "6",
        "accept-language": "es",
        countrycodes: "es",
      });

      fetch(`${NOMINATIM}?${params.toString()}`, {
        signal: controller.signal,
        headers: {
          // Nominatim pide identificación de la app
          "Accept": "application/json",
        },
      })
        .then((r) => {
          if (!r.ok) throw new Error("Servicio de búsqueda no disponible");
          return r.json() as Promise<NominatimResult[]>;
        })
        .then((data) => {
          setResultados(data);
          setAbierto(true);
        })
        .catch((err: unknown) => {
          if (err instanceof DOMException && err.name === "AbortError") return;
          setError(
            err instanceof Error ? err.message : "Error en la búsqueda",
          );
          setResultados([]);
        })
        .finally(() => setLoading(false));
    }, 500);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  function handleSelect(r: NominatimResult) {
    const lat = Number.parseFloat(r.lat);
    const lng = Number.parseFloat(r.lon);
    if (Number.isFinite(lat) && Number.isFinite(lng)) {
      onSelect(lat, lng, buildShortLabel(r));
      setQuery(buildShortLabel(r));
      setAbierto(false);
    }
  }

  return (
    <div ref={containerRef} className="relative">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => {
          if (resultados.length > 0) setAbierto(true);
        }}
        placeholder="Buscar dirección: 'Calle Mayor, Alcalá de Henares'"
        className="w-full rounded-lg border border-black/10 px-4 py-2.5 font-body text-sm outline-none focus:border-navy"
      />

      {abierto && (resultados.length > 0 || loading || error) && (
        <div className="absolute left-0 right-0 top-full z-30 mt-1 overflow-hidden rounded-lg border border-black/10 bg-white shadow-xl">
          {loading && (
            <p className="px-4 py-3 font-body text-xs text-gray-text">
              Buscando…
            </p>
          )}
          {error && (
            <p className="px-4 py-3 font-body text-xs text-red-700">{error}</p>
          )}
          {!loading && !error && resultados.length === 0 && (
            <p className="px-4 py-3 font-body text-xs text-gray-text">
              Sin resultados
            </p>
          )}
          {!loading && resultados.length > 0 && (
            <ul className="max-h-72 overflow-y-auto">
              {resultados.map((r) => (
                <li key={r.place_id}>
                  <button
                    type="button"
                    onClick={() => handleSelect(r)}
                    className="block w-full px-4 py-2.5 text-left font-body text-sm text-dark transition-colors hover:bg-cream"
                  >
                    <span className="block font-medium text-navy">
                      {buildShortLabel(r)}
                    </span>
                    <span className="block truncate text-xs text-gray-text">
                      {r.display_name}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      <p className="mt-2 font-body text-xs text-gray-text">
        Escribe la dirección o un punto de interés. Los resultados vienen de
        OpenStreetMap (Nominatim).
      </p>
    </div>
  );
}
