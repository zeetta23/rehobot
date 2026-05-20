import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import {
  listarInmueblesPublicos,
  formatPrecio,
  type FiltrosPublicos,
} from "@/lib/firestore/inmuebles";
import type { Operacion, TipoInmueble } from "@/lib/types";
import { MUNICIPIOS_CORREDOR } from "@/lib/types";
import { OrdenarSelect } from "@/components/public/OrdenarSelect";

export const metadata: Metadata = {
  title: "Inmuebles en venta y alquiler en el Corredor del Henares",
  description:
    "Catálogo completo de pisos, chalets, locales y garajes en Alcalá de Henares, Torrejón de Ardoz, Coslada y el resto del Corredor del Henares. Filtra por precio, habitaciones y zona.",
  alternates: { canonical: "/inmuebles" },
};

export const revalidate = 60;

type SearchParamsShape = {
  operacion?: string;
  tipo?: string;
  zona?: string;
  pmin?: string;
  pmax?: string;
  habs?: string;
  banos?: string;
  m2?: string;
  orden?: string;
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
const ORDENES_VALIDOS: NonNullable<FiltrosPublicos["orden"]>[] = [
  "recientes",
  "precio_asc",
  "precio_desc",
  "metros_asc",
  "metros_desc",
];

function parseNum(value: string | undefined): number | undefined {
  if (!value) return undefined;
  const n = Number(value);
  if (Number.isFinite(n) && n >= 0) return n;
  return undefined;
}

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
  filtros.precioMin = parseNum(sp.pmin);
  filtros.precioMax = parseNum(sp.pmax);
  filtros.habitacionesMin = parseNum(sp.habs);
  filtros.banosMin = parseNum(sp.banos);
  filtros.metrosMin = parseNum(sp.m2);
  if (sp.orden && ORDENES_VALIDOS.includes(sp.orden as NonNullable<FiltrosPublicos["orden"]>)) {
    filtros.orden = sp.orden as FiltrosPublicos["orden"];
  }

  const inmuebles = await listarInmueblesPublicos(filtros);

  // Cuenta cuántos filtros activos hay (para badge "Filtros aplicados: N")
  const filtrosActivos = [
    filtros.operacion,
    filtros.tipo,
    filtros.municipio,
    filtros.precioMin,
    filtros.precioMax,
    filtros.habitacionesMin,
    filtros.banosMin,
    filtros.metrosMin,
  ].filter((v) => v !== undefined && v !== "").length;

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-12">
      {/* HEAD */}
      <header className="mb-8 border-b border-black/5 pb-6 sm:mb-10 sm:pb-8">
        <p className="font-body text-xs uppercase tracking-[0.3em] text-gold">
          Catálogo
        </p>
        <h1 className="mt-3 font-display text-3xl font-semibold text-navy sm:text-4xl">
          Inmuebles disponibles
        </h1>
        <p className="mt-2 font-body text-sm text-gray-text">
          {inmuebles.length}{" "}
          {inmuebles.length === 1
            ? "inmueble encontrado"
            : "inmuebles encontrados"}
          {filtrosActivos > 0 &&
            ` · ${filtrosActivos} ${filtrosActivos === 1 ? "filtro" : "filtros"} aplicado${filtrosActivos === 1 ? "" : "s"}`}
        </p>
      </header>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[280px_1fr] lg:gap-10">
        {/* FILTROS */}
        <aside>
          <details
            className="group rounded-2xl border border-black/5 bg-white open:pb-0 lg:open:[&]:!block lg:border-0 lg:bg-transparent"
            open
          >
            <summary className="flex cursor-pointer items-center justify-between rounded-2xl px-4 py-3 font-body text-sm font-medium text-navy lg:hidden">
              <span>
                Filtros
                {filtrosActivos > 0 ? ` (${filtrosActivos})` : ""}
              </span>
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="transition-transform group-open:rotate-180"
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </summary>

            <form
              className="space-y-6 px-4 pb-4 lg:px-0 lg:pb-0"
              action="/inmuebles"
              method="get"
            >
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
                  Municipio
                </h2>
                <select
                  name="zona"
                  defaultValue={sp.zona ?? ""}
                  className="mt-3 w-full rounded-lg border border-black/10 bg-white px-3 py-2 font-body text-sm"
                >
                  <option value="">Todos</option>
                  {MUNICIPIOS_CORREDOR.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <h2 className="font-body text-xs font-semibold uppercase tracking-widest text-navy">
                  Precio (€)
                </h2>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    name="pmin"
                    min={0}
                    placeholder="Desde"
                    defaultValue={sp.pmin ?? ""}
                    className="w-full rounded-lg border border-black/10 px-3 py-2 font-body text-sm"
                  />
                  <input
                    type="number"
                    name="pmax"
                    min={0}
                    placeholder="Hasta"
                    defaultValue={sp.pmax ?? ""}
                    className="w-full rounded-lg border border-black/10 px-3 py-2 font-body text-sm"
                  />
                </div>
              </div>

              <div>
                <h2 className="font-body text-xs font-semibold uppercase tracking-widest text-navy">
                  Habitaciones (mín.)
                </h2>
                <div className="mt-3 flex flex-wrap gap-2">
                  {["", "1", "2", "3", "4", "5"].map((n) => {
                    const isActive = (sp.habs ?? "") === n;
                    return (
                      <label
                        key={n || "any"}
                        className="cursor-pointer rounded-md border border-navy/15 px-3 py-1.5 font-body text-xs text-navy transition-colors hover:bg-navy/10 has-checked:border-navy has-checked:bg-navy has-checked:text-white"
                      >
                        <input
                          type="radio"
                          name="habs"
                          value={n}
                          defaultChecked={isActive}
                          className="sr-only"
                        />
                        {n === "" ? "Cualquiera" : n === "5" ? "5+" : n}
                      </label>
                    );
                  })}
                </div>
              </div>

              <div>
                <h2 className="font-body text-xs font-semibold uppercase tracking-widest text-navy">
                  Baños (mín.)
                </h2>
                <div className="mt-3 flex flex-wrap gap-2">
                  {["", "1", "2", "3"].map((n) => {
                    const isActive = (sp.banos ?? "") === n;
                    return (
                      <label
                        key={n || "any"}
                        className="cursor-pointer rounded-md border border-navy/15 px-3 py-1.5 font-body text-xs text-navy transition-colors hover:bg-navy/10 has-checked:border-navy has-checked:bg-navy has-checked:text-white"
                      >
                        <input
                          type="radio"
                          name="banos"
                          value={n}
                          defaultChecked={isActive}
                          className="sr-only"
                        />
                        {n === "" ? "Cualquiera" : n === "3" ? "3+" : n}
                      </label>
                    );
                  })}
                </div>
              </div>

              <div>
                <h2 className="font-body text-xs font-semibold uppercase tracking-widest text-navy">
                  m² (mín.)
                </h2>
                <input
                  type="number"
                  name="m2"
                  min={0}
                  placeholder="Cualquiera"
                  defaultValue={sp.m2 ?? ""}
                  className="mt-3 w-full rounded-lg border border-black/10 px-3 py-2 font-body text-sm"
                />
              </div>

              {/* Mantener orden al aplicar filtros */}
              {sp.orden && (
                <input type="hidden" name="orden" value={sp.orden} />
              )}

              <button
                type="submit"
                className="w-full rounded-full bg-navy px-5 py-2.5 font-body text-sm font-medium text-white hover:bg-navy-medium"
              >
                Aplicar filtros
              </button>
              {filtrosActivos > 0 && (
                <Link
                  href="/inmuebles"
                  className="block text-center font-body text-xs text-gray-text underline-offset-4 hover:text-navy hover:underline"
                >
                  Limpiar filtros
                </Link>
              )}
            </form>
          </details>
        </aside>

        {/* GRID */}
        <section>
          {/* Barra de ordenación */}
          <div className="mb-6 flex items-center justify-between gap-3 rounded-xl bg-white p-3 shadow-sm">
            <OrdenarSelect valor={filtros.orden ?? "recientes"} />
            <p className="font-body text-xs text-gray-text">
              {inmuebles.length}{" "}
              {inmuebles.length === 1 ? "resultado" : "resultados"}
            </p>
          </div>

          {inmuebles.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-navy/20 bg-cream p-12 text-center sm:p-16">
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
                  <div className="relative aspect-[4/3] bg-cream">
                    {p.fotoPortada ? (
                      <Image
                        src={p.fotoPortada}
                        alt={p.titulo}
                        fill
                        sizes="(min-width: 1280px) 33vw, (min-width: 768px) 50vw, 100vw"
                        className="object-cover"
                      />
                    ) : (
                      <div className="absolute inset-0 bg-gradient-to-br from-navy/10 to-gold/20" />
                    )}
                  </div>
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
