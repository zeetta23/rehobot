import Link from "next/link";
import { notFound } from "next/navigation";
import {
  obtenerInmueblePorSlug,
  formatPrecio,
} from "@/lib/firestore/inmuebles";
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
      <nav className="mx-auto max-w-7xl px-6 pt-6 font-body text-xs text-gray-text">
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
      <section className="mx-auto mt-4 max-w-7xl px-6">
        <div className="grid grid-cols-4 gap-2">
          <div
            className="col-span-4 aspect-[16/9] rounded-2xl bg-gradient-to-br from-navy/10 to-gold/20 bg-cover bg-center sm:col-span-3 sm:row-span-2 sm:aspect-auto"
            style={
              inmueble.fotoPortada
                ? { backgroundImage: `url(${inmueble.fotoPortada})` }
                : undefined
            }
          />
          <div className="hidden aspect-square rounded-2xl bg-gradient-to-br from-navy/10 to-gold/20 sm:block" />
          <div className="hidden aspect-square rounded-2xl bg-gradient-to-br from-navy/10 to-gold/20 sm:block" />
        </div>
      </section>

      <div className="mx-auto mt-10 grid max-w-7xl grid-cols-1 gap-12 px-6 lg:grid-cols-[1fr_360px]">
        {/* CONTENIDO PRINCIPAL */}
        <div>
          <p className="font-body text-xs uppercase tracking-[0.3em] text-gold">
            {inmueble.municipio}
            {inmueble.zona && ` · ${inmueble.zona}`}
          </p>
          <h1 className="mt-3 font-display text-4xl font-semibold text-navy">
            {inmueble.titulo}
          </h1>
          <p className="mt-4 font-display text-3xl font-semibold text-navy">
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
          <section className="mt-10">
            <h2 className="font-display text-2xl font-semibold text-navy">
              Ubicación aproximada
            </h2>
            <div className="mt-4 aspect-[16/9] rounded-2xl border border-dashed border-navy/20 bg-cream">
              <div className="flex h-full items-center justify-center font-body text-sm text-gray-text">
                [ Mapa Leaflet · próximamente ]
              </div>
            </div>
          </section>

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
          <div className="rounded-2xl border border-black/5 bg-white p-6 shadow-sm">
            <p className="font-body text-xs uppercase tracking-[0.3em] text-gold">
              Te interesa este inmueble
            </p>
            <h3 className="mt-2 font-display text-xl font-semibold text-navy">
              Contacta con el agente
            </h3>

            <form className="mt-5 space-y-3">
              <input
                type="text"
                placeholder="Tu nombre"
                className="w-full rounded-lg border border-black/10 px-4 py-2.5 font-body text-sm outline-none focus:border-navy"
              />
              <input
                type="email"
                placeholder="Email"
                className="w-full rounded-lg border border-black/10 px-4 py-2.5 font-body text-sm outline-none focus:border-navy"
              />
              <input
                type="tel"
                placeholder="Teléfono"
                className="w-full rounded-lg border border-black/10 px-4 py-2.5 font-body text-sm outline-none focus:border-navy"
              />
              <textarea
                rows={3}
                defaultValue={`Hola, estoy interesad@ en el inmueble ${inmueble.ref} (${inmueble.titulo}). ¿Podríamos concertar una visita?`}
                className="w-full rounded-lg border border-black/10 px-4 py-2.5 font-body text-sm outline-none focus:border-navy"
              />
              <label className="flex items-start gap-2 font-body text-xs text-gray-text">
                <input type="checkbox" className="mt-0.5 accent-gold" />
                He leído y acepto la{" "}
                <Link href="/privacidad" className="underline">
                  política de privacidad
                </Link>
              </label>
              <button
                type="submit"
                disabled
                className="w-full cursor-not-allowed rounded-full bg-navy py-3 font-body text-sm font-medium text-white opacity-70"
              >
                Enviar consulta (próximamente)
              </button>
              <a
                href="https://wa.me/34916000000"
                className="flex w-full items-center justify-center gap-2 rounded-full border border-gold py-3 font-body text-sm font-medium text-navy transition-colors hover:bg-gold/10"
              >
                WhatsApp directo
              </a>
            </form>
          </div>
        </aside>
      </div>
    </article>
  );
}
