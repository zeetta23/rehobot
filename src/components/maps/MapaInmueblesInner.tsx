"use client";

import "leaflet/dist/leaflet.css";
import { useEffect, useMemo } from "react";
import L from "leaflet";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import type { InmueblePublicoListado } from "@/lib/firestore/inmuebles";
import { formatPrecio } from "@/lib/firestore/inmuebles";

interface Props {
  inmuebles: InmueblePublicoListado[];
  altura?: string;
  interactivo?: boolean;
}

const ALCALA: [number, number] = [40.4817, -3.3641];

function crearIcono(precio: string): L.DivIcon {
  return L.divIcon({
    className: "rehobot-marker",
    html: `
      <div style="
        background: #0a1f44;
        color: #fff;
        border: 2px solid #c9a96e;
        border-radius: 999px;
        padding: 4px 10px;
        font-family: Inter, system-ui, sans-serif;
        font-size: 11px;
        font-weight: 600;
        white-space: nowrap;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      ">${precio}</div>
    `,
    iconSize: [60, 24],
    iconAnchor: [30, 12],
  });
}

function FitToBounds({
  items,
}: {
  items: InmueblePublicoListado[];
}) {
  const map = useMap();
  useEffect(() => {
    const conCoords = items.filter(
      (i) => i.coordenadas.lat !== 0 && i.coordenadas.lng !== 0,
    );
    if (conCoords.length === 0) return;
    if (conCoords.length === 1) {
      map.setView([conCoords[0].coordenadas.lat, conCoords[0].coordenadas.lng], 14);
      return;
    }
    const bounds = L.latLngBounds(
      conCoords.map((i) => [i.coordenadas.lat, i.coordenadas.lng]) as [
        number,
        number,
      ][],
    );
    map.fitBounds(bounds, { padding: [40, 40] });
  }, [items, map]);
  return null;
}

export default function MapaInmueblesInner({
  inmuebles,
  altura = "500px",
  interactivo = true,
}: Props) {
  const items = useMemo(
    () =>
      inmuebles.filter(
        (i) => i.coordenadas.lat !== 0 && i.coordenadas.lng !== 0,
      ),
    [inmuebles],
  );

  const centro: [number, number] =
    items.length > 0
      ? [items[0].coordenadas.lat, items[0].coordenadas.lng]
      : ALCALA;

  return (
    <MapContainer
      center={centro}
      zoom={12}
      scrollWheelZoom={interactivo}
      dragging={interactivo}
      doubleClickZoom={interactivo}
      zoomControl={interactivo}
      style={{ height: altura, width: "100%" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <FitToBounds items={items} />
      {items.map((p) => (
        <Marker
          key={p.id}
          position={[p.coordenadas.lat, p.coordenadas.lng]}
          icon={crearIcono(formatPrecio(p.precio))}
        >
          <Popup>
            <div style={{ minWidth: 200 }}>
              {p.fotoPortada && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={p.fotoPortada}
                  alt={p.titulo}
                  style={{
                    width: "100%",
                    height: 120,
                    objectFit: "cover",
                    borderRadius: 8,
                    marginBottom: 8,
                  }}
                />
              )}
              <p
                style={{
                  margin: 0,
                  fontSize: 11,
                  textTransform: "uppercase",
                  letterSpacing: 1,
                  color: "#6b7280",
                }}
              >
                {p.municipio}
                {p.zona ? ` · ${p.zona}` : ""}
              </p>
              <p
                style={{
                  margin: "4px 0 6px",
                  fontFamily: "Playfair Display, Georgia, serif",
                  fontWeight: 600,
                  color: "#0a1f44",
                }}
              >
                {p.titulo}
              </p>
              <p
                style={{
                  margin: 0,
                  fontFamily: "Playfair Display, Georgia, serif",
                  fontSize: 18,
                  fontWeight: 600,
                  color: "#0a1f44",
                }}
              >
                {formatPrecio(p.precio)}
              </p>
              <a
                href={`/inmueble/${p.slug}`}
                style={{
                  display: "inline-block",
                  marginTop: 8,
                  padding: "6px 14px",
                  background: "#0a1f44",
                  color: "#fff",
                  borderRadius: 999,
                  fontSize: 12,
                  fontWeight: 500,
                  textDecoration: "none",
                }}
              >
                Ver ficha
              </a>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
