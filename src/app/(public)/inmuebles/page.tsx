import Link from "next/link";

const INMUEBLES_MOCK = Array.from({ length: 9 }, (_, i) => ({
  slug: `inmueble-mock-${i + 1}`,
  titulo: [
    "Piso reformado en El Ensanche",
    "Chalet adosado con jardín",
    "Ático con terraza panorámica",
    "Piso de 4 habitaciones cerca del centro",
    "Local comercial a pie de calle",
    "Garaje en zona céntrica",
    "Piso luminoso con balcón",
    "Casa unifamiliar con piscina",
    "Estudio reformado, ideal inversión",
  ][i],
  zona: [
    "Alcalá · Ensanche",
    "Torrejón · Zarzuela",
    "Coslada · Centro",
    "Alcalá · La Garena",
    "Torrejón · Casco antiguo",
    "Alcalá · Centro",
    "San Fernando · Jarama",
    "Velilla · Sur",
    "Coslada · Estación",
  ][i],
  precio: ["245.000", "385.000", "298.000", "210.000", "120.000", "32.000", "189.000", "450.000", "98.000"][i] + " €",
  habitaciones: [3, 4, 2, 4, 0, 0, 2, 5, 1][i],
  banos: [2, 3, 2, 2, 1, 0, 1, 4, 1][i],
  metros: [95, 180, 88, 110, 75, 18, 80, 230, 35][i],
}));

export default function InmueblesPage() {
  return (
    <div className="mx-auto max-w-7xl px-6 py-12">
      {/* HEAD */}
      <header className="mb-10 border-b border-black/5 pb-8">
        <p className="font-body text-xs uppercase tracking-[0.3em] text-gold">
          Catálogo
        </p>
        <h1 className="mt-3 font-display text-4xl font-semibold text-navy">
          Inmuebles disponibles
        </h1>
        <p className="mt-2 font-body text-sm text-gray-text">
          {INMUEBLES_MOCK.length} inmuebles encontrados
        </p>
      </header>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-[280px_1fr]">
        {/* FILTROS */}
        <aside className="space-y-8">
          <div>
            <h2 className="font-body text-xs font-semibold uppercase tracking-widest text-navy">
              Operación
            </h2>
            <div className="mt-3 space-y-2">
              {["Venta", "Alquiler"].map((op) => (
                <label
                  key={op}
                  className="flex items-center gap-2 font-body text-sm text-dark"
                >
                  <input type="checkbox" className="accent-gold" /> {op}
                </label>
              ))}
            </div>
          </div>

          <div>
            <h2 className="font-body text-xs font-semibold uppercase tracking-widest text-navy">
              Tipo
            </h2>
            <div className="mt-3 space-y-2">
              {["Piso", "Chalet", "Local", "Garaje", "Trastero"].map((t) => (
                <label
                  key={t}
                  className="flex items-center gap-2 font-body text-sm text-dark"
                >
                  <input type="checkbox" className="accent-gold" /> {t}
                </label>
              ))}
            </div>
          </div>

          <div>
            <h2 className="font-body text-xs font-semibold uppercase tracking-widest text-navy">
              Precio máximo
            </h2>
            <input
              type="range"
              min={50000}
              max={1000000}
              step={10000}
              defaultValue={500000}
              className="mt-3 w-full accent-gold"
            />
            <p className="mt-2 font-body text-xs text-gray-text">
              Hasta 500.000 €
            </p>
          </div>

          <div>
            <h2 className="font-body text-xs font-semibold uppercase tracking-widest text-navy">
              Habitaciones (mín.)
            </h2>
            <div className="mt-3 flex gap-2">
              {[1, 2, 3, 4, "5+"].map((h) => (
                <button
                  key={h}
                  className="rounded-md border border-navy/15 px-3 py-1.5 font-body text-xs text-navy hover:bg-navy hover:text-white"
                >
                  {h}
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* GRID */}
        <section>
          <div className="mb-6 flex items-center justify-between">
            <p className="font-body text-sm text-gray-text">
              Ordenar por:
            </p>
            <select className="rounded-md border border-black/10 bg-white px-3 py-2 font-body text-sm">
              <option>Más recientes</option>
              <option>Precio asc.</option>
              <option>Precio desc.</option>
              <option>m² asc.</option>
              <option>m² desc.</option>
            </select>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            {INMUEBLES_MOCK.map((p) => (
              <Link
                key={p.slug}
                href={`/inmueble/${p.slug}`}
                className="overflow-hidden rounded-2xl bg-white shadow-sm transition-shadow hover:shadow-xl"
              >
                <div className="aspect-[4/3] bg-gradient-to-br from-navy/10 to-gold/20" />
                <div className="p-5">
                  <p className="font-body text-xs uppercase tracking-widest text-gray-text">
                    {p.zona}
                  </p>
                  <h3 className="mt-2 font-display text-base font-semibold text-navy">
                    {p.titulo}
                  </h3>
                  <p className="mt-3 font-display text-xl font-semibold text-navy">
                    {p.precio}
                  </p>
                  <div className="mt-4 flex items-center gap-3 border-t border-black/5 pt-4 font-body text-xs text-gray-text">
                    {p.habitaciones > 0 && <span>{p.habitaciones} hab.</span>}
                    {p.habitaciones > 0 && p.banos > 0 && <span>·</span>}
                    {p.banos > 0 && <span>{p.banos} baños</span>}
                    {(p.habitaciones > 0 || p.banos > 0) && <span>·</span>}
                    <span>{p.metros} m²</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* PAGINACIÓN */}
          <nav className="mt-12 flex items-center justify-center gap-2">
            {[1, 2, 3].map((n) => (
              <button
                key={n}
                className={`rounded-md px-4 py-2 font-body text-sm ${
                  n === 1
                    ? "bg-navy text-white"
                    : "border border-navy/15 text-navy hover:bg-navy hover:text-white"
                }`}
              >
                {n}
              </button>
            ))}
          </nav>
        </section>
      </div>
    </div>
  );
}
