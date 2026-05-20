import Link from "next/link";
import Image from "next/image";
import {
  listarDestacados,
  listarInmueblesPublicos,
  formatPrecio,
} from "@/lib/firestore/inmuebles";
import { MapaInmuebles } from "@/components/maps/MapaInmuebles";

export const revalidate = 60;

const TIPOS = [
  { label: "Pisos", href: "/inmuebles?tipo=piso", count: "—" },
  { label: "Chalets", href: "/inmuebles?tipo=chalet", count: "—" },
  { label: "Locales", href: "/inmuebles?tipo=local", count: "—" },
  { label: "Garajes", href: "/inmuebles?tipo=garaje", count: "—" },
];

const ZONAS = [
  "Alcalá de Henares",
  "Torrejón de Ardoz",
  "Coslada",
  "San Fernando de Henares",
  "Mejorada del Campo",
  "Velilla de San Antonio",
  "Loeches",
];

function slugifyZona(zona: string) {
  return zona
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/ /g, "-");
}

export default async function HomePage() {
  // Trae destacados; si no hay aún, cae a los 3 más recientes publicados.
  const todosPublicos = await listarInmueblesPublicos();
  let destacados = await listarDestacados(3);
  if (destacados.length === 0) {
    destacados = todosPublicos.slice(0, 3);
  }
  const inmueblesConCoords = todosPublicos.filter(
    (i) => i.coordenadas.lat !== 0 && i.coordenadas.lng !== 0,
  );

  return (
    <>
      {/* HERO */}
      <section className="relative bg-navy text-white">
        <div className="mx-auto max-w-7xl px-4 pb-16 pt-12 sm:px-6 sm:pb-24 sm:pt-20 lg:pt-28">
          <p className="font-body text-xs uppercase tracking-[0.3em] text-gold">
            Inmobiliaria del Corredor del Henares
          </p>
          <h1 className="mt-6 max-w-3xl font-display text-4xl font-semibold leading-tight sm:text-5xl lg:text-6xl">
            Encuentra tu próximo hogar en el{" "}
            <span className="text-gold">Corredor del Henares</span>
          </h1>
          <p className="mt-6 max-w-xl font-body text-base text-white/70 sm:text-lg">
            Compra, venta y asesoramiento personalizado. Más de 15 años
            acompañando a familias en Alcalá, Torrejón, Coslada y alrededores.
          </p>

          {/* BUSCADOR */}
          <form
            action="/inmuebles"
            className="mt-8 grid max-w-4xl grid-cols-1 gap-3 rounded-2xl bg-white p-4 shadow-2xl sm:mt-10 sm:grid-cols-2 lg:grid-cols-4"
          >
            <label className="flex flex-col">
              <span className="font-body text-[10px] uppercase tracking-widest text-gray-text">
                Operación
              </span>
              <select
                name="operacion"
                className="mt-1 bg-transparent font-body text-sm text-dark outline-none"
              >
                <option value="venta">Venta</option>
                <option value="alquiler">Alquiler</option>
              </select>
            </label>
            <label className="flex flex-col">
              <span className="font-body text-[10px] uppercase tracking-widest text-gray-text">
                Tipo
              </span>
              <select
                name="tipo"
                className="mt-1 bg-transparent font-body text-sm text-dark outline-none"
              >
                <option value="">Cualquiera</option>
                <option value="piso">Piso</option>
                <option value="chalet">Chalet</option>
                <option value="local">Local</option>
              </select>
            </label>
            <label className="flex flex-col">
              <span className="font-body text-[10px] uppercase tracking-widest text-gray-text">
                Zona
              </span>
              <select
                name="zona"
                className="mt-1 bg-transparent font-body text-sm text-dark outline-none"
              >
                <option value="">Cualquiera</option>
                {ZONAS.map((z) => (
                  <option key={z} value={z}>
                    {z}
                  </option>
                ))}
              </select>
            </label>
            <button
              type="submit"
              className="rounded-xl bg-navy px-5 py-3 font-body text-sm font-medium text-white transition-colors hover:bg-navy-medium"
            >
              Buscar inmuebles
            </button>
          </form>
        </div>
      </section>

      {/* STATS */}
      <section className="border-y border-black/5 bg-cream">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-y-10 px-6 py-12 sm:grid-cols-4">
          {[
            { num: "15+", label: "Años de experiencia" },
            { num: "500+", label: "Inmuebles vendidos" },
            { num: "4,9", label: "Valoración Google" },
            { num: "7", label: "Municipios cubiertos" },
          ].map((s) => (
            <div key={s.label} className="text-center">
              <p className="font-display text-4xl font-semibold text-navy">
                {s.num}
              </p>
              <p className="mt-2 font-body text-xs uppercase tracking-widest text-gray-text">
                {s.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* EXPLORAR POR TIPO */}
      <section className="mx-auto max-w-7xl px-6 py-24">
        <div className="flex items-end justify-between">
          <div>
            <p className="font-body text-xs uppercase tracking-[0.3em] text-gold">
              Catálogo
            </p>
            <h2 className="mt-3 font-display text-3xl font-semibold text-navy sm:text-4xl">
              Explorar por tipo
            </h2>
          </div>
          <Link
            href="/inmuebles"
            className="hidden font-body text-sm font-medium text-navy underline-offset-4 hover:underline sm:inline"
          >
            Ver todos →
          </Link>
        </div>
        <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {TIPOS.map((tipo) => (
            <Link
              key={tipo.href}
              href={tipo.href}
              className="group flex aspect-square flex-col items-start justify-between rounded-2xl border border-black/5 bg-white p-6 transition-shadow hover:shadow-lg"
            >
              <span className="font-body text-xs uppercase tracking-widest text-gray-text">
                {tipo.count} inmuebles
              </span>
              <span className="font-display text-2xl font-semibold text-navy group-hover:text-gold">
                {tipo.label}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* DESTACADOS */}
      <section className="bg-cream">
        <div className="mx-auto max-w-7xl px-6 py-24">
          <div className="flex items-end justify-between">
            <div>
              <p className="font-body text-xs uppercase tracking-[0.3em] text-gold">
                Selección
              </p>
              <h2 className="mt-3 font-display text-3xl font-semibold text-navy sm:text-4xl">
                Inmuebles destacados
              </h2>
            </div>
            <Link
              href="/inmuebles"
              className="hidden font-body text-sm font-medium text-navy underline-offset-4 hover:underline sm:inline"
            >
              Ver listado completo →
            </Link>
          </div>
          {destacados.length === 0 ? (
            <div className="mt-10 rounded-2xl border border-dashed border-navy/20 bg-white p-12 text-center">
              <p className="font-display text-xl font-semibold text-navy">
                Pronto verás aquí nuestra selección
              </p>
              <p className="mt-3 font-body text-sm text-gray-text">
                Estamos preparando los primeros inmuebles. Vuelve en breve.
              </p>
            </div>
          ) : (
            <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {destacados.map((p) => (
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
                        sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                        className="object-cover"
                      />
                    ) : (
                      <div className="absolute inset-0 bg-gradient-to-br from-navy/10 to-gold/20" />
                    )}
                  </div>
                  <div className="p-6">
                    <p className="font-body text-xs uppercase tracking-widest text-gray-text">
                      {p.municipio}
                      {p.zona && ` · ${p.zona}`}
                    </p>
                    <h3 className="mt-2 font-display text-lg font-semibold text-navy">
                      {p.titulo}
                    </h3>
                    <p className="mt-3 font-display text-2xl font-semibold text-navy">
                      {formatPrecio(p.precio)}
                    </p>
                    <div className="mt-4 flex items-center gap-4 border-t border-black/5 pt-4 font-body text-xs text-gray-text">
                      {p.habitaciones > 0 && <span>{p.habitaciones} hab.</span>}
                      {p.habitaciones > 0 && p.banos > 0 && <span>·</span>}
                      {p.banos > 0 && <span>{p.banos} baños</span>}
                      {p.metrosConstruidos > 0 && (
                        <>
                          {(p.habitaciones > 0 || p.banos > 0) && (
                            <span>·</span>
                          )}
                          <span>{p.metrosConstruidos} m²</span>
                        </>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* VENDER CTA */}
      <section className="bg-navy text-white">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-12 px-6 py-24 lg:grid-cols-2 lg:items-center">
          <div>
            <p className="font-body text-xs uppercase tracking-[0.3em] text-gold">
              Para propietarios
            </p>
            <h2 className="mt-3 font-display text-3xl font-semibold sm:text-4xl">
              ¿Quieres vender tu casa?
            </h2>
            <p className="mt-6 font-body text-base text-white/70">
              Tasamos tu vivienda <strong>gratis</strong> y sin compromiso.
              Conocemos el mercado del Corredor del Henares como nadie y te
              ayudamos a vender al mejor precio en el menor tiempo posible.
            </p>
            <Link
              href="/vender"
              className="mt-8 inline-flex rounded-full bg-gold px-6 py-3 font-body text-sm font-medium text-navy transition-colors hover:bg-gold-light"
            >
              Solicitar valoración gratis
            </Link>
          </div>
          <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {[
              "Valoración gratuita y sin compromiso",
              "Profesionales con +15 años en la zona",
              "Marketing fotográfico profesional",
              "Asesoramiento legal y fiscal",
            ].map((item) => (
              <li
                key={item}
                className="rounded-xl border border-white/10 bg-white/5 p-5 font-body text-sm text-white/80"
              >
                {item}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* MAPA DE INMUEBLES */}
      <section className="bg-cream">
        <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="font-body text-xs uppercase tracking-[0.3em] text-gold">
                Donde operamos
              </p>
              <h2 className="mt-3 font-display text-3xl font-semibold text-navy sm:text-4xl">
                Explora los inmuebles en el mapa
              </h2>
              <p className="mt-3 max-w-2xl font-body text-sm text-gray-text">
                Visualiza nuestra cartera en el Corredor del Henares. Haz
                clic en los marcadores para ver cada vivienda.
              </p>
            </div>
            <Link
              href="/inmuebles?vista=mapa"
              className="hidden rounded-full bg-navy px-5 py-2.5 font-body text-sm font-medium text-white hover:bg-navy-medium sm:inline-flex"
            >
              Ver mapa completo →
            </Link>
          </div>

          <div className="mt-8 overflow-hidden rounded-2xl bg-white shadow-sm">
            {inmueblesConCoords.length === 0 ? (
              <div className="flex h-[360px] items-center justify-center bg-cream text-center">
                <div className="px-6">
                  <p className="font-display text-lg font-semibold text-navy">
                    Próximamente verás aquí nuestra cartera
                  </p>
                  <p className="mt-2 font-body text-sm text-gray-text">
                    Estamos preparando los primeros inmuebles para mostrar en
                    el mapa.
                  </p>
                </div>
              </div>
            ) : (
              <MapaInmuebles
                inmuebles={todosPublicos}
                altura="420px"
              />
            )}
          </div>

          {/* Atajos por zona (para los que prefieren clicar) */}
          <ul className="mt-8 flex flex-wrap gap-2">
            {ZONAS.map((zona) => (
              <li key={zona}>
                <Link
                  href={`/inmuebles?zona=${encodeURIComponent(zona)}`}
                  className="inline-flex rounded-full border border-navy/15 bg-white px-4 py-2 font-body text-xs text-navy transition-colors hover:border-navy hover:bg-navy hover:text-white"
                >
                  {zona}
                </Link>
              </li>
            ))}
          </ul>

          <Link
            href="/inmuebles?vista=mapa"
            className="mt-8 inline-flex rounded-full bg-navy px-5 py-2.5 font-body text-sm font-medium text-white hover:bg-navy-medium sm:hidden"
          >
            Ver mapa completo →
          </Link>
        </div>
      </section>
    </>
  );
}
