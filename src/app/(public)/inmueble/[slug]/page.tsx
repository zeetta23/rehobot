import Link from "next/link";

const CARACTERISTICAS_MOCK = [
  "Ascensor",
  "Garaje incluido",
  "Trastero",
  "Aire acondicionado",
  "Calefacción individual",
  "Terraza 12 m²",
  "Armarios empotrados",
  "Exterior",
  "Luminoso",
  "Reformado",
];

export default async function FichaInmueblePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

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
        · <span className="text-navy">{slug}</span>
      </nav>

      {/* GALERÍA */}
      <section className="mx-auto mt-4 max-w-7xl px-6">
        <div className="grid grid-cols-4 gap-2">
          <div className="col-span-4 aspect-[16/9] rounded-2xl bg-gradient-to-br from-navy/10 to-gold/20 sm:col-span-3 sm:row-span-2 sm:aspect-auto" />
          <div className="hidden aspect-square rounded-2xl bg-gradient-to-br from-navy/10 to-gold/20 sm:block" />
          <div className="hidden aspect-square rounded-2xl bg-gradient-to-br from-navy/10 to-gold/20 sm:block" />
        </div>
      </section>

      <div className="mx-auto mt-10 grid max-w-7xl grid-cols-1 gap-12 px-6 lg:grid-cols-[1fr_360px]">
        {/* CONTENIDO PRINCIPAL */}
        <div>
          <p className="font-body text-xs uppercase tracking-[0.3em] text-gold">
            Alcalá de Henares · Ensanche
          </p>
          <h1 className="mt-3 font-display text-4xl font-semibold text-navy">
            Piso reformado con 3 habitaciones
          </h1>
          <p className="mt-4 font-display text-3xl font-semibold text-navy">
            245.000 €
          </p>

          {/* Datos clave */}
          <ul className="mt-8 grid grid-cols-2 gap-4 border-y border-black/5 py-6 sm:grid-cols-4">
            {[
              { label: "Habitaciones", value: "3" },
              { label: "Baños", value: "2" },
              { label: "Construidos", value: "95 m²" },
              { label: "Planta", value: "3ª · Ext." },
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
          <section className="mt-10">
            <h2 className="font-display text-2xl font-semibold text-navy">
              Descripción
            </h2>
            <p className="mt-4 font-body text-base leading-relaxed text-dark">
              Magnífico piso completamente reformado en el corazón de El
              Ensanche, una de las zonas más demandadas de Alcalá de Henares.
              La vivienda cuenta con tres dormitorios amplios y luminosos, dos
              baños completos, salón con balcón a la calle y cocina office
              totalmente equipada. Reforma integral del año pasado: suelo
              laminado, ventanas con doble cristal, aire acondicionado por
              conductos y armarios empotrados.
            </p>
          </section>

          {/* Características */}
          <section className="mt-10">
            <h2 className="font-display text-2xl font-semibold text-navy">
              Características
            </h2>
            <ul className="mt-4 grid grid-cols-2 gap-y-2 font-body text-sm text-dark sm:grid-cols-3">
              {CARACTERISTICAS_MOCK.map((c) => (
                <li key={c} className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-gold" /> {c}
                </li>
              ))}
            </ul>
          </section>

          {/* Certificado energético */}
          <section className="mt-10">
            <h2 className="font-display text-2xl font-semibold text-navy">
              Certificado energético
            </h2>
            <div className="mt-4 flex gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-md bg-green-600 font-display text-3xl font-semibold text-white">
                C
              </div>
              <div className="flex h-16 w-16 items-center justify-center rounded-md bg-yellow-500 font-display text-3xl font-semibold text-white">
                D
              </div>
              <div className="font-body text-xs text-gray-text">
                <p>Consumo: C (98 kWh/m²·año)</p>
                <p>Emisiones: D (22 kg CO₂/m²·año)</p>
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
          <section className="mt-10">
            <h2 className="font-display text-2xl font-semibold text-navy">
              Tour virtual 360°
            </h2>
            <div className="mt-4 aspect-[16/9] rounded-2xl border border-dashed border-navy/20 bg-cream">
              <div className="flex h-full items-center justify-center font-body text-sm text-gray-text">
                [ Embed Kuula · próximamente ]
              </div>
            </div>
          </section>
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
                defaultValue="Hola, estoy interesad@ en este inmueble. ¿Podríamos concertar una visita?"
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
                className="w-full rounded-full bg-navy py-3 font-body text-sm font-medium text-white transition-colors hover:bg-navy-medium"
              >
                Enviar consulta
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

      {/* SIMILARES */}
      <section className="mx-auto max-w-7xl px-6 py-16">
        <h2 className="font-display text-2xl font-semibold text-navy">
          Inmuebles similares
        </h2>
        <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="overflow-hidden rounded-2xl bg-white shadow-sm"
            >
              <div className="aspect-[4/3] bg-gradient-to-br from-navy/10 to-gold/20" />
              <div className="p-5">
                <p className="font-body text-xs uppercase tracking-widest text-gray-text">
                  Alcalá · Ensanche
                </p>
                <h3 className="mt-2 font-display text-base font-semibold text-navy">
                  Inmueble similar #{i}
                </h3>
                <p className="mt-3 font-display text-lg font-semibold text-navy">
                  — €
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </article>
  );
}
