"use client";

import { useEffect, useState } from "react";
import { FirebaseError } from "firebase/app";
import {
  obtenerResumenAnalytics,
  type ResumenAnalytics,
} from "@/lib/firestore/analytics";

function formatearFecha(ms: number): string {
  if (!ms) return "—";
  return new Intl.DateTimeFormat("es-ES", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(ms));
}

export function AnalyticsWidget() {
  const [data, setData] = useState<ResumenAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    obtenerResumenAnalytics()
      .then(setData)
      .catch((err: unknown) => {
        if (err instanceof FirebaseError) {
          setError(`Error de Firestore: ${err.code}`);
        } else {
          setError("No se pudieron cargar las estadísticas.");
        }
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <section className="rounded-2xl border border-black/5 bg-white p-6">
        <p className="font-body text-sm text-gray-text">Cargando visitas…</p>
      </section>
    );
  }

  if (error || !data) {
    return (
      <section className="rounded-2xl border border-black/5 bg-white p-6">
        <p className="font-body text-sm text-red-700">
          {error ?? "Sin datos"}
        </p>
      </section>
    );
  }

  const sinVisitas = data.visitasMes === 0;

  return (
    <section className="mt-10 space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="font-body text-xs uppercase tracking-[0.3em] text-gold">
            Tráfico
          </p>
          <h2 className="mt-2 font-display text-2xl font-semibold text-navy">
            Visitas a la web
          </h2>
        </div>
        <p className="font-body text-xs text-gray-text">
          Datos del último mes · sólo visitantes que aceptan cookies analíticas
        </p>
      </div>

      {sinVisitas ? (
        <div className="rounded-2xl border border-dashed border-navy/20 bg-white p-10 text-center">
          <p className="font-display text-xl font-semibold text-navy">
            Sin visitas registradas aún
          </p>
          <p className="mt-3 font-body text-sm text-gray-text">
            Las visitas se cuentan cuando los usuarios aceptan las cookies
            analíticas en el banner. Comparte la web para empezar a recibir
            tráfico real.
          </p>
        </div>
      ) : (
        <>
          {/* KPIs */}
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {[
              {
                label: "Visitas hoy",
                value: data.visitasHoy,
                hint: "Páginas vistas",
              },
              {
                label: "Visitas semana",
                value: data.visitasSemana,
                hint: "Últimos 7 días",
              },
              {
                label: "Visitas mes",
                value: data.visitasMes,
                hint: "Últimos 30 días",
              },
              {
                label: "Visitantes únicos",
                value: data.usuariosUnicosMes,
                hint: "Sesiones únicas este mes",
              },
            ].map((kpi) => (
              <div
                key={kpi.label}
                className="rounded-2xl border border-black/5 bg-white p-6"
              >
                <p className="font-body text-xs uppercase tracking-widest text-gray-text">
                  {kpi.label}
                </p>
                <p className="mt-3 font-display text-3xl font-semibold text-navy">
                  {kpi.value}
                </p>
                <p className="mt-1 font-body text-xs text-gray-text">
                  {kpi.hint}
                </p>
              </div>
            ))}
          </div>

          {/* Tops */}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <div className="rounded-2xl border border-black/5 bg-white p-6">
              <h3 className="font-display text-base font-semibold text-navy">
                Páginas más vistas
              </h3>
              {data.topPaginas.length === 0 ? (
                <p className="mt-3 font-body text-xs text-gray-text">
                  Sin datos.
                </p>
              ) : (
                <ul className="mt-4 space-y-2">
                  {data.topPaginas.map((p) => (
                    <li
                      key={p.pagina}
                      className="flex items-center justify-between gap-2 font-body text-sm"
                    >
                      <a
                        href={p.pagina}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="truncate text-dark hover:text-navy hover:underline"
                      >
                        {p.pagina}
                      </a>
                      <span className="shrink-0 rounded-full bg-cream px-2 py-0.5 font-body text-xs text-gray-text">
                        {p.count}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="rounded-2xl border border-black/5 bg-white p-6">
              <h3 className="font-display text-base font-semibold text-navy">
                Inmuebles más vistos
              </h3>
              {data.topInmuebles.length === 0 ? (
                <p className="mt-3 font-body text-xs text-gray-text">
                  Aún sin visitas a fichas.
                </p>
              ) : (
                <ul className="mt-4 space-y-2">
                  {data.topInmuebles.map((p) => (
                    <li
                      key={p.slug}
                      className="flex items-center justify-between gap-2 font-body text-sm"
                    >
                      <a
                        href={`/inmueble/${p.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="truncate text-dark hover:text-navy hover:underline"
                      >
                        {p.slug}
                      </a>
                      <span className="shrink-0 rounded-full bg-cream px-2 py-0.5 font-body text-xs text-gray-text">
                        {p.count}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="rounded-2xl border border-black/5 bg-white p-6">
              <h3 className="font-display text-base font-semibold text-navy">
                Orígenes (referers)
              </h3>
              {data.topReferers.length === 0 ? (
                <p className="mt-3 font-body text-xs text-gray-text">
                  La mayoría entran directamente (sin referer).
                </p>
              ) : (
                <ul className="mt-4 space-y-2">
                  {data.topReferers.map((r) => (
                    <li
                      key={r.referer}
                      className="flex items-center justify-between gap-2 font-body text-sm"
                    >
                      <span className="truncate text-dark">{r.referer}</span>
                      <span className="shrink-0 rounded-full bg-cream px-2 py-0.5 font-body text-xs text-gray-text">
                        {r.count}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Últimas */}
          {data.ultimas.length > 0 && (
            <div className="rounded-2xl border border-black/5 bg-white p-6">
              <h3 className="font-display text-base font-semibold text-navy">
                Actividad reciente
              </h3>
              <ul className="mt-4 divide-y divide-black/5">
                {data.ultimas.map((u) => (
                  <li
                    key={u.id}
                    className="flex items-center justify-between gap-2 py-2 font-body text-xs"
                  >
                    <a
                      href={u.pagina}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="truncate text-dark hover:text-navy hover:underline"
                    >
                      {u.pagina}
                    </a>
                    <span className="shrink-0 text-gray-text">
                      {formatearFecha(u.fechaMs)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}
    </section>
  );
}
