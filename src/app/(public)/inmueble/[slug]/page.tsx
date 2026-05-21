import { cache } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  obtenerInmueblePorSlug,
  formatPrecio,
} from "@/lib/firestore/inmuebles";
import { InteresInmuebleForm } from "@/components/forms/InteresInmuebleForm";
import { MapaUbicacion } from "@/components/maps/MapaUbicacion";
import { CalculadoraHipoteca } from "@/components/public/CalculadoraHipoteca";
import { CompartirInmueble } from "@/components/public/CompartirInmueble";
import { GaleriaInmueble } from "@/components/public/GaleriaInmueble";
import type { CalificacionEnergetica } from "@/lib/types";

export const revalidate = 60;

const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL || "https://rehobot-rose.vercel.app";

// React cache: misma query Firestore se reutiliza dentro del mismo render.
const obtenerInmuebleCached = cache(obtenerInmueblePorSlug);

function descripcionCorta(texto: string, max = 155): string {
  if (!texto) return "";
  const plano = texto.replace(/\s+/g, " ").trim();
  if (plano.length <= max) return plano;
  return plano.slice(0, max - 1).replace(/\s+\S*$/, "") + "…";
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const inmueble = await obtenerInmuebleCached(slug);
  if (!inmueble) {
    return {
      title: "Inmueble no encontrado · Rehobot Real Estate",
      description:
        "Este inmueble ya no está disponible. Consulta nuestro catálogo completo en Rehobot Real Estate.",
    };
  }

  const ubicacion = [inmueble.municipio, inmueble.zona].filter(Boolean).join(", ");
  const title = `${inmueble.titulo} — ${formatPrecio(inmueble.precio)}${
    ubicacion ? " · " + ubicacion : ""
  } · Rehobot Real Estate`;

  const partesDescripcion = [
    inmueble.titulo,
    ubicacion,
    inmueble.habitaciones > 0 ? `${inmueble.habitaciones} hab.` : "",
    inmueble.banos > 0 ? `${inmueble.banos} baños` : "",
    inmueble.metrosConstruidos > 0
      ? `${inmueble.metrosConstruidos} m²`
      : "",
  ].filter(Boolean);
  const fallbackDescripcion =
    `${partesDescripcion.join(" · ")} · ${formatPrecio(inmueble.precio)}. ` +
    `Encuentra esta vivienda en Rehobot Real Estate, tu inmobiliaria en Madrid y el Corredor del Henares.`;
  const description =
    descripcionCorta(inmueble.descripcion) || descripcionCorta(fallbackDescripcion);

  const url = `${APP_URL}/inmueble/${inmueble.slug}`;
  const imagen = inmueble.fotos[0]?.urlLarge || inmueble.fotos[0]?.url;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      siteName: "Rehobot Real Estate",
      type: "website",
      locale: "es_ES",
      images: imagen
        ? [
            {
              url: imagen,
              alt: inmueble.titulo,
            },
          ]
        : undefined,
    },
    twitter: {
      card: imagen ? "summary_large_image" : "summary",
      title,
      description,
      images: imagen ? [imagen] : undefined,
    },
  };
}

const LABELS_TIPO_COCINA: Record<string, string> = {
  independiente: "Independiente",
  americana: "Americana",
  office: "Office",
};

const LABELS_TIPO_CALEFACCION: Record<string, string> = {
  sin: "Sin calefacción",
  electrica: "Eléctrica",
  gas_natural: "Gas natural",
  gas_propano: "Gas propano/butano",
  gasoil: "Gasoil",
  suelo_radiante: "Suelo radiante",
};

const LABELS_TIPO: Record<string, string> = {
  piso: "Piso",
  chalet: "Chalet",
  local: "Local comercial",
  garaje: "Garaje",
  trastero: "Trastero",
  terreno: "Terreno",
  oficina: "Oficina",
};

interface CardCarac {
  icono: string;
  label: string;
  value: string;
}

function colorCalificacion(c: CalificacionEnergetica): string {
  const map: Record<CalificacionEnergetica, string> = {
    A: "bg-green-700",
    B: "bg-green-600",
    C: "bg-green-500",
    D: "bg-yellow-500",
    E: "bg-orange-500",
    F: "bg-red-500",
    G: "bg-red-700",
    en_tramite: "bg-gray-400",
  };
  return map[c];
}

function labelCalificacion(c: CalificacionEnergetica): string {
  return c === "en_tramite" ? "—" : c;
}

export default async function FichaInmueblePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const inmueble = await obtenerInmuebleCached(slug);

  if (!inmueble) {
    notFound();
  }

  // JSON-LD para Google (rich snippets)
  const ubicacionStr = [inmueble.municipio, inmueble.zona]
    .filter(Boolean)
    .join(", ");
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": inmueble.operacion === "venta"
      ? "RealEstateListing"
      : "Apartment",
    name: inmueble.titulo,
    description: inmueble.descripcion || `${inmueble.titulo} en ${ubicacionStr}`,
    url: `${APP_URL}/inmueble/${inmueble.slug}`,
    image: inmueble.fotos
      .slice(0, 5)
      .map((f) => f.urlLarge || f.url)
      .filter(Boolean),
    address: {
      "@type": "PostalAddress",
      addressLocality: inmueble.municipio || undefined,
      addressRegion: "Madrid",
      addressCountry: "ES",
    },
    geo:
      inmueble.coordenadas.lat !== 0 && inmueble.coordenadas.lng !== 0
        ? {
            "@type": "GeoCoordinates",
            latitude: inmueble.coordenadas.lat,
            longitude: inmueble.coordenadas.lng,
          }
        : undefined,
    numberOfRooms:
      inmueble.habitaciones > 0 ? inmueble.habitaciones : undefined,
    numberOfBathroomsTotal: inmueble.banos > 0 ? inmueble.banos : undefined,
    floorSize:
      inmueble.metrosConstruidos > 0
        ? {
            "@type": "QuantitativeValue",
            value: inmueble.metrosConstruidos,
            unitCode: "MTK",
          }
        : undefined,
    offers: {
      "@type": "Offer",
      price: inmueble.precio,
      priceCurrency: "EUR",
      availability:
        inmueble.estado === "activo"
          ? "https://schema.org/InStock"
          : inmueble.estado === "reservado"
            ? "https://schema.org/LimitedAvailability"
            : "https://schema.org/SoldOut",
      seller: {
        "@type": "RealEstateAgent",
        name: "Rehobot Real Estate",
      },
    },
  };

  return (
    <article>
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* Breadcrumb */}
      <nav className="mx-auto max-w-7xl px-4 pt-6 font-body text-xs text-gray-text sm:px-6">
        <Link href="/" className="hover:text-navy">
          Inicio
        </Link>{" "}
        ·{" "}
        <Link href="/inmuebles" className="hover:text-navy">
          Inmuebles
        </Link>{" "}
        · <span className="text-navy">{inmueble.ref}</span>
      </nav>

      {/* GALERÍA */}
      <GaleriaInmueble fotos={inmueble.fotos} titulo={inmueble.titulo} />

      <div className="mx-auto mt-10 grid max-w-7xl grid-cols-1 gap-10 px-4 pb-20 sm:px-6 lg:grid-cols-[1fr_360px] lg:gap-12 lg:pb-32">
        {/* CONTENIDO PRINCIPAL */}
        <div>
          <p className="font-body text-xs uppercase tracking-[0.3em] text-gold">
            {inmueble.municipio}
            {inmueble.zona && ` · ${inmueble.zona}`}
          </p>
          <h1 className="mt-3 font-display text-3xl font-semibold text-navy sm:text-4xl">
            {inmueble.titulo}
          </h1>
          {inmueble.direccionPublica && (
            <p className="mt-2 inline-flex items-center gap-1.5 font-body text-sm text-gray-text">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-4 w-4 text-navy"
              >
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              {inmueble.direccionPublica}
            </p>
          )}
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <p className="font-display text-2xl font-semibold text-navy sm:text-3xl">
              {formatPrecio(inmueble.precio)}
            </p>
            <CompartirInmueble
              url={`${APP_URL}/inmueble/${inmueble.slug}`}
              titulo={inmueble.titulo}
              precio={formatPrecio(inmueble.precio)}
              ubicacion={[inmueble.municipio, inmueble.zona]
                .filter(Boolean)
                .join(", ")}
            />
          </div>
          {inmueble.estado !== "activo" && (
            <p className="mt-3 inline-flex rounded-full bg-yellow-100 px-3 py-1 font-body text-xs font-medium uppercase tracking-widest text-yellow-800">
              {inmueble.estado}
            </p>
          )}

          {/* Datos clave */}
          <ul className="mt-8 grid grid-cols-2 gap-4 border-y border-black/5 py-6 sm:grid-cols-4">
            {[
              {
                label: "Habitaciones",
                value: inmueble.habitaciones > 0 ? `${inmueble.habitaciones}` : "—",
              },
              {
                label: "Baños",
                value: inmueble.banos > 0 ? `${inmueble.banos}` : "—",
              },
              {
                label: "Construidos",
                value:
                  inmueble.metrosConstruidos > 0
                    ? `${inmueble.metrosConstruidos} m²`
                    : "—",
              },
              {
                label: "Planta",
                value: inmueble.planta ?? "—",
              },
            ].map((d) => (
              <li key={d.label}>
                <p className="font-display text-xl font-semibold text-navy">
                  {d.value}
                </p>
                <p className="font-body text-xs uppercase tracking-widest text-gray-text">
                  {d.label}
                </p>
              </li>
            ))}
          </ul>

          {/* Descripción */}
          {inmueble.descripcion && (
            <section className="mt-10">
              <h2 className="font-display text-2xl font-semibold text-navy">
                Descripción
              </h2>
              <p className="mt-4 whitespace-pre-line font-body text-base leading-relaxed text-dark">
                {inmueble.descripcion}
              </p>
            </section>
          )}

          {/* Características — sección con cards (estilo competencia) */}
          {(() => {
            const tieneAC = inmueble.caracteristicas.includes("ac");
            const tieneTerraza =
              inmueble.caracteristicas.includes("terraza") ||
              inmueble.caracteristicas.includes("balcon");
            const cards: CardCarac[] = [];

            cards.push({
              icono: "🏠",
              label: "Tipo de propiedad",
              value: LABELS_TIPO[inmueble.tipo] ?? inmueble.tipo,
            });
            cards.push({
              icono: "🏷️",
              label: "Operación",
              value:
                inmueble.operacion === "venta" ? "Venta" : "Alquiler",
            });
            if (inmueble.anoConstruccion) {
              cards.push({
                icono: "📅",
                label: "Año de construcción",
                value: String(inmueble.anoConstruccion),
              });
            }
            cards.push({
              icono: "🌿",
              label: "Terraza / balcón",
              value: tieneTerraza ? "Sí" : "No",
            });
            cards.push({
              icono: "❄️",
              label: "Aire acondicionado",
              value: tieneAC ? "Sí" : "No",
            });
            if (inmueble.tipoCalefaccion) {
              cards.push({
                icono: "🔥",
                label: "Calefacción",
                value:
                  LABELS_TIPO_CALEFACCION[inmueble.tipoCalefaccion] ??
                  inmueble.tipoCalefaccion,
              });
            }
            cards.push({
              icono: "⚡",
              label: "Certificado energético",
              value: labelCalificacion(inmueble.energetico.consumo),
            });
            if (
              inmueble.gastosComunidad !== null &&
              inmueble.gastosComunidad > 0
            ) {
              cards.push({
                icono: "💶",
                label: "Gastos de comunidad",
                value: `${inmueble.gastosComunidad} €/mes`,
              });
            }
            if (inmueble.tipoCocina) {
              cards.push({
                icono: "🍴",
                label: "Cocina",
                value:
                  LABELS_TIPO_COCINA[inmueble.tipoCocina] ??
                  inmueble.tipoCocina,
              });
            }
            if (inmueble.planta) {
              cards.push({
                icono: "🛗",
                label: "Planta",
                value: inmueble.planta,
              });
            }
            if (inmueble.orientacion) {
              cards.push({
                icono: "🧭",
                label: "Orientación",
                value: inmueble.orientacion,
              });
            }

            return (
              <section className="mt-10">
                <h2 className="font-display text-2xl font-semibold text-navy">
                  Características
                </h2>
                <ul className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {cards.map((c) => (
                    <li
                      key={c.label}
                      className="flex items-start gap-3 rounded-xl border-l-2 border-gold bg-cream/40 p-4"
                    >
                      <span className="text-2xl" aria-hidden>
                        {c.icono}
                      </span>
                      <div>
                        <p className="font-body text-xs uppercase tracking-widest text-gray-text">
                          {c.label}
                        </p>
                        <p className="mt-1 font-body text-sm font-medium text-navy">
                          {c.value}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>

                {/* Otras características destacadas como chips */}
                {(() => {
                  const ignoradas = new Set(["ac", "terraza", "balcon"]);
                  const chips = inmueble.caracteristicas.filter(
                    (c) => !ignoradas.has(c),
                  );
                  if (chips.length === 0) return null;
                  return (
                    <ul className="mt-6 flex flex-wrap gap-2">
                      {chips.map((c) => (
                        <li
                          key={c}
                          className="rounded-full border border-navy/15 bg-white px-3 py-1.5 font-body text-xs capitalize text-navy"
                        >
                          {c.replace(/_/g, " ")}
                        </li>
                      ))}
                    </ul>
                  );
                })()}
              </section>
            );
          })()}

          {/* Certificado energético */}
          <section className="mt-10">
            <h2 className="font-display text-2xl font-semibold text-navy">
              Certificado energético
            </h2>
            <div className="mt-4 flex gap-4">
              <div
                className={`flex h-16 w-16 items-center justify-center rounded-md font-display text-3xl font-semibold text-white ${colorCalificacion(
                  inmueble.energetico.consumo,
                )}`}
              >
                {labelCalificacion(inmueble.energetico.consumo)}
              </div>
              <div
                className={`flex h-16 w-16 items-center justify-center rounded-md font-display text-3xl font-semibold text-white ${colorCalificacion(
                  inmueble.energetico.emisiones,
                )}`}
              >
                {labelCalificacion(inmueble.energetico.emisiones)}
              </div>
              <div className="font-body text-xs text-gray-text">
                <p>
                  Consumo: {labelCalificacion(inmueble.energetico.consumo)}
                  {inmueble.energetico.consumoKwh &&
                    ` (${inmueble.energetico.consumoKwh} kWh/m²·año)`}
                </p>
                <p>
                  Emisiones: {labelCalificacion(inmueble.energetico.emisiones)}
                  {inmueble.energetico.emisionesKg &&
                    ` (${inmueble.energetico.emisionesKg} kg CO₂/m²·año)`}
                </p>
              </div>
            </div>
          </section>

          {/* Calculadora de hipoteca (solo para venta) */}
          {inmueble.operacion === "venta" && inmueble.precio > 0 && (
            <section className="mt-10">
              <CalculadoraHipoteca precioInicial={inmueble.precio} />
            </section>
          )}

          {/* Mapa */}
          {inmueble.coordenadas.lat !== 0 && inmueble.coordenadas.lng !== 0 && (
            <section className="mt-10">
              <h2 className="font-display text-2xl font-semibold text-navy">
                Ubicación aproximada
              </h2>
              <p className="mt-2 font-body text-xs text-gray-text">
                Mostramos un radio de privacidad. La dirección exacta se
                facilita en la visita.
              </p>
              <div className="mt-4 aspect-[16/9] overflow-hidden rounded-2xl">
                <MapaUbicacion
                  lat={inmueble.coordenadas.lat}
                  lng={inmueble.coordenadas.lng}
                />
              </div>
            </section>
          )}

          {/* Tour 360 */}
          {inmueble.tour360Url && (
            <section className="mt-10">
              <h2 className="font-display text-2xl font-semibold text-navy">
                Tour virtual 360°
              </h2>
              <div className="mt-4 aspect-[16/9] overflow-hidden rounded-2xl">
                <iframe
                  src={inmueble.tour360Url}
                  className="h-full w-full"
                  allow="fullscreen; vr"
                />
              </div>
            </section>
          )}
        </div>

        {/* FORMULARIO CONTACTO */}
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <InteresInmuebleForm
            inmuebleId={inmueble.id}
            inmuebleRef={inmueble.ref}
            inmuebleTitulo={inmueble.titulo}
            agenteAsignado={null}
            whatsappUrl={`https://wa.me/34643089984?text=${encodeURIComponent(
              `Hola, me interesa el inmueble ${inmueble.ref} (${inmueble.titulo}).`,
            )}`}
          />
        </aside>
      </div>
    </article>
  );
}
