import Link from "next/link";
import {
  listarInmueblesPublicos,
  formatPrecio,
  type FiltrosPublicos,
} from "@/lib/firestore/inmuebles";
import type { Operacion, TipoInmueble } from "@/lib/types";

export const revalidate = 60;

type SearchParamsShape = {
  operacion?: string;
  tipo?: string;
  zona?: string;
};

const OPERACIONES_VALIDAS: Operacion[] = ["venta", "alquiler"];
const TIPOS_VALIDOS: TipoInmueble[] = [
  "piso",
  "chalet",
  "local",
  "garaje",
  "trastero",
  "terreno",
  "oficina",
];

export default async function InmueblesPage({
  searchParams,
}: {
  searchParams: Promise<SearchParamsShape>;
}) {
  const sp = await searchParams;

  const filtros: FiltrosPublicos = {};
  if (sp.operacion && OPERACIONES_VALIDAS.includes(sp.operacion as Operacion)) {
    filtros.operacion = sp.operacion as Operacion;
  }
  if (sp.tipo && TIPOS_VALIDOS.includes(sp.tipo as TipoInmueble)) {
    filtros.tipo = sp.tipo as TipoInmueble;
  }
  if (sp.zona) filtros.municipio = sp.zona;

  const inmuebles = await listarInmueblesPublicos(filtros);

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
          {inmuebles.length}{" "}
          {inmuebles.length === 1
            ? "inmueble encontrado"
            : "inmuebles encontrados"}
        </p>
      </header>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-[280px_1fr]">
        {/* FILTROS (UI estática de momento - filtros reales vía URL) */}
        <aside className="space-y-8">
          <form className="space-y-6" action="/inmuebles" method="get">
            <div>
              <h2 className="font-body text-xs font-semibold uppercase tracking-widest text-navy">
                Operación
              </h2>
              <select
                name="operacion"
                defaultValue={sp.operacion ?? ""}
                className="mt-3 w-full rounded-lg border border-black/10 bg-white px-3 py-2 font-body text-sm"
              >
                <option value="">Todas</option>
                <option value="venta">Venta</option>
                <option value="alquiler">Alquiler</option>
              </select>
            </div>

            <div>
              <h2 className="font-body text-xs font-semibold uppercase tracking-widest text-navy">
                Tipo
              </h2>
              <select
                name="tipo"
                defaultValue={sp.tipo ?? ""}
                className="mt-3 w-full rounded-lg border border-black/10 bg-white px-3 py-2 font-body text-sm capitalize"
              >
                <option value="">Todos</option>
                {TIPOS_VALIDOS.map((t) => (
                  <option key={t} value={t} className="capitalize">
                    {t}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <h2 className="font-body text-xs font-semibold uppercase tracking-widest text-navy">
                Zona / Municipio
              </h2>
              <input
                type="text"
                name="zona"
                defaultValue={sp.zona ?? ""}
                placeholder="Alcalá de Henares"
                className="mt-3 w-full rounded-lg border border-black/10 px-3 py-2 font-body text-sm"
              />
            </div>

            <button
              type="submit"
              className="w-full rounded-full bg-navy px-5 py-2.5 font-body text-sm font-medium text-white hover:bg-navy-medium"
            >
              Aplicar filtros
            </button>
            <Link
              href="/inmuebles"
              className="block text-center font-body text-xs text-gray-text underline-offset-4 hover:text-navy hover:underline"
            >
              Limpiar filtros
            </Link>
          </form>
        </aside>

        {/* GRID */}
        <section>
          {inmuebles.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-navy/20 bg-cream p-16 text-center">
              <p className="font-display text-2xl font-semibold text-navy">
                Sin resultados
              </p>
              <p className="mt-3 font-body text-sm text-gray-text">
                No hay inmuebles que coincidan con los filtros aplicados.
                Prueba a ampliar la búsqueda.
              </p>
              <Link
                href="/inmuebles"
                className="mt-6 inline-flex font-body text-sm font-medium text-navy underline-offset-4 hover:underline"
              >
                Ver todos los inmuebles →
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
              {inmuebles.map((p) => (
                <Link
                  key={p.id}
                  href={`/inmueble/${p.slug}`}
                  className="overflow-hidden rounded-2xl bg-white shadow-sm transition-shadow hover:shadow-xl"
                >
                  <div
                    className="aspect-[4/3] bg-gradient-to-br from-navy/10 to-gold/20 bg-cover bg-center"
                    style={
                      p.fotoPortada
                        ? { backgroundImage: `url(${p.fotoPortada})` }
                        : undefined
                    }
                  />
                  <div className="p-5">
                    <p className="font-body text-xs uppercase tracking-widest text-gray-text">
                      {p.municipio}
                      {p.zona && ` · ${p.zona}`}
                    </p>
                    <h3 className="mt-2 font-display text-base font-semibold text-navy">
                      {p.titulo}
                    </h3>
                    <p className="mt-3 font-display text-xl font-semibold text-navy">
                      {formatPrecio(p.precio)}
                    </p>
                    <div className="mt-4 flex items-center gap-3 border-t border-black/5 pt-4 font-body text-xs text-gray-text">
                      {p.habitaciones > 0 && <span>{p.habitaciones} hab.</span>}
                      {p.habitaciones > 0 && p.banos > 0 && <span>·</span>}
                      {p.banos > 0 && <span>{p.banos} baños</span>}
                      {p.metrosConstruidos > 0 && (
                        <>
                          {(p.habitaciones > 0 || p.banos > 0) && <span>·</span>}
                          <span>{p.metrosConstruidos} m²</span>
                        </>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
