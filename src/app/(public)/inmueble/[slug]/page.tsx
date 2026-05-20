import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import {
  obtenerInmueblePorSlug,
  formatPrecio,
} from "@/lib/firestore/inmuebles";
import { InteresInmuebleForm } from "@/components/forms/InteresInmuebleForm";
import { MapaUbicacion } from "@/components/maps/MapaUbicacion";
import type { CalificacionEnergetica } from "@/lib/types";

export const revalidate = 60;

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
  const inmueble = await obtenerInmueblePorSlug(slug);

  if (!inmueble) {
    notFound();
  }

  return (
    <article>
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
      <section className="mx-auto mt-4 max-w-7xl px-4 sm:px-6">
        <div className="grid grid-cols-4 gap-2">
          {/* Foto principal */}
          <div className="relative col-span-4 aspect-[16/9] overflow-hidden rounded-2xl bg-cream sm:col-span-3 sm:row-span-2 sm:aspect-auto">
            {inmueble.fotos[0] ? (
              <Image
                src={inmueble.fotos[0].urlLarge || inmueble.fotos[0].url}
                alt={inmueble.titulo}
                fill
                sizes="(min-width: 768px) 75vw, 100vw"
                className="object-cover"
                priority
              />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-navy/10 to-gold/20" />
            )}
          </div>

          {/* Hasta 2 fotos secundarias visibles a partir de tablet */}
          {[1, 2].map((idx) => {
            const foto = inmueble.fotos[idx];
            return (
              <div
                key={idx}
                className="relative hidden aspect-square overflow-hidden rounded-2xl bg-cream sm:block"
              >
                {foto ? (
                  <Image
                    src={foto.urlMedium || foto.url}
                    alt={`${inmueble.titulo} ${idx + 1}`}
                    fill
                    sizes="25vw"
                    className="object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-navy/10 to-gold/20" />
                )}
              </div>
            );
          })}
        </div>

        {/* Galería completa: todas las fotos restantes */}
        {inmueble.fotos.length > 3 && (
          <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-6">
            {inmueble.fotos.slice(3).map((foto, idx) => (
              <div
                key={idx}
                className="relative aspect-square overflow-hidden rounded-xl bg-cream"
              >
                <Image
                  src={foto.urlMedium || foto.url}
                  alt={`${inmueble.titulo} ${idx + 4}`}
                  fill
                  sizes="(min-width: 1024px) 16vw, (min-width: 640px) 25vw, 50vw"
                  className="object-cover"
                />
              </div>
            ))}
          </div>
        )}
      </section>

      <div className="mx-auto mt-10 grid max-w-7xl grid-cols-1 gap-10 px-4 sm:px-6 lg:grid-cols-[1fr_360px] lg:gap-12">
        {/* CONTENIDO PRINCIPAL */}
        <div>
          <p className="font-body text-xs uppercase tracking-[0.3em] text-gold">
            {inmueble.municipio}
            {inmueble.zona && ` · ${inmueble.zona}`}
          </p>
          <h1 className="mt-3 font-display text-3xl font-semibold text-navy sm:text-4xl">
            {inmueble.titulo}
          </h1>
          <p className="mt-4 font-display text-2xl font-semibold text-navy sm:text-3xl">
            {formatPrecio(inmueble.precio)}
          </p>
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

          {/* Características */}
          {inmueble.caracteristicas.length > 0 && (
            <section className="mt-10">
              <h2 className="font-display text-2xl font-semibold text-navy">
                Características
              </h2>
              <ul className="mt-4 grid grid-cols-2 gap-y-2 font-body text-sm capitalize text-dark sm:grid-cols-3">
                {inmueble.caracteristicas.map((c) => (
                  <li key={c} className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-gold" />{" "}
                    {c.replace(/_/g, " ")}
                  </li>
                ))}
              </ul>
            </section>
          )}

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
            whatsappUrl={`https://wa.me/34916000000?text=${encodeURIComponent(
              `Hola, me interesa el inmueble ${inmueble.ref} (${inmueble.titulo}).`,
            )}`}
          />
        </aside>
      </div>
    </article>
  );
}
